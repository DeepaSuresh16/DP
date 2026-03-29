def recommend_crop(data: dict) -> list:
    """
    Uses environmental data to recommend top crops dynamically.
    Input dictionary should have N, P, K, temperature, humidity, ph, rainfall.
    """
    N = data.get('N', 0)
    P = data.get('P', 0)
    K = data.get('K', 0)
    temperature = data.get('temperature', 0)
    humidity = data.get('humidity', 0)
    ph = data.get('ph', 0)
    rainfall = data.get('rainfall', 0)
    
    crops = []
    
    # Simple heuristic to make the response dynamic based on inputs
    if rainfall > 150 and humidity > 70:
        crops.append({"crop": "Rice", "reason": f"High rainfall ({rainfall}mm) and humidity ({humidity}%) match Rice needs."})
        crops.append({"crop": "Jute", "reason": f"Jute performs excellently with {humidity}% humidity and ample water."})
    else:
        crops.append({"crop": "Wheat", "reason": f"Moderate rainfall ({rainfall}mm) is well suited for Wheat."})
        
    if temperature > 25 and N > 60:
        crops.append({"crop": "Maize", "reason": f"High Nitrogen ({N}) and warm climate ({temperature}°C) boost Maize yield."})
    
    if rainfall < 100 and temperature > 25:
        crops.append({"crop": "Millet", "reason": f"Drought resistant, suitable for {rainfall}mm rainfall and high heat."})
        
    if ph < 6.5:
        crops.append({"crop": "Tea", "reason": f"Acidic soil (pH {ph}) is perfect for Tea leaves."})
    elif ph > 7.5:
        crops.append({"crop": "Cotton", "reason": f"Slightly alkaline soil (pH {ph}) fits Cotton requirements."})
        
    if not crops:
        crops = [
            {"crop": "Lentils", "reason": "Versatile crop suitable for moderate, balanced environments."},
        ]
        
    # Return top 3 distinct recommendations
    return crops[:3]
