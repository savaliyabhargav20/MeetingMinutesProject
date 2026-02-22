import whisper
import os
from dotenv import load_dotenv

# UPDATED IMPORTS FOR LANGCHAIN 1.x
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

def transcribe_audio(file_path):
    """Converts audio to raw text using Whisper."""
    model = whisper.load_model("base")
    result = model.transcribe(file_path)
    return result["text"]

def generate_summary(transcript_text):
    """Summarizes text using the updated LangChain 1.x logic."""
    try:
        # Initialize the LLM (Requires OPENAI_API_KEY in your .env)
        llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

        # Updated Template Logic
        prompt = ChatPromptTemplate.from_template("""
        You are a professional secretary. Summarize this meeting transcript:
        
        1. **Executive Summary**
        2. **Key Decisions**
        3. **Action Items**

        Transcript:
        {transcript}
        """)

        # Modern LangChain "Chain" syntax
        chain = prompt | llm
        response = chain.invoke({"transcript": transcript_text})

        return response.content
    except Exception as e:
        return f"Error: {str(e)}"
