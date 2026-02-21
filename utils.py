import whisper
import os
from dotenv import load_dotenv
from docx import Document
import io

# Use these modern import paths to avoid ModuleNotFound errors
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

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

def create_docx(summary_text):
    """
    Converts summary text into a professional Word document.
    """
    doc = Document()
    doc.add_heading('Meeting Minutes', 0)
    
    # Add the summary content
    doc.add_paragraph(summary_text)
    
    # Save to an in-memory buffer so it can be downloaded
    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()
