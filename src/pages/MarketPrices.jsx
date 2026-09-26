import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  RotateCcw,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { fetchMarketPrices } from "../services/marketApi";
import "./MarketPrices.css";

const QUICK_COMMODITIES = [
  "Wheat",
  "Rice",
  "Potato",
  "Onion",
  "Tomato",
  "Mustard",
  "Cotton",
  "Maize",
  "Soyabean",
];

const INITIAL_FILTERS = {
  commodity: "",
  state: "",
  district: "",
  market: "",
  variety: "",
  arrival_date: "",
};

function MarketPrices() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState({
    records: [],
    total: 0,
    count: 0,
    updated_date: null,
  });

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetchMarketPrices({
      ...activeFilters,
      limit,
      offset,
    })
      .then((res) => {
        if (!ignore) {
          setData({
            records: res.records || [],
            total: res.total || 0,
            count: res.count || 0,
            updated_date: res.updated_date || null,
          });

          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.message ||
              t(
                "services.marketPrices.defaultApiError",
                "Failed to retrieve market prices. Please try again."
              )
          );
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeFilters, limit, offset, refreshIndex, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e?.preventDefault();

    setLoading(true);
    setOffset(0);
    setActiveFilters({ ...filters });
  };

  const handleQuickCommodity = (commodityName) => {
    const updated = {
      ...filters,
      commodity: commodityName,
    };

    setFilters(updated);
    setLoading(true);
    setOffset(0);
    setActiveFilters(updated);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setLoading(true);
    setOffset(0);
    setActiveFilters(INITIAL_FILTERS);
  };

  const handlePageChange = (newOffset) => {
    if (newOffset >= 0 && newOffset < data.total) {
      setLoading(true);
      setOffset(newOffset);

      window.scrollTo({
        top: 300,
        behavior: "smooth",
      });
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(data.total / limit));

  const showingStart = data.total > 0 ? offset + 1 : 0;
  const showingEnd = Math.min(offset + limit, data.total);

  return (
    <div className="market-page-wrapper">
      {/* Top Header & Breadcrumb */}
      <div className="market-header-section">
        <div className="market-title-group">
          <div className="live-badge">
            <span className="pulse-dot"></span>

            <span>
              {t(
                "services.marketPrices.liveData",
                "Live Government Agmarknet Data"
              )}
            </span>
          </div>

          <h1>
            {t(
              "services.marketPrices.title",
              "Daily Mandi Market Prices"
            )}
          </h1>

          <p className="market-subtitle">
            {t(
              "services.marketPrices.description",
              "Real-time wholesale agricultural commodity rates across mandis in India from official government data."
            )}
          </p>
        </div>
      </div>

      {/* Filter & Search Card */}
      <div className="market-filter-card">
        <div className="filter-header">
          <div className="filter-title-group">
            <Filter size={18} className="filter-icon" />

            <h2>
              {t(
                "services.marketPrices.searchFilter",
                "Search & Filter Mandis"
              )}
            </h2>
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw size={14} />

            <span>
              {t("services.marketPrices.reset", "Reset")}
            </span>
          </button>
        </div>

        {/* Quick commodity pills */}
        <div className="quick-commodities-row">
          <span className="quick-label">
            {t(
              "services.marketPrices.popularCommodities",
              "Popular Commodities:"
            )}
          </span>

          <div className="commodity-chips">
            {QUICK_COMMODITIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`commodity-chip ${
                  filters.commodity.toLowerCase() === item.toLowerCase()
                    ? "active"
                    : ""
                }`}
                onClick={() => handleQuickCommodity(item)}
              >
                {t(
                  `services.marketPrices.commodities.${item}`,
                  item
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-grid">
            {/* Commodity */}
            <div className="filter-field">
              <label htmlFor="commodity">
                {t(
                  "services.marketPrices.commodity",
                  "Commodity"
                )}
              </label>

              <div className="filter-input-wrap">
                <ShoppingBag size={16} className="input-icon" />

                <input
                  type="text"
                  id="commodity"
                  name="commodity"
                  placeholder={t(
                    "services.marketPrices.placeholders.commodity",
                    "e.g. Wheat, Potato, Onion"
                  )}
                  value={filters.commodity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* State */}
            <div className="filter-field">
              <label htmlFor="state">
                {t(
                  "services.marketPrices.state",
                  "State / UT"
                )}
              </label>

              <div className="filter-input-wrap">
                <MapPin size={16} className="input-icon" />

                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder={t(
                    "services.marketPrices.placeholders.state",
                    "e.g. Punjab, Maharashtra"
                  )}
                  value={filters.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* District */}
            <div className="filter-field">
              <label htmlFor="district">
                {t(
                  "services.marketPrices.district",
                  "District"
                )}
              </label>

              <div className="filter-input-wrap">
                <MapPin size={16} className="input-icon" />

                <input
                  type="text"
                  id="district"
                  name="district"
                  placeholder={t(
                    "services.marketPrices.placeholders.district",
                    "e.g. Pune, Agra, Ludhiana"
                  )}
                  value={filters.district}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Market */}
            <div className="filter-field">
              <label htmlFor="market">
                {t(
                  "services.marketPrices.market",
                  "Market / Mandi"
                )}
              </label>

              <div className="filter-input-wrap">
                <MapPin size={16} className="input-icon" />

                <input
                  type="text"
                  id="market"
                  name="market"
                  placeholder={t(
                    "services.marketPrices.placeholders.market",
                    "e.g. Lasalgaon, Achhnera"
                  )}
                  value={filters.market}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions-row">
            <div className="limit-selector">
              <label htmlFor="limit">
                {t(
                  "services.marketPrices.rowsPerPage",
                  "Rows per page:"
                )}
              </label>

              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              type="submit"
              className="search-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={16}
                    className="spin-icon"
                  />

                  <span>
                    {t(
                      "services.marketPrices.searching",
                      "Searching..."
                    )}
                  </span>
                </>
              ) : (
                <>
                  <Search size={16} />

                  <span>
                    {t(
                      "services.marketPrices.searchMandiRates",
                      "Search Mandi Rates"
                    )}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="market-error-banner">
          <AlertCircle size={20} className="error-icon" />

          <div className="error-content">
            <strong>
              {t(
                "services.marketPrices.unableToLoad",
                "Unable to Load Market Prices"
              )}
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            className="retry-btn"
            onClick={() => {
              setLoading(true);
              setRefreshIndex((prev) => prev + 1);
            }}
          >
            {t(
              "services.marketPrices.tryAgain",
              "Try Again"
            )}
          </button>
        </div>
      )}

      {/* Data Stats Bar */}
      <div className="market-stats-bar">
        <div className="stats-left">
          <span className="stats-count">
            {t("services.marketPrices.showing", "Showing")}{" "}
            <strong>
              {showingStart} - {showingEnd}
            </strong>{" "}
            {t("services.marketPrices.of", "of")}{" "}
            <strong>{data.total.toLocaleString()}</strong>{" "}
            {t("services.marketPrices.records", "records")}
          </span>

          {data.updated_date && (
            <span className="stats-timestamp">
              <Calendar size={13} />

              {t(
                "services.marketPrices.upstreamUpdated",
                "Upstream updated:"
              )}{" "}
              {new Date(
                data.updated_date
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="stats-right">
          <button
            type="button"
            className="refresh-btn"
            onClick={() => {
              setLoading(true);
              setRefreshIndex((prev) => prev + 1);
            }}
            disabled={loading}
            title={t(
              "services.marketPrices.refresh",
              "Refresh prices"
            )}
          >
            <RefreshCw
              size={14}
              className={loading ? "spin-icon" : ""}
            />

            <span>
              {t(
                "services.marketPrices.refresh",
                "Refresh"
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Main Results Table / Cards */}
      <div className="market-results-wrapper">
        {loading ? (
          <div className="market-loading-state">
            <div className="market-spinner"></div>

            <p>
              {t(
                "services.marketPrices.fetchingPrices",
                "Fetching real-time Agmarknet commodity prices from government repository..."
              )}
            </p>
          </div>
        ) : data.records.length === 0 ? (
          <div className="market-empty-state">
            <div className="empty-icon-circle">
              <Layers size={32} />
            </div>

            <h3>
              {t(
                "services.marketPrices.noRecords",
                "No Mandi Price Records Found"
              )}
            </h3>

            <p>
              {t(
                "services.marketPrices.noRecordsDescription",
                "No market price records matched your current search filters. Try adjusting your commodity name, state, or district."
              )}
            </p>

            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleReset}
            >
              {t(
                "services.marketPrices.clearFilters",
                "Clear All Filters"
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container">
              <table className="mandi-table">
                <thead>
                  <tr>
                    <th>
                      {t(
                        "services.marketPrices.commodity",
                        "Commodity"
                      )}
                    </th>

                    <th>
                      {t(
                        "services.marketPrices.variety",
                        "Variety / Grade"
                      )}
                    </th>

                    <th>
                      {t(
                        "services.marketPrices.market",
                        "Mandi (Market)"
                      )}
                    </th>

                    <th>
                      {t(
                        "services.marketPrices.district",
                        "District"
                      )}
                    </th>

                    <th>
                      {t(
                        "services.marketPrices.state",
                        "State"
                      )}
                    </th>

                    <th>
                      {t(
                        "services.marketPrices.arrivalDate",
                        "Arrival Date"
                      )}
                    </th>

                    <th className="price-header">
                      {t(
                        "services.marketPrices.minPrice",
                        "Min Price"
                      )}
                    </th>

                    <th className="price-header">
                      {t(
                        "services.marketPrices.maxPrice",
                        "Max Price"
                      )}
                    </th>

                    <th className="price-header modal-header">
                      {t(
                        "services.marketPrices.modalPrice",
                        "Modal Price"
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.records.map((rec, index) => (
                    <tr
                      key={`${rec.market}-${rec.commodity}-${index}`}
                    >
                      <td className="commodity-cell">
                        <span className="commodity-name">
                          {rec.commodity}
                        </span>
                      </td>

                      <td className="variety-cell">
                        {rec.variety ||
                          t(
                            "services.marketPrices.other",
                            "Other"
                          )}
                      </td>

                      <td className="market-cell">
                        <strong>{rec.market}</strong>
                      </td>

                      <td>{rec.district}</td>

                      <td>{rec.state}</td>

                      <td className="date-cell">
                        {rec.arrival_date || "—"}
                      </td>

                      <td className="price-cell">
                        {rec.min_price != null
                          ? `₹${rec.min_price.toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="price-cell">
                        {rec.max_price != null
                          ? `₹${rec.max_price.toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="price-cell modal-price-cell">
                        {rec.modal_price != null ? (
                          <span className="modal-badge">
                            <TrendingUp size={12} />

                            ₹{rec.modal_price.toLocaleString()}

                            <small>
                              /
                              {t(
                                "services.marketPrices.quintal",
                                "qtl"
                              )}
                            </small>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-list">
              {data.records.map((rec, index) => (
                <div
                  key={`m-${rec.market}-${rec.commodity}-${index}`}
                  className="mobile-mandi-card"
                >
                  <div className="card-top">
                    <div className="card-title-col">
                      <span className="m-commodity">
                        {rec.commodity}
                      </span>

                      <span className="m-variety">
                        {rec.variety ||
                          t(
                            "services.marketPrices.standardVariety",
                            "Standard Variety"
                          )}
                      </span>
                    </div>

                    {rec.modal_price != null && (
                      <div className="m-modal-price">
                        <span className="m-price-val">
                          ₹{rec.modal_price.toLocaleString()}
                        </span>

                        <span className="m-price-unit">
                          /{" "}
                          {t(
                            "services.marketPrices.quintal",
                            "Quintal"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-location-row">
                    <MapPin size={14} />

                    <span>
                      {rec.market}, {rec.district},{" "}
                      {rec.state}
                    </span>
                  </div>

                  <div className="card-prices-grid">
                    <div className="price-item">
                      <span className="p-label">
                        {t(
                          "services.marketPrices.minRate",
                          "Min Rate"
                        )}
                      </span>

                      <span className="p-val">
                        {rec.min_price != null
                          ? `₹${rec.min_price.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>

                    <div className="price-item">
                      <span className="p-label">
                        {t(
                          "services.marketPrices.maxRate",
                          "Max Rate"
                        )}
                      </span>

                      <span className="p-val">
                        {rec.max_price != null
                          ? `₹${rec.max_price.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>

                    <div className="price-item">
                      <span className="p-label">
                        {t(
                          "services.marketPrices.arrivalDate",
                          "Arrival Date"
                        )}
                      </span>

                      <span className="p-val date">
                        {rec.arrival_date || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="market-pagination">
              <div className="pagination-info">
                {t("services.marketPrices.page", "Page")}{" "}
                <strong>{currentPage}</strong>{" "}
                {t("services.marketPrices.of", "of")}{" "}
                <strong>{totalPages}</strong>
              </div>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() =>
                    handlePageChange(offset - limit)
                  }
                  disabled={offset === 0 || loading}
                >
                  <ChevronLeft size={16} />

                  <span>
                    {t(
                      "services.marketPrices.previous",
                      "Previous"
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  className="page-btn"
                  onClick={() =>
                    handlePageChange(offset + limit)
                  }
                  disabled={
                    offset + limit >= data.total ||
                    loading
                  }
                >
                  <span>
                    {t(
                      "services.marketPrices.next",
                      "Next"
                    )}
                  </span>

                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MarketPrices;