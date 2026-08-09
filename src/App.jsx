import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Square, X, Leaf, Info, Activity, ShieldCheck, Sun, Droplets, MapPin, AudioLines } from 'lucide-react';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('');
  const [cropName, setCropName] = useState('');
  const [description, setDescription] = useState('');
  
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
    if (!imageFile) {
      setError("Please add a photo of your crop to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('location', location || 'Unknown');
    formData.append('crop_name', cropName || 'Unknown');
    if (description) formData.append('description', description);
    if (audioBlob) formData.append('audio', audioBlob, 'voice.wav');

    try {
      const response = await fetch('http://localhost:8000/diagnose', {
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
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError("Unable to connect to the server. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-charcoal font-sans selection:bg-harvest selection:text-white pb-20">
      
      {/* Header */}
      <header className="bg-surface border-b border-kisan/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kisan rounded-xl flex items-center justify-center text-white shadow-sm">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl text-kisan tracking-tight">Kisan Mitra</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 font-medium text-sm text-soil">
            <span className="text-kisan font-semibold cursor-pointer">Crop Doctor</span>
            <span className="hover:text-kisan transition-colors cursor-pointer">Yojana Radar</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-kisan">Diagnose Your Crop</h1>
            <p className="text-soil text-lg">Upload a photo and tell us the symptoms. We'll provide an expert treatment plan instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Visual Evidence Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-kisan/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-kisanLight text-kisan flex items-center justify-center">1</span>
                  Crop Photo
                </h2>
                {imagePreview && (
                  <button type="button" onClick={removeImage} className="text-sm font-semibold text-danger hover:bg-danger/10 px-3 py-1 rounded-full transition-colors">
                    Remove
                  </button>
                )}
              </div>
              
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 bg-bg/50 border-2 border-dashed border-kisan/20 rounded-xl cursor-pointer hover:bg-kisanLight hover:border-kisan/40 transition-colors">
                  <Upload className="w-8 h-8 text-kisan mb-3" />
                  <span className="font-semibold text-kisan">Tap to upload photo</span>
                  <span className="text-sm text-soil mt-1">Make sure the affected area is clearly visible</span>
                  <input type="file" className="hide-file-input" accept="image/*" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-kisan/10">
                  <img src={imagePreview} alt="Crop" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Context Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-kisan/5">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-lg bg-kisanLight text-kisan flex items-center justify-center">2</span>
                Basic Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2 flex items-center gap-1">
                    <SproutIcon className="w-4 h-4 text-soil" /> Crop Name
                  </label>
                  <input 
                    type="text" 
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full bg-bg border border-kisan/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kisan/30 transition-all font-medium"
                    placeholder="e.g. Wheat, Tomato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-soil" /> Location
                  </label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-bg border border-kisan/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kisan/30 transition-all font-medium"
                    placeholder="e.g. Prayagraj"
                  />
                </div>
              </div>
            </div>

            {/* Voice & Symptoms Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-kisan/5">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-lg bg-kisanLight text-kisan flex items-center justify-center">3</span>
                Symptoms
              </h2>
              
              {/* Voice Recorder - Very Prominent */}
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-kisan/10"></div>
                </div>
                <div className="relative flex justify-center mb-5">
                  <span className="px-3 bg-surface text-sm font-medium text-soil">OR TYPE</span>
                </div>
              </div>

              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-bg border border-kisan/20 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-kisan/30 transition-all min-h-[100px] resize-none font-medium placeholder:text-soil/70"
                placeholder="Describe any spots, color changes, or pests you noticed..."
              />
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-harvest text-charcoal font-display font-bold text-xl py-4 rounded-2xl shadow-md hover:bg-yellow-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-6 h-6 animate-pulse" /> Analyzing Symptoms...
                </>
              ) : (
                "Get Treatment Plan"
              )}
            </button>
            
            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-xl font-medium flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

          </form>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24">
            
            {!result && !loading && (
              <div className="bg-kisanLight/50 border-2 border-dashed border-kisan/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                <ShieldCheck className="w-16 h-16 text-kisan/30 mb-4" />
                <h3 className="font-display font-bold text-xl text-kisan mb-2">Expert Diagnosis</h3>
                <p className="text-soil">Fill out the details on the left and tap the button to generate an AI-powered treatment plan.</p>
              </div>
            )}

            {loading && (
              <div className="bg-surface rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[400px] shadow-card border border-kisan/5">
                <div className="w-16 h-16 border-4 border-kisan/20 border-t-kisan rounded-full animate-spin mb-6"></div>
                <h3 className="font-display font-bold text-xl text-charcoal mb-2">Consulting AI Doctor</h3>
                <p className="text-soil">Analyzing photo and cross-referencing agricultural databases...</p>
              </div>
            )}

            {result && !loading && (
              <div className="bg-kisan text-white rounded-3xl p-8 shadow-card-hover overflow-hidden relative">
                {/* Decorative background shape */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

                <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  <ShieldCheck className="w-4 h-4" /> Diagnosis Ready
                </div>

                <h2 className="font-display font-bold text-3xl mb-8 leading-tight">
                  {result.disease}
                </h2>

                {result.audio_b64 && (
                  <div className="bg-white/10 rounded-2xl p-4 mb-8 backdrop-blur-sm">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <AudioLines className="w-4 h-4" /> Listen to Audio Guide
                    </p>
                    <audio controls className="w-full h-10 opacity-90 custom-audio">
                      <source src={`data:audio/wav;base64,${result.audio_b64}`} type="audio/wav" />
                    </audio>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <h3 className="text-sm font-bold uppercase text-harvest mb-2">Recommended Action</h3>
                    <p className="text-lg font-medium leading-relaxed">{result.immediate_treatment}</p>
                  </div>
                  
                  <div className="border-l-4 border-harvest/50 pl-4 py-1">
                    <h3 className="text-xs font-bold uppercase text-white/70 mb-1">Chemical Control</h3>
                    <p className="text-sm leading-relaxed text-white/90">{result.chemical_fallback}</p>
                  </div>

                  <div className="border-t border-white/20 pt-5 mt-4">
                    <h3 className="text-xs font-bold uppercase text-white/70 mb-2 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> Note
                    </h3>
                    <p className="text-sm leading-relaxed text-white/80">{result.urgency}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}

// Temporary internal component for the sprout icon
function SproutIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.1-1.9-2.2-3.5a5.1 5.1 0 0 1 4.7-5.3 4.1 4.1 0 0 1 3 1.5c.3.5.5 1.1.5 1.7 0 1.2-.6 2.3-1.6 3" />
      <path d="M14.1 6a4.7 4.7 0 0 1 5.3 1 4.6 4.6 0 0 1 1 3.2c-.3 1.5-1.5 2.7-3.2 3.1-1.4.3-3 .1-4.7-.6" />
    </svg>
  );
}

export default App;
