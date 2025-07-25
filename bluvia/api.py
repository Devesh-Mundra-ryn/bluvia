from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- Add this import
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .model import predict_metals, update_metals_with_user_data
import uuid
import csv
from io import StringIO
import os

USER_DATA_PATH = os.environ.get("BLUVIA_USER_DATA_PATH", "user_data.csv")

app = FastAPI(title="GeoMetals API")

# --- Add this CORS configuration block ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ambitious-stone-0f864a41e.6.azurestaticapps.net"],  # Change this to your frontend URL in production, e.g., ["https://yourfrontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------

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

def get_risk_level(metal: str, value: float) -> str:
    if value < 50:
        return "low"
    elif value < 100:
        return "moderate"
    return "high"

def append_user_data(rows, fieldnames):
    file_exists = os.path.isfile(USER_DATA_PATH)
    with open(USER_DATA_PATH, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

def load_user_data():
    if not os.path.isfile(USER_DATA_PATH):
        return []
    with open(USER_DATA_PATH, "r", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contamination(request: dict):
    try:
        lat = request.get("lat")
        lng = request.get("lng")
        if lat is None or lng is None:
            raise HTTPException(status_code=400, detail="Latitude and longitude required")

        predictions = predict_metals(lat, lng)
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
    try:
        metadata_obj = {}
        if metadata:
            try:
                metadata_obj = UploadMetadata.parse_raw(metadata).dict()
            except Exception:
                pass

        content = await file.read()
        s = StringIO(content.decode("utf-8"))
        reader = csv.DictReader(s)
        rows = list(reader)
        if not rows:
            return UploadResponse(success=False, fileId="", error="Empty file")

        append_user_data(rows, reader.fieldnames)
        return UploadResponse(success=True, fileId=str(uuid.uuid4()), error=None, results={"rows": len(rows)})
    except Exception as e:
        return UploadResponse(success=False, fileId="", error=str(e))
