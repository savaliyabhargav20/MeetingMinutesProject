import whisper

# 1. Define the path to the file you moved
audio_path = "input_audio/audio_only.m4a"

# 2. Load the Whisper Model
model = whisper.load_model("base")

# 3. Transcribe the file
print("Transcribing your Zoom meeting... please wait.")
result = model.transcribe(audio_path)

# 4. Show the text
print(result["text"])
