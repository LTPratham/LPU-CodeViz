import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import explain, trace, ask

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

app = FastAPI(
    title="LPU CodeViz API",
    description="AI-powered code visualization backend for LPU students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Next.js dev and production
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins + ["http://localhost:3000", "https://lpu-code-viz.vercel.app"],
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
        "name": "LPU CodeViz API",
        "version": "1.0.0",
        "endpoints": ["/explain", "/trace", "/ask"],
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
