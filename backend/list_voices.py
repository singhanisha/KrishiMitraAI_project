import os
import requests
from dotenv import load_dotenv

load_dotenv()

response = requests.get(
    "https://api.smallest.ai/waves/v1/lightning-v3.1/get_voices",
    headers={"Authorization": f"Bearer {os.getenv('SMALLEST_API_KEY')}"}
)

print(response.status_code)
print(response.json())