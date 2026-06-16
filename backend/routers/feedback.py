# backend/routers/feedback.py
from fastapi import APIRouter
from backend.schemas.content import FeedbackRequest

router = APIRouter()

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    # TODO: Save to PostgreSQL when DB is set up
    print(f"[Feedback] post_id={request.post_id} correct={request.correct}")
    return {"status": "ok"}