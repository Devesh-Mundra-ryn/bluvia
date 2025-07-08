from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Data Models ==============
class MetalResult(BaseModel):
    name: str
    concentration: float
    unit: str
    level: str
    error: float

class AnalysisResponse(BaseModel):
    metals: List[MetalResult]
    location: dict
    timestamp: str

class UploadMetadata(BaseModel):
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None

class UploadResponse(BaseModel):
    success: bool
    fileId: str
    results: Optional[dict] = None
    error: Optional[str] = None

class InfoSection(BaseModel):
    title: str
    content: str
    lastUpdated: str

class InfoContent(BaseModel):
    sections: List[InfoSection]

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str
    recaptchaToken: Optional[str] = None

class ContactResponse(BaseModel):
    success: bool
    messageId: Optional[str] = None
    error: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class GoogleAuthRequest(BaseModel):
    token: str

# ============== Helper Function ==============
def get_risk_level(metal: str, value: float) -> str:
    thresholds = {
        "Fe_ppm": 48000,
        "Cr_ppm": 95,
        "Mn_ppm": 610,
        "Mo_ppm": 1,
        "In_ppm": 0.05,
        "Ta_ppm": 0.5
    }

    limit = thresholds.get(metal, 999999)
    if value < 0.5 * limit:
        return "low"
    elif value < limit:
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
            raise HTTPException(status_code=400, detail="Latitude and longitude are required")

        predictions = predict_metals(lat, lng)

        # Integrate user data into model calculation:
        user_data = load_user_data()
        predictions = update_metals_with_user_data(predictions, user_data, lat, lng)

        metal_results = []
        for metal, val in predictions.items():
            metal_results.append(MetalResult(
                name=metal.replace("_ppm", ""),
                concentration=round(val, 4),
                unit="ppm",
                level=get_risk_level(metal, val),
                error=5.0  # Static demo value
            ))

        return AnalysisResponse(
            metals=metal_results,
            location={"lat": lat, "lng": lng},
            timestamp=datetime.utcnow().isoformat()
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
        contents = await file.read()
        try:
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
                {"name": "Cr", "concentration": 12.3, "unit": "ppm"},
            ],
            "validationErrors": []
        }

        return UploadResponse(
            success=True,
            fileId=file_id,
            results=mock_results
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

@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(request: ContactRequest):
    try:
        return ContactResponse(
            success=True,
            messageId=str(uuid.uuid4())
        )
    except Exception as e:
        return ContactResponse(
            success=False,
            error=str(e)
        )

# ============== Auth ==============
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    return {
        "token": "demo-token",
        "user": {"email": request.email, "name": "Demo User"}
    }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    return {
        "success": True,
        "user": {"email": request.email, "name": request.name}
    }

@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest):
    return {
        "token": "demo-token",
        "user": {"email": "user@gmail.com", "name": "Google User"}
    }

@app.get("/api/auth/guest")
async def guest_auth():
    return {
        "token": "guest-token",
        "user": {"name": "Guest User"}
    }
