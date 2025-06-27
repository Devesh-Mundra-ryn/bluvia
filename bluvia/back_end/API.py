from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from model import predict_metals  # Use model's prediction
import uuid

app = FastAPI(title="GeoMetals API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Models ==============
class MetalResult(BaseModel):
    name: str
    concentration: float
    unit: str
    level: str  # 'low' | 'moderate' | 'high'
    error: float  # Fixed for now

class AnalysisResponse(BaseModel):
    metals: List[MetalResult]
    location: dict  # { lat: number, lng: number }
    timestamp: str

# ============== Helper Functions ==============
def get_risk_level(metal: str, value: float) -> str:
    thresholds = {
        "Fe_ppm": 48000,
        "Cr_ppm": 95,
        "Mn_ppm": 610,
        "Mo_ppm": 1,
        "In_ppm": 0.05,
        "Ta_ppm": 0.5
    }

    if metal not in thresholds:
        return "unknown"
    
    limit = thresholds[metal]
    if value < 0.5 * limit:
        return "low"
    elif value < limit:
        return "moderate"
    return "high"

# ============== API Endpoint ==============
@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contamination(request: dict):
    try:
        lat = request.get("lat")
        lng = request.get("lng")

        if lat is None or lng is None:
            raise HTTPException(status_code=400, detail="Latitude and longitude are required")

        predictions = predict_metals(lat, lng)

        metal_results = []
        for metal, val in predictions.items():
            metal_results.append(MetalResult(
                name=metal.replace("_ppm", ""),
                concentration=round(val, 4),
                unit="ppm",
                level=get_risk_level(metal, val),
                error=5.0  # Fixed demo error
            ))

        return AnalysisResponse(
            metals=metal_results,
            location={"lat": lat, "lng": lng},
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
