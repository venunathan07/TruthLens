import asyncio
from fastapi import APIRouter
from backend.schemas.content import AnalyzeBatchRequest, AnalyzeBatchResponse, AnalysisResult
from backend.services.groq_service import analyze_post

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeBatchResponse)
async def analyze_batch(request: AnalyzeBatchRequest):
    if not request.posts:
        return AnalyzeBatchResponse(results=[])

    loop = asyncio.get_running_loop()
    tasks = [
        loop.run_in_executor(None, analyze_post, post)
        for post in request.posts
    ]
    results = await asyncio.gather(*tasks)

    return AnalyzeBatchResponse(results=list(results))
