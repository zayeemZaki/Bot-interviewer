"""
PDF Processing Service
Handles PDF text extraction and sanitization.
"""

from pypdf import PdfReader
from io import BytesIO


class PDFService:
    """Service for processing PDF files and extracting text."""
    
    @staticmethod
    def extract_text_from_pdf(pdf_file: bytes) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            pdf_file: PDF file content as bytes
            
        Returns:
            Extracted text from all pages
        """
        text = ""
        pdf_reader = PdfReader(BytesIO(pdf_file))
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    
    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Clean and sanitize extracted text.
        
        Args:
            text: Raw text to sanitize
            
        Returns:
            Cleaned text with normalized whitespace
        """
        return text.replace("\n", " ").strip()
    
    @staticmethod
    def process_pdf(pdf_file: bytes) -> str:
        """
        Process a PDF file: extract and sanitize text.
        
        Args:
            pdf_file: PDF file content as bytes
            
        Returns:
            Clean, sanitized text from the PDF
        """
        raw_text = PDFService.extract_text_from_pdf(pdf_file)
        return PDFService.sanitize_text(raw_text)
