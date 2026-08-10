import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Square, X, Leaf, Info, Activity, ShieldCheck, Sun, MapPin, AudioLines, ScrollText, Landmark, CheckCircle2, ChevronRight, Phone, Mail, ArrowLeft, TrendingUp, CloudSun } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('home'); // 'home', 'crop', or 'yojana'
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('');
  const [cropName, setCropName] = useState('');
  const [description, setDescription] = useState('');
  const [landSize, setLandSize] = useState('Marginal (< 1 Hectare)');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [activeView]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeView === 'crop' && !imageFile) {
      setError("Please add a photo of your crop to continue.");
      return;
    }
    if ((activeView === 'yojana' || activeView === 'mandi' || activeView === 'weather') && (!location || !cropName)) {
      setError("Please enter your state/location and crop name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('crop_name', cropName || 'Unknown');
    formData.append('crop', cropName || 'Unknown'); // backend aliases
    
    if (description) formData.append('description', description);
    if (audioBlob) formData.append('audio', audioBlob, 'voice.wav');

    let endpoint = '';
    if (activeView === 'crop') {
        formData.append('location', location || 'Unknown');
        formData.append('image', imageFile);
        endpoint = '/diagnose';
    } else if (activeView === 'yojana') {
        formData.append('state', location || 'Unknown');
        formData.append('land_size', landSize);
        endpoint = '/yojana';
    } else if (activeView === 'mandi') {
        formData.append('state', location || 'Unknown');
        formData.append('district', location || 'Unknown');
        endpoint = '/mandi';
    } else if (activeView === 'weather') {
        formData.append('state', location || 'Unknown');
        formData.append('district', location || 'Unknown');
        endpoint = '/weather';
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError("Unable to connect to the server. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderVoiceRecorder = () => (
    <div className={`rounded-xl p-4 mb-5 border-2 transition-all ${isRecording ? 'border-danger bg-danger/5' : audioBlob ? 'border-kisan bg-kisanLight' : 'border-kisan/10 bg-bg'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <>
              <div className="relative flex items-center justify-center w-10 h-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-40"></span>
                <Mic className="relative w-6 h-6 text-danger animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-danger">Recording Voice Note...</p>
                <p className="text-sm font-medium text-danger/80">{formatTime(recordingTime)}</p>
              </div>
            </>
          ) : audioBlob ? (
            <>
              <div className="w-10 h-10 rounded-full bg-kisan text-white flex items-center justify-center">
                <AudioLines className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-kisan">Voice Note Attached</p>
                <p className="text-sm font-medium text-kisan/80">{formatTime(recordingTime)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-harvestLight text-harvest flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-charcoal">Use Voice (Recommended)</p>
                <p className="text-sm font-medium text-soil">Speak in Hindi or English</p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isRecording ? (
            <button type="button" onClick={stopRecording} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-danger text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-red-700 transition-colors">
              <Square className="w-4 h-4 fill-current" /> Stop
            </button>
          ) : (
            <>
              {audioBlob && (
                <button type="button" onClick={clearAudio} className="p-3 text-soil hover:bg-danger/10 hover:text-danger rounded-xl transition-colors" title="Delete voice note">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button type="button" onClick={startRecording} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-kisan text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-green-800 transition-colors">
                <Mic className="w-5 h-5" /> {audioBlob ? 'Record Again' : 'Record'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-charcoal font-sans selection:bg-harvest selection:text-white flex flex-col">
      
      {/* 1. Government Utility Top Bar */}
      <div className="bg-[#1b263b] text-white text-xs py-1.5 px-4 sm:px-6 z-50 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-white/80 font-medium">
            <span className="hover:text-white cursor-pointer">GOVERNMENT OF INDIA</span>
            <span className="hidden sm:inline border-l border-white/20 pl-4 hover:text-white cursor-pointer">MINISTRY OF AGRICULTURE & FARMERS WELFARE</span>
          </div>
          <div className="flex items-center gap-4 text-white/80 font-medium">
            <a href="#main-content" className="hover:text-white hidden sm:inline">Skip to main content</a>
            <div className="hidden sm:flex items-center gap-1 border-x border-white/20 px-4">
              <button className="hover:text-white px-1">A-</button>
              <button className="hover:text-white px-1 font-bold">A</button>
              <button className="hover:text-white px-1">A+</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors font-bold text-white">English</button>
              <button className="hover:text-white px-2">हिन्दी</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Official Header */}
      <header className="bg-white shadow-sm z-40 sticky top-0 border-b border-kisan/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo Area */}
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setActiveView('home')}
          >
            <img src="/emblem.jpg" alt="National Emblem" className="h-16 w-16 object-contain mix-blend-multiply" />
            <div className="border-l-2 border-kisan/20 pl-4">
              <h1 className="font-display font-bold text-2xl text-[#1b263b] tracking-tight leading-tight">
                Kisan Mitra <span className="text-kisan font-semibold block md:inline md:ml-2">Portal</span>
              </h1>
              <p className="text-xs font-semibold text-soil uppercase tracking-wider mt-0.5">
                Department of Agriculture & Farmers Welfare
              </p>
            </div>
          </div>
          {activeView !== 'home' && (
            <button 
              onClick={() => setActiveView('home')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-soil hover:text-charcoal bg-bg px-4 py-2 rounded-lg border border-kisan/10 hover:border-kisan/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Services
            </button>
          )}
        </div>
      </header>

      {/* 3. Scrolling Ticker / Marquee */}
      <div className="bg-kisan text-white text-sm py-2 px-4 border-y border-kisan/20 overflow-hidden flex items-center">
        <div className="bg-harvest text-charcoal font-bold px-3 py-1 rounded text-xs shrink-0 z-10 shadow-sm">LATEST UPDATES</div>
        <div className="w-full relative flex overflow-x-hidden ml-4">
           <div className="animate-marquee whitespace-nowrap font-medium flex items-center">
             <span className="mx-4 text-white/90">● PM-Kisan 15th installment released. Check your status via Yojana Radar.</span>
             <span className="mx-4 text-white/90">● Advisory: High risk of Yellow Rust in Wheat crops in Northern regions. Use Crop Doctor for diagnosis.</span>
             <span className="mx-4 text-white/90">● New subsidies available for solar water pumps under KUSUM Yojana.</span>
             <span className="mx-4 text-white/90">● PM-Kisan 15th installment released. Check your status via Yojana Radar.</span>
           </div>
        </div>
      </div>

      {/* 4. Hero Banner Segment (Only on Home) */}
      {activeView === 'home' && (
        <>
          <div className="relative w-full h-[250px] md:h-[350px] bg-charcoal overflow-hidden">
            <img src="/agri_hero.jpg" alt="Indian Agriculture" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b263b]/90 via-[#1b263b]/60 to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-harvest/20 border border-harvest/30 text-harvest px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                  <Activity className="w-3.5 h-3.5" /> AI-Powered Agriculture
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                  Empowering Farmers with <span className="text-harvest">Digital Solutions</span>
                </h2>
                <p className="text-white/80 text-lg max-w-xl font-medium">
                  Access instant crop disease diagnosis and discover government schemes you are eligible for, directly from your phone.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white border-b border-kisan/10 shadow-sm relative z-10 -mt-6 mx-4 sm:mx-auto max-w-5xl rounded-xl overflow-hidden flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-kisan/10">
            <div className="flex-1 min-w-[150px] p-4 text-center bg-white/50 backdrop-blur-md">
              <div className="text-2xl font-display font-bold text-kisan">2.4M+</div>
              <div className="text-xs font-bold text-soil uppercase tracking-wider">Farmers Registered</div>
            </div>
            <div className="flex-1 min-w-[150px] p-4 text-center bg-white/50 backdrop-blur-md">
              <div className="text-2xl font-display font-bold text-kisan">150+</div>
              <div className="text-xs font-bold text-soil uppercase tracking-wider">Active Yojanas</div>
            </div>
            <div className="flex-1 min-w-[150px] p-4 text-center bg-white/50 backdrop-blur-md">
              <div className="text-2xl font-display font-bold text-kisan">98%</div>
              <div className="text-xs font-bold text-soil uppercase tracking-wider">Diagnosis Accuracy</div>
            </div>
          </div>
        </>
      )}

      {/* 5. Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        
        {/* === HOME DASHBOARD VIEW === */}
        {activeView === 'home' && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-bold text-charcoal">Citizen Services</h2>
              <div className="w-16 h-1 bg-harvest mx-auto mt-3 rounded-full"></div>
              <p className="text-soil mt-4 font-medium max-w-2xl mx-auto">
                Select a service below to get started. All services are completely free and available in multiple languages via voice assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Service Card 1: Crop Doctor */}
              <div 
                onClick={() => setActiveView('crop')}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-kisan/10 shadow-sm hover:shadow-xl hover:border-kisan/30 transition-all flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src="/crop_doctor_logo.jpg" alt="Crop Doctor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <ShieldCheck className="w-6 h-6 mb-1 text-kisan" />
                    <h3 className="text-xl font-display font-bold">Crop Doctor</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-soil font-medium text-sm mb-6 flex-1">
                    Upload a photo of your affected crop for an instant AI-powered diagnosis and treatment plan.
                  </p>
                  <div className="flex items-center text-kisan font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Access Service <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Service Card 2: Yojana Radar */}
              <div 
                onClick={() => setActiveView('yojana')}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-kisan/10 shadow-sm hover:shadow-xl hover:border-kisan/30 transition-all flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src="/yojana_radar_logo.jpg" alt="Yojana Radar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Landmark className="w-6 h-6 mb-1 text-harvest" />
                    <h3 className="text-xl font-display font-bold">Yojana Radar</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-soil font-medium text-sm mb-6 flex-1">
                    Discover government schemes, subsidies, and financial aid you are eligible for based on your profile.
                  </p>
                  <div className="flex items-center text-harvest font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Access Service <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Service Card 3: Mandi Prices */}
              <div 
                onClick={() => setActiveView('mandi')}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-kisan/10 shadow-sm hover:shadow-xl hover:border-kisan/30 transition-all flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src="/mandi_prices_logo.jpg" alt="Mandi Prices" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <TrendingUp className="w-6 h-6 mb-1 text-orange-400" />
                    <h3 className="text-xl font-display font-bold">Mandi Prices</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-soil font-medium text-sm mb-6 flex-1">
                    Check live simulated APMC mandi prices for your crops across India before selling.
                  </p>
                  <div className="flex items-center text-orange-600 font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Access Service <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

              {/* Service Card 4: Weather Advisory */}
              <div 
                onClick={() => setActiveView('weather')}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-kisan/10 shadow-sm hover:shadow-xl hover:border-kisan/30 transition-all flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src="/weather_advisory_logo.jpg" alt="Weather Advisory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <CloudSun className="w-6 h-6 mb-1 text-blue-400" />
                    <h3 className="text-xl font-display font-bold">Weather Advisory</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-soil font-medium text-sm mb-6 flex-1">
                    Get localized weather forecasts and farming advisories specific to your crop lifecycle.
                  </p>
                  <div className="flex items-center text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    Access Service <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === MODULE VIEW === */}
        {activeView !== 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-12 mb-2 sm:hidden">
              <button 
                onClick={() => setActiveView('home')}
                className="flex items-center gap-2 text-sm font-bold text-soil hover:text-charcoal transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            </div>

            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="mb-6 flex items-center justify-between border-b-2 border-kisan/20 pb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal flex items-center gap-2">
                    {activeView === 'crop' && <ShieldCheck className="w-8 h-8 text-kisan" />}
                    {activeView === 'yojana' && <Landmark className="w-8 h-8 text-harvest" />}
                    {activeView === 'mandi' && <TrendingUp className="w-8 h-8 text-orange-500" />}
                    {activeView === 'weather' && <CloudSun className="w-8 h-8 text-blue-500" />}
                    
                    {activeView === 'crop' && 'Crop Diagnosis Service'}
                    {activeView === 'yojana' && 'Scheme Discovery Service'}
                    {activeView === 'mandi' && 'Mandi Price Radar'}
                    {activeView === 'weather' && 'Weather Advisory'}
                  </h2>
                  <p className="text-soil mt-1 font-medium">
                    {activeView === 'crop' && 'Upload a photo for instant AI analysis.'}
                    {activeView === 'yojana' && 'Find government subsidies you qualify for.'}
                    {activeView === 'mandi' && 'Check live market prices for your crop.'}
                    {activeView === 'weather' && 'Get localized agrometeorological advice.'}
                  </p>
                </div>
                <div className="hidden sm:block text-kisan">
                  <Leaf className="w-10 h-10 opacity-20" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Visual Evidence Card (Crop Doctor ONLY) */}
                {activeView === 'crop' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-kisan/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-kisan"></div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-charcoal">Step 1: Upload Crop Photo</h3>
                      {imagePreview && (
                        <button type="button" onClick={removeImage} className="text-sm font-semibold text-danger hover:bg-danger/10 px-3 py-1 rounded-full transition-colors">
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {!imagePreview ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 bg-bg/50 border-2 border-dashed border-kisan/30 rounded-xl cursor-pointer hover:bg-kisanLight hover:border-kisan transition-colors">
                        <Upload className="w-8 h-8 text-kisan mb-3" />
                        <span className="font-semibold text-kisan">Click to browse or take a photo</span>
                        <span className="text-sm text-soil mt-1">Make sure the affected area is clearly visible</span>
                        <input type="file" className="hide-file-input" accept="image/*" onChange={handleImageChange} />
                      </label>
                    ) : (
                      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-kisan/10">
                        <img src={imagePreview} alt="Crop" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* Context Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-kisan/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-kisan"></div>
                  <h3 className="font-bold text-lg text-charcoal mb-4">
                    {activeView === 'crop' ? 'Step 2: Basic Details' : 'Step 1: Location & Crop'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2 flex items-center gap-1">
                        <Leaf className="w-4 h-4 text-soil" /> {activeView === 'crop' ? 'Crop Name *' : 'Primary Crop *'}
                      </label>
                      <input 
                        type="text" 
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        required
                        className="w-full bg-bg border border-kisan/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kisan transition-all font-medium"
                        placeholder="e.g. Wheat, Tomato"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-soil" /> {activeView === 'crop' ? 'District / Location *' : 'State / District *'}
                      </label>
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full bg-bg border border-kisan/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kisan transition-all font-medium"
                        placeholder={activeView === 'crop' ? 'e.g. Prayagraj' : 'e.g. Uttar Pradesh, Prayagraj'}
                      />
                    </div>
                  </div>

                  {activeView === 'yojana' && (
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-soil" /> Land Holding Size *
                      </label>
                      <select
                        value={landSize}
                        onChange={(e) => setLandSize(e.target.value)}
                        className="w-full bg-bg border border-kisan/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kisan transition-all font-medium"
                      >
                        <option value="Marginal (< 1 Hectare)">Marginal (&lt; 1 Hectare)</option>
                        <option value="Small (1-2 Hectares)">Small (1-2 Hectares)</option>
                        <option value="Medium (2-10 Hectares)">Medium (2-10 Hectares)</option>
                        <option value="Large (> 10 Hectares)">Large (&gt; 10 Hectares)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Voice & Description Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-kisan/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-kisan"></div>
                  <h3 className="font-bold text-lg text-charcoal mb-4">
                    {activeView === 'crop' ? 'Step 3: Symptoms' : 'Step 2: Additional Details'}
                  </h3>
                  
                  {renderVoiceRecorder()}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-kisan/10"></div>
                    </div>
                    <div className="relative flex justify-center mb-5">
                      <span className="px-3 bg-white text-sm font-medium text-soil">OR TYPE</span>
                    </div>
                  </div>

                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg border border-kisan/20 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-kisan transition-all min-h-[100px] resize-none font-medium placeholder:text-soil/70"
                    placeholder={
                      activeView === 'crop' ? 'Describe any spots, color changes, or pests you noticed...' : 
                      activeView === 'mandi' ? 'Any specific market you are looking for (e.g. Azadpur Mandi)?' :
                      'Any other details about your farming methods, category, or specific equipment needs...'
                    }
                  />
                </div>

                {/* Submit Action */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-kisan text-white font-display font-bold text-lg py-4 rounded-xl shadow-md hover:bg-green-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Activity className="w-6 h-6 animate-pulse" /> Processing Request...
                    </>
                  ) : (
                    <>
                      {activeView === 'crop' && 'Generate Treatment Plan'}
                      {activeView === 'yojana' && 'Search Database'}
                      {activeView === 'mandi' && 'Check Live Prices'}
                      {activeView === 'weather' && 'Get Weather Advisory'}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="bg-danger/10 text-danger p-4 rounded-lg font-medium flex items-start gap-3 border border-danger/20">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

              </form>
            </div>

            {/* Right Column: Results */}
            <div id="results-section" className="lg:col-span-5 relative">
              <div className="sticky top-28">
                
                {/* Header for results section */}
                <div className="bg-[#1b263b] text-white p-4 rounded-t-xl flex items-center gap-3">
                  <ScrollText className="w-5 h-5 text-harvest" />
                  <h3 className="font-bold text-lg">Official Report</h3>
                </div>

                <div className="bg-white border-x border-b border-kisan/10 rounded-b-xl shadow-sm p-6 min-h-[400px]">
                  {!result && !loading && (
                    <div className="flex flex-col items-center justify-center text-center h-full opacity-60 py-12">
                      <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mb-4">
                        <Info className="w-8 h-8 text-soil" />
                      </div>
                      <p className="text-soil font-medium max-w-xs">
                        {activeView === 'crop' && 'Submit your crop details and photo to receive an AI-generated diagnosis report.'}
                        {activeView === 'yojana' && 'Submit your profile to query the national database for applicable agricultural schemes.'}
                        {activeView === 'mandi' && 'Submit your location to query live simulated APMC Mandi prices.'}
                        {activeView === 'weather' && 'Submit your location to receive a simulated localized weather advisory.'}
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex flex-col items-center justify-center text-center h-full py-12">
                      <div className="w-12 h-12 border-4 border-kisan/20 border-t-kisan rounded-full animate-spin mb-4"></div>
                      <h4 className="font-bold text-charcoal mb-1">Processing Data</h4>
                      <p className="text-sm text-soil">Please wait while we fetch official records...</p>
                    </div>
                  )}

                  {/* Crop Doctor Results */}
                  {result && !loading && activeView === 'crop' && (
                    <div className="space-y-6">
                      <div className="border-b border-kisan/10 pb-4">
                        <p className="text-xs font-bold text-soil uppercase tracking-wider mb-1">Identified Condition</p>
                        <h2 className="font-display font-bold text-2xl text-danger leading-tight">
                          {result.disease}
                        </h2>
                      </div>

                      {result.audio_b64 && (
                        <div className="bg-kisanLight/30 rounded-lg p-3 flex items-center gap-3 border border-kisan/20">
                          <div className="w-10 h-10 rounded-full bg-white text-kisan flex items-center justify-center shrink-0 shadow-sm">
                            <AudioLines className="w-5 h-5" />
                          </div>
                          <div className="flex-1 w-full overflow-hidden">
                            <p className="text-xs font-bold text-kisan uppercase mb-1">Audio Advisory</p>
                            <audio controls className="w-full h-8 opacity-90 custom-audio" style={{maxWidth: '100%'}}>
                              <source src={`data:audio/wav;base64,${result.audio_b64}`} type="audio/wav" />
                            </audio>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-charcoal flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-kisan" /> Recommended Action
                        </h4>
                        <p className="text-sm text-charcoal/80 leading-relaxed bg-bg p-3 rounded-lg border border-kisan/5">
                          {result.immediate_treatment}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-charcoal flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-harvest" /> Chemical Control
                        </h4>
                        <p className="text-sm text-charcoal/80 leading-relaxed border-l-2 border-harvest pl-3 py-1">
                          {result.chemical_fallback}
                        </p>
                      </div>

                      <div className="bg-danger/5 border border-danger/20 p-3 rounded-lg mt-4">
                        <h4 className="text-xs font-bold uppercase text-danger mb-1">Important Note</h4>
                        <p className="text-sm text-danger/80">{result.urgency}</p>
                      </div>
                    </div>
                  )}

                  {/* Yojana Radar Results */}
                  {result && !loading && activeView === 'yojana' && result.schemes && (
                    <div className="space-y-6">
                      <div className="border-b border-kisan/10 pb-4">
                        <p className="text-xs font-bold text-soil uppercase tracking-wider mb-1">Database Match Results</p>
                        <h2 className="font-display font-bold text-xl text-[#1b263b] leading-tight">
                          Found {result.schemes.length} Eligible Schemes
                        </h2>
                      </div>

                      {result.audio_b64 && (
                         <div className="bg-kisanLight/30 rounded-lg p-3 flex items-center gap-3 border border-kisan/20">
                           <div className="w-10 h-10 rounded-full bg-white text-kisan flex items-center justify-center shrink-0 shadow-sm">
                              <AudioLines className="w-5 h-5" />
                           </div>
                           <div className="flex-1 w-full overflow-hidden">
                              <p className="text-xs font-bold text-kisan uppercase mb-1">Audio Summary</p>
                              <audio controls className="w-full h-8 opacity-90 custom-audio" style={{maxWidth: '100%'}}>
                                <source src={`data:audio/wav;base64,${result.audio_b64}`} type="audio/wav" />
                              </audio>
                           </div>
                         </div>
                      )}

                      <div className="space-y-4">
                        {result.schemes.map((scheme, idx) => (
                          <div key={idx} className="bg-bg rounded-xl p-4 border border-kisan/10">
                            <div className="flex gap-2 items-start mb-3">
                              <span className="bg-[#1b263b] text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                              <h4 className="font-bold text-charcoal leading-tight">{scheme.scheme_name}</h4>
                            </div>
                            
                            <div className="space-y-3 pl-7">
                              <div>
                                <p className="text-[10px] font-bold text-soil uppercase mb-0.5">Eligibility</p>
                                <p className="text-sm text-charcoal/80 leading-snug">{scheme.eligibility}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-soil uppercase mb-0.5 text-kisan">Benefits</p>
                                <p className="text-sm font-medium text-kisan leading-snug">{scheme.benefits}</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-kisan/5">
                                <p className="text-[10px] font-bold text-soil uppercase mb-0.5">How to Apply</p>
                                <p className="text-xs text-charcoal/80 leading-snug">{scheme.how_to_apply}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandi Prices Results */}
                  {result && !loading && activeView === 'mandi' && (
                    <div className="space-y-6">
                      <div className="border-b border-kisan/10 pb-4">
                        <p className="text-xs font-bold text-soil uppercase tracking-wider mb-1">Market Snapshot - {result.date}</p>
                        <h2 className="font-display font-bold text-2xl text-orange-600 leading-tight">
                          {result.mandi_name}
                        </h2>
                      </div>

                      {result.audio_b64 && (
                        <div className="bg-orange-50 rounded-lg p-3 flex items-center gap-3 border border-orange-200">
                          <div className="w-10 h-10 rounded-full bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                            <AudioLines className="w-5 h-5" />
                          </div>
                          <div className="flex-1 w-full overflow-hidden">
                            <p className="text-xs font-bold text-orange-600 uppercase mb-1">Audio Market Update</p>
                            <audio controls className="w-full h-8 opacity-90 custom-audio" style={{maxWidth: '100%'}}>
                              <source src={`data:audio/wav;base64,${result.audio_b64}`} type="audio/wav" />
                            </audio>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-bg p-3 rounded-xl border border-kisan/10 text-center">
                          <p className="text-[10px] font-bold text-soil uppercase">Min Price</p>
                          <p className="text-lg font-bold text-charcoal">₹{result.min_price}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-center shadow-sm relative -top-2">
                          <p className="text-[10px] font-bold text-orange-600 uppercase">Modal Price</p>
                          <p className="text-2xl font-bold text-orange-600">₹{result.modal_price}</p>
                        </div>
                        <div className="bg-bg p-3 rounded-xl border border-kisan/10 text-center">
                          <p className="text-[10px] font-bold text-soil uppercase">Max Price</p>
                          <p className="text-lg font-bold text-charcoal">₹{result.max_price}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-kisan/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <h4 className="text-sm font-bold text-charcoal">Market Advisory</h4>
                          <span className="ml-auto text-xs font-bold bg-bg px-2 py-1 rounded text-soil">{result.trend}</span>
                        </div>
                        <p className="text-sm text-charcoal/80 leading-relaxed border-l-2 border-orange-300 pl-3">
                          {result.advisory}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Weather Advisory Results */}
                  {result && !loading && activeView === 'weather' && (
                    <div className="space-y-6">
                      <div className="border-b border-kisan/10 pb-4 flex justify-between items-end">
                        <div>
                          <p className="text-xs font-bold text-soil uppercase tracking-wider mb-1">Agrometeorological Update</p>
                          <h2 className="font-display font-bold text-2xl text-blue-600 leading-tight">
                            {result.temperature}
                          </h2>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-soil uppercase tracking-wider mb-1">Rain Prob.</p>
                          <p className="font-bold text-blue-500">{result.rain_probability}</p>
                        </div>
                      </div>

                      {result.audio_b64 && (
                        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 border border-blue-200">
                          <div className="w-10 h-10 rounded-full bg-white text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                            <AudioLines className="w-5 h-5" />
                          </div>
                          <div className="flex-1 w-full overflow-hidden">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Audio Weather Alert</p>
                            <audio controls className="w-full h-8 opacity-90 custom-audio" style={{maxWidth: '100%'}}>
                              <source src={`data:audio/wav;base64,${result.audio_b64}`} type="audio/wav" />
                            </audio>
                          </div>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-xl border border-kisan/10">
                        <div className="flex items-center gap-2 mb-2">
                          <CloudSun className="w-4 h-4 text-blue-500" />
                          <h4 className="text-sm font-bold text-charcoal">3-Day Forecast</h4>
                        </div>
                        <p className="text-sm text-charcoal/80 leading-relaxed">
                          {result.forecast}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${result.alert_level === 'Warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className={`w-4 h-4 ${result.alert_level === 'Warning' ? 'text-orange-500' : 'text-blue-500'}`} />
                          <h4 className={`text-sm font-bold ${result.alert_level === 'Warning' ? 'text-orange-700' : 'text-blue-700'}`}>Crop Action Plan</h4>
                        </div>
                        <p className={`text-sm leading-relaxed ${result.alert_level === 'Warning' ? 'text-orange-800' : 'text-blue-800'}`}>
                          {result.crop_advisory}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 6. Official Government Footer */}
      <footer className="bg-[#1b263b] text-white/80 border-t-4 border-harvest mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/emblem.jpg" alt="National Emblem" className="h-12 w-12 object-contain brightness-0 invert" />
                <div>
                  <h3 className="text-white font-bold text-lg">Kisan Mitra Portal</h3>
                  <p className="text-xs">Ministry of Agriculture & Farmers Welfare, Government of India</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                A digital initiative to provide instant crop disease diagnosis and scheme discovery for farmers across India, powered by artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="w-3 h-3" /> About Ministry</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="w-3 h-3" /> PM-KISAN Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1"><ChevronRight className="w-3 h-3" /> e-NAM Portal</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Kisan Call Center (KCC):<br/><strong className="text-white">1800-180-1551</strong> (Toll Free)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>support@kisanmitra.gov.in</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-4 text-white/50">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Accessibility Statement</a>
            </div>
            <div className="text-white/50 text-center md:text-right">
              <p>© {new Date().getFullYear()} Ministry of Agriculture & Farmers Welfare.</p>
              <p>Designed & Developed by National Informatics Centre (NIC) - Placeholder</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
