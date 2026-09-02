"""FastAPI application entry point."""
from fastapi import FastAPI

app = FastAPI(title="Antarctic Navigation System", version="0.1.0")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
