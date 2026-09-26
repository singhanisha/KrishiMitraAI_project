from pydantic import BaseModel, Field
from typing import List, Optional

class MarketPriceRecord(BaseModel):
    state: str = Field(..., description="Indian State or Union Territory")
    district: str = Field(..., description="District name")
    market: str = Field(..., description="Mandi/Market yard name")
    commodity: str = Field(..., description="Commodity/Crop name")
    variety: Optional[str] = Field(None, description="Commodity variety or grade")
    arrival_date: Optional[str] = Field(None, description="Arrival date (DD/MM/YYYY)")
    min_price: Optional[float] = Field(None, description="Minimum price in Rs/Quintal")
    max_price: Optional[float] = Field(None, description="Maximum price in Rs/Quintal")
    modal_price: Optional[float] = Field(None, description="Modal/Frequent price in Rs/Quintal")

class MarketPriceResponse(BaseModel):
    status: str = Field("success", description="Response status")
    total: int = Field(..., description="Total matching records available in dataset")
    count: int = Field(..., description="Number of records returned in this response")
    limit: int = Field(..., description="Page limit applied")
    offset: int = Field(..., description="Page offset applied")
    updated_date: Optional[str] = Field(None, description="Upstream dataset update timestamp")
    records: List[MarketPriceRecord] = Field(default_factory=list, description="List of mandi price records")
