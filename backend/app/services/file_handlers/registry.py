"""
Maps a FileType to its handler instance. This is the one place that needs
to change if a new file type is added.
"""
from app.models.document import FileType
from app.services.file_handlers.docx_handler import DocxHandler
from app.services.file_handlers.pdf_handler import PdfHandler
from app.services.file_handlers.pptx_handler import PptxHandler
from app.services.file_handlers.text_handler import TextHandler
from app.services.file_handlers.xlsx_handler import XlsxHandler

_HANDLERS = {
    FileType.docx: DocxHandler(),
    FileType.xlsx: XlsxHandler(),
    FileType.pptx: PptxHandler(),
    FileType.pdf: PdfHandler(),
    FileType.txt: TextHandler(),
    FileType.csv: TextHandler(),
}


def get_handler(file_type: FileType):
    return _HANDLERS[file_type]
