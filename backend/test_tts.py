import requests

response = requests.post(
    "http://127.0.0.1:8000/text-to-speech",
    json={
        "text": "नमस्ते, आपकी फसल के लिए सबसे अच्छा सुझाव यह है",
        "language": "hi"
    }
)

with open("test_hindi.wav", "wb") as f:
    f.write(response.content)

print("Saved! Status:", response.status_code)