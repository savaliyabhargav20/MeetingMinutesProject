import whisper
import os
from dotenv import load_dotenv

# Use these modern import paths to avoid ModuleNotFound errors
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
openai.api_key = st.secrets["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"]
def transcribe_audio(file_path):
def transcribe_audio(file_path):
    # (Rest of your code remains the same)
    model = whisper.load_model("base")
    result = model.transcribe(file_path)
    return result["text"]

def generate_summary(transcript_text):
    # Use the updated imports here
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
    prompt = ChatPromptTemplate.from_template("Summarize this: {transcript}")
    chain = prompt | llm
    return chain.invoke({"transcript": transcript_text}).content

st.title("📝 Automatic Meeting Minutes")

# ... (rest of your UI code)

if st.button("Generate Meeting Minutes"):
    # ... (transcription and summary logic)
    
    summary = generate_summary(transcript)
    st.write(summary)

    # NOW THIS LINE WILL WORK:
    docx_file = create_docx(summary) 
    
    st.download_button(
        label="Download Word Document",
        data=docx_file,
        file_name="meeting_minutes.docx",
        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

