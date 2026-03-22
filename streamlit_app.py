import streamlit as st
import base64
import os

# Set the Streamlit page to full width
st.set_page_config(layout="wide", page_title="AgriSmart Assistant", initial_sidebar_state="collapsed")

# Hide Streamlit's default UI elements to make it look like a pure website
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            .block-container {
                padding-top: 0rem;
                padding-bottom: 0rem;
                padding-left: 0rem;
                padding-right: 0rem;
                max-width: 100%;
            }
            iframe {
                width: 100vw;
                height: 100vh;
                border: none;
                margin: 0;
                padding: 0;
            }
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

def load_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return ""

def load_image_base64(filepath):
    try:
        with open(filepath, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
        return f"data:image/png;base64,{encoded_string}"
    except:
        return ""

# Read all frontend code
html_code = load_file("index.html")
css_code = load_file("style.css")
js_code = load_file("script.js")

# Convert the background image to base64 so it loads properly inside the Streamlit iframe
bg_base64 = load_image_base64("background.png")
if bg_base64:
    css_code = css_code.replace("background.png", bg_base64)

# Strip out the external link tags from HTML so we can inject them directly
html_code = html_code.replace('<link rel="stylesheet" href="style.css">', '')
html_code = html_code.replace('<script src="script.js"></script>', '')

# Assemble the monolithic HTML payload
full_html_payload = f"""
{html_code}
<style>
{css_code}
</style>
<script>
{js_code}
</script>
"""

# Render the application inside Streamlit!
st.components.v1.html(full_html_payload, height=900, scrolling=True)
