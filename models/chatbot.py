def get_chatbot_response(query: str, language: str) -> str:
    """
    Dynamic basic semantic response simulation without actual LLM weights.
    Analyzes the query for agricultural keywords.
    """
    query_lower = query.lower()
    
    # Keyword heuristics
    if "fertilizer" in query_lower or "urea" in query_lower or "nitrogen" in query_lower:
        base_resp = "For fertilizing, it's best to test your soil NPK levels first. Urea is excellent for nitrogen, but too much will burn the roots."
    elif "water" in query_lower or "irrigation" in query_lower or "rain" in query_lower:
        base_resp = "Smart irrigation is crucial. Use drip irrigation for row crops like cotton, while flooding restricts airflow. Check the local rainfall index!"
    elif "disease" in query_lower or "yellow" in query_lower or "spots" in query_lower:
        base_resp = "Yellow spots usually indicate a fungal infection (like rust or blight) or nitrogen deficiency. Try uploading an image to the Disease identifier!"
    elif "profit" in query_lower or "money" in query_lower or "yield" in query_lower:
        base_resp = "To maximize yield, utilize crop rotation. Legumes like chickpeas restore nitrogen, reducing chemical costs for your next harvest."
    else:
        base_resp = f"That's an excellent question about '{query}'. For deeper insights, ensure your local weather and soil parameters are up to date."
        
    # Language translations
    if language.lower() == "hindi":
        return "कृषि सलाहकार: " + base_resp + " (कृपया ध्यान दें, यह एक डेमो अनुवाद है।)"
    elif language.lower() == "kannada":
        return "ಕೃಷಿ ಸಲಹೆಗಾರ: " + base_resp + " (ಇದು ಡೆಮೊ ಅನುವಾದವಾಗಿದೆ.)"
    elif language.lower() == "telugu":
        return "వ్యవసాయ సలహాదారు: " + base_resp + " (ఇది డెమో అనువాదం.)"
    elif language.lower() == "tamil":
        return "விவசாய ஆலோசகர்: " + base_resp + " (இது ஒரு டெமோ மொழிபெயர்ப்பு.)"
        
    return base_resp
