from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime

class ClaimAnalysis(BaseModel):
    claim: str
    verdict: str = Field(..., description="TRUE | FALSE | UNVERIFIED | MISLEADING")
    source: str
    explanation: str

class EthicalNotes(BaseModel):
    bias_warning: str
    confidence_note: str
    privacy: str = "No user content retained beyond this session"

class FrameAnalysis(BaseModel):
    frames_analyzed: int
    manipulation_detected: bool
    ai_generated_score: float = Field(..., ge=0.0, le=1.0)
    artifacts_found: List[str]

class UnifiedReportSchema(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    verdict: str = Field(..., description="LIKELY MISLEADING | LIKELY TRUE | UNVERIFIED")
    credibility_score: int = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0.0, le=1.0)
    summary: str
    reasoning_chain: List[str] = Field(default_factory=list, description="Step-by-step logic detailing how the AI derived the credibility score.")
    analysis_model: str = Field(default="N/A", description="AI Model(s) used for the final analysis")
    api_used: str = Field(default="N/A", description="API Provider(s) used for the final analysis")
    claims_analyzed: List[ClaimAnalysis]
    red_flags: List[str]
    frame_analysis: Optional[FrameAnalysis] = None
    ethical_notes: EthicalNotes
    input_type: str = Field(..., description="text | url | image | audio | video")
    processing_path: str
    raw_response: Optional[str] = Field(default=None, description="Raw JSON or text response from the model for maximum transparency")
    timestamp: datetime = Field(default_factory=datetime.now)

# Request Models
class URLAnalysisRequest(BaseModel):
    url: str

class TextAnalysisRequest(BaseModel):
    content: str
