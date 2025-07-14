import os
import pandas as pd
import joblib
from typing import Dict, Any, List

# --- Helper: Use environment variables for model and user data paths, fallback to relative paths ---

def get_model_path():
    """Return the path to the trained model file."""
    return os.environ.get("BLUVIA_MODEL_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "model_save_path.joblib")))

def get_user_data_path():
    """Return the path to the user data CSV file used by the API."""
    return os.environ.get("BLUVIA_USER_DATA_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "user_data.csv")))

# --- Prediction API ---

def predict_metals(lat: float, lng: float) -> Dict[str, float]:
    """
    Predict metal concentrations at the given latitude and longitude using the trained river model.
    Returns a dictionary {metal_name: predicted_value}
    """
    model_path = get_model_path()
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    river_model = joblib.load(model_path)
    input_df = pd.DataFrame([{'Lat': lat, 'Lon': lng}])
    prediction = river_model.predict_one(input_df)
    # prediction is a dict: {metal: value, ...}
    return prediction

def update_metals_with_user_data(predictions: Dict[str, float], user_data: List[dict], lat: float, lng: float) -> Dict[str, float]:
    """
    Optionally update predictions using nearby user-uploaded data points.
    If user_data contains points close to (lat,lng), average those values and override predictions.
    """
    if not user_data:
        return predictions

    # Find user data points close to the requested lat/lng (within 0.01 deg)
    close_points = [
        row for row in user_data
        if "Lat" in row and "Lon" in row and
           abs(float(row['Lat']) - lat) < 0.01 and abs(float(row['Lon']) - lng) < 0.01
    ]
    if close_points:
        # For each metal in predictions, average user-uploaded values if available
        metals = list(predictions.keys())
        for metal in metals:
            # User data columns may use SEM_Fe_ppm format
            user_col = f"SEM_{metal}_ppm"
            values = []
            for row in close_points:
                val = row.get(user_col)
                try:
                    valf = float(val)
                    if not pd.isna(valf):
                        values.append(valf)
                except Exception:
                    continue
            if values:
                predictions[metal] = sum(values) / len(values)
    return predictions
