from docx import Document
import io

def create_docx(summary_text):
    doc = Document()
    doc.add_heading('Meeting Minutes', 0)
    doc.add_paragraph(summary_text)
    
    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()
