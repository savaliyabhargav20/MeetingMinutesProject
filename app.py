import streamlit as st
import os
from utils import transcribe_audio, generate_summary

st.set_page_config(page_title="AI Meeting Minutes", page_icon="📝")
st.title("📝 Automatic Meeting Minutes")

uploaded_file = st.file_uploader("Upload Zoom Recording", type=["m4a", "mp3", "wav"])

if uploaded_file:
    if st.button("Generate Minutes"):
        # Create a temp file to process
        with open("temp_audio.m4a", "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        with st.spinner("Processing..."):
            text = transcribe_audio("temp_audio.m4a")
            minutes = generate_summary(text)
            
            st.subheader("Results")
            st.write(minutes)
        
        os.remove("temp_audio.m4a")
