from groq import Groq
import json
from backend.core.config import settings
from backend.schemas.content import Post, AnalysisResult

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a misinformation detector. Analyze social media posts and return JSON only.

FLAG only if you are 90%+ confident the content is ONE of these:
- fake_news: fabricated news events presented as real (NOT opinions, NOT predictions, NOT recent events you may not know about)
- misleading_stats: deliberately manipulated numbers or data
- fake_job: fraudulent job postings with fake salaries or placements
- health_misinfo: dangerous false medical claims
- scam_course: fake "100% placement guaranteed" course ads
- fake_review: obviously fabricated product testimonials

DO NOT FLAG:
- Opinions, predictions, satire, humor
- News organizations reporting stories
- Government officials describing their own work
- Ads from known companies (Google, AWS, Microsoft, Apple, LinkedIn)
- Prediction markets (Polymarket etc)
- Anything you are less than 90% sure about
- Breaking news or recent events (your training data may be outdated)

Return ONLY this JSON:
{"flagged": true/false, "confidence": 0.0-1.0, "category": "type or null", "explanation": "one sentence or null"}"""

def analyze_post(post: Post) -> AnalysisResult:
    try:
        text_preview = post.text[:150]
        content = f"Platform: {post.platform}\nPost: {text_preview}"

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": content},
            ],
            max_tokens=80,
            temperature=0.1,
        )

        raw = completion.choices[0].message.content.strip()
        raw = raw.replace(" ` json", "").replace(" ` ", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            return AnalysisResult(id=post.id, flagged=False, confidence=0.0)
        raw = raw[start:end]
        data = json.loads(raw)

        flagged = data.get("flagged", False)
        confidence = float(data.get("confidence", 0.0))
        category = data.get("category")

        print(f"[Groq] {post.id} | flagged={flagged} | confidence={confidence} | category={category} | text={post.text[:60]}")

        if flagged and confidence >= 0.90:
            from backend.services.search_service import verify_claim
            is_real = verify_claim(post.text)
            if is_real is True:
                print(f"[Search] Claim verified as REAL - removing flag for {post.id}")
                flagged = False
                confidence = 0.0
                category = None

        return AnalysisResult(
            id=post.id,
            flagged=flagged,
            confidence=confidence,
            category=category,
            explanation=data.get("explanation"),
        )

    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            print(f"[Groq] Rate limited - skipping post {post.id}")
        else:
            print(f"[Groq] Error analyzing post {post.id}: {e}")
        return AnalysisResult(id=post.id, flagged=False, confidence=0.0)
