import os
from dotenv import load_dotenv
load_dotenv()

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import explain, trace, ask

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

app = FastAPI(
    title="CodeCanvas API",
    description="AI-powered code visualization backend for computer science students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Next.js dev and production
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins + ["http://localhost:3000", "https://codecanvas.app", "https://lpu-code-viz.vercel.app"],
    allow_origin_regex=r"https://lpu-code-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(explain.router, tags=["Explain"])
app.include_router(trace.router,   tags=["Trace"])
app.include_router(ask.router,     tags=["Tutor Chat"])


@app.get("/")
async def root():
    return {
        "name": "CodeCanvas API",
        "version": "1.0.0",
        "endpoints": ["/explain", "/trace", "/ask"],
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/test_groq")
async def test_groq():
    import time
    from services.groq_client import get_groq_clients, PRIMARY_MODEL, FALLBACK_MODEL
    
    try:
        clients = get_groq_clients()
    except Exception as e:
        return {"error": f"Failed to get clients: {e}"}
        
    report = []
    for idx, client in enumerate(clients):
        key_report = {"index": idx}
        # Test llama-3.1-8b-instant
        start = time.time()
        try:
            response = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a helper."},
                    {"role": "user", "content": "Hello. Respond in 3 words."}
                ],
                max_tokens=10,
                temperature=0.3
            )
            elapsed = time.time() - start
            key_report["8b_status"] = "ok"
            key_report["8b_time"] = round(elapsed, 2)
            key_report["8b_response"] = response.choices[0].message.content.strip()
        except Exception as e:
            key_report["8b_status"] = "error"
            key_report["8b_error"] = str(e)
            
        # Test llama-3.3-70b-versatile
        start = time.time()
        try:
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helper."},
                    {"role": "user", "content": "Hello. Respond in 3 words."}
                ],
                max_tokens=10,
                temperature=0.3
            )
            elapsed = time.time() - start
            key_report["70b_status"] = "ok"
            key_report["70b_time"] = round(elapsed, 2)
            key_report["70b_response"] = response.choices[0].message.content.strip()
        except Exception as e:
            key_report["70b_status"] = "error"
            key_report["70b_error"] = str(e)
            
        report.append(key_report)
        
    return {
        "primary_model": PRIMARY_MODEL,
        "fallback_model": FALLBACK_MODEL,
        "keys_count": len(clients),
        "report": report
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

