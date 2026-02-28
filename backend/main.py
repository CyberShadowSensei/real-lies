from fastapi import FastAPI, APIRouter, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import analyze
from backend.routers import report

app = FastAPI(
    title="TruthLens API",
    description="Multimodal Misinformation Detection System API",
    version="0.1.0",
    debug=settings.DEBUG_MODE,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(report.router, prefix="/report", tags=["Report"])

@app.get("/health", response_class=JSONResponse, tags=["Monitoring"])
async def health_check():
    """
    Checks the health of the API.
    """
    return {"status": "ok", "message": "TruthLens API is running smoothly!"}

# Example of how to run the app using uvicorn (for development)
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host=settings.UVICORN_HOST, port=settings.UVICORN_PORT)
