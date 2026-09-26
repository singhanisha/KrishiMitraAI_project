from typing import Dict


# ============================================================
# Supported Languages
# ============================================================

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "pa": "Punjabi",
    "ta": "Tamil",
    "mr": "Marathi",
    "te": "Telugu",
    "ml": "Malayalam",
    "kn": "Kannada",
    "or": "Odia",
    "gu": "Gujarati",
}


# ============================================================
# Crop Translations
# Exact 22 crop classes from Crop_recommendation.csv
# ============================================================

CROP_TRANSLATIONS: Dict[str, Dict[str, str]] = {

    "rice": {
        "en": "rice",
        "hi": "चावल",
        "bn": "ধান",
        "pa": "ਚੌਲ",
        "ta": "நெல்",
        "mr": "तांदूळ",
        "te": "వరి",
        "ml": "നെല്ല്",
        "kn": "ಭತ್ತ",
        "or": "ଧାନ",
        "gu": "ચોખા",
    },

    "maize": {
        "en": "maize",
        "hi": "मक्का",
        "bn": "ভুট্টা",
        "pa": "ਮੱਕੀ",
        "ta": "மக்காச்சோளம்",
        "mr": "मका",
        "te": "మొక్కజొన్న",
        "ml": "ചോളം",
        "kn": "ಮೆಕ್ಕೆಜೋಳ",
        "or": "ମକା",
        "gu": "મકાઈ",
    },

    "chickpea": {
        "en": "chickpea",
        "hi": "चना",
        "bn": "ছোলা",
        "pa": "ਛੋਲੇ",
        "ta": "கொண்டைக்கடலை",
        "mr": "हरभरा",
        "te": "శనగ",
        "ml": "കടല",
        "kn": "ಕಡಲೆ",
        "or": "ବୁଟ",
        "gu": "ચણા",
    },

    "kidneybeans": {
        "en": "kidney beans",
        "hi": "राजमा",
        "bn": "রাজমা",
        "pa": "ਰਾਜਮਾਹ",
        "ta": "ராஜ்மா",
        "mr": "राजमा",
        "te": "రాజ్మా",
        "ml": "രാജ്മ",
        "kn": "ರಾಜ್ಮಾ",
        "or": "ରାଜମା",
        "gu": "રાજમા",
    },

    "pigeonpeas": {
        "en": "pigeon peas",
        "hi": "अरहर",
        "bn": "অড়হর ডাল",
        "pa": "ਅਰਹਰ",
        "ta": "துவரை",
        "mr": "तूर",
        "te": "కందులు",
        "ml": "തുവരപ്പരിപ്പ്",
        "kn": "ತೊಗರಿ",
        "or": "ହରଡ଼",
        "gu": "તુવેર",
    },

    "mothbeans": {
        "en": "moth beans",
        "hi": "मोठ",
        "bn": "মোঠ ডাল",
        "pa": "ਮੋਠ",
        "ta": "மொத் பீன்ஸ்",
        "mr": "मटकी",
        "te": "మోత్ బీన్స్",
        "ml": "മോത്ത് പയർ",
        "kn": "ಮೋತ್ ಬೀನ್ಸ್",
        "or": "ମୋଠ",
        "gu": "મઠ",
    },

    "mungbean": {
        "en": "mung bean",
        "hi": "मूंग",
        "bn": "মুগ ডাল",
        "pa": "ਮੂੰਗ",
        "ta": "பாசிப்பயறு",
        "mr": "मूग",
        "te": "పెసలు",
        "ml": "ചെറുപയർ",
        "kn": "ಹೆಸರುಕಾಳು",
        "or": "ମୁଗ",
        "gu": "મગ",
    },

    "blackgram": {
        "en": "black gram",
        "hi": "उड़द",
        "bn": "মাষকলাই",
        "pa": "ਉੜਦ",
        "ta": "உளுந்து",
        "mr": "उडीद",
        "te": "మినుములు",
        "ml": "ഉഴുന്ന്",
        "kn": "ಉದ್ದು",
        "or": "ବିରି",
        "gu": "અડદ",
    },

    "lentil": {
        "en": "lentil",
        "hi": "मसूर",
        "bn": "মসুর ডাল",
        "pa": "ਮਸੂਰ",
        "ta": "மசூர் பருப்பு",
        "mr": "मसूर",
        "te": "మసూర్ పప్పు",
        "ml": "മസൂർ പരിപ്പ്",
        "kn": "ಮಸೂರ್ ಬೇಳೆ",
        "or": "ମସୁର",
        "gu": "મસૂર",
    },

    "pomegranate": {
        "en": "pomegranate",
        "hi": "अनार",
        "bn": "ডালিম",
        "pa": "ਅਨਾਰ",
        "ta": "மாதுளை",
        "mr": "डाळिंब",
        "te": "దానిమ్మ",
        "ml": "മാതളം",
        "kn": "ದಾಳಿಂಬೆ",
        "or": "ଡାଳିମ୍ବ",
        "gu": "દાડમ",
    },

    "banana": {
        "en": "banana",
        "hi": "केला",
        "bn": "কলা",
        "pa": "ਕੇਲਾ",
        "ta": "வாழை",
        "mr": "केळी",
        "te": "అరటి",
        "ml": "വാഴപ്പഴം",
        "kn": "ಬಾಳೆ",
        "or": "କଦଳୀ",
        "gu": "કેળું",
    },

    "mango": {
        "en": "mango",
        "hi": "आम",
        "bn": "আম",
        "pa": "ਅੰਬ",
        "ta": "மாம்பழம்",
        "mr": "आंबा",
        "te": "మామిడి",
        "ml": "മാങ്ങ",
        "kn": "ಮಾವು",
        "or": "ଆମ୍ବ",
        "gu": "કેરી",
    },

    "grapes": {
        "en": "grapes",
        "hi": "अंगूर",
        "bn": "আঙুর",
        "pa": "ਅੰਗੂਰ",
        "ta": "திராட்சை",
        "mr": "द्राक्षे",
        "te": "ద్రాక్ష",
        "ml": "മുന്തിരി",
        "kn": "ದ್ರಾಕ್ಷಿ",
        "or": "ଅଙ୍ଗୁର",
        "gu": "દ્રાક્ષ",
    },

    "watermelon": {
        "en": "watermelon",
        "hi": "तरबूज",
        "bn": "তরমুজ",
        "pa": "ਤਰਬੂਜ",
        "ta": "தர்பூசணி",
        "mr": "कलिंगड",
        "te": "పుచ్చకాయ",
        "ml": "തണ്ണിമത്തൻ",
        "kn": "ಕಲ್ಲಂಗಡಿ",
        "or": "ତରଭୁଜ",
        "gu": "તરબૂચ",
    },

    "muskmelon": {
        "en": "muskmelon",
        "hi": "खरबूजा",
        "bn": "খরমুজ",
        "pa": "ਖਰਬੂਜਾ",
        "ta": "முலாம்பழம்",
        "mr": "खरबूज",
        "te": "ఖర్బూజ",
        "ml": "തണ്ണിമത്തൻ",
        "kn": "ಖರ್ಬೂಜ",
        "or": "ଖରଭୁଜ",
        "gu": "શક્કરટેટી",
    },

    "apple": {
        "en": "apple",
        "hi": "सेब",
        "bn": "আপেল",
        "pa": "ਸੇਬ",
        "ta": "ஆப்பிள்",
        "mr": "सफरचंद",
        "te": "ఆపిల్",
        "ml": "ആപ്പിൾ",
        "kn": "ಸೇಬು",
        "or": "ସେଓ",
        "gu": "સફરજન",
    },

    "orange": {
        "en": "orange",
        "hi": "संतरा",
        "bn": "কমলা",
        "pa": "ਸੰਤਰਾ",
        "ta": "ஆரஞ்சு",
        "mr": "संत्रे",
        "te": "నారింజ",
        "ml": "ഓറഞ്ച്",
        "kn": "ಕಿತ್ತಳೆ",
        "or": "କମଳା",
        "gu": "નારંગી",
    },

    "papaya": {
        "en": "papaya",
        "hi": "पपीता",
        "bn": "পেঁপে",
        "pa": "ਪਪੀਤਾ",
        "ta": "பப்பாளி",
        "mr": "पपई",
        "te": "బొప్పాయి",
        "ml": "പപ്പായ",
        "kn": "ಪಪ್ಪಾಯಿ",
        "or": "ଅମୃତଭଣ୍ଡା",
        "gu": "પપૈયું",
    },

    "coconut": {
        "en": "coconut",
        "hi": "नारियल",
        "bn": "নারকেল",
        "pa": "ਨਾਰੀਅਲ",
        "ta": "தேங்காய்",
        "mr": "नारळ",
        "te": "కొబ్బరి",
        "ml": "തേങ്ങ",
        "kn": "ತೆಂಗಿನಕಾಯಿ",
        "or": "ନଡ଼ିଆ",
        "gu": "નાળિયેર",
    },

    "cotton": {
        "en": "cotton",
        "hi": "कपास",
        "bn": "তুলা",
        "pa": "ਕਪਾਹ",
        "ta": "பருத்தி",
        "mr": "कापूस",
        "te": "పత్తి",
        "ml": "പരുത്തി",
        "kn": "ಹತ್ತಿ",
        "or": "କପା",
        "gu": "કપાસ",
    },

    "jute": {
        "en": "jute",
        "hi": "जूट",
        "bn": "পাট",
        "pa": "ਜੂਟ",
        "ta": "சணல்",
        "mr": "ताग",
        "te": "జనపనార",
        "ml": "ചണം",
        "kn": "ಸೆಣಬು",
        "or": "ପାଟ",
        "gu": "શણ",
    },

    "coffee": {
        "en": "coffee",
        "hi": "कॉफी",
        "bn": "কফি",
        "pa": "ਕੌਫੀ",
        "ta": "காபி",
        "mr": "कॉफी",
        "te": "కాఫీ",
        "ml": "കാപ്പി",
        "kn": "ಕಾಫಿ",
        "or": "କଫି",
        "gu": "કોફી",
    },
}


# ============================================================
# Confidence Tier Translations
# ============================================================

CONFIDENCE_TIER_TRANSLATIONS: Dict[str, Dict[str, str]] = {

    "High": {
        "en": "High",
        "hi": "उच्च",
        "bn": "উচ্চ",
        "pa": "ਉੱਚ",
        "ta": "அதிகம்",
        "mr": "उच्च",
        "te": "అధికం",
        "ml": "ഉയർന്നത്",
        "kn": "ಹೆಚ್ಚು",
        "or": "ଉଚ୍ଚ",
        "gu": "ઉચ્ચ",
    },

    "Moderate": {
        "en": "Moderate",
        "hi": "मध्यम",
        "bn": "মাঝারি",
        "pa": "ਦਰਮਿਆਨਾ",
        "ta": "மிதமானது",
        "mr": "मध्यम",
        "te": "మధ్యస్థం",
        "ml": "മിതമായത്",
        "kn": "ಮಧ್ಯಮ",
        "or": "ମଧ୍ୟମ",
        "gu": "મધ્યમ",
    },

    "Low": {
        "en": "Low",
        "hi": "कम",
        "bn": "কম",
        "pa": "ਘੱਟ",
        "ta": "குறைவு",
        "mr": "कमी",
        "te": "తక్కువ",
        "ml": "കുറഞ്ഞത്",
        "kn": "ಕಡಿಮೆ",
        "or": "କମ୍",
        "gu": "ઓછું",
    },
}


# ============================================================
# Translation Functions
# ============================================================

def translate_crop(crop: str, language: str) -> str:
    """
    Translate a crop name into the selected language.
    If translation is unavailable, return original crop name.
    """

    crop_key = crop.strip().lower()

    if language == "en":
        return crop

    crop_data = CROP_TRANSLATIONS.get(crop_key)

    if not crop_data:
        return crop

    return crop_data.get(language, crop)


def translate_confidence_tier(tier: str, language: str) -> str:
    """
    Translate High / Moderate / Low into the selected language.
    """

    if language == "en":
        return tier

    tier_data = CONFIDENCE_TIER_TRANSLATIONS.get(tier)

    if not tier_data:
        return tier

    return tier_data.get(language, tier)