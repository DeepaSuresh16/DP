import streamlit as st
from models.predict_soil import predict_soil
from models.predict_disease import predict_disease
from models.recommend_crop import recommend_crop
from models.chatbot import get_chatbot_response

st.set_page_config(page_title="Smart Agri Assistant", page_icon="🌱", layout="wide")

st.title("🌱 Smart Agri AI Assistant")
st.markdown("Predict crops, analyze soil health, detect leaf diseases, and chat with your personalized agricultural guide powered by AI.")

# Tabs Setup
tab1, tab2, tab3, tab4 = st.tabs(["🌾 Crop Recommendation", "🌱 Soil Analysis", "🍃 Leaf Disease", "🤖 AI Chatbot"])

# T1: Crop Recommendation
with tab1:
    st.header("Precision Crop Recommendation")
    col1, col2 = st.columns(2)
    with col1:
        N = st.number_input("Nitrogen (N) Content", 0, 140, 50)
        P = st.number_input("Phosphorous (P) Content", 0, 145, 50)
        K = st.number_input("Potassium (K) Content", 0, 205, 50)
        temp = st.number_input("Temperature (°C)", 0.0, 50.0, 25.0)
    with col2:
        humidity = st.number_input("Humidity (%)", 0.0, 100.0, 50.0)
        ph = st.number_input("Soil pH", 0.0, 14.0, 6.5)
        rainfall = st.number_input("Rainfall (mm)", 0.0, 300.0, 100.0)
        
    if st.button("Get Crop Recommendations"):
        data = {"N": N, "P": P, "K": K, "temperature": temp, "humidity": humidity, "ph": ph, "rainfall": rainfall}
        res = recommend_crop(data)
        st.success("✅ Analysis Complete!")
        for i, c in enumerate(res):
            st.info(f"**{i+1}. {c['crop']}**: {c['reason']}")

# T2: Soil Analysis
with tab2:
    st.header("Intelligent Soil Assessment")
    soil_img = st.file_uploader("Upload Soil Image", type=["jpg", "png", "jpeg"], key="soil")
    if soil_img and st.button("Analyze Soil Health"):
        res = predict_soil(soil_img.read())
        st.success("✅ Image processing successful!")
        col1, col2 = st.columns(2)
        with col1:
            st.write(f"🌍 **Detected Type:** {res['soil_type']}")
            st.write(f"🧪 **Estimated pH:** {res['estimated_ph']}")
        with col2:
            st.write(f"💧 **Estimated Moisture:** {res['estimated_moisture']}")
            st.write(f"🌾 **Suggested Matches:** {', '.join(res['suggested_crops'])}")

# T3: Disease Detection
with tab3:
    st.header("Leaf Disease Classifier")
    leaf_img = st.file_uploader("Upload Leaf Image", type=["jpg", "png", "jpeg"], key="leaf")
    if leaf_img and st.button("Detect Leaf Malady"):
        res = predict_disease(leaf_img.read())
        if res.get('detected', False):
            st.error(f"🚨 **Issue Identified:** {res['disease_name']} ({int(res['confidence']*100)}% Confidence)")
            st.write(f"**Root Causes:** {res['causes']}")
            st.write(f"**Prevention Planning:** {res['prevention']}")
            st.subheader("💊 Recommended Treatments:")
            st.write(f"- 🧴 **Chemical Approach:** {res['recommended_treatment']['chemical']}")
            st.write(f"- 🍃 **Organic Approach:** {res['recommended_treatment']['organic']}")
        else:
            st.success("🌟 The leaf appears **completely healthy**! Keep up the good work.")

# T4: Chatbot
with tab4:
    st.header("AI Agronomist Chat")
    st.markdown("Ask anything concerning farming protocols, treatments, yields, or weather adjustments.")
    
    col1, col2 = st.columns([1, 4])
    with col1:
        lang = st.selectbox("Response Language", ["English", "Hindi", "Kannada", "Telugu", "Tamil"])
    with col2:
        query = st.text_input("What is your farming question?")
        
    if st.button("Consult AI") and query:
        res = get_chatbot_response(query, lang)
        # Using a chat message layout
        with st.chat_message("assistant"):
            st.write(res)
