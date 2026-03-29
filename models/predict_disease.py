import hashlib

def predict_disease(image_bytes: bytes) -> dict:
    """
    Dynamic simulation for crop disease detection.
    Uses an image hash to detect different bounding boxes.
    """
    if not image_bytes:
        return {"error": "Image required"}
        
    file_hash = int(hashlib.md5(image_bytes).hexdigest(), 16)
    
    diseases = [
        {
            "name": "Apple Scab",
            "causes": "Fungal infection from Venturia inaequalis due to damp environment.",
            "prevention": "Ensure good air circulation, prune trees, and clear fallen leaves.",
            "chem": "Fungicides containing captan, myclobutanil.",
            "org": "Neem oil, sulfur-based sprays."
        },
        {
            "name": "Tomato Late Blight",
            "causes": "Phytophthora infestans fungus attacking in highly moist, cool temperatures.",
            "prevention": "Water at the base, space plants well, avoid watering late in day.",
            "chem": "Chlorothalonil or copper-based fungicides quickly.",
            "org": "Regular baking soda spray, removing infected leaves immediately."
        },
        {
            "name": "Wheat Rust",
            "causes": "Puccinia fungal spores spread primarily through wind.",
            "prevention": "Use rust-resistant wheat varieties, practice strict crop rotation.",
            "chem": "Tebuconazole and propiconazole sprays at early stages.",
            "org": "Plant immunity boosters, organic compost teas."
        },
        {
            "name": "Healthy Leaf",
            "causes": "Optimal conditions maintained.",
            "prevention": "Continue regular maintenance, adequate sunlight, and proper watering schedules.",
            "chem": "None needed.",
            "org": "Maintain healthy organic compost."
        }
    ]
    
    disease = diseases[file_hash % len(diseases)]
    
    return {
        "detected": disease["name"] != "Healthy Leaf",
        "disease_name": disease["name"],
        "confidence": round(0.70 + (file_hash % 29) / 100.0, 2), # 0.70 to 0.98
        "causes": disease["causes"],
        "prevention": disease["prevention"],
        "recommended_treatment": {
            "chemical": disease["chem"],
            "organic": disease["org"]
        }
    }
