import whisper
import os
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from docx import Document
import io

# Load your API keys from the .env file
load_dotenv()

def transcribe_audio(file_path):
    """
    Step 1: Uses OpenAI Whisper to convert the audio file into a raw transcript.
    """
    try:
        # Load the Whisper model (using 'base' for a balance of speed and accuracy)
        # Options: 'tiny', 'base', 'small', 'medium', 'large'
        model = whisper.load_model("base")
        
        # Run transcription
        print(f"Starting transcription for: {file_path}")
        result = model.transcribe(file_path)
        
        return result["text"]
    except Exception as e:
        return f"Error during transcription: {str(e)}"

def generate_summary(transcript_text):
    """
    Step 2: Uses LangChain and GPT-4o to summarize the raw transcript.
    """
    try:
        # Initialize the Large Language Model (LLM)
        llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

        # Define the instructions (The Prompt)
        prompt = ChatPromptTemplate.from_template("""
        You are a professional secretary. I will provide you with a raw transcript of a meeting.
        Your job is to create a structured 'Meeting Minutes' document including:
        
        1. **Executive Summary**: A brief 3-4 sentence overview.
        2. **Key Decisions**: Bullet points of what was decided.
        3. **Action Items**: A list of tasks and who they are assigned to.
        4. **Next Steps**: Any upcoming meetings or deadlines mentioned.

        Transcript:
        {transcript}
        """)

        # Chain the prompt to the model and invoke it
        chain = prompt | llm
        response = chain.invoke({"transcript": transcript_text})

        return response.content
    except Exception as e:
        return f"Error during summarization: {str(e)}"

from docx import Document
import io

def create_docx(summary_text):
    """
    Converts the summary text into a professional Word Document.
    """
    doc = Document()
    doc.add_heading('Meeting Minutes', 0)
    
    # We split the summary by lines to handle the AI's formatting
    for line in summary_text.split('\n'):
        if line.startswith('###'):
            doc.add_heading(line.replace('###', '').strip(), level=1)
        elif line.startswith('**'):
            doc.add_paragraph(line.replace('**', '').strip(), style='List Bullet')
        else:
            doc.add_paragraph(line)
            
    # Save the document to a byte stream so Streamlit can download it
    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()