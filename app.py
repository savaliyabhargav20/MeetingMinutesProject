import streamlit as st
import os
from utils import transcribe_audio, generate_summary

# 1. Page Configuration & Title
st.set_page_config(page_title="AI Meeting Minutes", page_icon="📝")
st.title("📝 Automatic Meeting Minutes")
st.markdown("Upload your Zoom recording to get a structured summary instantly.")

# 2. File Uploader
# We restrict types to m4a (Zoom default) and mp3/wav for flexibility
uploaded_file = st.file_uploader("Upload your Zoom Recording (Audio Only)", type=["m4a", "mp3", "wav"])

if uploaded_file is not None:
    st.audio(uploaded_file, format='audio/m4a')
    
    # 3. Process Button
    if st.button("Generate Meeting Minutes"):
        # Save the uploaded file temporarily to process it
        temp_file_path = f"temp_{uploaded_file.name}"
        with open(temp_file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())

        try:
            # Visual feedback for the user
            with st.status("Processing your meeting..."):
                st.write("Transcribing audio with Whisper...")
                transcript = transcribe_audio(temp_file_path)
                
                st.write("Generating professional summary...")
                summary = generate_summary(transcript)

            # 4. Display Results
            st.success("Analysis Complete!")
            
            st.subheader("Professional Summary")
            st.write(summary)

            st.subheader("Raw Transcript")
            with st.expander("Click to view full transcript"):
                st.write(transcript)

        except Exception as e:
            st.error(f"An error occurred: {e}")
        
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
else:
    st.info("Please upload an audio file to begin.")

# Create the Word file in memory
docx_file = create_docx(summary)

# Add a download button
st.download_button(
    label="📂 Download Minutes as Word",
    data=docx_file,
    file_name="Meeting_Minutes.docx",
    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)