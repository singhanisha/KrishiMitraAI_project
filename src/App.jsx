import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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

        <Route path="/weather" element={<WeatherForecast />} />

        <Route path="/crop-recommendation" element={<CropRecommendation />}/>

        <Route  path="/yield-prediction"  element={<YieldPrediction />}  />

        <Route path="/market-prices" element={<MarketPrices />} />

        <Route path="/soil-analysis" element={<SoilAnalysis />} />

        <Route path="/about" element={<About />} />

        <Route path="/services" element={<Services />}/>

        <Route path="/contact" element={<Contact />}/>

        <Route path="/insights/:topic" element={<InsightDetail />} />

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