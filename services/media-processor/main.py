from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
import fitz  # PyMuPDF
import io

app = FastAPI(title="Media Processor", description="Extracts and chunks educational media")

class YoutubeRequest(BaseModel):
    url: str

class ProcessedChunk(BaseModel):
    index: int
    text: str
    char_count: int

class ProcessedResponse(BaseModel):
    source: str
    chunks: list[ProcessedChunk]
    total_chunks: int

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=4000,
    chunk_overlap=400,
    length_function=len,
    is_separator_regex=False,
)

def extract_video_id(url: str) -> str:
    """Extracts the YouTube video ID from a standard or shortened URL."""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    raise ValueError("Invalid YouTube URL")

@app.post("/process/youtube", response_model=ProcessedResponse)
async def process_youtube(req: YoutubeRequest):
    try:
        video_id = extract_video_id(req.url)
        # Fetch transcript
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine text
        full_text = " ".join([t['text'] for t in transcript_list])
        
        # Chunk text
        chunks = text_splitter.split_text(full_text)
        
        processed = [
            ProcessedChunk(index=i, text=c, char_count=len(c)) 
            for i, c in enumerate(chunks)
        ]
        
        return ProcessedResponse(
            source=req.url,
            chunks=processed,
            total_chunks=len(processed)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process/pdf", response_model=ProcessedResponse)
async def process_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        contents = await file.read()
        
        # Extract text using PyMuPDF
        doc = fitz.open(stream=contents, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
            
        if not full_text.strip():
            raise ValueError("No extractable text found in PDF")
            
        # Chunk text
        chunks = text_splitter.split_text(full_text)
        
        processed = [
            ProcessedChunk(index=i, text=c, char_count=len(c)) 
            for i, c in enumerate(chunks)
        ]
        
        return ProcessedResponse(
            source=file.filename,
            chunks=processed,
            total_chunks=len(processed)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
