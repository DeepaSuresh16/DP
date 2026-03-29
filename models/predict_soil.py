import hashlib

def predict_soil(image_bytes: bytes) -> dict:
    """
    Dynamic simulation for soil prediction using image byte hash.
    Generates different results based on the uploaded image.
    """
    if not image_bytes:
        return {"error": "No image provided"}
        
    # Hash the image bytes to deterministically pick a mock result
    file_hash = int(hashlib.md5(image_bytes).hexdigest(), 16)
    
    soil_types = ["Loamy", "Sandy", "Clay", "Black Soil", "Red Soil"]
    
    detected_type = soil_types[file_hash % len(soil_types)]
    estimated_ph = round(5.5 + (file_hash % 30) / 10.0, 1) # Range 5.5 to 8.4
    estimated_moisture = f"{20 + (file_hash % 60)}%" # Range 20% to 79%
    
    suggested = []
    if detected_type == "Loamy":
        suggested = ["Wheat", "Sugarcane", "Cotton"]
    elif detected_type == "Black Soil":
        suggested = ["Cotton", "Soybean", "Groundnut"]
    elif detected_type == "Red Soil":
        suggested = ["Groundnut", "Millet", "Tobacco"]
    elif detected_type == "Sandy":
        suggested = ["Potato", "Carrot", "Maize"]
    else:
        suggested = ["Rice", "Jute", "Cabbage"]
    
    return {
        "soil_type": detected_type,
        "estimated_ph": estimated_ph,
        "estimated_moisture": estimated_moisture,
        "suggested_crops": suggested
    }
