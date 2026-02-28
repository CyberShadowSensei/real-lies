from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Annotated

from backend.models import UnifiedReportSchema
from backend.services.video_service import process_video_for_analysis
from backend.services.audio_service import process_audio_for_analysis
from backend.services.image_service import process_image_for_analysis
from backend.services.url_service import scrape_url_content
from backend.services.text_service import analyze_text_with_groq_llm
from backend.routers.report import store_report
from backend.models import URLAnalysisRequest, TextAnalysisRequest, EthicalNotes, ClaimAnalysis

router = APIRouter()

@router.post("/audio", response_model=UnifiedReportSchema)
async def analyze_audio(audio_file: Annotated[UploadFile, File(description="Audio file to analyze (mp3, wav, etc.)")]):
    """
    Analyzes an audio file for misinformation by transcribing and evaluating the content.
    """
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an audio file."
        )
    
    try:
        report = await process_audio_for_analysis(audio_file)
        store_report(report)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing audio: {str(e)}"
        )

@router.post("/video", response_model=UnifiedReportSchema)
async def analyze_video(video_file: Annotated[UploadFile, File(description="Video file to analyze (mp4, mov, etc.)")]):
    """
    Analyzes a video file for misinformation, extracting audio for transcription
    and frames for visual analysis.
    """
    if not video_file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a video file."
        )
    
    try:
        report = await process_video_for_analysis(video_file)
        store_report(report)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing video: {str(e)}"
        )

@router.post("/image", response_model=UnifiedReportSchema)
async def analyze_image(image_file: Annotated[UploadFile, File(description="Image file to analyze (jpg, png, webp)")]):
    """
    Analyzes an image file for synthetic origins and manipulation.
    """
    if not image_file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image file."
        )
    
    try:
        report = await process_image_for_analysis(image_file)
        store_report(report)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.post("/url", response_model=UnifiedReportSchema)
async def analyze_url(request: URLAnalysisRequest):
    """
    Scrapes content from a URL and analyzes it for misinformation.
    """
    scraped_data = await scrape_url_content(request.url)

    if "error" in scraped_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scrape URL: {scraped_data['error']}"
        )
    
    main_text = scraped_data.get("main_text", "")
    if not main_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No significant text content found at the provided URL."
        )

    llm_analysis = await analyze_text_with_groq_llm(main_text)

    # Convert LLM output to UnifiedReportSchema
    claims_analyzed = [
        ClaimAnalysis(**claim) for claim in llm_analysis.get("claims_analyzed", [])
    ]
    
    ethical_notes = EthicalNotes(
        bias_warning="AI analysis can contain biases. Verify critical information.",
        confidence_note="This report is based on automated analysis and should be used as a guide."
    )

    report = UnifiedReportSchema(
        verdict=llm_analysis.get("overall_verdict", "UNVERIFIED"),
        credibility_score=llm_analysis.get("credibility_score", 50),
        confidence=llm_analysis.get("confidence", 0.5),
        summary=llm_analysis.get("summary", "Analysis summary not available."),
        reasoning_chain=llm_analysis.get("reasoning_chain", []),
        claims_analyzed=claims_analyzed,
        red_flags=llm_analysis.get("red_flags", []),
        ethical_notes=ethical_notes,
        input_type="url",
        processing_path="url_service.py -> text_service.py",
        api_used="Groq API",
        analysis_model="llama-3.3-70b",
    )
    
    store_report(report)
    return report

@router.post("/text", response_model=UnifiedReportSchema)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyzes raw text content for misinformation.
    """
    if not request.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text content cannot be empty."
        )
    
    llm_analysis = await analyze_text_with_groq_llm(request.content)

    claims_analyzed = [
        ClaimAnalysis(**claim) for claim in llm_analysis.get("claims_analyzed", [])
    ]
    
    ethical_notes = EthicalNotes(
        bias_warning="AI analysis can contain biases. Verify critical information.",
        confidence_note="This report is based on automated analysis and should be used as a guide."
    )

    report = UnifiedReportSchema(
        verdict=llm_analysis.get("overall_verdict", "UNVERIFIED"),
        credibility_score=llm_analysis.get("credibility_score", 50),
        confidence=llm_analysis.get("confidence", 0.5),
        summary=llm_analysis.get("summary", "Analysis summary not available."),
        reasoning_chain=llm_analysis.get("reasoning_chain", []),
        claims_analyzed=claims_analyzed,
        red_flags=llm_analysis.get("red_flags", []),
        ethical_notes=ethical_notes,
        input_type="text",
        processing_path="text_service.py",
        api_used="Groq API",
        analysis_model="llama-3.3-70b",
    )
    
    store_report(report)
    return report
