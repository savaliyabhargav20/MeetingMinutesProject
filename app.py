import streamlit as st
import os
from utils import transcribe_audio, generate_summary, create_docx

st.set_page_config(page_title="AI Minutes Pro", page_icon="📝")
st.title("📝 Automatic Meeting Minutes")

uploaded_file = st.file_uploader("Upload Zoom Recording (m4a, mp3, wav)", type=["m4a", "mp3", "wav"])

if uploaded_file:
    st.audio(uploaded_file)
    
    if st.button("Start AI Analysis"):
        # Save temp file for Whisper to read
        temp_name = f"temp_{uploaded_file.name}"
        with open(temp_name, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        try:
            with st.status("Analyzing Meeting...", expanded=True) as status:
                st.write("👂 Transcribing audio (Whisper)...")
                transcript = transcribe_audio(temp_name)
                
                st.write("🤖 Summarizing with GPT-4o...")
                summary = generate_summary(transcript)
                
                status.update(label="Analysis Complete!", state="complete", expanded=False)

            st.subheader("Professional Minutes")
            st.markdown(summary)

            # Export Section
            docx_data = create_docx(summary)
            st.download_button(
                label="📥 Download as Word Doc",
                data=docx_data,
                file_name="Meeting_Minutes.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            
        except Exception as e:
            st.error(f"Error occurred: {e}")
        finally:
            if os.path.exists(temp_name):
                os.remove(temp_name)
