from app.services.file_handlers.base import FileHandler


class TextHandler(FileHandler):
    """Handles .txt and .csv -- no library needed, it's just bytes <-> str."""

    def read_text(self, file_bytes: bytes) -> str:
        return file_bytes.decode("utf-8", errors="replace")

    def create(self, content_text: str) -> bytes:
        return content_text.encode("utf-8")

    def update(self, file_bytes: bytes, instruction_result_text: str) -> bytes:
        return instruction_result_text.encode("utf-8")
