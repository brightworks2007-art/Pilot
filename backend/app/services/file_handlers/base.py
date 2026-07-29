"""
Common interface every file-type handler implements, so the CRUD/execute
layer can call `handler.read(...)`/`handler.write(...)` without caring
which format it's actually dealing with.
"""
from abc import ABC, abstractmethod


class FileHandler(ABC):
    @abstractmethod
    def read_text(self, file_bytes: bytes) -> str:
        """Return a plain-text representation of the file's content."""

    @abstractmethod
    def create(self, content_text: str) -> bytes:
        """Build a brand new file of this type from plain text content."""

    @abstractmethod
    def update(self, file_bytes: bytes, instruction_result_text: str) -> bytes:
        """
        Apply already-generated new content to an existing file, returning
        the updated file's bytes. `instruction_result_text` is the actual
        new content (the LLM has already turned the user's instruction into
        concrete text before this is called) -- this function's only job is
        writing it into the file format correctly.
        """
