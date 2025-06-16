from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime
import pandas as pd
import numpy as np
from geopy.distance import geodesic
from sklearn.ensemble import RandomForestRegressor
import uuid
import csv
from io import StringIO

app = FastAPI(title="Waterway Contamination Analysis API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data files
try:
    industry_df = pd.read_csv("industry_locations.csv")
    soil_baseline_df = pd.read_csv("merged_soil_sem_data.csv")
except FileNotFoundError as e:
    raise RuntimeError(f"Required data file not found: {e}")

# Initialize the AI model
np.random.seed(42)
n_samples = 500
X_train = np.random.randint(0, 2, size=(n_samples, 5))

Y_train = pd.DataFrame({
    "Fe": 2 + 3.8*X_train[:,0] + 2.9*X_train[:,1] + 3.5*X_train[:,2] + 4.2*X_train[:,3] + 1.2*X_train[:,4] + np.random.normal(0, 0.5, n_samples),
    "Cr": 0.3 + 3.8*X_train[:,0] + 1.5*X_train[:,1] + 3.5*X_train[:,2] + 2.0*X_train[:,3] + 0.8*X_train[:,4] + np.random.normal(0, 0.2, n_samples),
    "Mn": 0.5 + 3.8*X_train[:,0] + 2.0*X_train[:,1] + 3.5*X_train[:,2] + 1.8*X_train[:,3] + 1.0*X_train[:,4] + np.random.normal(0, 0.3, n_samples),
    "Mo": 0.2 + 1.5*X_train[:,0] + 2.9*X_train[:,1] + 3.5*X_train[:,2] + 2.5*X_train[:,3] + 1.1*X_train[:,4] + np.random.normal(0, 0.2, n_samples),
    "In": 0.01 + 1.0*X_train[:,0] + 0.8*X_train[:,1] + 0.5*X_train[:,2] + 4.2*X_train[:,3] + 0.5*X_train[:,4] + np.random.normal(0, 0.1, n_samples),
})

rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, Y_train)

# ============== Models ==============
class MetalResult(BaseModel):
    name: str
    concentration: float
    unit: str
    level: str  # 'low' | 'moderate' | 'high'
    error: float  # Percentage error

class AnalysisResponse(BaseModel):
    metals: List[MetalResult]
    location: dict  # { lat: number, lng: number }
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

# ============== Helper Functions ==============
def detect_nearby_industries(lat: float, lon: float, radius_km: float = 3.0) -> dict:
    """Detect nearby industries within given radius (in km)"""
    results = {
        "MF": 0, "AR": 0, "WT": 0, "EW": 0,
        "LF": 0, "RC": 0, "CS": 0, "BR": 0,
        "AP": 0, "CP": 0, "MS": 0, "OG": 0, "SO": 0
    }
    user_location = (lat, lon)

    for _, row in industry_df.iterrows():
        industry_location = (row["Latitude"], row["Longitude"])
        distance = geodesic(user_location, industry_location).km

        if distance <= radius_km:
            industry_type = row["Industry_Type"]

            if industry_type == "Metal Fabrication":
                results["MF"] = 1
            elif industry_type == "Auto Repair":
                results["AR"] = 1
            elif industry_type == "Wastewater Treatment":
                results["WT"] = 1
            elif industry_type == "E-waste Recycling":
                results["EW"] = 1
            elif industry_type == "Landfill / Dump":
                results["LF"] = 1
            elif industry_type == "Raceways / Tracks":
                results["RC"] = 1
            elif industry_type == "Construction Site":
                results["CS"] = 1
            elif industry_type == "Battery Recycling":
                results["BR"] = 1
            elif industry_type == "Airport":
                results["AP"] = 1
            elif industry_type == "Chemical Plant":
                results["CP"] = 1
            elif industry_type == "Mining Site":
                results["MS"] = 1
            elif industry_type == "Oil/Gas Facility":
                results["OG"] = 1
            elif industry_type == "Stormwater Outfall":
                results["SO"] = 1

    return results

def get_risk_level(value: float) -> str:
    if value < 25:
        return "low"
    elif value < 60:
        return "moderate"
    return "high"

# ============== API Endpoints ==============
@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contamination(request: dict):
    try:
        lat = request.get("lat")
        lng = request.get("lng")
        user_id = request.get("userId")

        if lat is None or lng is None:
            raise HTTPException(status_code=400, detail="Latitude and longitude are required")

        # Detect nearby industries (using default stormwater exposure False)
        detected_industries = detect_nearby_industries(lat, lng)
        
        # Prepare features for AI model
        user_features = np.array([[
            detected_industries["MF"], 
            detected_industries["AR"], 
            detected_industries["WT"], 
            detected_industries["EW"], 
            0  # Default stormwater exposure to False
        ]])
        
        # Get AI predictions
        ai_predicted_values = rf_model.predict(user_features)[0]
        
        # Find nearest soil baseline
        soil_baseline_df["distance"] = (
            (soil_baseline_df["Lat"] - lat)**2 + 
            (soil_baseline_df["Lon"] - lng)**2
        )**0.5
        nearest_soil = soil_baseline_df.loc[soil_baseline_df["distance"].idxmin()]
        
        # Prepare response
        metals = ["Fe", "Cr", "Mn", "Mo", "In"]
        metal_results = []
        
        for i, metal in enumerate(metals):
            predicted = ai_predicted_values[i]
            baseline = nearest_soil[f"Soil_{metal}_ppm"] if f"Soil_{metal}_ppm" in nearest_soil else 0.05
            risk_score = min(max((predicted / (baseline + 1)) * 25, 0), 100)
            
            metal_results.append(MetalResult(
                name=metal,
                concentration=round(predicted, 2),
                unit="ppm",
                level=get_risk_level(risk_score),
                error=5.0  # Fixed 5% error for demo
            ))
        
        return AnalysisResponse(
            metals=metal_results,
            location={"lat": lat, "lng": lng},
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    userId: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    try:
        # Parse metadata if provided
        metadata_obj = {}
        if metadata:
            try:
                metadata_obj = UploadMetadata.parse_raw(metadata).dict()
            except:
                metadata_obj = {}

        # Read and parse the CSV file
        contents = await file.read()
        csv_data = StringIO(contents.decode("utf-8"))
        reader = csv.DictReader(csv_data)
        
        # Process file (simple validation for demo)
        rows = list(reader)
        if not rows:
            raise ValueError("Empty file")
        
        # Generate a file ID
        file_id = str(uuid.uuid4())
        
        # For demo, just return some mock results
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
                content="This tool analyzes heavy metal contamination in urban waterways...",
                lastUpdated="2023-11-15"
            ),
            InfoSection(
                title="How It Works",
                content="Our AI model predicts contamination levels based on nearby industrial sites...",
                lastUpdated="2023-11-15"
            )
        ]
    )

@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(request: ContactRequest):
    try:
        # In a real app, you would:
        # 1. Validate recaptchaToken if provided
        # 2. Save the message to database
        # 3. Send email notification
        
        return ContactResponse(
            success=True,
            messageId=str(uuid.uuid4())
        )
    except Exception as e:
        return ContactResponse(
            success=False,
            error=str(e)
        )

# ============== Auth Endpoints ==============
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Implement your login logic here
    return {"token": "demo-token", "user": {"email": request.email, "name": "Demo User"}}

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    # Implement your registration logic here
    return {"success": True, "user": {"email": request.email, "name": request.name}}

@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest):
    # Implement Google OAuth logic here
    return {"token": "demo-token", "user": {"email": "user@gmail.com", "name": "Google User"}}

@app.get("/api/auth/guest")
async def guest_auth():
    # Implement guest login logic here
    return {"token": "guest-token", "user": {"name": "Guest User"}}