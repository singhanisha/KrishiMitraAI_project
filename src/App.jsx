import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

function About() {
  return (
    <div className="page-placeholder">
      <h1>About Us</h1>
    </div>
  );
}

function Services() {
  return (
    <div className="page-placeholder">
      <h1>Services</h1>
    </div>
  );
}

function Resources() {
  return (
    <div className="page-placeholder">
      <h1>Resources</h1>
    </div>
  );
}

function Contact() {
  return (
    <div className="page-placeholder">
      <h1>Contact Us</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;