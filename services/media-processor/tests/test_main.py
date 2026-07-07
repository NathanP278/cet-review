import pytest
from fastapi.testclient import TestClient
from main import app, extract_video_id

client = TestClient(app)

def test_extract_video_id_standard():
    """It should extract the video ID from a standard youtube.com URL."""
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert extract_video_id(url) == "dQw4w9WgXcQ"

def test_extract_video_id_shortened():
    """It should extract the video ID from a shortened youtu.be URL."""
    url = "https://youtu.be/dQw4w9WgXcQ?t=10"
    assert extract_video_id(url) == "dQw4w9WgXcQ"

def test_extract_video_id_invalid():
    """It should raise a ValueError for an invalid URL format."""
    with pytest.raises(ValueError):
        extract_video_id("https://google.com")

def test_process_youtube_invalid_url():
    """It should return a 400 error for a completely invalid URL."""
    response = client.post("/process/youtube", json={"url": "not-a-url"})
    assert response.status_code == 400
    assert "Invalid YouTube URL" in response.json()["detail"]

def test_process_pdf_invalid_file_type():
    """It should return a 400 error if the uploaded file is not a PDF."""
    files = {"file": ("test.txt", b"Hello World", "text/plain")}
    response = client.post("/process/pdf", files=files)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "File must be a PDF"
