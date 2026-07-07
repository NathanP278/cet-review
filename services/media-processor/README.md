# Media Processor Microservice

This is the Python microservice responsible for extracting and semantically chunking transcripts and PDFs. 

It is designed to be hosted independently of the Next.js application on a platform like Render or Railway.

## Running Locally

```bash
uv run uvicorn main:app --reload --port 8000
```
