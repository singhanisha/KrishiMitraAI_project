import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Mic,
  Volume2,
  MicOff,
} from "lucide-react";

import { getChatbotResponse } from "../../services/chatbotService";

import "./ChatBot.css";

const API_URL = "http://127.0.0.1:8000";

const ChatBot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Namaste! 👋 I am KrishiMitra AI. How can I help you today?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceMessage, setIsVoiceMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

  // ==============================
  // AUTO SCROLL
  // ==============================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==============================
  // DETECT LANGUAGE (for TTS voice selection)
  // ==============================

  const detectSpeechLanguage = (text) => {
    const marathiWords = [
      "आहे",
      "नाही",
      "पाऊस",
      "हवामान",
      "उद्या",
      "कसे",
      "शेती",
      "तुम्हाला",
    ];

    const isMarathi = marathiWords.some((word) =>
      text.includes(word)
    );

    if (isMarathi) {
      return "mr";
    }

    // Hindi / Devanagari
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi";
    }

    return "en";
  };

  // ==============================
  // TEXT TO SPEECH (backend: Smallest.ai)
  // ==============================

  const speakText = async (text) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const language = detectSpeechLanguage(text);

      const response = await fetch(`${API_URL}/text-to-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error("Text-to-speech request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  // ==============================
  // VOICE INPUT (backend: Groq Whisper)
  // ==============================

  const startRecording = async () => {
    try {
      // Stop any bot speech before listening
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await transcribeAndSend(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone Error:", error);
      alert(
        "Could not access microphone. Please allow microphone permission."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAndSend = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(`${API_URL}/speech-to-text`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Speech-to-text request failed");
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        setIsVoiceMessage(true);
        await handleSend(data.text, true);
      } else {
        alert("Could not understand the audio. Please try again.");
      }
    } catch (error) {
      console.error("STT Error:", error);
      alert("Voice recognition failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // ==============================
  // SEND MESSAGE
  // ==============================

  const handleSend = async (
    messageToSend = input,
    fromVoice = isVoiceMessage
  ) => {
    if (!messageToSend.trim() || isLoading) return;

    const userText = messageToSend.trim();

    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const typingMessage = {
      id: "typing",
      text: "KrishiMitra AI is thinking...",
      sender: "bot",
      typing: true,
    };

    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await getChatbotResponse(userText);

      const botResponse =
        response ||
        "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => {
        const withoutTyping = prev.filter(
          (message) => message.id !== "typing"
        );

        return [
          ...withoutTyping,
          {
            id: Date.now() + 1,
            text: botResponse,
            sender: "bot",
          },
        ];
      });

      // Only speak automatically if question came from voice
      if (fromVoice) {
        setTimeout(() => {
          speakText(botResponse);
        }, 300);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);

      const errorMessage =
        "Sorry, something went wrong. Please try again.";

      setMessages((prev) => {
        const withoutTyping = prev.filter(
          (message) => message.id !== "typing"
        );

        return [
          ...withoutTyping,
          {
            id: Date.now() + 1,
            text: errorMessage,
            sender: "bot",
          },
        ];
      });
    } finally {
      setIsLoading(false);
      setIsVoiceMessage(false);
    }
  };

  // ==============================
  // ENTER KEY
  // ==============================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(input, false);
    }
  };

  // ==============================
  // STOP SPEECH ON CLOSE
  // ==============================

  const handleClose = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (isRecording) {
      stopRecording();
    }

    setIsOpen(false);
  };

  const micDisabled = isLoading || isTranscribing;

  return (
    <>
      {/* Floating Chat Button */}

      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}

      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}

          <div className="chatbot-header">
            <div className="bot-profile">
              <div className="bot-avatar">
                <Bot size={22} />
              </div>

              <div>
                <h3>KrishiMitra AI</h3>

                <span>
                  <span className="online-dot"></span>
                  Online
                </span>
              </div>
            </div>

            <button
              className="chatbot-close"
              onClick={handleClose}
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-row ${message.sender}`}
              >
                {message.sender === "bot" && (
                  <div className="message-avatar bot-message-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`message-bubble ${message.sender} ${
                    message.typing ? "typing-message" : ""
                  }`}
                >
                  {message.typing ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <span>{message.text}</span>

                      {message.sender === "bot" && (
                        <button
                          className="speak-button"
                          title="Listen"
                          onClick={() => speakText(message.text)}
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {message.sender === "user" && (
                  <div className="message-avatar user-message-avatar">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isTranscribing && (
              <div className="message-row bot">
                <div className="message-avatar bot-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble bot typing-message">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask anything about farming..."
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setIsVoiceMessage(false);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* Voice Input */}

            <button
              className={`mic-button ${isRecording ? "listening" : ""}`}
              title={isRecording ? "Stop recording" : "Voice input"}
              onClick={handleVoiceInput}
              disabled={micDisabled}
            >
              {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Send */}

            <button
              className="send-button"
              onClick={() => handleSend(input, false)}
              aria-label="Send message"
              disabled={!input.trim() || isLoading}
            >
              <Send size={19} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
