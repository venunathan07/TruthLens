# backend/models/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import Column, String, Float, Boolean, BigInteger, Text
from backend.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class FlaggedContent(Base):
    __tablename__ = "flagged_content"
    id = Column(String, primary_key=True)
    text = Column(Text)
    platform = Column(String)
    confidence = Column(Float)
    category = Column(String)
    explanation = Column(Text)
    timestamp = Column(BigInteger)

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    id = Column(String, primary_key=True)
    post_id = Column(String)
    correct = Column(Boolean)
    timestamp = Column(BigInteger)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)