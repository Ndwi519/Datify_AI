import os
import base64
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from PIL import Image as PILImage

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_pdf_report(request_data) -> str:
    
    pdf_filename = f"report_{hash(request_data.question)}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # List of Flowable objects
    story = []
    
    # Title
    story.append(Paragraph("AI Data Analytics Report", title_style))
    story.append(Spacer(1, 12))
    
    # Question
    story.append(Paragraph("User Query:", subtitle_style))
    story.append(Paragraph(request_data.question, normal_style))
    story.append(Spacer(1, 12))
    
    # Explanation / Insights
    story.append(Paragraph("AI Analysis & Insights:", subtitle_style))
    
    # Split explanation by newlines and add as separate paragraphs
    if request_data.explanation:
        paragraphs = request_data.explanation.split('\n')
        for p in paragraphs:
            if p.strip():
                story.append(Paragraph(p.strip(), normal_style))
                story.append(Spacer(1, 8))
    
    story.append(Spacer(1, 16))
    
    # Base64 Image handling
    if request_data.chart_image_base64:
        try:
            # Strip data:image/png;base64, prefix if present
            base64_str = request_data.chart_image_base64
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
                
            img_data = base64.b64decode(base64_str)
            img_buffer = BytesIO(img_data)
            
            # Need to open with PIL to get aspect ratio so we can resize sensibly
            with PILImage.open(img_buffer) as pil_img:
                width, height = pil_img.size
                
            # Create a reportlab Image
            img_buffer.seek(0)
            
            # Scale to fit letter page width (~600 pts)
            target_width = 450
            ratio = target_width / max(width, 1)
            target_height = height * ratio
            
            chart_img = Image(img_buffer, width=target_width, height=target_height)
            
            story.append(Paragraph("Generated Chart visualization:", subtitle_style))
            story.append(Spacer(1, 12))
            story.append(chart_img)
            
        except Exception as e:
            print(f"Error embedding image in PDF: {str(e)}")
            story.append(Paragraph(f"*[Chart visualization could not be embedded]*", normal_style))

    doc.build(story)
    
    return pdf_path
