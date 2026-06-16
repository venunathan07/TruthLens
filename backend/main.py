from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.routers import analyze, feedback

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[TruthLens] Backend starting...")
    yield
    print("[TruthLens] Backend shutting down...")

app = FastAPI(title="TruthLens API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(feedback.router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "TruthLens API"}