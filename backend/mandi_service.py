import time
import logging
from typing import Optional, Dict, Any, Tuple
import httpx
from fastapi import HTTPException, status

import os
from market_schema import MarketPriceRecord, MarketPriceResponse

MANDI_API_KEY = os.getenv("MANDI_API_KEY", "")
MANDI_API_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
MANDI_CACHE_TTL_SECONDS = 1800

logger = logging.getLogger("krishimitra.mandi")

class MandiPriceService:
    """Service to fetch, normalize, and cache commodity market prices from data.gov.in API."""

    def __init__(self):
        self._cache: Dict[str, Tuple[float, MarketPriceResponse]] = {}
        self.ttl: int = MANDI_CACHE_TTL_SECONDS

    def _get_cache_key(
        self,
        state: Optional[str],
        district: Optional[str],
        market: Optional[str],
        commodity: Optional[str],
        variety: Optional[str],
        arrival_date: Optional[str],
        limit: int,
        offset: int,
    ) -> str:
        parts = [
            f"s:{state or ''}",
            f"d:{district or ''}",
            f"m:{market or ''}",
            f"c:{commodity or ''}",
            f"v:{variety or ''}",
            f"dt:{arrival_date or ''}",
            f"l:{limit}",
            f"o:{offset}",
        ]
        return "|".join(parts).lower()

    def _cleanup_expired_cache(self) -> None:
        now = time.time()
        expired_keys = [k for k, (ts, _) in self._cache.items() if (now - ts) > self.ttl]
        for k in expired_keys:
            self._cache.pop(k, None)

    @staticmethod
    def _parse_price(val: Any) -> Optional[float]:
        """Safely parses a price value to float, handling strings, None, and non-numeric placeholders."""
        if val is None:
            return None
        val_str = str(val).strip()
        if not val_str or val_str.upper() in ("NA", "N/A", "NULL", "NONE", "-"):
            return None
        try:
            return round(float(val_str), 2)
        except (ValueError, TypeError):
            return None

    async def fetch_market_prices(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        commodity: Optional[str] = None,
        variety: Optional[str] = None,
        arrival_date: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> MarketPriceResponse:
        """Fetches live market prices from data.gov.in with in-memory caching and safe error handling."""
        api_key = MANDI_API_KEY
        if not api_key or not api_key.strip():
            logger.warning("MANDI_API_KEY is not configured in backend environment.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "MANDI_API_KEY is not configured on the server. Please set a valid data.gov.in "
                    "API key in the backend environment or backend/.env file."
                ),
            )

        # Check in-memory cache
        cache_key = self._get_cache_key(
            state, district, market, commodity, variety, arrival_date, limit, offset
        )
        self._cleanup_expired_cache()
        if cache_key in self._cache:
            cached_time, cached_response = self._cache[cache_key]
            if (time.time() - cached_time) <= self.ttl:
                logger.info(f"Serving mandi prices from cache for query: {cache_key}")
                return cached_response

        # Build official data.gov.in request parameters
        params: Dict[str, Any] = {
            "api-key": api_key,
            "format": "json",
            "limit": limit,
            "offset": offset,
        }

        if state and state.strip():
            params["filters[state]"] = state.strip()
        if district and district.strip():
            params["filters[district]"] = district.strip()
        if market and market.strip():
            params["filters[market]"] = market.strip()
        if commodity and commodity.strip():
            params["filters[commodity]"] = commodity.strip()
        if variety and variety.strip():
            params["filters[variety]"] = variety.strip()
        if arrival_date and arrival_date.strip():
            params["filters[arrival_date]"] = arrival_date.strip()

        # Log request without revealing the API key
        safe_params = {k: ("***" if k == "api-key" else v) for k, v in params.items()}
        logger.info(f"Fetching mandi prices from upstream API: {safe_params}")

        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
            async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
                response = await client.get(MANDI_API_BASE_URL, params=params)

            if response.status_code == 401 or response.status_code == 403:
                logger.error("data.gov.in authentication failed: invalid API key")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Authentication with data.gov.in failed. Please verify that MANDI_API_KEY is valid.",
                )

            if response.status_code != 200:
                logger.error(
                    f"data.gov.in returned HTTP {response.status_code}: {response.text[:200]}"
                )
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Upstream government API returned an error (HTTP {response.status_code}).",
                )

            data = response.json()
        except httpx.TimeoutException:
            logger.error("Timeout while connecting to data.gov.in API")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request to upstream data.gov.in Mandi API timed out. Please try again shortly.",
            )
        except httpx.RequestError as exc:
            logger.error(f"Network error connecting to data.gov.in: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Network error connecting to data.gov.in Mandi API: {str(exc)}",
            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Unexpected error querying data.gov.in: {exc}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while processing market prices: {str(exc)}",
            )

        # Validate response payload
        raw_records = data.get("records", [])
        total_records = data.get("total", len(raw_records))
        try:
            total_records = int(total_records)
        except (ValueError, TypeError):
            total_records = len(raw_records)

        updated_date = data.get("updated_date") or data.get("created_date")

        normalized_records = []
        for item in raw_records:
            normalized_records.append(
                MarketPriceRecord(
                    state=str(item.get("state", "")).strip(),
                    district=str(item.get("district", "")).strip(),
                    market=str(item.get("market", "")).strip(),
                    commodity=str(item.get("commodity", "")).strip(),
                    variety=str(item.get("variety", "")).strip() if item.get("variety") else None,
                    arrival_date=str(item.get("arrival_date", "")).strip() if item.get("arrival_date") else None,
                    min_price=self._parse_price(item.get("min_price")),
                    max_price=self._parse_price(item.get("max_price")),
                    modal_price=self._parse_price(item.get("modal_price")),
                )
            )

        result_response = MarketPriceResponse(
            status="success",
            total=total_records,
            count=len(normalized_records),
            limit=limit,
            offset=offset,
            updated_date=updated_date,
            records=normalized_records,
        )

        # Cache valid response
        self._cache[cache_key] = (time.time(), result_response)
        return result_response

# Global singleton instance
mandi_price_service = MandiPriceService()
