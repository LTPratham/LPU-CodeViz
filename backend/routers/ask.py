import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.groq_client import chat_completion

router = APIRouter()
logger = logging.getLogger(__name__)


class AskRequest(BaseModel):
    code: str
    lang: str
    stepNum: int
    stepDescription: str
    question: str


ASK_SYSTEM = """You are a friendly, encouraging coding tutor for computer science B.Tech students.
Your tone is like a helpful senior student — warm, clear, never condescending.
Rules:
- Be concise: 2-4 sentences max.
- Reference the actual code the student wrote.
- Encourage, don't just give away the answer.
- Use simple analogies if helpful.
- If asked about a concept, explain it in the context of their specific code.
- Never lecture — just answer the question asked."""

ASK_USER_TEMPLATE = """Student's Code ({lang}, numbered lines):
{code}

Current Execution Step #{stepNum}: {stepDescription}

Student's Question: {question}

Answer in 2-4 sentences, referencing their actual code (refer to the line numbers if relevant)."""


@router.post("/ask")
async def ask(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Prepend line numbers to the code to help the LLM identify correct lines
    numbered_lines = [f"{i+1}: {line}" for i, line in enumerate(req.code.splitlines())]
    numbered_code = "\n".join(numbered_lines)

    user_prompt = ASK_USER_TEMPLATE.format(
        lang=req.lang,
        code=numbered_code[:2500],  # Truncate for token limits
        stepNum=req.stepNum,
        stepDescription=req.stepDescription,
        question=req.question,
    )

    try:
        answer = await chat_completion(ASK_SYSTEM, user_prompt, max_tokens=512)
        return {"answer": answer.strip()}
    except Exception as e:
        logger.error(f"Error in /ask: {e}")
        raise HTTPException(status_code=500, detail=str(e))

