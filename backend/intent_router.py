import re


# ==========================================
# WEATHER INTENT DETECTION
# ==========================================

def detect_intent(message):

    message_lower = message.lower().strip()

    # --------------------------------------
    # CROP INTENT CHECK FIRST
    # (checked before weather because crop messages
    # also mention "temperature" etc, which overlaps
    # with weather keywords)
    # --------------------------------------

    crop_keywords = [
        "crop recommendation",
        "which crop",
        "best crop",
        "फसल",
        "कौन सी फसल",
        "फसल की सलाह",
        "पीक",
        "ফসল",
        "ਫਸਲ",
        "પાક",
        "ଫସଲ",
        "பயிர்",
        "పంట",
        "ಬೆಳೆ",
        "വിള",
    ]

    crop_value_signals = [
        "nitrogen", "phosphorus", "potassium",
        "नाइट्रोजन", "फॉस्फोरस", "पोटैशियम", "पोटाश",
        "नायट्रोजन", "फॉस्फरस", "पोटॅशियम",
        "নাইট্রোজেন", "ফসফরাস", "পটাশিয়াম",
        "ਨਾਈਟ੍ਰੋਜਨ", "ਫਾਸਫੋਰਸ", "ਪੋਟਾਸ਼ੀਅਮ",
        "નાઇટ્રોજન", "ફોસ્ફરસ", "પોટેશિયમ",
        "ନାଇଟ୍ରୋଜେନ", "ଫସଫରସ", "ପୋଟାସିୟମ",
        "நைட்ரஜன்", "பாஸ்பரஸ்", "பொட்டாசியம்",
        "నత్రజని", "నైట్రోజన్", "భాస్వరం", "పొటాషియం",
        "ನೈಟ್ರೋಜನ್", "ಫಾಸ್ಫರಸ್", "ಪೊಟ್ಯಾಶಿಯಂ",
        "നൈട്രജൻ", "ഫോസ്ഫറസ്", "പൊട്ടാസ്യം",
    ]

    has_crop_keyword = any(keyword in message_lower for keyword in crop_keywords)
    has_crop_values = any(signal in message_lower for signal in crop_value_signals)

    if has_crop_keyword or has_crop_values:
        return "crop_recommendation"

    weather_keywords = [

        # English
        "weather",
        "temperature",
        "temp",
        "rain",
        "rainfall",
        "forecast",
        "humidity",
        "wind",
        "storm",
        "cloudy",
        "sunny",
        "hot",
        "cold",
        "degree",
        "degrees",

        # Hindi
        "मौसम",
        "तापमान",
        "बारिश",
        "बरसात",
        "वर्षा",
        "हवा",
        "नमी",
        "गर्मी",
        "ठंड",
        "डिग्री",
        "होगी क्या",
        "होगा क्या",

        # Marathi
        "हवामान",
        "पाऊस",
        "पावस",
        "पर्जन्य",
        "वारा",
        "आर्द्रता",
        "उष्ण",
        "थंडी",
        "पडेल का",

        # Hinglish
        "mausam",
        "baarish",
        "barish",
        "garmi",
        "thand",
        "temperature kya",
        "weather kya",
        "kal rain",
        "aaj ka weather",

        # Bengali
        "আবহাওয়া",
        "বৃষ্টি",
        "তাপমাত্রা",

        # Punjabi
        "ਮੌਸਮ",
        "ਮੀਂਹ",
        "ਤਾਪਮਾਨ",

        # Gujarati
        "હવામાન",
        "વરસાદ",
        "તાપમાન",

        # Odia
        "ପାଗ",
        "ବର୍ଷା",
        "ତାପମାତ୍ରା",

        # Tamil
        "வானிலை",
        "மழை",
        "வெப்பநிலை",

        # Telugu
        "వాతావరణం",
        "వర్షం",
        "ఉష్ణోగ్రత",

        # Kannada
        "ಹವಾಮಾನ",
        "ಮಳೆ",
        "ತಾಪಮಾನ",

        # Malayalam
        "കാലാവസ്ഥ",
        "മഴ",
        "താപനില",
    ]

    if any(keyword in message_lower for keyword in weather_keywords):
        return "weather"

    # Disease intent
    disease_keywords = [
        "disease",
        "plant disease",
        "leaf disease",
        "crop disease",
        "बीमारी",
        "रोग",
        "पत्ते पीले",
        "कीट",
    ]

    if any(keyword in message_lower for keyword in disease_keywords):
        return "disease_detection"

    # Soil intent
    soil_keywords = [
        "soil",
        "soil analysis",
        "soil health",
        "मिट्टी",
        "मृदा",
        "जमीन की जांच",
    ]

    if any(keyword in message_lower for keyword in soil_keywords):
        return "soil_analysis"

    return "general"


# ==========================================
# WEATHER KEYWORDS USED FOR CITY EXTRACTION
# (kept separate/smaller so the generic fallback
# only anchors on the most common word per language)
# ==========================================

WEATHER_ANCHOR_WORDS = [
    # English
    "weather", "temperature", "temp", "rain", "forecast",
    # Hindi
    "मौसम", "तापमान", "बारिश",
    # Marathi
    "हवामान", "पाऊस",
    # Bengali
    "আবহাওয়া", "বৃষ্টি", "তাপমাত্রা",
    # Punjabi
    "ਮੌਸਮ", "ਮੀਂਹ", "ਤਾਪਮਾਨ",
    # Gujarati
    "હવામાન", "વરસાદ", "તાપમાન",
    # Odia
    "ପାଗ", "ବର୍ଷା", "ତାପମାତ୍ରା",
    # Tamil
    "வானிலை", "மழை", "வெப்பநிலை",
    # Telugu
    "వాతావరణం", "వర్షం", "ఉష్ణోగ్రత",
    # Kannada
    "ಹವಾಮಾನ", "ಮಳೆ", "ತಾಪಮಾನ",
    # Malayalam
    "കാലാവസ്ഥ", "മഴ", "താപനില",
]


# ==========================================
# DYNAMIC CITY EXTRACTION
# ==========================================

def clean_city(city):

    if not city:
        return None

    city = city.strip()

    # Remove punctuation
    city = re.sub(r"[?,.!]+$", "", city)

    # Remove unwanted English words
    unwanted_words = [
        "weather",
        "temperature",
        "temp",
        "rain",
        "forecast",
        "humidity",
        "wind",
        "tomorrow",
        "today",
        "now",
        "please",
        "will",
        "it",
        "is",
        "the",
        "what",
        "in",
        "at",
        "for"
    ]

    words = city.split()

    cleaned_words = [
        word for word in words
        if word.lower() not in unwanted_words
    ]

    city = " ".join(cleaned_words).strip()

    return city if city else None


GENERIC_SKIP_WORDS = {
    "आज", "कल", "उद्या",
    "আজ", "কাল",
    "ਅੱਜ", "ਕੱਲ",
    "આજ", "કાલે",
    "ଆଜି", "ଆସନ୍ତାକାଲି",
    "இன்று", "நாளை",
    "ఈరోజు", "రేపు",
    "ಇಂದು", "ನಾಳೆ",
    "ഇന്ന്", "നാളെ",
    "today", "tomorrow",
}


def extract_city_generic(message):
    """Fallback for languages without dedicated grammar patterns:
    treats the word immediately before a weather-related keyword
    as the city, skipping common time-connector words (today/
    tomorrow equivalents) so they aren't mistaken for a city."""

    words = message.strip().split()

    for i, word in enumerate(words):

        clean_word = re.sub(r"[?,।.!]+$", "", word)

        if clean_word in WEATHER_ANCHOR_WORDS:

            j = i - 1

            while j >= 0:

                candidate = re.sub(r"[?,।.!]+$", "", words[j])

                if candidate in GENERIC_SKIP_WORDS:
                    j -= 1
                    continue

                if candidate:
                    return candidate

                break

            return None

    return None


def extract_city(message):

    message = message.strip()

    # ==========================================
    # ENGLISH PATTERNS
    # ==========================================

    english_patterns = [

        # What is Jaipur's temperature? / What is Jaipur temperature?
        r"\bwhat(?:'s|\s+is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*?)(?:'s)?\s+(?:weather|temperature|temp|rain|forecast|humidity)\b",

        # What is the temperature in Varanasi?
        r"\b(?:weather|temperature|temp|rain|forecast|humidity|wind)\b.*?\b(?:in|at|for)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)",

        # Will it rain tomorrow in Pune?
        r"\b(?:tomorrow|today)\b.*?\b(?:in|at)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)",

        # Weather in Mumbai
        r"\b(?:in|at|for)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)\??$",

        # Pune weather
        r"^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(?:weather|temperature|temp|rain)$",
    ]

    for pattern in english_patterns:

        match = re.search(
            pattern,
            message,
            re.IGNORECASE
        )

        if match:

            city = clean_city(match.group(1))

            if city:
                return city


    # ==========================================
    # HINDI PATTERNS
    # ==========================================

    hindi_patterns = [

        # पुणे में आज/कल मौसम कैसा है (time word optional)
        r"^(.+?)\s+में\s+(?:(?:आज|कल)\s+)?(?:मौसम|बारिश|तापमान)",

        # पुणे का तापमान क्या है
        r"^(.+?)\s+(?:का|की|के)\s+(?:तापमान|मौसम|बारिश)",

        # पुणे में मौसम कैसा है
        r"^(.+?)\s+में\s+(?:मौसम|बारिश|तापमान)",

        # कल पुणे में बारिश होगी क्या
        r"(?:कल|आज)\s+(.+?)\s+में",

        # पुणे में कल बारिश होगी क्या
        r"^(.+?)\s+में\s+(?:कल|आज)",

        # Varanasi का मौसम
        r"^(.+?)\s+(?:का|की|के)\s+(?:मौसम|तापमान)",
    ]

    for pattern in hindi_patterns:

        match = re.search(pattern, message)

        if match:

            city = match.group(1).strip()

            # Remove unwanted words
            city = re.sub(
                r"^(कल|आज)\s+",
                "",
                city
            ).strip()

            if city:
                return city


    # ==========================================
    # MARATHI PATTERNS
    # ==========================================

    marathi_patterns = [

        # पुण्यात तापमान किती आहे
        r"^(.+?)(?:मध्ये|मधे|त)\s+(?:तापमान|हवामान|पाऊस)",

        # उद्या पुण्यात पाऊस पडेल का
        r"(?:उद्या|आज)\s+(.+?)(?:मध्ये|मधे|त)\s+(?:पाऊस|हवामान)",

        # पुणे मध्ये पाऊस पडेल का
        r"^(.+?)\s+(?:मध्ये|मधे)\s+(?:पाऊस|हवामान)",

        # पुण्यात उद्या पाऊस
        r"^(.+?)(?:मध्ये|मधे|त)\s+(?:उद्या|आज)",
    ]

    for pattern in marathi_patterns:

        match = re.search(pattern, message)

        if match:

            city = match.group(1).strip()

            if city:
                return city


    # ==========================================
    # GENERIC FALLBACK (Bengali, Punjabi, Gujarati,
    # Odia, Tamil, Telugu, Kannada, Malayalam)
    # ==========================================

    generic_city = extract_city_generic(message)

    if generic_city:
        return generic_city


    return None