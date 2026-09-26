import os
import re
import difflib
import unicodedata
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import Base, engine
from auth.routes import router as auth_router

import requests
from groq import Groq



from intent_router import detect_intent, extract_city
from weather_service import (
    get_current_weather,
    get_tomorrow_rain_prediction
)
from mandi_service import mandi_price_service
from market_schema import MarketPriceResponse
from fastapi import Query
from typing import Optional
from ml.predictor import crop_predictor
from ml.crop_schema import CropRecommendationRequest, CropRecommendationResponse, SoilAnalysisRequest, SoilAdvisoryResponse
from ml.soil_advisory import generate_soil_advisory
from ml.yield_predictor import yield_predictor
from ml.yield_schema import YieldPredictionRequest, YieldPredictionResponse

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

SMALLEST_API_KEY = os.getenv("SMALLEST_API_KEY")
SMALLEST_TTS_URL = "https://api.smallest.ai/waves/v1/tts"

LANGUAGE_VOICE_MAP = {
    "en": "srishti",
    "hi": "srishti",
    "mr": "rupali",
    "bn": "samarth",
    "pa": "gurpreet",
    "gu": "kiran",
    "or": "samarth",
    "ta": "anitha",
    "te": "padmaja",
    "kn": "manjunath",
    "ml": "shibi",
}


app = FastAPI(
    title="KrishiMitra AI Backend"
)

Base.metadata.create_all(bind=engine)


app.include_router(auth_router)

print("=== KrishiMitra Backend loaded — version: v12-crop-templates-all-languages ===")


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODELS
# ==========================================

class ChatRequest(BaseModel):
    message: str


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def home():
    return {
        "message": "KrishiMitra AI Backend is running successfully!"
    }


@app.get("/market-prices", response_model=MarketPriceResponse)
async def get_market_prices(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    commodity: Optional[str] = Query(None),
    variety: Optional[str] = Query(None),
    arrival_date: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return await mandi_price_service.fetch_market_prices(
        state=state, district=district, market=market, commodity=commodity,
        variety=variety, arrival_date=arrival_date, limit=limit, offset=offset,
    )

# ==========================================
# LANGUAGE DETECTION
# ==========================================

def detect_language(message):
    """Detects language by counting how many characters fall in each
    Indian script's Unicode block, and picking the majority script —
    far more robust than 'first matching character wins', since a
    single stray/contaminating character (e.g. from copy-paste or
    voice artifacts) won't skew the result when the message is
    mostly in another script."""

    script_ranges = {
        "devanagari": (0x0900, 0x097F),   # Hindi + Marathi (disambiguated below)
        "bn": (0x0980, 0x09FF),
        "pa": (0x0A00, 0x0A7F),
        "gu": (0x0A80, 0x0AFF),
        "or": (0x0B00, 0x0B7F),
        "ta": (0x0B80, 0x0BFF),
        "te": (0x0C00, 0x0C7F),
        "kn": (0x0C80, 0x0CFF),
        "ml": (0x0D00, 0x0D7F),
    }

    counts = {key: 0 for key in script_ranges}

    for ch in message:
        code = ord(ch)
        for key, (start, end) in script_ranges.items():
            if start <= code <= end:
                counts[key] += 1
                break

    best_key = max(counts, key=counts.get)

    if counts[best_key] == 0:
        return "en"

    if best_key == "devanagari":

        marathi_words = [
            "उद्या", "पाऊस", "हवामान", "आहे", "किती", "पडेल", "मध्ये", "मधे"
        ]

        if any(word in message for word in marathi_words):
            return "mr"

        return "hi"

    return best_key


# ==========================================
# GROQ LLM
# ==========================================

def ask_llama(message):

    try:
        prompt = f"""
You are KrishiMitra AI, an intelligent agriculture assistant for Indian farmers.

Rules:
1. Answer in the same language as the user's question.
2. Give practical agriculture advice.
3. Keep answers simple and farmer-friendly.
4. Do not invent scientific facts.
5. If unsure, clearly mention uncertainty.

Farmer Question:
{message}
"""

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Groq Error:", e)
        return "Sorry, I am unable to process your request right now."


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "bn": "Bengali",
    "pa": "Punjabi",
    "gu": "Gujarati",
    "or": "Odia",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
}


def phrase_in_language(facts, language):
    """Takes real facts (numbers/names) and phrases them naturally
    in the target language using the LLM — facts themselves are NOT
    generated by the LLM, only the sentence wording is."""

    language_name = LANGUAGE_NAMES.get(language, "English")

    try:
        prompt = f"""
Write ONE short, natural, farmer-friendly sentence in {language_name}
that conveys exactly the following facts. Do not add, remove, or
change any numbers or names. Do not add extra information. Only output
the sentence in {language_name}, nothing else.

Facts: {facts}
"""

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("Phrasing Error:", e)
        return facts


CITY_NAME_TRANSLATIONS = {
    # Mumbai
    "मुंबई": "Mumbai", "মুম্বাই": "Mumbai", "ਮੁੰਬਈ": "Mumbai",
    "મુંબઈ": "Mumbai", "ମୁମ୍ବାଇ": "Mumbai", "மும்பை": "Mumbai",
    "ముంబై": "Mumbai", "ಮುಂಬೈ": "Mumbai", "മുംബൈ": "Mumbai",
    # Delhi
    "दिल्ली": "Delhi", "দিল্লি": "Delhi", "ਦਿੱਲੀ": "Delhi",
    "દિલ્હી": "Delhi", "ଦିଲ୍ଲୀ": "Delhi", "டெல்லி": "Delhi",
    "ఢిల్లీ": "Delhi", "ದೆಹಲಿ": "Delhi", "ഡെൽഹി": "Delhi",
    # Pune
    "पुणे": "Pune", "পুনে": "Pune", "ਪੁਣੇ": "Pune",
    "પુણે": "Pune", "ପୁନେ": "Pune", "புனே": "Pune",
    "పూణే": "Pune", "ಪುಣೆ": "Pune", "പൂനെ": "Pune",
    # Chennai
    "चेन्नई": "Chennai", "চেন্নাই": "Chennai", "ਚੇਨਈ": "Chennai",
    "ચેન્નાઈ": "Chennai", "ଚେନ୍ନାଇ": "Chennai", "சென்னை": "Chennai",
    "చెన్నై": "Chennai", "ಚೆನ್ನೈ": "Chennai", "ചെന്നൈ": "Chennai",
    # Kolkata
    "कोलकाता": "Kolkata", "কলকাতা": "Kolkata", "ਕੋਲਕਾਤਾ": "Kolkata",
    "કોલકાતા": "Kolkata", "କୋଲକାତା": "Kolkata", "கொல்கத்தா": "Kolkata",
    "కోల్‌కతా": "Kolkata", "ಕೋಲ್ಕತಾ": "Kolkata", "കൊൽക്കത്ത": "Kolkata",
    # Bengaluru
    "बेंगलुरु": "Bengaluru", "বেঙ্গালুরু": "Bengaluru", "ਬੰਗਲੁਰੂ": "Bengaluru",
    "બેંગ્લોર": "Bengaluru", "ବେଙ୍ଗାଲୁରୁ": "Bengaluru", "பெங்களூரு": "Bengaluru",
    "బెంగళూరు": "Bengaluru", "ಬೆಂಗಳೂರು": "Bengaluru", "ബെംഗളൂരു": "Bengaluru",
    # Hyderabad
    "हैदराबाद": "Hyderabad", "হায়দ্রাবাদ": "Hyderabad", "ਹੈਦਰਾਬਾਦ": "Hyderabad",
    "હૈદરાબાદ": "Hyderabad", "ହାଇଦ୍ରାବାଦ": "Hyderabad", "ஹைதராபாத்": "Hyderabad",
    "హైదరాబాద్": "Hyderabad", "ಹೈದರಾಬಾದ್": "Hyderabad", "ഹൈദരാബാദ്": "Hyderabad",
    # Ahmedabad
    "अहमदाबाद": "Ahmedabad", "আহমেদাবাদ": "Ahmedabad", "ਅਹਿਮਦਾਬਾਦ": "Ahmedabad",
    "અમદાવાદ": "Ahmedabad", "ଅହମଦାବାଦ": "Ahmedabad", "அகமதாபாத்": "Ahmedabad",
    "అహ్మదాబాద్": "Ahmedabad", "ಅಹಮದಾಬಾದ್": "Ahmedabad", "അഹമ്മദാബാദ്": "Ahmedabad",
    # Jaipur
    "जयपुर": "Jaipur", "জয়পুর": "Jaipur", "ਜੈਪੁਰ": "Jaipur",
    "જયપુર": "Jaipur", "ଜୟପୁର": "Jaipur", "ஜெய்ப்பூர்": "Jaipur",
    "జైపూర్": "Jaipur", "ಜೈಪುರ": "Jaipur", "ജയ്‌പൂർ": "Jaipur",
    # Lucknow
    "लखनऊ": "Lucknow", "লখনউ": "Lucknow", "ਲਖਨਊ": "Lucknow",
    "લખનૌ": "Lucknow", "ଲକ୍ଷ୍ନୌ": "Lucknow", "லக்னோ": "Lucknow",
    "లక్నో": "Lucknow", "ಲಕ್ನೋ": "Lucknow", "ലഖ്‌നൗ": "Lucknow",
    # Chandigarh
    "चंडीगढ़": "Chandigarh", "চণ্ডীগড়": "Chandigarh", "ਚੰਡੀਗੜ੍ਹ": "Chandigarh",
    "ચંડીગઢ": "Chandigarh", "ଚଣ୍ଡୀଗଡ": "Chandigarh", "சண்டிகர்": "Chandigarh",
    "చండీగఢ్": "Chandigarh", "ಚಂಡೀಗಢ": "Chandigarh", "ചണ്ഡീഗഢ്": "Chandigarh",
    # Amritsar
    "अमृतसर": "Amritsar", "অমৃতসর": "Amritsar", "ਅੰਮ੍ਰਿਤਸਰ": "Amritsar",
    "અમૃતસર": "Amritsar", "ଅମୃତସର": "Amritsar", "அமிர்தசரஸ்": "Amritsar",
    "అమృత్‌సర్": "Amritsar", "ಅಮೃತಸರ": "Amritsar", "അമൃത്‌സർ": "Amritsar",
    # Surat
    "सूरत": "Surat", "সুরাট": "Surat", "ਸੂਰਤ": "Surat",
    "સુરત": "Surat", "ସୁରଟ": "Surat", "சூரத்": "Surat",
    "సూరత్": "Surat", "ಸೂರತ್": "Surat", "സൂറത്ത്": "Surat",
    # Kochi
    "कोच्चि": "Kochi", "কোচি": "Kochi", "ਕੋਚੀ": "Kochi",
    "કોચી": "Kochi", "କୋଚି": "Kochi", "கொச்சி": "Kochi",
    "కొచ్చి": "Kochi", "ಕೊಚ್ಚಿ": "Kochi", "കൊച്ചി": "Kochi",
    # Bhubaneswar
    "भुवनेश्वर": "Bhubaneswar", "ভুবনেশ্বর": "Bhubaneswar", "ਭੁਵਨੇਸ਼ਵਰ": "Bhubaneswar",
    "ભુવનેશ્વર": "Bhubaneswar", "ଭୁବନେଶ୍ୱର": "Bhubaneswar", "புவனேஷ்வர்": "Bhubaneswar",
    "భువనేశ్వర్": "Bhubaneswar", "ಭುವನೇಶ್ವರ": "Bhubaneswar", "ഭുവനേശ്വർ": "Bhubaneswar",
    # Nagpur
    "नागपूर": "Nagpur", "नागपुर": "Nagpur", "নাগপুর": "Nagpur", "ਨਾਗਪੁਰ": "Nagpur",
    "નાગપુર": "Nagpur", "ନାଗପୁର": "Nagpur", "நாக்பூர்": "Nagpur",
    "నాగ్పూర్": "Nagpur", "ನಾಗಪುರ": "Nagpur", "നാഗ്പൂർ": "Nagpur",
    # Nashik
    "नाशिक": "Nashik", "নাসিক": "Nashik", "ਨਾਸਿਕ": "Nashik",
    "નાસિક": "Nashik", "ନାସିକ": "Nashik", "நாசிக்": "Nashik",
    "నాసిక్": "Nashik", "ನಾಸಿಕ್": "Nashik", "നാസിക്": "Nashik",
    # Kanpur
    "कानपुर": "Kanpur", "কানপুর": "Kanpur", "ਕਾਨਪੁਰ": "Kanpur",
    "કાનપુર": "Kanpur", "କାନପୁର": "Kanpur", "கான்பூர்": "Kanpur",
    "కాన్పూర్": "Kanpur", "ಕಾನ್ಪುರ": "Kanpur", "കാൺപൂർ": "Kanpur",
    # Varanasi
    "वाराणसी": "Varanasi", "বারাণসী": "Varanasi", "ਵਾਰਾਣਸੀ": "Varanasi",
    "વારાણસી": "Varanasi", "ବାରାଣାସୀ": "Varanasi", "வாரணாசி": "Varanasi",
    "వారణాసి": "Varanasi", "ವಾರಾಣಸಿ": "Varanasi", "വാരണാസി": "Varanasi",
    # Patna
    "पटना": "Patna", "পাটনা": "Patna", "ਪਟਨਾ": "Patna",
    "પટના": "Patna", "ପାଟନା": "Patna", "பாட்னா": "Patna",
    "పాట్నా": "Patna", "ಪಾಟ್ನಾ": "Patna", "പാറ്റ്ന": "Patna",
    # Bhopal
    "भोपाल": "Bhopal", "ভোপাল": "Bhopal", "ਭੋਪਾਲ": "Bhopal",
    "ભોપાલ": "Bhopal", "ଭୋପାଳ": "Bhopal", "போபால்": "Bhopal",
    "భోపాల్": "Bhopal", "ಭೋಪಾಲ್": "Bhopal", "ഭോപ്പാൽ": "Bhopal",
    # Indore
    "इंदौर": "Indore", "ইন্দোর": "Indore", "ਇੰਦੌਰ": "Indore",
    "ઇન્દોર": "Indore", "ଇନ୍ଦୋର": "Indore", "இந்தூர்": "Indore",
    "ఇండోర్": "Indore", "ಇಂದೋರ್": "Indore", "ഇൻഡോർ": "Indore",
    # Coimbatore
    "कोयंबटूर": "Coimbatore", "কোয়েম্বাটোর": "Coimbatore", "ਕੋਇੰਬਟੂਰ": "Coimbatore",
    "કોઈમ્બતુર": "Coimbatore", "କୋଏମ୍ବାଟୁର": "Coimbatore", "கோயம்புத்தூர்": "Coimbatore",
    "కోయంబత్తూరు": "Coimbatore", "ಕೊಯಮತ್ತೂರು": "Coimbatore", "കോയമ്പത്തൂർ": "Coimbatore",
    # Madurai
    "मदुरै": "Madurai", "মাদুরাই": "Madurai", "ਮਦੁਰਾਈ": "Madurai",
    "મદુરાઈ": "Madurai", "ମଦୁରାଇ": "Madurai", "மதுரை": "Madurai",
    "మదురై": "Madurai", "ಮಧುರೈ": "Madurai", "മധുര": "Madurai",
    # Thiruvananthapuram
    "तिरुवनंतपुरम": "Thiruvananthapuram", "তিরুবনন্তপুরম": "Thiruvananthapuram",
    "ਤਿਰੂਵਨੰਤਪੁਰਮ": "Thiruvananthapuram", "તિરુવનંતપુરમ": "Thiruvananthapuram",
    "ତିରୁଵନନ୍ତପୁରମ": "Thiruvananthapuram", "திருவனந்தபுரம்": "Thiruvananthapuram",
    "తిరువనంతపురం": "Thiruvananthapuram", "ತಿರುವನಂತಪುರಂ": "Thiruvananthapuram",
    "തിരുവനന്തപുരം": "Thiruvananthapuram",
    # Visakhapatnam
    "विशाखापट्नम": "Visakhapatnam", "বিশাখাপত্তনম": "Visakhapatnam",
    "ਵਿਸ਼ਾਖਾਪਟਨਮ": "Visakhapatnam", "વિશાખાપટ્ટનમ": "Visakhapatnam",
    "ବିଶାଖାପାଟଣା": "Visakhapatnam", "விசாகப்பட்டினம்": "Visakhapatnam",
    "విశాఖపట్నం": "Visakhapatnam", "ವಿಶಾಖಪಟ್ಟಣಂ": "Visakhapatnam",
    "വിശാഖപട്ടണം": "Visakhapatnam",
    # Mysuru
    "मैसूर": "Mysuru", "মহীশূর": "Mysuru", "ਮੈਸੂਰ": "Mysuru",
    "મૈસુર": "Mysuru", "ମାଇସୋର": "Mysuru", "மைசூர்": "Mysuru",
    "మైసూరు": "Mysuru", "ಮೈಸೂರು": "Mysuru", "മൈസൂർ": "Mysuru",
    # Ludhiana
    "लुधियाना": "Ludhiana", "লুধিয়ানা": "Ludhiana", "ਲੁਧਿਆਣਾ": "Ludhiana",
    "લુધિયાણા": "Ludhiana", "ଲୁଧିଆନା": "Ludhiana", "லூதியானா": "Ludhiana",
    "లూధియానా": "Ludhiana", "ಲುಧಿಯಾನಾ": "Ludhiana", "ലുധിയാന": "Ludhiana",
    # Raipur
    "रायपुर": "Raipur", "রায়পুর": "Raipur", "ਰਾਏਪੁਰ": "Raipur",
    "રાયપુર": "Raipur", "ରାଇପୁର": "Raipur", "ராய்ப்பூர்": "Raipur",
    "రాయ్‌పూర్": "Raipur", "ರಾಯಪುರ": "Raipur", "റായ്പൂർ": "Raipur",
    # Agra
    "आगरा": "Agra", "আগ্রা": "Agra", "ਆਗਰਾ": "Agra",
    "આગ્રા": "Agra", "ଆଗ୍ରା": "Agra", "ஆக்ரா": "Agra",
    "ఆగ్రా": "Agra", "ಆಗ್ರಾ": "Agra", "ആഗ്ര": "Agra",
}


def strip_matras(text):
    """Removes Unicode combining marks (vowel signs / matras, nukta,
    virama, anusvara etc.) so only the base consonant/vowel letters
    remain. Two spellings of the same city that only differ in matras
    (e.g. a voice-transcription variant) will reduce to the same or
    very similar consonant skeleton, while two genuinely different
    city names (which usually differ in their consonants) will not —
    this avoids matra-heavy false matches like 'जैपूर' (Jaipur,
    misspelled) wrongly matching 'मैसूर' (Mysuru)."""

    return ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')


def lookup_city_dictionary(candidate):
    """Exact match, then prefix match (suffix-attached forms like
    Bengali city+genitive-case), then fuzzy match on the matra-
    stripped consonant skeleton (handles voice/STT misspelling
    variance without confusing unrelated cities)."""

    if candidate in CITY_NAME_TRANSLATIONS:
        return CITY_NAME_TRANSLATIONS[candidate]

    best_match = None
    best_len = 0

    for native_name, english_name in CITY_NAME_TRANSLATIONS.items():
        if candidate.startswith(native_name) and len(native_name) > best_len:
            best_match = english_name
            best_len = len(native_name)

    if best_match:
        return best_match

    normalized_candidate = strip_matras(candidate)

    normalized_map = {}
    for native_name, english_name in CITY_NAME_TRANSLATIONS.items():
        normalized_map[strip_matras(native_name)] = english_name

    close = difflib.get_close_matches(
        normalized_candidate,
        normalized_map.keys(),
        n=1,
        cutoff=0.6,
    )

    if close:
        matched_key = close[0]
        matched_english = normalized_map[matched_key]
        print(f"City fuzzy match (consonant-skeleton): '{candidate}' ~ '{matched_key}' -> {matched_english}")
        return matched_english

    return None


ENGLISH_CITY_NAMES = sorted(set(CITY_NAME_TRANSLATIONS.values()))


def resolve_city_in_english(message, extracted_city):
    """Resolves the extracted city fragment to its English spelling.
    If it's already English/Latin script: exact-matches (case-
    insensitive) against known city names first, then fuzzy-matches
    to catch misspellings (e.g. 'Tiruvantrapooram' -> 'Thiruvananthapuram');
    falls back to passing it through unchanged if nothing close is
    found (OpenWeatherMap may still resolve names outside our list).
    Otherwise uses the fixed dictionary (exact / prefix / fuzzy match)
    on the native script. No LLM call, so results are fast and
    consistent every time. Covers ~30 major Indian cities."""

    if not extracted_city:
        return None

    if re.match(r'^[A-Za-z\s]+$', extracted_city):

        for known_city in ENGLISH_CITY_NAMES:
            if known_city.lower() == extracted_city.lower():
                return known_city

        close = difflib.get_close_matches(
            extracted_city.lower(),
            [c.lower() for c in ENGLISH_CITY_NAMES],
            n=1,
            cutoff=0.6,
        )

        if close:
            matched = next(c for c in ENGLISH_CITY_NAMES if c.lower() == close[0])
            print(f"English city fuzzy match: '{extracted_city}' -> '{matched}'")
            return matched

        return extracted_city

    match = lookup_city_dictionary(extracted_city)

    if match:
        print(f"City resolved: '{extracted_city}' -> '{match}'")
    else:
        print(f"City NOT found in dictionary: '{extracted_city}'")

    return match


CROP_NAME_TRANSLATIONS = {
    "rice": {
        "hi": "चावल", "mr": "तांदूळ", "bn": "চাল", "pa": "ਚੌਲ",
        "gu": "ચોખા", "or": "ଚାଉଳ", "ta": "அரிசி", "te": "బియ్యం",
        "kn": "ಅಕ್ಕಿ", "ml": "അരി",
    },
    "maize": {
        "hi": "मक्का", "mr": "मका", "bn": "ভুট্টা", "pa": "ਮੱਕੀ",
        "gu": "મકાઈ", "or": "ମକା", "ta": "சோளம்", "te": "మొక్కజొన్న",
        "kn": "ಜೋಳ", "ml": "ചോളം",
    },
    "chickpea": {
        "hi": "चना", "mr": "हरभरा", "bn": "ছোলা", "pa": "ਛੋਲੇ",
        "gu": "ચણા", "or": "ଛୋଲା", "ta": "கொண்டைக்கடலை", "te": "శనగలు",
        "kn": "ಕಡಲೆ", "ml": "കടല",
    },
    "kidneybeans": {
        "hi": "राजमा", "mr": "राजमा", "bn": "রাজমা", "pa": "ਰਾਜਮਾਹ",
        "gu": "રાજમા", "or": "ରାଜମା", "ta": "ராஜ்மா", "te": "రాజ్మా",
        "kn": "ರಾಜ್ಮಾ", "ml": "രാജ്മ",
    },
    "pigeonpeas": {
        "hi": "अरहर", "mr": "तूर", "bn": "অড়হর", "pa": "ਅਰਹਰ",
        "gu": "તુવેર", "or": "ହରଡ", "ta": "துவரை", "te": "కంది",
        "kn": "ತೊಗರಿ", "ml": "തുവര",
    },
    "mothbeans": {
        "hi": "मोठ", "mr": "मटकी", "bn": "মথবিন", "pa": "ਮੋਠ",
        "gu": "મઠ", "or": "ମଠ", "ta": "மோத் பீன்ஸ்", "te": "బొబ్బర్లు",
        "kn": "ಮೋಠ್", "ml": "മോത്ത് ബീൻസ്",
    },
    "mungbean": {
        "hi": "मूंग", "mr": "मूग", "bn": "মুগ", "pa": "ਮੂੰਗ",
        "gu": "મગ", "or": "ମୁଗ", "ta": "பாசிப்பயறு", "te": "పెసలు",
        "kn": "ಹೆಸರು", "ml": "ചെറുപയർ",
    },
    "blackgram": {
        "hi": "उड़द", "mr": "उडीद", "bn": "কলাই", "pa": "ਮਾਂਹ",
        "gu": "અડદ", "or": "ବିରି", "ta": "உளுந்து", "te": "మినుములు",
        "kn": "ಉದ್ದು", "ml": "ഉഴുന്ന്",
    },
    "lentil": {
        "hi": "मसूर", "mr": "मसूर", "bn": "মসুর", "pa": "ਮਸਰ",
        "gu": "મસૂર", "or": "ମସୁର", "ta": "மசூர் பருப்பு", "te": "మసూర్ పప్పు",
        "kn": "ಮಸೂರ್ ಬೇಳೆ", "ml": "മസൂർ പരിപ്പ്",
    },
    "pomegranate": {
        "hi": "अनार", "mr": "डाळिंब", "bn": "ডালিম", "pa": "ਅਨਾਰ",
        "gu": "દાડમ", "or": "ଡାଳିମ୍ବ", "ta": "மாதுளை", "te": "దానిమ్మ",
        "kn": "ದಾಳಿಂಬೆ", "ml": "മാതളം",
    },
    "banana": {
        "hi": "केला", "mr": "केळी", "bn": "কলা", "pa": "ਕੇਲਾ",
        "gu": "કેળા", "or": "କଦଳୀ", "ta": "வாழை", "te": "అరటి",
        "kn": "ಬಾಳೆಹಣ್ಣು", "ml": "വാഴ",
    },
    "mango": {
        "hi": "आम", "mr": "आंबा", "bn": "আম", "pa": "ਅੰਬ",
        "gu": "કેરી", "or": "ଆମ୍ବ", "ta": "மாம்பழம்", "te": "మామిడి",
        "kn": "ಮಾವು", "ml": "മാങ്ങ",
    },
    "grapes": {
        "hi": "अंगूर", "mr": "द्राक्षे", "bn": "আঙ্গুর", "pa": "ਅੰਗੂਰ",
        "gu": "દ્રાક્ષ", "or": "ଅଙ୍ଗୁର", "ta": "திராட்சை", "te": "ద్రాక్ష",
        "kn": "ದ್ರಾಕ್ಷಿ", "ml": "മുന്തിരി",
    },
    "watermelon": {
        "hi": "तरबूज", "mr": "कलिंगड", "bn": "তরমুজ", "pa": "ਤਰਬੂਜ਼",
        "gu": "તડબૂચ", "or": "ତରବୁଜ", "ta": "தர்பூசணி", "te": "పుచ్చకాయ",
        "kn": "ಕಲ್ಲಂಗಡಿ", "ml": "തണ്ണിമത്തൻ",
    },
    "muskmelon": {
        "hi": "खरबूजा", "mr": "खरबूज", "bn": "খরমুজ", "pa": "ਖਰਬੂਜ਼ਾ",
        "gu": "ટેટી", "or": "ଖରମୁଜ", "ta": "முலாம்பழம்", "te": "ఖర్బూజ",
        "kn": "ಕರ್ಬೂಜ", "ml": "മസ്കമെലൺ",
    },
    "apple": {
        "hi": "सेब", "mr": "सफरचंद", "bn": "আপেল", "pa": "ਸੇਬ",
        "gu": "સફરજન", "or": "ସେଓ", "ta": "ஆப்பிள்", "te": "ఆపిల్",
        "kn": "ಸೇಬು", "ml": "ആപ്പിൾ",
    },
    "orange": {
        "hi": "संतरा", "mr": "संत्रे", "bn": "কমলা", "pa": "ਸੰਤਰਾ",
        "gu": "નારંગી", "or": "କମଳା", "ta": "ஆரஞ்சு", "te": "నారింజ",
        "kn": "ಕಿತ್ತಳೆ", "ml": "ഓറഞ്ച്",
    },
    "papaya": {
        "hi": "पपीता", "mr": "पपई", "bn": "পেঁপে", "pa": "ਪਪੀਤਾ",
        "gu": "પપૈયું", "or": "ପିଜୁଳି", "ta": "பப்பாளி", "te": "బొప్పాయి",
        "kn": "ಪರಂಗಿ", "ml": "പപ്പായ",
    },
    "coconut": {
        "hi": "नारियल", "mr": "नारळ", "bn": "নারকেল", "pa": "ਨਾਰੀਅਲ",
        "gu": "નાળિયેર", "or": "ନଡ଼ିଆ", "ta": "தேங்காய்", "te": "కొబ్బరి",
        "kn": "ತೆಂಗಿನಕಾಯಿ", "ml": "തേങ്ങ",
    },
    "cotton": {
        "hi": "कपास", "mr": "कापूस", "bn": "তুলা", "pa": "ਕਪਾਹ",
        "gu": "કપાસ", "or": "କପା", "ta": "பருத்தி", "te": "పత్తి",
        "kn": "ಹತ್ತಿ", "ml": "പരുത്തി",
    },
    "jute": {
        "hi": "जूट", "mr": "ताग", "bn": "পাট", "pa": "ਜੂਟ",
        "gu": "શણ", "or": "ଜୁଟ", "ta": "சணல்", "te": "జనపనార",
        "kn": "ಸೆಣಬು", "ml": "ചണം",
    },
    "coffee": {
        "hi": "कॉफी", "mr": "कॉफी", "bn": "কফি", "pa": "ਕੌਫੀ",
        "gu": "કોફી", "or": "କଫି", "ta": "காபி", "te": "కాఫీ",
        "kn": "ಕಾಫಿ", "ml": "കാപ്പി",
    },
}


def translate_crop_name(crop_name, language):
    """Translates an English crop name (as returned by the ML model)
    into the target language using a fixed lookup table — reliable
    and instant, no LLM call needed for the model's known 22 crops."""

    if language == "en":
        return crop_name

    crop_key = crop_name.strip().lower()

    if crop_key in CROP_NAME_TRANSLATIONS:
        translated = CROP_NAME_TRANSLATIONS[crop_key].get(language)
        if translated:
            print(f"Crop name translation (lookup): {crop_name} -> {translated}")
            return translated

    # Fallback: crop not in the fixed table — try Groq, else English
    try:
        language_name = LANGUAGE_NAMES.get(language, "English")

        prompt = f"""
Translate the English crop/plant name "{crop_name}" into {language_name}.
Output ONLY the translated crop name, nothing else — no explanation,
no punctuation, no English text.
"""

        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=30,
        )

        translated = response.choices[0].message.content.strip()

        print(f"Crop name translation (LLM fallback): {crop_name} -> '{translated}'")

        return translated if translated else crop_name

    except Exception as e:
        print("Crop Name Translation Error:", e)
        return crop_name

CONFIDENCE_TIER_TRANSLATIONS = {
    "High": {
        "en": "High",
        "hi": "उच्च",
        "mr": "उच्च",
        "bn": "উচ্চ",
        "pa": "ਉੱਚ",
        "gu": "ઉચ્ચ",
        "or": "ଉଚ୍ଚ",
        "ta": "அதிகம்",
        "te": "అధికం",
        "kn": "ಹೆಚ್ಚು",
        "ml": "ഉയർന്നത്",
    },

    "Moderate": {
        "en": "Moderate",
        "hi": "मध्यम",
        "mr": "मध्यम",
        "bn": "মাঝারি",
        "pa": "ਦਰਮਿਆਨਾ",
        "gu": "મધ્યમ",
        "or": "ମଧ୍ୟମ",
        "ta": "மிதமானது",
        "te": "మధ్యస్థం",
        "kn": "ಮಧ್ಯಮ",
        "ml": "മിതമായത്",
    },

    "Low": {
        "en": "Low",
        "hi": "कम",
        "mr": "कमी",
        "bn": "কম",
        "pa": "ਘੱਟ",
        "gu": "ઓછું",
        "or": "କମ୍",
        "ta": "குறைவு",
        "te": "తక్కువ",
        "kn": "ಕಡಿಮೆ",
        "ml": "കുറഞ്ഞത്",
    },
}


def translate_confidence_tier(tier, language):
    if language == "en":
        return tier

    return CONFIDENCE_TIER_TRANSLATIONS.get(
        tier,
        {}
    ).get(language, tier)
# ==========================================
# WEATHER RESPONSE
# ==========================================

def create_weather_response(message, city):

    language = detect_language(message)
    message_lower = message.lower()

    tomorrow_keywords = ["tomorrow", "कल", "उद्या"]
    is_tomorrow = any(keyword in message_lower for keyword in tomorrow_keywords)

    if is_tomorrow:

        prediction = get_tomorrow_rain_prediction(city)

        if not prediction["success"]:
            return None

        probability = prediction["probability"]
        weather_city = prediction["city"]

        if language == "en":
            if prediction["rain_expected"]:
                return (
                    f"Yes, rain is expected tomorrow in {weather_city}. "
                    f"The probability of rain is approximately {probability}%."
                )
            return (
                f"No significant rain is expected tomorrow in {weather_city}. "
                f"The probability of rain is approximately {probability}%."
            )

        elif language == "hi":
            if prediction["rain_expected"]:
                return (
                    f"हाँ, कल {weather_city} में बारिश होने की संभावना है। "
                    f"बारिश की संभावना लगभग {probability}% है।"
                )
            return (
                f"फिलहाल कल {weather_city} में तेज बारिश की संभावना नहीं है। "
                f"बारिश की संभावना लगभग {probability}% है।"
            )

        elif language == "mr":
            if prediction["rain_expected"]:
                return (
                    f"होय, उद्या {weather_city} मध्ये पाऊस पडण्याची शक्यता आहे. "
                    f"पावसाची शक्यता सुमारे {probability}% आहे."
                )
            return (
                f"सध्या उद्या {weather_city} मध्ये मोठ्या पावसाची शक्यता नाही. "
                f"पावसाची शक्यता सुमारे {probability}% आहे."
            )

        else:
            facts = (
                f"City: {weather_city}, "
                f"Rain expected tomorrow: {'Yes' if prediction['rain_expected'] else 'No'}, "
                f"Rain probability: {probability}%"
            )
            return phrase_in_language(facts, language)

    # CURRENT WEATHER

    weather = get_current_weather(city)

    if not weather["success"]:
        print("Current weather API failed for city:", city, "| Error:", weather.get("error"))
        return None

    weather_city = weather["city"]

    if language == "en":
        return (
            f"The current weather in {weather_city} is {weather['description']}. "
            f"Temperature is {weather['temperature']}°C, "
            f"feels like {weather['feels_like']}°C, "
            f"humidity is {weather['humidity']}%, "
            f"and wind speed is {weather['wind_speed']} m/s."
        )

    elif language == "hi":
        return (
            f"{weather_city} में वर्तमान मौसम {weather['description']} है। "
            f"तापमान {weather['temperature']}°C है, "
            f"महसूस होने वाला तापमान {weather['feels_like']}°C है, "
            f"नमी {weather['humidity']}% है और "
            f"हवा की गति {weather['wind_speed']} m/s है।"
        )

    elif language == "mr":
        return (
            f"{weather_city} मधील सध्याचे हवामान {weather['description']} आहे. "
            f"तापमान {weather['temperature']}°C आहे, "
            f"जाणवणारे तापमान {weather['feels_like']}°C आहे, "
            f"आर्द्रता {weather['humidity']}% आहे आणि "
            f"वाऱ्याचा वेग {weather['wind_speed']} m/s आहे."
        )

    else:
        facts = (
            f"City: {weather_city}, Condition: {weather['description']}, "
            f"Temperature: {weather['temperature']}°C, "
            f"Feels like: {weather['feels_like']}°C, "
            f"Humidity: {weather['humidity']}%, "
            f"Wind speed: {weather['wind_speed']} m/s"
        )
        return phrase_in_language(facts, language)


# ==========================================
# CROP RECOMMENDATION — REDIRECT MESSAGE
# ==========================================

def create_crop_recommendation_response(message):

    language = detect_language(message)

    templates = {
        "hi": (
            "सटीक फसल सुझाव के लिए कृपया 'Crop Recommendation' सेक्शन में जाएं "
            "और अपनी मिट्टी (Nitrogen, Phosphorus, Potassium, pH) और मौसम "
            "(Temperature, Humidity, Rainfall) की जानकारी भरें। "
            "वहाँ हमारा AI मॉडल आपको सबसे उपयुक्त फसल बताएगा।"
        ),
        "mr": (
            "अचूक पीक शिफारशीसाठी कृपया 'Crop Recommendation' विभागात जा "
            "आणि तुमच्या मातीची (Nitrogen, Phosphorus, Potassium, pH) आणि हवामानाची "
            "(Temperature, Humidity, Rainfall) माहिती भरा. "
            "आमचे AI मॉडेल तुम्हाला योग्य पीक सुचवेल."
        ),
        "bn": (
            "সঠিক ফসলের পরামর্শের জন্য অনুগ্রহ করে 'Crop Recommendation' বিভাগে যান "
            "এবং আপনার মাটির (Nitrogen, Phosphorus, Potassium, pH) এবং আবহাওয়ার "
            "(Temperature, Humidity, Rainfall) তথ্য দিন। "
            "আমাদের AI মডেল আপনাকে সবচেয়ে উপযুক্ত ফসল জানাবে।"
        ),
        "pa": (
            "ਸਹੀ ਫਸਲ ਸੁਝਾਅ ਲਈ ਕਿਰਪਾ ਕਰਕੇ 'Crop Recommendation' ਸੈਕਸ਼ਨ ਵਿੱਚ ਜਾਓ "
            "ਅਤੇ ਆਪਣੀ ਮਿੱਟੀ (Nitrogen, Phosphorus, Potassium, pH) ਅਤੇ ਮੌਸਮ "
            "(Temperature, Humidity, Rainfall) ਦੀ ਜਾਣਕਾਰੀ ਭਰੋ। "
            "ਸਾਡਾ AI ਮਾਡਲ ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਢੁਕਵੀਂ ਫਸਲ ਦੱਸੇਗਾ।"
        ),
        "gu": (
            "ચોક્કસ પાક સૂચન માટે કૃપા કરીને 'Crop Recommendation' વિભાગમાં જાઓ "
            "અને તમારી માટી (Nitrogen, Phosphorus, Potassium, pH) અને હવામાનની "
            "(Temperature, Humidity, Rainfall) માહિતી ભરો. "
            "અમારું AI મોડેલ તમને સૌથી યોગ્ય પાક જણાવશે."
        ),
        "or": (
            "ସଠିକ ଫସଲ ପରାମର୍ଶ ପାଇଁ ଦୟାକରି 'Crop Recommendation' ବିଭାଗକୁ ଯାଆନ୍ତୁ "
            "ଏବଂ ଆପଣଙ୍କ ମାଟିର (Nitrogen, Phosphorus, Potassium, pH) ଏବଂ ପାଗର "
            "(Temperature, Humidity, Rainfall) ସୂଚନା ଭରନ୍ତୁ। "
            "ଆମର AI ମଡେଲ ଆପଣଙ୍କୁ ସବୁଠାରୁ ଉପଯୁକ୍ତ ଫସଲ କହିବ।"
        ),
        "ta": (
            "துல்லியமான பயிர் பரிந்துரைக்கு தயவுசெய்து 'Crop Recommendation' "
            "பிரிவுக்குச் சென்று உங்கள் மண் (Nitrogen, Phosphorus, Potassium, pH) "
            "மற்றும் காலநிலை (Temperature, Humidity, Rainfall) தகவல்களை நிரப்பவும். "
            "எங்கள் AI மாதிரி உங்களுக்கு மிகவும் பொருத்தமான பயிரை தெரிவிக்கும்."
        ),
        "te": (
            "ఖచ్చితమైన పంట సిఫార్సు కోసం దయచేసి 'Crop Recommendation' విభాగానికి వెళ్లి "
            "మీ నేల (Nitrogen, Phosphorus, Potassium, pH) మరియు వాతావరణ "
            "(Temperature, Humidity, Rainfall) వివరాలను నింపండి. "
            "మా AI మోడల్ మీకు అత్యంత అనుకూలమైన పంటను చెబుతుంది."
        ),
        "kn": (
            "ನಿಖರವಾದ ಬೆಳೆ ಶಿಫಾರಸಿಗಾಗಿ ದಯವಿಟ್ಟು 'Crop Recommendation' ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ "
            "ನಿಮ್ಮ ಮಣ್ಣಿನ (Nitrogen, Phosphorus, Potassium, pH) ಮತ್ತು ಹವಾಮಾನದ "
            "(Temperature, Humidity, Rainfall) ಮಾಹಿತಿಯನ್ನು ಭರ್ತಿ ಮಾಡಿ. "
            "ನಮ್ಮ AI ಮಾದರಿ ನಿಮಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ ಬೆಳೆಯನ್ನು ತಿಳಿಸುತ್ತದೆ."
        ),
        "ml": (
            "കൃത്യമായ വിള നിർദ്ദേശത്തിനായി ദയവായി 'Crop Recommendation' "
            "വിഭാഗത്തിലേക്ക് പോയി നിങ്ങളുടെ മണ്ണിന്റെ (Nitrogen, Phosphorus, "
            "Potassium, pH) കൂടാതെ കാലാവസ്ഥയുടെ (Temperature, Humidity, "
            "Rainfall) വിവരങ്ങൾ പൂരിപ്പിക്കുക. ഞങ്ങളുടെ AI മോഡൽ നിങ്ങൾക്ക് "
            "ഏറ്റവും അനുയോജ്യമായ വിള നിർദ്ദേശിക്കും."
        ),
        "en": (
            "For an accurate crop recommendation, please go to the "
            "'Crop Recommendation' section and enter your soil details "
            "(Nitrogen, Phosphorus, Potassium, pH) and climate details "
            "(Temperature, Humidity, Rainfall). "
            "Our AI model will then suggest the most suitable crop for you."
        ),
    }

    return templates.get(language, templates["en"])


# ==========================================
# CROP TERM VARIANTS (multilingual)
# ==========================================

CROP_TERM_VARIANTS = {
    "nitrogen": [
        "nitrogen", "नाइट्रोजन", "नायट्रोजन", "নাইট্রোজেন",
        "ਨਾਈਟ੍ਰੋਜਨ", "નાઇટ્રોજન", "ନାଇଟ୍ରୋଜେନ", "நைட்ரஜன்",
        "నత్రజని", "నైట్రోజన్", "ನೈಟ್ರೋಜನ್", "ಸಾರಜನಕ", "നൈട്രജൻ",
    ],
    "phosphorus": [
        "phosphorus", "फॉस्फोरस", "फॉस्फरस", "ফসফরাস",
        "ਫਾਸਫੋਰਸ", "ફોસ્ફરસ", "ଫସଫରସ", "பாஸ்பரஸ்",
        "భాస్వరం", "ಫಾಸ್ಫರಸ್", "ರಂಜಕ", "ഫോസ്ഫറസ്",
    ],
    "potassium": [
        "potassium", "पोटैशियम", "पोटाश", "पोटॅशियम", "পটাশিয়াম",
        "ਪੋਟਾਸ਼ੀਅਮ", "પોટેશિયમ", "ପୋଟାସିୟମ", "பொட்டாசியம்",
        "పొటాషియం", "ಪೊಟ್ಯಾಶಿಯಂ", "പൊട്ടാസ്യം",
    ],
    "temperature": [
        "temperature", "तापमान", "তাপমাত্রা", "ਤਾਪਮਾਨ", "તાપમાન",
        "ତାପମାତ୍ରା", "வெப்பநிலை", "ఉష్ణోగ్రత", "ತಾಪಮಾನ", "താപനില",
    ],
    "humidity": [
        "humidity", "नमी", "आर्द्रता", "আর্দ্রতা", "ਨਮੀ", "ભેજ",
        "ଆର୍ଦ୍ରତା", "ஈரப்பதம்", "తేమ", "ಆರ್ದ್ರತೆ", "ഈർപ്പം",
    ],
    "ph": [
        "ph",
    ],
    "rainfall": [
        "rainfall", "वर्षा", "बारिश", "पर्जन्य", "पाऊस", "বৃষ্টিপাত",
        "ਬਾਰਿਸ਼", "ਵਰਖਾ", "વરસાદ", "ବର୍ଷା", "மழைவீழ்ச்சி", "மழை",
        "వర్షపాతం", "ಮಳೆ", "മഴ",
    ],
}


# ==========================================
# EXTRACT CROP VALUES FROM CHAT MESSAGE
# ==========================================

def extract_crop_values(message):

    values = {}

    for key, terms in CROP_TERM_VARIANTS.items():

        term_pattern = "|".join(re.escape(term) for term in terms)

        if key == "ph":
            # word-boundary after too, so it doesn't match inside "phosphorus"
            pattern = rf"\b(?:{term_pattern})\b[^\d\-]*(-?\d+\.?\d*)"
        else:
            pattern = rf"(?:{term_pattern})[^\d\-]*(-?\d+\.?\d*)"

        match = re.search(pattern, message, re.IGNORECASE)

        if match:
            values[key] = float(match.group(1))

    return values


# ==========================================
# CHAT ENDPOINT
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):

    message = request.message.strip()

    print("\n==============================")
    print("User Question:", message)
    print("Message repr (for encoding debug):", repr(message))

    intent = detect_intent(message)

    print("Detected Intent:", intent)

    # --------------------------------------
    # WEATHER
    # --------------------------------------

    if intent == "weather":

        city = extract_city(message)

        print("Detected City (regex):", city)

        if city:

            resolved_city = resolve_city_in_english(message, city)

            if resolved_city:

                weather_response = create_weather_response(message, resolved_city)

                if weather_response:
                    return {
                        "response": weather_response,
                        "source": "weather_api",
                        "intent": "weather",
                        "city": resolved_city
                    }

        language = detect_language(message)

        if language == "hi":
            response_text = "कृपया उस शहर का नाम बताइए जिसके मौसम की जानकारी चाहिए।"
        elif language == "mr":
            response_text = "कृपया तुम्हाला कोणत्या शहराचे हवामान जाणून घ्यायचे आहे ते सांगा."
        else:
            response_text = "Please tell me the city name for weather information."

        return {
            "response": response_text,
            "source": "weather",
            "intent": "weather"
        }

    # --------------------------------------
    # CROP RECOMMENDATION
    # --------------------------------------

    if intent == "crop_recommendation":

        extracted = extract_crop_values(message)

        required_fields = [
            "nitrogen", "phosphorus", "potassium",
            "temperature", "humidity", "ph", "rainfall"
        ]

        if all(field in extracted for field in required_fields):

            try:
                crop_request = CropRecommendationRequest(**extracted)
                result = crop_predictor.predict(crop_request)

                crop_name = result.prediction.recommended_crop
                confidence = result.prediction.confidence_pct

                language = detect_language(message)
                print(f"Crop response language detected: '{language}'")
                crop_name_display = translate_crop_name(crop_name, language)

                if language == "hi":
                    response_text = (
                        f"आपके दिए गए आंकड़ों के अनुसार, आपके खेत के लिए "
                        f"'{crop_name_display}' सबसे उपयुक्त फसल है "
                        f"(विश्वास स्तर: {confidence}%)।"
                    )
                elif language == "mr":
                    response_text = (
                        f"तुम्ही दिलेल्या माहितीनुसार, तुमच्या शेतासाठी "
                        f"'{crop_name_display}' हे सर्वोत्तम पीक आहे "
                        f"(विश्वास पातळी: {confidence}%)."
                    )
                elif language == "bn":
                    response_text = (
                        f"আপনার দেওয়া তথ্য অনুযায়ী, আপনার জমির জন্য "
                        f"'{crop_name_display}' সবচেয়ে উপযুক্ত ফসল "
                        f"(আত্মবিশ্বাস: {confidence}%)।"
                    )
                elif language == "pa":
                    response_text = (
                        f"ਤੁਹਾਡੇ ਦਿੱਤੇ ਅੰਕੜਿਆਂ ਅਨੁਸਾਰ, ਤੁਹਾਡੇ ਖੇਤ ਲਈ "
                        f"'{crop_name_display}' ਸਭ ਤੋਂ ਢੁਕਵੀਂ ਫਸਲ ਹੈ "
                        f"(ਭਰੋਸਾ: {confidence}%)।"
                    )
                elif language == "gu":
                    response_text = (
                        f"તમે આપેલા આંકડા મુજબ, તમારા ખેતર માટે "
                        f"'{crop_name_display}' સૌથી યોગ્ય પાક છે "
                        f"(વિશ્વાસ સ્તર: {confidence}%)."
                    )
                elif language == "or":
                    response_text = (
                        f"ଆପଣ ଦେଇଥିବା ତଥ୍ୟ ଅନୁଯାୟୀ, ଆପଣଙ୍କ ଜମି ପାଇଁ "
                        f"'{crop_name_display}' ସବୁଠାରୁ ଉପଯୁକ୍ତ ଫସଲ "
                        f"(ବିଶ୍ୱାସ: {confidence}%)।"
                    )
                elif language == "ta":
                    response_text = (
                        f"நீங்கள் கொடுத்த தரவுகளின்படி, உங்கள் வயலுக்கு "
                        f"'{crop_name_display}' மிகவும் பொருத்தமான பயிர் "
                        f"(நம்பகத்தன்மை: {confidence}%)."
                    )
                elif language == "te":
                    response_text = (
                        f"మీరు ఇచ్చిన సమాచారం ప్రకారం, మీ పొలానికి "
                        f"'{crop_name_display}' అత్యంత అనుకూలమైన పంట "
                        f"(విశ్వాసం: {confidence}%)."
                    )
                elif language == "kn":
                    response_text = (
                        f"ನೀವು ನೀಡಿದ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ಹೊಲಕ್ಕೆ "
                        f"'{crop_name_display}' ಅತ್ಯಂತ ಸೂಕ್ತ ಬೆಳೆಯಾಗಿದೆ "
                        f"(ವಿಶ್ವಾಸ: {confidence}%)."
                    )
                elif language == "ml":
                    response_text = (
                        f"നിങ്ങൾ നൽകിയ വിവരങ്ങൾ അനുസരിച്ച്, നിങ്ങളുടെ "
                        f"കൃഷിയിടത്തിന് '{crop_name_display}' ഏറ്റവും "
                        f"അനുയോജ്യമായ വിളയാണ് (വിശ്വാസം: {confidence}%)."
                    )
                else:
                    response_text = (
                        f"Based on the values you provided, "
                        f"'{crop_name_display}' would be best suited for your farm "
                        f"(confidence: {confidence}%)."
                    )

                return {
                    "response": response_text,
                    "source": "ml_model",
                    "intent": "crop_recommendation",
                    "prediction": crop_name,
                    "confidence": confidence
                }

            except Exception as e:
                print("Crop Model Error (chat):", e)

        if not extracted:
            return {
                "response": ask_llama(message),
                "source": "llm_fallback",
                "intent": "crop_recommendation"
            }

        return {
            "response": create_crop_recommendation_response(message),
            "source": "crop_redirect",
            "intent": "crop_recommendation",
            "redirect": "/crop-recommendation"
        }

    # --------------------------------------
    # DISEASE DETECTION / SOIL ANALYSIS (LLM fallback for now)
    # --------------------------------------

    if intent == "disease_detection":
        return {
            "response": ask_llama(message),
            "source": "llm_fallback",
            "intent": "disease_detection"
        }

    if intent == "soil_analysis":
        return {
            "response": ask_llama(message),
            "source": "llm_fallback",
            "intent": "soil_analysis"
        }

    # --------------------------------------
    # GENERAL LLM
    # --------------------------------------

    llm_response = ask_llama(message)

    return {
        "response": llm_response,
        "source": "general_llm",
        "intent": "general"
    }


# ==========================================
# CROP RECOMMENDATION FORM ENDPOINT
# ==========================================

""" @app.post("/crop-recommendation/predict", response_model=CropRecommendationResponse)
async def predict_crop(request: CropRecommendationRequest):
    return crop_predictor.predict(request) """

@app.post("/crop-recommendation/predict", response_model=CropRecommendationResponse)
async def predict_crop(request: CropRecommendationRequest):

    # Get original ML prediction
    result = crop_predictor.predict(request)

    # Selected language from frontend/request
    language = request.language

    print(f"Crop recommendation response language: {language}")

    # --------------------------------------
    # Translate recommended crop
    # --------------------------------------

    result.prediction.recommended_crop = translate_crop_name(
        result.prediction.recommended_crop,
        language
    )

    # --------------------------------------
    # Translate confidence tier
    # --------------------------------------

    result.prediction.confidence_tier = translate_confidence_tier(
        result.prediction.confidence_tier,
        language
    )

    # --------------------------------------
    # Translate alternative crops
    # --------------------------------------

    for alternative in result.prediction.top_alternatives:

        alternative.crop = translate_crop_name(
            alternative.crop,
            language
        )

    return result

# ==========================================
# SOIL ANALYSIS ENDPOINT
# ==========================================
@app.post("/soil-analysis/analyze", response_model=SoilAdvisoryResponse)
async def analyze_soil(request: SoilAnalysisRequest):
    return generate_soil_advisory(
        n=request.nitrogen,
        p=request.phosphorus,
        k=request.potassium,
        ph_val=request.ph,
        ec=request.ec,
        oc=request.oc,
        caco3=request.caco3,
    )

# ==========================================
# YIELD PREDICTION ENDPOINT
# ==========================================
@app.post("/yield-prediction/predict", response_model=YieldPredictionResponse)
async def predict_yield(request: YieldPredictionRequest):
    return yield_predictor.predict(request)

# ==========================================
# SPEECH TO TEXT (Groq Whisper)
# ==========================================

@app.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):

    try:
        audio_bytes = await audio.read()

        transcription = groq_client.audio.transcriptions.create(
            file=(audio.filename, audio_bytes),
            model="whisper-large-v3-turbo",
            response_format="verbose_json",
        )

        return {
            "text": transcription.text,
            "detected_language": transcription.language
        }

    except Exception as e:
        print("STT Error:", e)
        raise HTTPException(
            status_code=500,
            detail="Speech-to-text failed. Please try again."
        )


# ==========================================
# TEXT TO SPEECH (Smallest.ai Waves)
# ==========================================

@app.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):

    try:
        if not request.text:
            raise HTTPException(
                status_code=400,
                detail="No text provided for speech synthesis."
            )

        voice_id = LANGUAGE_VOICE_MAP.get(request.language, "srishti")

        response = requests.post(
            SMALLEST_TTS_URL,
            headers={
                "Authorization": f"Bearer {SMALLEST_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "audio/wav",
            },
            json={
                "text": request.text,
                "voice_id": voice_id,
                "model": "lightning_v3.1",
                "language": request.language,
                "sample_rate": 24000,
                "output_format": "wav",
            },
        )

        response.raise_for_status()

        return Response(content=response.content, media_type="audio/wav")

    except requests.exceptions.HTTPError as e:
        error_body = e.response.text if e.response is not None else "No response body"
        print("TTS HTTP Error:", error_body)
        raise HTTPException(
            status_code=500,
            detail=f"Smallest.ai error: {error_body}"
        )

    except Exception as e:
        print("TTS Error:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Text-to-speech failed: {str(e)}"
        )