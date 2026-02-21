import streamlit as st
import openai
from docx import Document
from io import BytesIO
import os

# --- 1. CONFIGURATION ---
# This looks for a label named "OPENAI_API_KEY" in your Streamlit Secrets
openai.api_key = st.secrets["OPENAI_API_KEY"]

# --- 2. DEFINE FUNCTIONS ---
def transcribe_audio(file_path):
    """Transcribes audio using OpenAI Whisper."""
    try:
        with open(file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
        return transcript["text"]
    except Exception as e:
        return f"Transcription Error: {str(e)}"

def create_docx(text):
    """Creates a Word document from the provided text."""
    doc = Document()
    doc.add_heading('Meeting Minutes', 0)
    doc.add_paragraph(text)
    
    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer

# --- 3. STREAMLIT UI ---
st.title("🎙️ Meeting Minutes Generator")

uploaded_file = st.file_uploader("Upload Audio File", type=["m4a", "mp3", "wav"])

if uploaded_file is not None:
    # Save file temporarily
    with open("temp_audio.m4a", "wb") as f:
        f.write(uploaded_file.getbuffer())
    
    st.info("Transcribing audio... please wait.")
    
    # Transcription
    transcript = transcribe_audio("temp_audio.m4a")
    st.write("### Transcript")
    st.write(transcript)
    
    # Document Creation
    if st.button("Generate Word Doc"):
        docx_file = create_docx(transcript)
        st.download_button(
            label="Download Minutes",
            data=docx_file,
            file_name="meeting_minutes.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
