import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WeatherForecast from "./pages/WeatherForecast";
import ChatBot from "./components/chatbot/ChatBot";
import CropRecommendation from "./pages/CropRecommendation";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import YieldPrediction from "./pages/YieldPrediction";
import InsightDetail from "./pages/InsightDetail";
import MarketPrices from "./pages/MarketPrices";
import SoilAnalysis from "./pages/SoilAnalysis";
import DiseaseDetection from "./pages/DiseaseDetection";

import { useEffect } from "react";          // useEffect add (useState pehle se hai)
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn } from "./utils/auth";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    try {
      if (isLoggedIn() && sessionStorage.getItem("open_chat_after_login") === "1") {
        sessionStorage.removeItem("open_chat_after_login");
        setIsChatOpen(true);
      }
    } catch { /* ignore */ }
  }, []);

  const openChat = () => {
    setIsChatOpen(true);
  };

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/"element={<Home onOpenChat={openChat} />}/>

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* <Route path="/weather" element={<WeatherForecast />} />

        <Route path="/crop-recommendation" element={<CropRecommendation />}/>

        <Route path="/disease-detection" element={<DiseaseDetection />} />

        <Route  path="/yield-prediction"  element={<YieldPrediction />}  />

        <Route path="/market-prices" element={<MarketPrices />} />

        <Route path="/soil-analysis" element={<SoilAnalysis />} /> */}

        <Route path="/about" element={<About />} />

        <Route path="/services" element={<Services />}/>

        <Route path="/contact" element={<Contact />}/>

        <Route path="/insights/:topic" element={<InsightDetail />} />

        <Route path="/weather" element={<ProtectedRoute><WeatherForecast /></ProtectedRoute>} />
        <Route path="/crop-recommendation" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
        <Route path="/yield-prediction" element={<ProtectedRoute><YieldPrediction /></ProtectedRoute>} />
        <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
        <Route path="/soil-analysis" element={<ProtectedRoute><SoilAnalysis /></ProtectedRoute>} />
        <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />

      </Routes>

      {/* Global AI Chatbot */}
      <ChatBot
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />

    </BrowserRouter>
  );
}

export default App;