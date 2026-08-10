import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# 1. Add activeTab to imports
content = content.replace("import { Upload, Mic, Square, X, Leaf, Info, Activity, ShieldCheck, Sun, Droplets, MapPin, AudioLines } from 'lucide-react';",
"import { Upload, Mic, Square, X, Leaf, Info, Activity, ShieldCheck, Sun, Droplets, MapPin, AudioLines, ScrollText, Landmark, CheckCircle2 } from 'lucide-react';")

# 2. Add state for activeTab and Yojana
state_addition = """  const [activeTab, setActiveTab] = useState('crop');
  const [landSize, setLandSize] = useState('Marginal (< 1 Hectare)');
"""
content = content.replace("  const [imageFile, setImageFile] = useState(null);", state_addition + "  const [imageFile, setImageFile] = useState(null);")

# 3. Modify headers
header_old = """          <div className="hidden sm:flex items-center gap-6 font-medium text-sm text-soil">
            <span className="text-kisan font-semibold cursor-pointer">Crop Doctor</span>
            <span className="hover:text-kisan transition-colors cursor-pointer">Yojana Radar</span>
          </div>"""

header_new = """          <div className="hidden sm:flex items-center gap-6 font-medium text-sm text-soil">
            <span 
              onClick={() => setActiveTab('crop')}
              className={`cursor-pointer transition-colors ${activeTab === 'crop' ? 'text-kisan font-semibold border-b-2 border-kisan pb-1' : 'hover:text-kisan'}`}>
              Crop Doctor
            </span>
            <span 
              onClick={() => setActiveTab('yojana')}
              className={`cursor-pointer transition-colors ${activeTab === 'yojana' ? 'text-kisan font-semibold border-b-2 border-kisan pb-1' : 'hover:text-kisan'}`}>
              Yojana Radar
            </span>
          </div>"""
content = content.replace(header_old, header_new)

# 4. Modify HandleSubmit for Yojana
handleSubmit_old = """  const handleSubmit = async (e) => {
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

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${apiUrl}/diagnose`, {
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
  };"""

handleSubmit_new = """  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'crop' && !imageFile) {
      setError("Please add a photo of your crop to continue.");
      return;
    }
    if (activeTab === 'yojana' && (!location || !cropName)) {
      setError("Please enter your state/location and crop name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('location', location || 'Unknown');
    formData.append('crop_name', cropName || 'Unknown');
    if (description) formData.append('description', description);
    if (audioBlob) formData.append('audio', audioBlob, 'voice.wav');

    let endpoint = '';
    if (activeTab === 'crop') {
        formData.append('image', imageFile);
        endpoint = '/diagnose';
    } else {
        formData.append('state', location || 'Unknown');
        formData.append('crop', cropName || 'Unknown');
        formData.append('land_size', landSize);
        endpoint = '/yojana';
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
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError("Unable to connect to the server. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };"""

content = content.replace(handleSubmit_old, handleSubmit_new)

# 5. Extract Voice component (lines ~239-299) and common basic details to avoid massive duplication
# Since this script approach might be brittle with long multi-line strings, I'll just write a unified App.jsx

with open('src/App.jsx', 'w') as f:
    f.write(content)

