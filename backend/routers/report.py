from fastapi import APIRouter, HTTPException, status
from pydantic import UUID4
from backend.models import UnifiedReportSchema

router = APIRouter()

# In-memory dictionary for report storage
# Key: UUID string, Value: UnifiedReportSchema
in_memory_report_db = {}

def store_report(report: UnifiedReportSchema):
    """
    Stores a generated report in the in-memory database.
    """
    in_memory_report_db[str(report.id)] = report

@router.get("/{report_id}", response_model=UnifiedReportSchema)
async def get_report(report_id: UUID4):
    """
    Retrieves a stored report by its ID.
    """
    report = in_memory_report_db.get(str(report_id))
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID {report_id} not found."
        )
        
    return report
