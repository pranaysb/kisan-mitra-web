# Kisan Mitra - AI Agricultural Assistant (Frontend)

![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

The interactive web portal for **Kisan Mitra**, built for the **Build with Gemma: TFUG Prayagraj [AI Prayagraj]** hackathon. 
Kisan Mitra is designed to empower Indian farmers with cutting-edge AI, acting as a highly accessible, multi-lingual agricultural assistant.

## 🌟 The GenAI for Good Track

This project was built to address high-impact challenges in Indian agriculture, providing farmers with instant, AI-backed answers to their most critical daily problems:
- **What disease is killing my crop?** (Crop Doctor)
- **What government subsidies am I eligible for?** (Yojana Radar)
- **Should I sell my harvest today or wait?** (Mandi Prices)
- **Will it rain tomorrow?** (Weather Advisory)

## 🖥️ UI & UX Design
The platform features a highly accessible, public-service inspired theme (reminiscent of official national portals) to build trust with users. 
Key features include:
- **Voice-First Input**: Recognizes that literacy or typing can be a barrier; farmers can simply speak in Hindi/English to get answers.
- **Text-to-Speech (TTS)**: The AI's responses are spoken back to the user aloud in Hindi for immediate comprehension.
- **Responsive Dashboard**: A 2-column masonry layout optimized for both desktop and mobile devices.

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/pranaysb/kisan-mitra-web.git
cd kisan-mitra-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Connect the Backend
Create a `.env` file in the root directory and link it to the FastAPI backend:
```env
VITE_API_URL=https://kisan-mitra-backend.onrender.com
```

### 4. Run the Development Server
```bash
npm run dev
```

---
*Designed & Developed for the Build with Gemma Hackathon 2026.*
