from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from model import predict_metals, update_metals_with_user_data
import uuid
import csv
from io import StringIO
import os

USER_DATA_PATH = "user_data.csv"

app = FastAPI(title="GeoMetals API")

# ======= Models =======
class MetalResult(BaseModel):
    name: str
    concentration: float
    unit: str
    risk: str

class AnalysisResponse(BaseModel):
    metals: List[MetalResult]
    location: dict

class UploadMetadata(BaseModel):
    description: Optional[str]
    source: Optional[str]

class UploadResponse(BaseModel):
    success: bool
    fileId: str
    error: Optional[str] = None
    results: Optional[dict] = None

class InfoSection(BaseModel):
    title: str
    content: str
    lastUpdated: str

class InfoContent(BaseModel):
    sections: List[InfoSection]

# ======= Utility Functions =======
def get_risk_level(metal: str, value: float) -> str:
    if value < 50:
        return "low"
    elif value < 100:
        return "moderate"
    return "high"

def append_user_data(rows, fieldnames):
    """Append uploaded rows to the cumulative user_data.csv."""
    file_exists = os.path.isfile(USER_DATA_PATH)
    with open(USER_DATA_PATH, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

def load_user_data():
    """Load all user-uploaded data as a list of dicts."""
    if not os.path.isfile(USER_DATA_PATH):
        return []
    with open(USER_DATA_PATH, "r", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

# ============== Endpoints ==============

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contamination(request: dict):
    try:
        lat = request.get("lat")
        lng = request.get("lng")
        if lat is None or lng is None:
            raise HTTPException(status_code=400, detail="Latitude and longitude required")

        predictions = predict_metals(lat, lng)

        # Integrate user data into model calculation:
        user_data = load_user_data()
        predictions = update_metals_with_user_data(predictions, user_data, lat, lng)

        metal_results = []
        for metal, val in predictions.items():
            metal_results.append(MetalResult(
                name=metal,
                concentration=val,
                unit="ppm",
                risk=get_risk_level(metal, val)
            ))

        return AnalysisResponse(
            metals=metal_results,
            location={"lat": lat, "lng": lng}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    userId: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """
    Endpoint to upload a CSV file. Expects a multipart/form-data request with a file field.
    Optionally accepts userId and metadata (as JSON string).
    """
    try:
        # Parse metadata if provided
        metadata_obj = {}
        if metadata:
            try:
                metadata_obj = UploadMetadata.parse_raw(metadata).dict()
            except Exception:
                metadata_obj = {}

        # Read and decode CSV file contents
        try:
            contents = await file.read()
            csv_data = StringIO(contents.decode("utf-8"))
        except Exception as e:
            return UploadResponse(success=False, fileId="", error=f"Failed to decode file: {e}")

        try:
            reader = csv.DictReader(csv_data)
            rows = list(reader)
            fieldnames = reader.fieldnames
        except Exception as e:
            return UploadResponse(success=False, fileId="", error=f"Failed to parse CSV: {e}")

        if not rows:
            return UploadResponse(success=False, fileId="", error="Empty or invalid CSV file")

        # Append data to cumulative user data file
        append_user_data(rows, fieldnames)

        # Assign a unique file ID to this upload
        file_id = str(uuid.uuid4())

        # For demonstration, we return mock results:
        mock_results = {
            "metals": [
                {"name": "Fe", "concentration": 125.4, "unit": "ppm"},
                {"name": "Pb", "concentration": 12.3, "unit": "ppm"}
            ]
        }

        return UploadResponse(
            success=True,
            fileId=file_id,
            results=mock_results,
            error=None
        )
    except Exception as e:
        return UploadResponse(
            success=False,
            fileId="",
            error=str(e)
        )

@app.get("/api/content/info", response_model=InfoContent)
async def get_info_content():
    return InfoContent(
        sections=[
            InfoSection(
                title="About This Project",
                content="This tool predicts concentrations of heavy metals based on GPS location using a trained AI model built on real SEM-EDS data, plus user-submitted data.",
                lastUpdated="2025-07-08"
            ),
            InfoSection(
                title="How It Works",
                content="The model uses Gradient Boosting to estimate metal levels based on latitude, longitude, and incorporates user-uploaded data.",
                lastUpdated="2025-07-08"
            )
        ]
    )
