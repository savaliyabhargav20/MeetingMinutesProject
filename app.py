import streamlit as st
import os
# Import your functions from utils.py
from utils import transcribe_audio, generate_summary, create_docx 

st.set_page_config(page_title="AI Meeting Minutes", page_icon="📝")
st.title("📝 Automatic Meeting Minutes")

# File uploader for Zoom recordings
uploaded_file = st.file_uploader("Upload your Zoom Recording", type=["m4a", "mp3", "wav"])

if uploaded_file is not None:
    st.audio(uploaded_file)
    
    if st.button("Generate Meeting Minutes"):
        # Create a temporary file to store the upload
        temp_path = f"temp_{uploaded_file.name}"
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        try:
            with st.spinner("Step 1: Transcribing Audio..."):
                transcript = transcribe_audio(temp_path)
            
            with st.spinner("Step 2: Summarizing with AI..."):
                summary = generate_summary(transcript)

            st.success("Analysis Complete!")
            st.subheader("Summary")
            st.write(summary)

            # Create and Download Word Doc
            docx_data = create_docx(summary)
            st.download_button(
                label="📥 Download Minutes as Word",
                data=docx_data,
                file_name="Meeting_Minutes.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )

        except Exception as e:
            st.error(f"Error: {e}")
        finally:
            # Clean up the temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
