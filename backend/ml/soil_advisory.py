from typing import Dict, List, Optional, Any
from .crop_schema import (
    SoilAdvisoryResponse,
    NutrientStatus,
    NPKBalanceInfo,
    SoilHealthScore,
)

# Reference dataset statistics derived from Crop_recommendation.csv and Crop_Predication_dataset.xlsx
DATASET_STATS = {
    # Crop_recommendation.csv reference stats
    "nitrogen": {
        "name": "Nitrogen (N)",
        "unit": "kg/ha",
        "min": 0.0,
        "max": 140.0,
        "median": 37.0,
        "q25": 21.0,
        "q75": 84.25,
        "source": "Crop Recommendation Reference Dataset"
    },
    "phosphorus": {
        "name": "Phosphorus (P)",
        "unit": "kg/ha",
        "min": 5.0,
        "max": 145.0,
        "median": 51.0,
        "q25": 28.0,
        "q75": 68.0,
        "source": "Crop Recommendation Reference Dataset"
    },
    "potassium": {
        "name": "Potassium (K)",
        "unit": "kg/ha",
        "min": 5.0,
        "max": 205.0,
        "median": 32.0,
        "q25": 20.0,
        "q75": 49.0,
        "source": "Crop Recommendation Reference Dataset"
    },
    "ph": {
        "name": "Soil pH",
        "unit": "pH",
        "min": 3.50,
        "max": 9.94,
        "median": 6.43,
        "q25": 5.97,
        "q75": 6.92,
        "source": "Crop Recommendation Reference Dataset"
    },
    # Crop_Predication_dataset.xlsx reference stats
    "ec": {
        "name": "Electrical Conductivity (EC)",
        "unit": "dS/m",
        "min": 0.007,
        "max": 1.64,
        "median": 0.341,
        "q25": 0.250,
        "q75": 0.610,
        "source": "Soil Physicochemical Reference Dataset"
    },
    "oc": {
        "name": "Organic Carbon (OC)",
        "unit": "%",
        "min": 0.0019,
        "max": 8.50,
        "median": 0.520,
        "q25": 0.195,
        "q75": 3.200,
        "source": "Soil Physicochemical Reference Dataset"
    },
    "caco3": {
        "name": "Calcium Carbonate (CaCO3)",
        "unit": "%",
        "min": 0.0,
        "max": 18.0,
        "median": 4.700,
        "q25": 3.600,
        "q75": 7.000,
        "source": "Soil Physicochemical Reference Dataset"
    },
}

def _classify_relative_level(val: float, stats: Dict[str, Any]) -> str:
    """Classifies input against reference quartile distribution."""
    if val < stats["q25"]:
        return "In Lower Quartile (< Q1)"
    elif val > stats["q75"]:
        return "In Upper Quartile (> Q3)"
    else:
        return "Within Interquartile Mid-Range (Q1–Q3)"

def _interpret_npk_parameter(key: str, val: float, stats: Dict[str, Any]) -> tuple[str, str]:
    """Generates simple farmer-friendly interpretation and badge for N, P, K."""
    level = _classify_relative_level(val, stats)
    
    if key == "nitrogen":
        if val < stats["q25"]:
            return ("Nitrogen is on the lower side of reference data. Vegetative growth and leaf greenness may need monitoring.", "Moderate")
        elif val > stats["q75"]:
            return ("Nitrogen is high compared to reference median. Sufficient for high-foliage demand crops.", "Optimal")
        else:
            return ("Nitrogen is in the balanced reference mid-range, suitable for steady vegetative growth.", "Optimal")
            
    elif key == "phosphorus":
        if val < stats["q25"]:
            return ("Phosphorus is in the lower quartile of reference data. Root establishment and early flowering may benefit from adequate availability.", "Moderate")
        elif val > stats["q75"]:
            return ("Phosphorus is rich relative to reference data. Supports vigorous root development and early vigor.", "Optimal")
        else:
            return ("Phosphorus is in the normal reference mid-range, supporting healthy root systems.", "Optimal")
            
    elif key == "potassium":
        if val < stats["q25"]:
            return ("Potassium is in the lower quartile of reference data. Crop drought tolerance and pest resilience should be monitored.", "Moderate")
        elif val > stats["q75"]:
            return ("Potassium is high relative to reference data. Enhances disease resilience, stalk strength, and fruit quality.", "Optimal")
        else:
            return ("Potassium is in the healthy reference mid-range, promoting overall plant resilience.", "Optimal")
            
    return ("Parameter within recorded reference boundaries.", "Optimal")

def _interpret_ph(ph_val: float) -> tuple[str, str, str]:
    """Interprets pH scale, badge, and descriptive string."""
    if ph_val < 5.5:
        return (
            "Strongly Acidic",
            "Attention Needed",
            "Soil pH is acidic (< 5.5). Best suited for acid-tolerant crops (e.g. tea, potato) or may restrict phosphorus and calcium uptake."
        )
    elif 5.5 <= ph_val < 6.5:
        return (
            "Moderately Acidic / Favorable",
            "Optimal",
            "Soil pH is slightly acidic (5.5 - 6.5), a favorable range for many grain and horticultural crops."
        )
    elif 6.5 <= ph_val <= 7.5:
        return (
            "Neutral / Ideal",
            "Optimal",
            "Soil pH is in the optimal neutral range (6.5 - 7.5), maximizing availability of major macro and micronutrients."
        )
    elif 7.5 < ph_val <= 8.5:
        return (
            "Moderately Alkaline",
            "Moderate",
            "Soil pH is slightly alkaline (7.5 - 8.5). Nutrient uptake remains viable, though micronutrient availability should be observed."
        )
    else:
        return (
            "Strongly Alkaline",
            "Attention Needed",
            "Soil pH is strongly alkaline (> 8.5). May lead to phosphorus fixation and trace element (iron/zinc) unavailability."
        )

def _interpret_ec(ec_val: float) -> tuple[str, str, str]:
    """Interprets Electrical Conductivity (salinity level)."""
    stats = DATASET_STATS["ec"]
    if ec_val < 0.25:
        return (
            "Low Electrical Conductivity",
            "Optimal",
            "Very low electrical conductivity. Soil is non-saline with minimal dissolved salt hazard for root systems."
        )
    elif 0.25 <= ec_val <= 0.61:
        return (
            "Optimal Salinity Mid-Range",
            "Optimal",
            "Electrical conductivity is in the optimal reference mid-range (0.25 - 0.61 dS/m). Ideal osmotic balance for root water uptake."
        )
    elif 0.61 < ec_val <= 1.20:
        return (
            "Mildly Elevated Salinity",
            "Moderate",
            "Slightly elevated electrical conductivity. Sensitive crops should be monitored for drainage and salt accumulation."
        )
    else:
        return (
            "Elevated Salinity Risk",
            "Attention Needed",
            "High electrical conductivity (> 1.2 dS/m). Excess salts present in soil solution can restrict root moisture absorption."
        )

def _interpret_oc(oc_val: float) -> tuple[str, str, str]:
    """Interprets Organic Carbon content."""
    if oc_val < 0.20:
        return (
            "Low Organic Carbon",
            "Attention Needed",
            "Low organic carbon level (< 0.20%). Indicates low soil organic matter; biological activity and moisture retention are limited."
        )
    elif 0.20 <= oc_val <= 3.20:
        return (
            "Healthy Organic Carbon Mid-Range",
            "Optimal",
            "Organic carbon is in the reference mid-range (0.20% - 3.20%), supporting active soil microbial ecology and soil structure."
        )
    else:
        return (
            "High Organic Carbon",
            "Optimal",
            "High organic carbon reservoir (> 3.20%). Strong organic humus content offering superior water holding capacity."
        )

def _interpret_caco3(caco3_val: float) -> tuple[str, str, str]:
    """Interprets Calcium Carbonate (free lime status)."""
    if caco3_val < 3.60:
        return (
            "Low Free Lime / Non-Calcareous",
            "Optimal",
            "Low calcium carbonate (< 3.6%). Non-calcareous soil condition with very low risk of phosphorus lockup."
        )
    elif 3.60 <= caco3_val <= 7.00:
        return (
            "Moderate Calcium Carbonate",
            "Optimal",
            "Calcium carbonate is in the standard reference mid-range (3.6% - 7.0%), typical for productive agricultural soils."
        )
    else:
        return (
            "Elevated Calcareous / Lime Status",
            "Moderate",
            "Elevated calcium carbonate (> 7.0%). Highly calcareous soil; phosphorus and micronutrients (iron/zinc) may face higher fixation."
        )

def _compute_npk_balance(n: float, p: float, k: float) -> NPKBalanceInfo:
    """Evaluates the proportional balance between Nitrogen, Phosphorus, and Potassium."""
    # Base normalization around Potassium or standard unity
    k_safe = max(k, 1.0)
    n_ratio = round(n / k_safe, 1)
    p_ratio = round(p / k_safe, 1)
    k_ratio = 1.0
    
    ratio_str = f"{n_ratio} : {p_ratio} : {k_ratio}"
    
    if n_ratio > 4.5:
        status = "Nitrogen Dominant"
        interpretation = f"Soil exhibits high nitrogen relative to potassium ({ratio_str}). Supports heavy foliage but balance with P and K promotes crop hardiness."
    elif p_ratio > 3.0:
        status = "Phosphorus Rich"
        interpretation = f"Phosphorus is elevated relative to potassium ({ratio_str}). Excellent for root stimulation and early seedling vigor."
    elif n < 20 and p < 20 and k < 20:
        status = "Low Overall Nutrient Density"
        interpretation = f"All macronutrient levels are comparatively low ({ratio_str}). Soil may require balanced fertility replenishment."
    else:
        status = "Balanced Macro-Nutrient Profile"
        interpretation = f"N-P-K proportion ({ratio_str}) aligns well within standard agricultural multi-nutrient guidelines."

    return NPKBalanceInfo(
        ratio_string=ratio_str,
        balance_status=status,
        interpretation=interpretation
    )

def _compute_soil_health_score(
    n: float,
    p: float,
    k: float,
    ph_val: float,
    ec: Optional[float],
    oc: Optional[float],
    caco3: Optional[float]
) -> SoilHealthScore:
    """
    Computes a transparent, dataset-grounded composite Soil Health Score (0-100).
    Points are allocated per factor and normalized according to available inputs.
    """
    points_earned = 0.0
    max_possible_points = 0.0
    breakdown = {}

    # 1. pH Score (Max 25 pts)
    max_possible_points += 25.0
    if 6.0 <= ph_val <= 7.5:
        ph_pts = 25
    elif (5.5 <= ph_val < 6.0) or (7.5 < ph_val <= 8.0):
        ph_pts = 20
    elif (5.0 <= ph_val < 5.5) or (8.0 < ph_val <= 8.5):
        ph_pts = 14
    else:
        ph_pts = 8
    points_earned += ph_pts
    breakdown["pH Factor (0-25)"] = ph_pts

    # 2. NPK Sufficiency & Balance Score (Max 35 pts)
    max_possible_points += 35.0
    # N factor (12 pts)
    if 20.0 <= n <= 160.0:
        n_pts = 12
    elif (10.0 <= n < 20.0) or (160.0 < n <= 240.0):
        n_pts = 9
    else:
        n_pts = 5
        
    # P factor (12 pts)
    if 25.0 <= p <= 90.0:
        p_pts = 12
    elif (12.0 <= p < 25.0) or (90.0 < p <= 120.0):
        p_pts = 9
    else:
        p_pts = 5

    # K factor (11 pts)
    if 20.0 <= k <= 100.0:
        k_pts = 11
    elif (10.0 <= k < 20.0) or (100.0 < k <= 180.0):
        k_pts = 8
    else:
        k_pts = 4

    npk_total = n_pts + p_pts + k_pts
    points_earned += npk_total
    breakdown["NPK Nutrient Base (0-35)"] = npk_total

    # 3. Optional: EC Salinity Score (Max 20 pts)
    if ec is not None:
        max_possible_points += 20.0
        if ec < 0.61:
            ec_pts = 20
        elif 0.61 <= ec <= 1.0:
            ec_pts = 14
        elif 1.0 < ec <= 1.5:
            ec_pts = 8
        else:
            ec_pts = 4
        points_earned += ec_pts
        breakdown["Salinity/EC Factor (0-20)"] = ec_pts

    # 4. Optional: OC Score (Max 10 pts)
    if oc is not None:
        max_possible_points += 10.0
        if oc >= 0.50:
            oc_pts = 10
        elif 0.20 <= oc < 0.50:
            oc_pts = 7
        else:
            oc_pts = 4
        points_earned += oc_pts
        breakdown["Organic Carbon (0-10)"] = oc_pts

    # 5. Optional: CaCO3 Score (Max 10 pts)
    if caco3 is not None:
        max_possible_points += 10.0
        if caco3 <= 5.0:
            caco3_pts = 10
        elif 5.0 < caco3 <= 8.0:
            caco3_pts = 7
        else:
            caco3_pts = 4
        points_earned += caco3_pts
        breakdown["Free Lime/CaCO3 (0-10)"] = caco3_pts

    # Normalize to 100
    normalized_score = int(round((points_earned / max_possible_points) * 100.0))
    normalized_score = max(0, min(100, normalized_score))

    if normalized_score >= 80:
        rating = "Optimal"
        summary = "Soil parameters demonstrate a well-balanced profile with favorable nutrient availability and root-zone conditions."
    elif normalized_score >= 60:
        rating = "Moderate"
        summary = "Soil parameters are largely viable for crop production with specific secondary aspects showing moderate variation."
    else:
        rating = "Needs Attention"
        summary = "Certain soil parameters diverge noticeably from standard optimal ranges, suggesting closer agronomic attention."

    return SoilHealthScore(
        score=normalized_score,
        rating=rating,
        summary=summary,
        score_breakdown=breakdown
    )

def generate_soil_advisory(
    n: float,
    p: float,
    k: float,
    ph_val: float,
    ec: Optional[float] = None,
    oc: Optional[float] = None,
    caco3: Optional[float] = None
) -> SoilAdvisoryResponse:
    """
    Generates a conservative, transparent, dataset-grounded soil diagnostic and advisory report.
    Evaluates N, P, K, pH and optional secondary indicators (EC, OC, CaCO3).
    """
    analyzed_params: Dict[str, NutrientStatus] = {}
    observations: List[str] = []
    risk_flags: List[str] = []

    # 1. Evaluate Macronutrients (N, P, K)
    for key, val in [("nitrogen", n), ("phosphorus", p), ("potassium", k)]:
        stats = DATASET_STATS[key]
        rel_level = _classify_relative_level(val, stats)
        interp, badge = _interpret_npk_parameter(key, val, stats)
        
        analyzed_params[key] = NutrientStatus(
            input_value=round(val, 2),
            unit=stats["unit"],
            dataset_median=stats["median"],
            dataset_range=[stats["min"], stats["max"]],
            relative_level=rel_level,
            interpretation=interp,
            status_badge=badge
        )

    # 2. Evaluate Soil pH
    ph_stats = DATASET_STATS["ph"]
    ph_desc, ph_badge, ph_interp = _interpret_ph(ph_val)
    analyzed_params["ph"] = NutrientStatus(
        input_value=round(ph_val, 2),
        unit="pH",
        dataset_median=ph_stats["median"],
        dataset_range=[ph_stats["min"], ph_stats["max"]],
        relative_level=_classify_relative_level(ph_val, ph_stats),
        interpretation=ph_interp,
        status_badge=ph_badge
    )

    # 3. Evaluate Optional EC
    if ec is not None:
        ec_stats = DATASET_STATS["ec"]
        ec_desc, ec_badge, ec_interp = _interpret_ec(ec)
        analyzed_params["ec"] = NutrientStatus(
            input_value=round(ec, 3),
            unit=ec_stats["unit"],
            dataset_median=ec_stats["median"],
            dataset_range=[ec_stats["min"], ec_stats["max"]],
            relative_level=_classify_relative_level(ec, ec_stats),
            interpretation=ec_interp,
            status_badge=ec_badge
        )
        if ec > 1.0:
            risk_flags.append(f"Elevated soil EC ({ec} dS/m) indicates salinity presence that may create osmotic water stress for seedlings.")
        elif ec <= 0.61:
            observations.append(f"Electrical Conductivity ({ec} dS/m) is in the safe non-saline range.")

    # 4. Evaluate Optional OC
    if oc is not None:
        oc_stats = DATASET_STATS["oc"]
        oc_desc, oc_badge, oc_interp = _interpret_oc(oc)
        analyzed_params["oc"] = NutrientStatus(
            input_value=round(oc, 3),
            unit=oc_stats["unit"],
            dataset_median=oc_stats["median"],
            dataset_range=[oc_stats["min"], oc_stats["max"]],
            relative_level=_classify_relative_level(oc, oc_stats),
            interpretation=oc_interp,
            status_badge=oc_badge
        )
        if oc < 0.20:
            risk_flags.append(f"Low Organic Carbon ({oc}%) indicates depleted organic matter; soil water retention and microbial activity may be constrained.")
        else:
            observations.append(f"Organic Carbon ({oc}%) supports good soil structure and microbial habitat.")

    # 5. Evaluate Optional CaCO3
    if caco3 is not None:
        caco3_stats = DATASET_STATS["caco3"]
        caco3_desc, caco3_badge, caco3_interp = _interpret_caco3(caco3)
        analyzed_params["caco3"] = NutrientStatus(
            input_value=round(caco3, 2),
            unit=caco3_stats["unit"],
            dataset_median=caco3_stats["median"],
            dataset_range=[caco3_stats["min"], caco3_stats["max"]],
            relative_level=_classify_relative_level(caco3, caco3_stats),
            interpretation=caco3_interp,
            status_badge=caco3_badge
        )
        if caco3 > 7.0 and ph_val > 7.5:
            risk_flags.append(f"Combined high CaCO3 ({caco3}%) and alkaline pH ({ph_val}) may increase the likelihood of phosphorus and micronutrient (Fe/Zn) fixation.")
        elif caco3 <= 5.0:
            observations.append(f"Calcium carbonate ({caco3}%) is within the non-calcareous range, favorable for free nutrient mobility.")

    # 6. Specific pH Risk Flags
    if ph_val < 5.5:
        risk_flags.append(f"Strongly acidic soil pH ({ph_val}) can restrict phosphorus and calcium availability while increasing aluminum toxicity risk in sensitive crops.")
    elif ph_val > 8.3:
        risk_flags.append(f"Strongly alkaline soil pH ({ph_val}) may restrict zinc, iron, and manganese availability.")

    # 7. Macronutrient Comparative Observations
    if n > DATASET_STATS["nitrogen"]["median"]:
        observations.append(f"Nitrogen ({n} kg/ha) is above the reference dataset median ({DATASET_STATS['nitrogen']['median']} kg/ha).")
    else:
        observations.append(f"Nitrogen ({n} kg/ha) is at or below the reference dataset median ({DATASET_STATS['nitrogen']['median']} kg/ha).")

    if p > DATASET_STATS["phosphorus"]["median"]:
        observations.append(f"Phosphorus ({p} kg/ha) is above reference dataset median ({DATASET_STATS['phosphorus']['median']} kg/ha).")
    
    if k > DATASET_STATS["potassium"]["median"]:
        observations.append(f"Potassium ({k} kg/ha) is above reference dataset median ({DATASET_STATS['potassium']['median']} kg/ha).")

    # 8. Compute NPK Balance & Soil Health Score
    npk_balance = _compute_npk_balance(n, p, k)
    soil_health = _compute_soil_health_score(n, p, k, ph_val, ec, oc, caco3)

    # 9. Formulate Summary Text
    params_count = len(analyzed_params)
    summary_text = (
        f"Soil profile evaluated across {params_count} parameters exhibits a pH of {round(ph_val, 2)} ({ph_desc}) "
        f"with N-P-K levels of {round(n, 1)}-{round(p, 1)}-{round(k, 1)} kg/ha. "
        f"Overall dataset-based Soil Health Score is {soil_health.score}/100 ({soil_health.rating})."
    )

    return SoilAdvisoryResponse(
        disclaimer="Advisory interpretation based on dataset statistical distribution. Not a certified laboratory diagnostic report.",
        parameters_analyzed=analyzed_params,
        soil_health_score=soil_health,
        npk_balance=npk_balance,
        soil_summary=summary_text,
        key_observations=observations,
        risk_flags=risk_flags
    )

