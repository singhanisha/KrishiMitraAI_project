"""
chat_extras.py  (backend/ folder me, main.py ke bagal me rakho)

Chatbot ko Yield Prediction aur Mandi Price se jodta hai (kisi bhi bhasha me),
aur disease sawaalon par photo-upload page ka hint deta hai.

Flow:  pehle ye module try karta hai (asli ML model / live data),
       agar message in me se kisi ka nahi hai ya data nahi mila -> None return,
       aur main.py ka purana flow (general LLM answer) waise hi chalta hai.

Weather aur Crop ka flow bilkul nahi chhua gaya hai.
"""

import asyncio
import datetime
import json
import re

from llm_utils import llm_complete
from ml.yield_predictor import yield_predictor
from ml.yield_schema import YieldPredictionRequest
from mandi_service import mandi_price_service

LANG_NAMES = {
    "en": "English", "hi": "Hindi", "mr": "Marathi", "bn": "Bengali",
    "pa": "Punjabi", "gu": "Gujarati", "or": "Odia", "ta": "Tamil",
    "te": "Telugu", "kn": "Kannada", "ml": "Malayalam",
}


# ------------------------------------------------------------------
# Yield model ki allowed values (state / crop / season) metadata se
# ------------------------------------------------------------------

def _allowed():
    try:
        u = (yield_predictor.metadata or {}).get("unique_categories", {})
        return u.get("states", []), u.get("crops", []), u.get("seasons", [])
    except Exception:
        return [], [], []


def _canon(value, allowed):
    """LLM ne jo naam diya use model ke exact naam se match karta hai."""
    if not value or not isinstance(value, str):
        return None
    v = value.strip().lower()
    if not allowed:
        return value.strip()
    for a in allowed:
        if a.lower() == v:
            return a
    for a in allowed:                      # jaise 'paddy' -> nahi, par 'Moong' ~ 'Moong(Green Gram)'
        if v and (v in a.lower() or a.lower() in v):
            return a
    return None


def _num(x):
    try:
        if x is None or x == "":
            return None
        return float(x)
    except Exception:
        return None


# ------------------------------------------------------------------
# Step 1: ek LLM call se message ka type + values nikalo
# ------------------------------------------------------------------

def classify_message(message):
    states, crops, seasons = _allowed()
    prompt = f"""You read a farmer's message (any Indian language / script / Hinglish) and return JSON only.

Decide "intent":
- "yield"   : asks to predict / estimate crop yield or production for a crop.
- "mandi"   : asks for today's / current market (mandi) price or rate of a commodity.
- "disease" : wants to identify or treat a plant disease / pest, or describes sick plant leaves.
- "other"   : anything else.

Extra fields (use null when the message does not give them; never guess numbers):
- "crop": English name. For yield use exactly one of: {crops}
- "state": English name. For yield use exactly one of: {states}
- "season": one of {seasons}
- "area_hectare": number in HECTARES (1 acre = 0.4047 ha, 1 bigha is local so use null if unsure)
- "rainfall_mm": annual rainfall in mm
- "fertilizer_kg": total fertilizer in kg
- "pesticide_kg": total pesticide in kg
- "year": harvest year
- "commodity": for mandi, English commodity name as used in Agmarknet (Wheat, Tomato, Onion, Potato, Rice, ...)
- "market": mandi/market name in English, or null
- "district": district in English, or null

Output exactly one JSON object, nothing else.

Message: {message}"""

    raw = llm_complete(prompt, temperature=0, max_tokens=900)
    print("Extra-intent LLM raw:", repr(raw))
    if not raw:
        return {"intent": "other"}
    m = re.search(r"\{.*\}", raw, re.S)
    if not m:
        return {"intent": "other"}
    try:
        data = json.loads(m.group(0))
        if not isinstance(data, dict):
            return {"intent": "other"}
        return data
    except Exception:
        return {"intent": "other"}


# ------------------------------------------------------------------
# Chhote helpers: kisi bhi bhasha me sentence likhwana
# ------------------------------------------------------------------

def _say_in(language, instruction, fallback):
    name = LANG_NAMES.get(language, "English")
    text = llm_complete(
        f"Write in {name} only (no English unless it is a number, unit or place name). "
        f"Output just the text.\n\n{instruction}",
        temperature=0.3, max_tokens=700,
    )
    return text if text else fallback


_hint_cache = {}


def disease_hint(language):
    if language in _hint_cache:
        return _hint_cache[language]
    hint = _say_in(
        language,
        "One short friendly sentence: 'For an AI diagnosis from a photo, open the Disease Detection "
        "page of KrishiMitra AI (Services > Disease Detection) and upload a clear photo of the leaf.'",
        "Tip: for an AI diagnosis from a photo, open Services > Disease Detection and upload a clear leaf photo.",
    )
    _hint_cache[language] = hint
    return hint


# ------------------------------------------------------------------
# Yield
# ------------------------------------------------------------------

def handle_yield(info, language, say):
    states, crops, seasons = _allowed()

    crop = _canon(info.get("crop"), crops)
    state = _canon(info.get("state"), states)
    season = _canon(info.get("season"), seasons)
    area = _num(info.get("area_hectare"))
    rain = _num(info.get("rainfall_mm"))
    fert = _num(info.get("fertilizer_kg"))
    pest = _num(info.get("pesticide_kg"))
    year = _num(info.get("year")) or datetime.date.today().year

    missing = []
    if not crop:   missing.append("crop name")
    if not state:  missing.append("state")
    if not season: missing.append("season (Kharif / Rabi / Summer / Whole Year ...)")
    if not area or area <= 0: missing.append("cultivated area (hectare or acre)")
    if rain is None: missing.append("annual rainfall in mm")
    if fert is None: missing.append("total fertilizer in kg")
    if pest is None: missing.append("total pesticide in kg")

    if missing:
        text = _say_in(
            language,
            "The farmer wants a yield prediction. Politely ask them to send ONE message that includes "
            "these missing details: " + "; ".join(missing) +
            ". Mention they can also use the Yield Prediction page (Services > Yield Prediction).",
            "For yield prediction I also need: " + ", ".join(missing) +
            ". Please send them in one message, or use Services > Yield Prediction.",
        )
        return {"response": text, "source": "yield_model_needs_input", "intent": "yield_prediction"}

    try:
        result = yield_predictor.predict(YieldPredictionRequest(
            year=int(year), state=state, crop=crop, season=season,
            area=area, annual_rainfall=rain, fertilizer=fert, pesticide=pest,
        ))
    except Exception as e:
        print("Chat yield error:", e)
        return None

    total = round(result.predicted_yield * area, 2)
    total_unit = "nuts" if result.unit.startswith("nuts") else "tonnes"
    facts = (
        f"Predicted yield for {result.crop} in {result.state} ({result.season} season, year {int(year)}): "
        f"{result.predicted_yield} {result.unit}. "
        f"For {round(area, 2)} hectares the estimated total production is about {total} {total_unit}. "
        f"This is a model estimate, not a guarantee."
    )
    return {"response": say(facts, language), "source": "yield_model",
            "intent": "yield_prediction"}


# ------------------------------------------------------------------
# Mandi price
# ------------------------------------------------------------------

def handle_mandi(info, language, say):
    commodity = info.get("commodity") or info.get("crop")
    if not commodity or not isinstance(commodity, str):
        return None
    state = info.get("state") if isinstance(info.get("state"), str) else None
    market = info.get("market") if isinstance(info.get("market"), str) else None
    district = info.get("district") if isinstance(info.get("district"), str) else None

    try:
        data = asyncio.run(mandi_price_service.fetch_market_prices(
            state=state, district=district, market=market,
            commodity=commodity.strip().title(), limit=5,
        ))
    except Exception as e:
        print("Chat mandi error:", getattr(e, "detail", e))
        return None

    if not data.records:
        return None

    lines = []
    for r in data.records:
        price = f"Rs {r.modal_price:g}/quintal" if r.modal_price is not None else "price n/a"
        rng = ""
        if r.min_price is not None and r.max_price is not None:
            rng = f" (min {r.min_price:g} - max {r.max_price:g})"
        date = f", {r.arrival_date}" if r.arrival_date else ""
        lines.append(f"• {r.market}, {r.district} ({r.state}): {price}{rng}{date}")

    header = say(
        f"Latest mandi prices for {commodity.title()}"
        + (f" in {state}" if state else " across India")
        + ". All prices are in rupees per quintal.",
        language,
    )
    return {"response": header + "\n" + "\n".join(lines),
            "source": "mandi_api", "intent": "market_price"}


# ------------------------------------------------------------------
# Pre-check: yield / mandi jaisa lag raha hai? (weather se PEHLE chalta hai)
# Kyunki yield wale message me "rainfall" hota hai aur wo weather keyword bhi hai.
# Ye sasta keyword-check hai (LLM call nahi) — sirf shak hone par hi LLM chalta hai,
# isliye normal weather sawaalon me koi extra delay nahi.
# ------------------------------------------------------------------

_GATE_WORDS = [
    # yield / production
    "yield", "production", "harvest", "per hectare", "hectare", "acre", "fertilizer", "fertiliser", "pesticide",
    "उपज", "पैदावार", "उत्पादन", "उत्पादकता", "हेक्टेयर", "एकड़", "एकर", "खाद", "कीटनाशक",
    "ফলন", "উৎপাদন", "ਝਾੜ", "ਪੈਦਾਵਾਰ", "ઉપજ", "ઉત્પાદન", "ଅମଳ", "ଉତ୍ପାଦନ",
    "விளைச்சல்", "மகசூல்", "దిగుబడి", "ಇಳುವರಿ", "ವಿಳುವರಿ", "വിളവ്", "ഉത്പാദനം",
    # mandi / price
    "mandi", "price", "rate of", "bhav", "bhaav", "market rate", "msp",
    "मंडी", "मंडई", "भाव", "बाजार", "किंमत", "कीमत", "दाम", "रेट",
    "মূল্য", "দাম", "বাজার", "ਭਾਅ", "ਕੀਮਤ", "ਮੰਡੀ", "ભાવ", "કિંમત", "બજાર",
    "ମୂଲ୍ୟ", "ଦର", "ବଜାର", "விலை", "சந்தை", "ధర", "మార్కెట్", "ಬೆಲೆ", "ಮಾರುಕಟ್ಟೆ", "വില", "മാർക്കറ്റ്",
]


def looks_like_yield_or_price(message):
    m = message.lower()
    return any(w in m for w in _GATE_WORDS)


# ------------------------------------------------------------------
# Main entry — chat() se bulao
# ------------------------------------------------------------------

def handle_extra_intents(message, language, say, ask_general):
    """say(facts, language)  -> main.phrase_in_language
       ask_general(message)  -> main.ask_llama
       Return: response dict, ya None (matlab purana flow chalne do)."""
    try:
        info = classify_message(message)
        intent = str(info.get("intent", "other")).lower()
        print("Extra intent:", intent)

        if intent == "yield":
            return handle_yield(info, language, say)

        if intent == "mandi":
            return handle_mandi(info, language, say)

        if intent == "disease":
            answer = ask_general(message)
            return {
                "response": f"{answer}\n\n{disease_hint(language)}",
                "source": "llm_with_disease_hint",
                "intent": "disease_detection",
            }
    except Exception as e:
        print("handle_extra_intents error:", e)
    return None