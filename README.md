<div align="center">
  <h1>🌾 Kisan Mitra Web</h1>
  <h3>Empowering Indian Farmers with Multimodal AI</h3>
  <p><i>Winner/Submission for the Build with Gemma: TFUG Prayagraj Hackathon</i></p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react" alt="React"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.4-purple?style=for-the-badge&logo=vite" alt="Vite"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind"></a>
  </p>
</div>

---

Kisan Mitra (*Farmer's Friend*) is a highly accessible, voice-first web portal designed to solve high-impact agricultural challenges using Google's **Gemma 4** open models. 

This repository contains the interactive frontend application. The AI reasoning and API routes are handled by our [Kisan Mitra Backend](https://github.com/pranaysb/kisan-mitra).

## 🌟 Core Features

- 🩺 **Crop Doctor:** Upload a photo of a diseased plant. The platform uses multimodal Vision AI to diagnose the pathogen and provide localized treatment plans.
- 🏛️ **Yojana Radar:** A smart subsidy engine that matches the farmer's profile against complex government schemes and returns tailored financial recommendations.
- 📈 **Mandi Prices:** Provides real-time APMC market analysis and trends to advise farmers on when to sell their harvest.
- 🌦️ **Weather Advisory:** Analyzes local weather conditions to generate crop-specific farming advisories (e.g., "Delay irrigation due to upcoming rain").

## 🎯 Design Philosophy (The GenAI for Good Track)

We built this portal specifically for users with low technical literacy in rural areas:
- **Voice-First Input:** Farmers can simply speak into their devices in Hindi/English instead of navigating complex drop-downs or typing.
- **Audio-Output (TTS):** Every AI advisory is read aloud in Hindi, breaking down literacy barriers.
- **Official Public Portal Theme:** Designed with high contrast, masonry grids, and a trusted aesthetic optimized for low-brightness mobile screens.

## 🛠️ Quick Start

### Prerequisites
- Node.js (v18+)
- A running instance of the [Kisan Mitra Backend](https://github.com/pranaysb/kisan-mitra)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pranaysb/kisan-mitra-web.git
   cd kisan-mitra-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and point it to your FastAPI backend:
   ```env
   VITE_API_URL=https://kisan-mitra-backend.onrender.com
   ```
   *(Note: If running the backend locally, use `http://localhost:8000`)*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing
This project was developed rapidly during a 1-day hackathon sprint. Contributions, optimizations, and pull requests are welcome!

---
<div align="center">
  <b>Built with ❤️ using Gemma 4</b>
</div>
