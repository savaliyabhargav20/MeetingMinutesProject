import streamlit as st
import openai
from utils import transcribe_audio, generate_minutes

# --- CONFIGURATION ---
st.set_page_config(page_title="AI Meeting Minutes", page_icon="📝")

# Accessing the secret correctly by its KEY NAME, not the value
try:
    openai.api_key = st.secrets["OPENAI_API_KEY"]
except KeyError:
    st.error("Missing secret: 'OPENAI_API_KEY' not found in Streamlit secrets.")
    st.stop()

# --- UI ---
st.title("📝 AI Meeting Minutes Generator")
st.write("Upload your meeting recording and let AI do the notes.")

uploaded_file = st.file_uploader("Upload Audio (mp3, wav, m4a)", type=["mp3", "wav", "m4a"])

if uploaded_file is not None:
    if st.button("Generate Minutes"):
        with st.spinner("Processing... this may take a minute."):
            
            # Step 1: Transcribe
            text_raw = transcribe_audio(uploaded_file)
            
            # Step 2: Generate Minutes
            if "Error" not in text_raw:
                minutes = generate_minutes(text_raw)
                
                st.subheader("Final Minutes")
                st.markdown(minutes)
                
                # Download Option
                st.download_button("Download Minutes", minutes, file_name="minutes.txt")
            else:
                st.error(text_raw)
