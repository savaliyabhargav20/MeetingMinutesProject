import openai
import streamlit as st

def get_chat_response(transcript):
    """
    Takes the raw transcript and uses GPT-4o to format it into 
    professional meeting minutes.
    """
    # Initialize the client inside the function using the secret
    client = openai.OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

    system_prompt = (
        "You are an AI assistant specialized in corporate secretarial duties. "
        "Analyze the following meeting transcript and generate professional minutes. "
        "Structure the output with the following headings:\n"
        "1. **Executive Summary**: A brief overview of the meeting.\n"
        "2. **Key Discussion Points**: Bullet points of main topics discussed.\n"
        "3. **Decisions Made**: Any final conclusions reached.\n"
        "4. **Action Items**: A list of tasks, who is assigned to them, and deadlines (if mentioned)."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Transcript:\n{transcript}"}
            ],
            temperature=0.5 # Keeps the output focused and professional
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Error generating minutes: {str(e)}"

def transcribe_audio(audio_file):
    """
    Sends the audio file to OpenAI Whisper for transcription.
    """
    client = openai.OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

    try:
        # Note: audio_file is a file-like object from st.file_uploader
        transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file
        )
        return transcript.text
    except Exception as e:
        return f"❌ Error transcribing audio: {str(e)}"
