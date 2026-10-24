"""
llm_utils.py  (backend/ folder me, main.py ke bagal me rakho)

Groq 'openai/gpt-oss-20b' ek REASONING model hai. Ye pehle andar sochta hai
(reasoning tokens) aur phir jawab likhta hai. Agar max_tokens chhota ho (15-200)
to saare tokens sochne me khatam ho jaate hain aur jawab KHALI ('') aata hai.
Isi wajah se city translation / crop-name / phrasing bar-bar fail ho rahi thi.
Ye module har chhote LLM call ko sahi tarah se karta hai.
"""

import os
import re
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def llm_complete(prompt, temperature=0.2, max_tokens=1500, effort="low"):
    """Safe LLM call. Returns text ('' if truly failed).
    - reasoning_effort='low'  -> kam sochta hai, tokens bachte hain
    - bada max_completion_tokens -> reasoning + answer dono fit
    - khali jawab aaye to ek baar bade budget ke saath retry
    """
    budgets = [max_tokens, max_tokens * 3]
    for attempt, budget in enumerate(budgets):
        try:
            kwargs = dict(
                model=_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_completion_tokens=budget,
            )
            if "gpt-oss" in _MODEL:
                kwargs["reasoning_effort"] = "low" if attempt == 0 else "medium"
            resp = _client.chat.completions.create(**kwargs)
            text = (resp.choices[0].message.content or "").strip()
            if text:
                return text
            print(f"LLM empty output (attempt {attempt + 1}, budget {budget})")
        except Exception as e:
            print(f"LLM error (attempt {attempt + 1}):", e)
    return ""


def extract_city_with_llm(message):
    """Poore message se seedha ENGLISH city ka naam nikalta hai
    (kisi bhi bhasha me: Hindi, Marathi, Tamil, ... ya Hinglish).
    Returns: 'Jaipur' jaisa string, ya None agar message me city hai hi nahi."""

    prompt = f"""You extract the city name from a farmer's weather question.
The question can be in any Indian language or script (Hindi, Marathi, Bengali,
Punjabi, Gujarati, Odia, Tamil, Telugu, Kannada, Malayalam, English, Hinglish).

Rules:
- Find the place (city/town) the person is asking weather about.
- Output its standard ENGLISH spelling as used by OpenWeatherMap
  (example: जयपुर -> Jaipur, ಬೆಂಗಳೂರು -> Bengaluru, கோயம்புத்தூர் -> Coimbatore).
- Postpositions/suffixes like में, मध्ये, ਵਿੱਚ, ના, ல், ಲ್ಲಿ are NOT part of the city.
- Words like today, tomorrow, temperature, rain, weather are NOT cities.
- If the question has no city, output exactly: NONE
- Output ONLY the JSON: {{"city": "<English name or NONE>"}}

Question: {message}"""

    raw = llm_complete(prompt, temperature=0, max_tokens=600)
    print("City LLM raw:", repr(raw))

    if not raw:
        return None

    m = re.search(r'"city"\s*:\s*"([^"]*)"', raw)
    city = m.group(1).strip() if m else raw.strip().strip('"\'`{} ')

    # Safety: sirf Latin letters/space/hyphen/dot wala naam maanenge
    if not city or city.upper() == "NONE":
        return None
    if not re.fullmatch(r"[A-Za-z][A-Za-z .\-']{1,40}", city):
        print("City LLM rejected (not a clean English name):", repr(city))
        return None
    return city