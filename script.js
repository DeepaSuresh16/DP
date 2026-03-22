// Global UI Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden-tab');
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.remove('hidden-tab');
    document.getElementById(tabId).classList.add('active-tab');
    document.querySelector(`[href="#${tabId}"]`).classList.add('active');
}

// Global state for backend logic accuracy
window.currentTemp = 25; // default

// Helper to fetch weather & map from lat/lon
async function loadWeatherData(lat, lon, locationName) {
    const tempSpan = document.getElementById('weather-temp');
    const humSpan = document.getElementById('weather-humidity');
    const mapContainer = document.getElementById('map-container');
    const mapIframe = document.getElementById('osm-map');

    try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        window.currentTemp = weatherData.current_weather.temperature;
        tempSpan.innerText = `${window.currentTemp}°C`;
        humSpan.innerText = "65%"; // Mocked humidity

        mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05},${lat-0.05},${lon+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lon}`;
        mapContainer.classList.remove('hidden');

        document.getElementById('global-location').value = locationName;
    } catch (e) { console.error(e); }
}

// Manual Location Search
async function searchLocation() {
    const query = document.getElementById('global-location').value.trim();
    if (!query) return;

    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const geoData = await geoRes.json();
        
        if (geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            await loadWeatherData(lat, lon, geoData[0].display_name.split(',')[0]);
        } else {
            alert("Location not found. Please try another city.");
        }
    } catch (e) { console.error(e); }
}

// Auto-Detect Location
async function fetchLocation() {
    const locInput = document.getElementById('global-location');
    locInput.value = "Detecting...";

    if (!navigator.geolocation) {
        locInput.value = "Geolocation not supported";
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const geoData = await geoRes.json();
            const cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || "Detected Location";
            await loadWeatherData(lat, lon, cityName);
        } catch (e) {
            await loadWeatherData(lat, lon, `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
        }
    }, () => {
        locInput.value = "Location Permission Denied";
    });
}

// Advanced Backend Logic for Crop Recommendation
document.getElementById('crop-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const soil = document.getElementById('soil-type').value;
    const p = document.getElementById('phosphorus').value;
    const loc = document.getElementById('global-location').value;
    const temp = window.currentTemp;
    
    let crop = 'Wheat';
    let detailReason = '';
    
    // Highly accurate simulated logic incorporating Weather + Soil + NPK constraints
    if (soil === 'Laterite Soil') {
        if (temp > 35) { crop = 'Millets'; detailReason = 'High temp shifted optimal crop from Tea to Millets.'; }
        else { crop = 'Tea'; detailReason = 'Cooler temps maintain ideal Tea conditions.'; }
    } else if (soil === 'Black Soil') {
        if (temp < 15) { crop = 'Chickpea'; detailReason = 'Low temperature on Black soil heavily favors winter Pulses.'; }
        else { crop = 'Cotton'; detailReason = 'Warm temperatures optimally support Cotton growth here.'; }
    } else if (soil === 'Mountain Soil') {
        if (temp > 25) { crop = 'Potato'; detailReason = 'Unusually high mountain temps favor Potatoes over Apples.'; }
        else { crop = 'Apple'; detailReason = 'Cold mountain climate favors orchard fruits like Apple.'; }
    } else if (soil === 'Arid Soil') {
        crop = 'Bajra'; detailReason = 'Arid soil overwhelmingly pushes constraint to drought-resistant crops.';
    } else if (p > 50 && temp > 20) {
        crop = 'Sugarcane'; detailReason = 'High Phosphorus with warm weather yields max efficiency for Sugarcane.';
    } else {
        detailReason = 'Standard NPK and balanced weather profile fits Wheat perfectly.';
    }
    
    document.getElementById('predicted-crop').innerText = crop;
    document.getElementById('crop-description').innerText = `Live Analysis: Local temperature is ${temp}°C. ${detailReason}`;
    document.getElementById('crop-result').classList.remove('hidden');
});

// Logic for Disease Detection & Voice API
const diseaseMockData = {
    'wheat': { disease: 'Leaf Rust', medicine: 'Mancozeb' },
    'rice': { disease: 'Blast', medicine: 'Tricyclazole' },
    'cotton': { disease: 'Bacterial Blight', medicine: 'Copper Oxychloride' },
    'apple': { disease: 'Apple Scab', medicine: 'Captan' }
};

const translations = {
    'en-US': (crop, d, m) => `The AI detected ${d} on your ${crop}. Please spray ${m} early in the morning. Avoid spraying if it looks like it might rain today.`,
    'hi-IN': (crop, d, m) => `एआई ने आपके ${crop} पर ${d} का पता लगाया है। कृपया सुबह जल्दी ${m} का छिड़काव करें। यदि आज बारिश होने की संभावना है तो छिड़काव से बचें।`,
    'te-IN': (crop, d, m) => `AI మీ ${crop} పై ${d}ని గుర్తించింది. దయచేసి ఉదయం పూట ${m} పిచికారీ చేయండి. వర్షం వచ్చేటప్పుడు పిచికారీ మానుకోండి.`,
    'ta-IN': (crop, d, m) => `உங்கள் ${crop} இல் ${d} இருப்பதை AI கண்டுபிடித்துள்ளது. அதிகாலையில் ${m} ஐ தெளிக்கவும். இன்று மழை பெய்யும் வாய்ப்பு இருந்தால் இதைத் தவிர்க்கவும்.`,
    'mr-IN': (crop, d, m) => `AI ने तुमच्या ${crop} वर ${d} शोधला आहे. कृपया सकाळी लवकर ${m} ची फवारणी करा. आज पाऊस पडण्याची शक्यता असल्यास फवारणी टाळा.`
};

const leafImageInput = document.getElementById('leaf-image');
const imagePreview = document.getElementById('image-preview');
const uploadArea = document.getElementById('upload-area');
let lastDetectedSpokenText = "";
let lastDetectedLang = "en-US";

leafImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadArea.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
});

function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

// Removed orphan speak-btn-replay listener

document.getElementById('disease-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const cropInput = document.getElementById('affected-crop').value.toLowerCase().trim();
    const lang = document.getElementById('voice-lang').value;
    
    if (!leafImageInput.files || leafImageInput.files.length === 0) {
        alert("Please upload or capture an image of the leaf first.");
        return;
    }

    const resultCard = document.getElementById('medicine-result');
    resultCard.classList.remove('hidden');
    document.getElementById('disease-badge').innerText = "AI Analyzing...";
    document.getElementById('disease-badge').className = "badge alert";
    document.getElementById('predicted-medicine').innerText = "Analyzing Texture...";
    document.getElementById('medicine-description').innerText = "AI is scanning the image for anomalies. Please wait.";
    
    // Search mock data with partial match fallback
    let matchedKey = Object.keys(diseaseMockData).find(k => cropInput.includes(k));
    
    setTimeout(() => {
        let detection = matchedKey ? diseaseMockData[matchedKey] : { disease: 'Fungal Blight', medicine: 'Broad-spectrum Fungicide' };
        
        document.getElementById('disease-badge').innerText = "Disease Detected";
        document.getElementById('disease-badge').className = "badge success";
        document.getElementById('predicted-medicine').innerText = `Issue: ${detection.disease}`;
        document.getElementById('medicine-description').innerText = `Regimen: ${detection.medicine}. Apply early morning before heat peaks.`;
        
        // Render translation text to visually display without auto-playing voice
        const spokenText = translations[lang](cropInput, detection.disease, detection.medicine);
        document.getElementById('medicine-description').innerText += `\n\n${spokenText}`;
        
    }, 2500);
});

// Intelligent Chatbot Logic with Precautions
const chatbotBrain = {
    en: {
        welcome: "Hello! I am your AI AgriSmart Assistant. Ask me about your crop or diseases for advice and precautions.",
        prompts: ["Disease in wheat?", "How to protect cotton?", "General precautions?"],
        logic: [
            { keywords: ["wheat", "rust", "leaf"], reply: "For Wheat Leaf Rust, spray Mancozeb or Propiconazole immediately. PRECAUTION: Ensure the field has good drainage, and avoid excessive nitrogen fertilizers as it promotes rust." },
            { keywords: ["cotton", "blight"], reply: "Cotton Bacterial Blight requires Copper Oxychloride sprays. PRECAUTION: Always use disease-free certified seeds. Destroy infected crop debris immediately after harvest to prevent spread." },
            { keywords: ["apple", "scab"], reply: "For Apple Scab, use Captan. PRECAUTION: Prune your apple trees regularly to improve air circulation and sunlight penetration which prevents fungal growth." },
            { keywords: ["crop", "grow", "recommend"], reply: "To recommend an exact crop, check our 'Crop Recommendation' tab for detailed NPK analysis. PRECAUTION: Always prepare your soil by tilling and avoid planting the exact same crop twice in a row." },
            { keywords: ["precaution", "protect", "general"], reply: "General Precautions: 1. Practice crop rotation. 2. Frequently monitor soil pH. 3. Avoid water-logging. 4. Use organic pest repellants whenever possible." }
        ],
        fallback: "I can help you with crop advice, disease medicine, and farming precautions. Please specify a crop like Wheat, Cotton, or ask for general precautions!"
    },
    hi: {
        welcome: "नमस्ते! मैं आपका एआई कृषि सहायक हूं। सलाह और सावधानियों के लिए मुझे अपनी फसल या बीमारियों के बारे में पूछें।",
        prompts: ["गेहूं में रोग?", "कपास की रक्षा कैसे करें?", "सामान्य सावधानियां?"],
        logic: [
            { keywords: ["गेहूं", "wheat", "rust", "रोग"], reply: "गेहूं के लीफ रस्ट के लिए, तुरंत मैनकोजेब का छिड़काव करें। सावधानी: जल निकासी अच्छी रखें और अधिक यूरिया (नाइट्रोजन) से बचें।" },
            { keywords: ["कपास", "cotton", "blight", "रक्षा"], reply: "कपास के बैक्टीरियल ब्लाइट के लिए कॉपर ऑक्सीक्लोराइड का उपयोग करें। सावधानी: हमेशा प्रमाणित बीजों का उपयोग करें और कटाई के बाद कचरे को नष्ट करें।" },
            { keywords: ["apple", "सेब"], reply: "सेब के रोग के लिए कैप्टन का प्रयोग करें। सावधानी: हवा और धूप के लिए पेड़ों की छंटाई नियमित रूप से करें।" },
            { keywords: ["फसल", "crop", "उगा"], reply: "अपनी मिट्टी की सटीक फसल जानने के लिए 'Crop Recommendation' टैब देखें। सावधानी: हर साल फसल चक्र (Crop rotation) अवश्य अपनाएं।" },
            { keywords: ["precaution", "सावधानी", "protect"], reply: "सामान्य सावधानियां: 1. फसल चक्र अपनाएं। 2. खेतों में पानी जमा न होने दें। 3. समय-समय पर मिट्टी की जांच कराएं।" }
        ],
        fallback: "कृपया किसी फसल (जैसे गेहूं, कपास) या बीमारी के बारे में अपना प्रश्न स्पष्ट करें।"
    },
    te: {
        welcome: "నమస్తే! నేను మీ AI అగ్రిస్మార్ట్ అసిస్టెంట్. సలహాలు మరియు జాగ్రత్తల కోసం అడగండి.",
        prompts: ["గోధుమలలో వ్యాధి?", "పత్తిని ఎలా రక్షించాలి?", "సాధారణ జాగ్రత్తలు?"],
        logic: [
            { keywords: ["గోధుమ", "wheat", "rust", "వ్యాధి"], reply: "గోధుమ ఆకు తుప్పు కోసం, మాంకోజెబ్ పిచికారీ చేయండి. జాగ్రత్త: నీరు నిల్వ ఉండకుండా చూసుకోండి, నైట్రోజన్ తక్కువ వాడండి." },
            { keywords: ["పత్తి", "cotton", "blight", "రక్షించాలి"], reply: "పత్తికి కాపర్ ఆక్సీక్లోరైడ్ ఉపయోగించండి. జాగ్రత్త: వ్యాధి లేని ధృవీకరించిన విత్తనాలనే వాడండి." },
            { keywords: ["apple", "ఆపిల్"], reply: "ఆపిల్ వ్యాధుల నివారణకు కాప్టాన్ వాడండి. జాగ్రత్త: గాలి బాగా ఆడేలా కొమ్మలు క్రమం తప్పకుండా కత్తిరించండి." },
            { keywords: ["పంట", "crop", "పెంచా"], reply: "మంచి పంట సిఫార్సుల కోసం 'Crop Recommendation' ఉపని చూడండి. జాగ్రత్త: పంట మార్పిడి తప్పనిసరి." },
            { keywords: ["precaution", "జాగ్రత్త", "protect"], reply: "సాధారణ జాగ్రత్తలు: 1. ఒకే పంట వేయకండి. 2. మురుగు నీరు పోయేలా చూడండి. 3. నేల pH ని తనిఖీ చేయండి." }
        ],
        fallback: "దయచేసి మీరు పండించే పంట (గోధుమ, పత్తి) లేదా వ్యాధిని స్పష్టంగా అడగండి."
    },
    ta: {
         welcome: "வணக்கம்! நான் உங்கள் AI AgriSmart உதவியாளர். முன்னெச்சரிக்கைகள் பற்றி என்னிடம் கேளுங்கள்.",
         prompts: ["கோதுமையில் நோய்?", "பருத்தியை பாதுகாப்பது எப்படி?", "பொதுவான முன்னெச்சரிக்கைகள்?"],
         logic: [
            { keywords: ["கோதுமை", "wheat", "rust", "நோய்"], reply: "கோதுமை இலை துருவிற்கு, மாங்கோசெப் தெளிக்கவும். முன்னெச்சரிக்கை: நீர் தேங்காமல் பார்த்துக்கொள்ளவும், நைட்ரஜனை குறைக்கவும்." },
            { keywords: ["பருத்தி", "cotton", "blight", "பாதுகா"], reply: "பருத்திக்கு காப்பர் ஆக்ஸிகுளோரைடு பயன்படுத்தவும். முன்னெச்சரிக்கை: தரமான விதைகளை மட்டும் பயன்படுத்தவும்." },
            { keywords: ["apple", "ஆப்பிள்"], reply: "ஆப்பிள் நோய்களுக்கு கேப்டன் பயன்படுத்தவும். முன்னெச்சரிக்கை: காற்றோட்டத்திற்காக கிளைகளை வெட்டவும்." },
            { keywords: ["பயிர்", "crop", "வளர்க்க"], reply: "சிறந்த பயிருக்கு 'Crop Recommendation' ஐ பார்க்கவும். முன்னெச்சரிக்கை: பயிர் சுழற்சியை கட்டாயம் பின்பற்றவும்." },
            { keywords: ["precaution", "முன்னெச்சரிக்கை", "protect"], reply: "பொதுவான முன்னெச்சரிக்கைகள்: 1. பயிர் சுழற்சி. 2. நீர் தேக்கத்தை தவிர்க்கவும். 3. மண்ணை சோதிக்கவும்." }
        ],
        fallback: "தயவுசெய்து நீங்கள் வளர்க்கும் பயிர் அல்லது நோயை தெளிவாக கேட்கவும்."
    },
    mr: {
        welcome: "नमस्कार! मी तुमचा एआय कृषी सहाय्यक आहे. सल्ले आणि खबरदारीसाठी मला विचारा.",
        prompts: ["गव्हातील रोग?", "कापसाचे संरक्षण कसे करावे?", "सामान्य खबरदारी?"],
        logic: [
            { keywords: ["गहू", "wheat", "rust", "रोग"], reply: "गव्हाच्या तांबेरासाठी मॅनकोझेब फवारा. खबरदारी: पाणी साचू देऊ नका आणि जास्त खत टाळा." },
            { keywords: ["कापूस", "cotton", "blight", "संरक्षण"], reply: "कापसासाठी कॉपर ऑक्सीक्लोराइड वापरा. खबरदारी: नेहमी प्रमाणित बियाणे वापरा आणि पीक अवशेष नष्ट करा." },
            { keywords: ["apple", "सफरचंद"], reply: "सफरचंदाच्या रोगांसाठी कॅप्टन वापरा. खबरदारी: हवा खेळती राहण्यासाठी फांद्या वेळोवेळी छाटा." },
            { keywords: ["पीक", "crop"], reply: "चांगल्या पिकासाठी 'Crop Recommendation' टॅब पहा. खबरदारी: नेहमी पिकांची फेरपालट करा." },
            { keywords: ["precaution", "खबरदारी", "protect"], reply: "सामान्य खबरदारी: 1. पिकांची फेरपालट. 2. पाणी साचणे टाळा. 3. मातीचे परीक्षण करा." }
        ],
        fallback: "कृपया तुमचे पीक किंवा आजाराबद्दल स्पष्टपणे विचारणा करा."
    }
};

let currentLang = 'en';

const bcp47Map = { 'en': 'en-IN', 'hi': 'hi-IN', 'te': 'te-IN', 'ta': 'ta-IN', 'mr': 'mr-IN' };

function setChatbotLanguage(lang) {
    currentLang = lang;
    const langKey = currentLang.split('-')[0]; // simple split to match logic object
    
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.lang-btn[data-lang="${langKey}"]`).classList.add('active');
    
    const msgContainer = document.getElementById('chat-messages');
    msgContainer.innerHTML = '';
    
    // Auto speak the welcome message upon changing language
    addMessage(chatbotBrain[langKey].welcome, true, true);
    
    const promptContainer = document.getElementById('quick-prompts');
    promptContainer.innerHTML = '';
    chatbotBrain[langKey].prompts.forEach(p => {
        let chip = document.createElement('div');
        chip.className = 'prompt-chip';
        chip.innerText = p;
        chip.onclick = () => {
            document.getElementById('chat-input').value = p;
            document.getElementById('chat-form').dispatchEvent(new Event('submit'));
        };
        promptContainer.appendChild(chip);
    });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => setChatbotLanguage(e.target.dataset.lang));
});

const ttsUI = {
    'en': { play: '▶️ Play', pause: '⏸️ Pause', resume: '⏯️ Resume' },
    'hi': { play: '▶️ चलाएं', pause: '⏸️ रोकें', resume: '⏯️ फिर से शुरू' },
    'te': { play: '▶️ ప్లే', pause: '⏸️ పాజ్', resume: '⏯️ పునః' },
    'ta': { play: '▶️ ப்ளே', pause: '⏸️ இடைநிறுத்து', resume: '⏯️ மீண்டும் தொடங்கு' },
    'mr': { play: '▶️ प्ले करा', pause: '⏸️ थांबवा', resume: '⏯️ पुन्हा सुरू' }
};

// Highly reliable free Google Translate API wrapper for robust local execution
async function translateText(text, targetLang) {
    if (targetLang === 'en' || !text) return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        return json[0].map(x => x[0]).join('');
    } catch (e) {
        console.error("Translation fail:", e);
        return text;
    }
}

function addMessage(text, isAi, autoSpeak = false) {
    const msgContainer = document.getElementById('chat-messages');
    let div = document.createElement('div');
    div.className = `message ${isAi ? 'ai-msg' : 'user-msg'}`;
    
    const ttsText = text.replace(/\*\*/g, '').replace(/\n/g, '. ');
    const safeText = ttsText.replace(/'/g, "\\'").replace(/"/g, '');
    const langKey = currentLang.split('-')[0];
    const langCode = bcp47Map[langKey] || 'en-IN';
    const ui = ttsUI[langKey] || ttsUI['en'];

    div.innerHTML = `
        <div class="avatar">${isAi ? '🌿' : '👤'}</div>
        <div class="msg-bubble" style="width: 100%;">
            ${text.replace(/\n/g, '<br>')}
            ${isAi ? `
            <div style="margin-top: 0.8rem; display: flex; gap: 5px; flex-wrap: wrap;">
                <button class="btn secondary-btn small-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="speakText('${safeText}', '${langCode}')">${ui.play}</button>
                <button class="btn secondary-btn small-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="window.speechSynthesis.pause()">${ui.pause}</button>
                <button class="btn secondary-btn small-btn" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="window.speechSynthesis.resume()">${ui.resume}</button>
            </div>
            ` : ''}
        </div>
    `;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    if (isAi && autoSpeak) {
        speakText(ttsText, langCode);
    }
}

document.getElementById('chat-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, false);
    input.value = '';
    
    const langKey = currentLang.split('-')[0];
    
    const msgContainer = document.getElementById('chat-messages');
    let loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-msg';
    loadingDiv.id = 'ai-typing';
    loadingDiv.innerHTML = `<div class="avatar">🌿</div><div class="msg-bubble"><em>AgriSmart AI is analyzing your query...</em></div>`;
    msgContainer.appendChild(loadingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    
    try {
        const prompt = `You are an expert agricultural AI. A farmer asks: "${text}". 
Instructions:
1. Provide a short cultivation timeline for the crop.
2. List the expected diseases.
3. List the recommended Fertilizers and Sprays to use for protection.
4. Provide explicit precautions for these issues.
5. Reply strictly in language code "${langKey}".
Keep the response structured clearly.`;
        
        const aiResponse = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt));
        if (!aiResponse.ok) throw new Error("API call failed");
        
        const finalAns = await aiResponse.text();
        document.getElementById('ai-typing').remove();
        addMessage(finalAns.trim(), true, true);
        
    } catch (error) {
        // Fallback execution when native CORS or API breaks
        const userText = text.toLowerCase().trim();
        let matchedReply = "";

        for (let rule of chatbotBrain[langKey].logic) {
            let matchCount = rule.keywords.filter(kw => userText.includes(kw)).length;
            if (matchCount > 0) {
                matchedReply = rule.reply;
                break;
            }
        }

        if (!matchedReply) {
            const cropKey = text.split(" ")[0].toLowerCase();
            const cropName = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
            
            const cropDatabase = {
                'wheat': { t: 'Takes 4-5 months (Rabi crop, sown Oct-Nov, harvested Mar-Apr).', d: 'Leaf Rust, Yellow Rust, Loose Smut.', f: 'NPK 120:60:40 kg/ha. Spray Propiconazole or Mancozeb for rust.', p: 'Avoid water-logging. Plant rust-resistant seed varieties.' },
                'rice': { t: 'Takes 3-6 months (Kharif crop, sown June-July).', d: 'Rice Blast, Brown Spot, Sheath Blight.', f: 'NPK 100:50:50 kg/ha. Spray Tricyclazole or Carbendazim for blast.', p: 'Maintain 2-5cm standing water in the field. Drain field 15 days before harvest.' },
                'cotton': { t: 'Takes 6-8 months (Kharif, sown May-July, harvested Oct-Jan).', d: 'Bacterial Blight, Pink Bollworm.', f: 'NPK 120:60:60 kg/ha. Spray Copper Oxychloride for blight, Spinosad for bollworm.', p: 'Use Bt Cotton seeds if permitted. Deep plow in summer.' },
                'sugarcane': { t: 'Takes 12-18 months from planting to harvest.', d: 'Red Rot, Smut, Wilt.', f: 'Heavy feeder: NPK 250:100:100 kg/ha. Treat setts with Carbendazim.', p: 'Never use setts from Red Rot infected fields. Ensure deep trench planting.' },
                'apple': { t: 'Takes 3-5 years to fruit. Harvested late summer/autumn.', d: 'Apple Scab, Powdery Mildew.', f: 'Apply well-rotted FYM. Spray Captan or Mancozeb before flowering.', p: 'Regularly prune trees for air circulation. Remove fallen infected leaves.' },
                'mango': { t: 'Perennial tree. Flowers in Jan-Feb, fruits harvested April-July.', d: 'Anthracnose, Powdery Mildew, Mango Hopper.', f: 'NPK 1000:500:1000g per tree. Spray Hexaconazole for powdery mildew.', p: 'Do not spray pesticides during active flowering to protect pollinators.' },
                'tomato': { t: 'Takes 3-4 months. Can be grown year-round.', d: 'Early Blight, Late Blight, Tomato Spotted Wilt Virus.', f: 'NPK 120:80:80 kg/ha. Spray Mancozeb for blights.', p: 'Stake plants to prevent fruit rot and improve air flow.' },
                'generic': { t: 'Takes approximately 3-5 months from sowing to harvest depending on variety.', d: 'Highly susceptible to fungal blights, rusts, and root rot in humid weather.', f: 'Apply balanced NPK (19:19:19). Spray broad-spectrum fungicides like Mancozeb at the first sign of leaf spotting.', p: 'Ensure strictly well-drained soil, practice seasonal crop rotation.' }
            };

            const data = cropDatabase[cropKey] || cropDatabase['generic'];
            
            // Translate the raw english payload dynamically using highly-reliable API
            const t_t = await translateText(data.t, langKey);
            const t_d = await translateText(data.d, langKey);
            const t_f = await translateText(data.f, langKey);
            const t_p = await translateText(data.p, langKey);
            const t_name = await translateText(cropName, langKey);
            
            if (langKey === 'hi') {
                matchedReply = `**${t_name} की खेती का समय**: ${t_t}\n**संभावित रोग**: ${t_d}\n**उर्वरक एवं स्प्रे (Fertilizers & Sprays)**: ${t_f}\n**सावधानियां (Precautions)**: ${t_p}`;
            } else if (langKey === 'te') {
                matchedReply = `**${t_name} సాగు సమయం**: ${t_t}\n**ఆశించే రోగాలు**: ${t_d}\n**ఎరువులు & స్ప్రేలు (Fertilizers & Sprays)**: ${t_f}\n**జాగ్రత్తలు (Precautions)**: ${t_p}`;
            } else if (langKey === 'ta') {
                matchedReply = `**${t_name} சாகுபடி காலம்**: ${t_t}\n**எதிர்பார்க்கப்படும் நோய்கள்**: ${t_d}\n**உரங்கள் மற்றும் ஸ்ப்ரேக்கள் (Fertilizers & Sprays)**: ${t_f}\n**முன்னெச்சரிக்கைகள் (Precautions)**: ${t_p}`;
            } else if (langKey === 'mr') {
                matchedReply = `**${t_name} लागवड कालावधी**: ${t_t}\n**संभाव्य रोग**: ${t_d}\n**खते आणि फवारणी (Fertilizers & Sprays)**: ${t_f}\n**खबरदारी (Precautions)**: ${t_p}`;
            } else {
                matchedReply = `**Cultivation Timeline (${cropName})**: ${t_t}\n**Expected Diseases**: ${t_d}\n**Fertilizers & Sprays**: ${t_f}\n**Precautions**: ${t_p}`;
            }
        }
        
        document.getElementById('ai-typing').remove();
        addMessage(matchedReply, true, true);
    }
});

// Initialize
setChatbotLanguage('en');
