import io

from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.services.file_handlers.base import FileHandler


class PdfHandler(FileHandler):
    """
    Reads real PDFs with pypdf. Creating/updating PDFs is generated fresh
    with reportlab (pypdf can't easily rewrite arbitrary PDF content) --
    good enough for the MVP; a template-based approach can replace this later.
    """

    def read_text(self, file_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join((page.extract_text() or "") for page in reader.pages)

    def create(self, content_text: str) -> bytes:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 72
        for line in content_text.split("\n"):
            if y < 72:
                c.showPage()
                y = height - 72
            c.drawString(72, y, line[:100])
            y -= 16
        c.save()
        return buffer.getvalue()

    def update(self, file_bytes: bytes, instruction_result_text: str) -> bytes:
        return self.create(instruction_result_text)
