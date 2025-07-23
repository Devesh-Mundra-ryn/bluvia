import os
import pandas as pd
import joblib
from typing import Dict, Any, List

from path_utils import get_model_path

def predict_metals(lat: float, lng: float) -> Dict[str, float]:
    model_path = get_model_path()
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    river_model = joblib.load(model_path)
    input_df = pd.DataFrame([{'Lat': lat, 'Lon': lng}])
    prediction = river_model.predict_one(input_df)
    return prediction

def update_metals_with_user_data(predictions: Dict[str, float], user_data: List[dict], lat: float, lng: float) -> Dict[str, float]:
    if not user_data:
        return predictions
    close_points = [
        row for row in user_data
        if "Lat" in row and "Lon" in row and
           abs(float(row['Lat']) - lat) < 0.01 and abs(float(row['Lon']) - lng) < 0.01
    ]
    if close_points:
        metals = list(predictions.keys())
        for metal in metals:
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
