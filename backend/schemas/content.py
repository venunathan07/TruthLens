# backend/schemas/content.py
from pydantic import BaseModel
from typing import Optional

class Post(BaseModel):
    id: str
    text: str
    images: list[str] = []
    platform: str

class AnalyzeBatchRequest(BaseModel):
    posts: list[Post]

class AnalysisResult(BaseModel):
    id: str
    flagged: bool
    confidence: float
    category: Optional[str] = None
    explanation: Optional[str] = None

class AnalyzeBatchResponse(BaseModel):
    results: list[AnalysisResult]

class FeedbackRequest(BaseModel):
    post_id: str
    correct: bool
    timestamp: int