import pandas as pd
import os
import joblib
from geopy.distance import geodesic

from .path_utils import get_data_path, get_model_path

industry_location_file = get_data_path("industry_locations.csv")
soil_sem_data = get_data_path("soil_sem_data.csv")
model_save_path = get_model_path()
master_csv_file = get_data_path("master_csv.csv")

if os.path.exists(industry_location_file):
    industry_df = pd.read_csv(industry_location_file)
else:
    print(" Error: Missing industry locations file: "+str(industry_location_file))

industry_types = [
    "Metal Fabrication","Auto Repair","Wastewater Treatment","E-waste Recycling","Landfill / Dump",
    "Raceways / Tracks", "Construction Site","Battery Recycling", "Airport","Chemical Plant",
    "Mining Site","Oil/Gas Facility","Stormwater Outfall"]

def detect_nearby_industries(lat, lon):
    user_location = (lat, lon)
    detected_industries = []
    for _, row in industry_df.iterrows():
        industry_location = (row["Latitude"], row["Longitude"])
        distance = geodesic(user_location, industry_location).km
        if distance <= 3:
            industry_type = row["Industry_Type"]
            if industry_type in industry_types:
                detected_industries.append(industry_type)
    if len(detected_industries)==0:
        print("None")
    else:
        return detected_industries

def creating_New_training_data(new_csv_file):
    data_file = pd.read_csv(new_csv_file)
    if 'Lat' not in data_file.columns or 'Lon' not in data_file.columns:
        if "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            raise ValueError("New CSV must contain 'Lat' and 'Lon' columns")
    else:
        if 'Lat'  in data_file.columns and 'Lon'  in data_file.columns:
            target_columns = data_file.drop(columns=["Lat", "Lon"]).columns
            X_New = data_file[["Lat", "Lon"]].copy()
        elif "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            target_columns = data_file.drop(columns=["Latitude", "Longitude"]).columns
            X_New = data_file[["Latitude", "Longitude"]].copy()
    Y_New = data_file[target_columns].copy()
    Y_New = Y_New.apply(pd.to_numeric, errors='coerce')
    if Y_New.isnull().values.any():
        print("Warning: NaN values found in new target data; filling with 0.")
        Y_New = Y_New.fillna(0)
    return X_New, Y_New

def ai_prediction(lat, lon, model_save_path):
    river_model = joblib.load(model_save_path)
    dummy_df = pd.DataFrame([{'Lat': lat, 'Lon': lon}])
    enriched_input = dummy_df
    prediction = river_model.predict_one(enriched_input)
    return prediction

def find_SE(lat, lon, model_path, x, y_true):
    river_model = joblib.load(model_path)

    if 'Lat' not in x.columns or 'Lon' not in x.columns:
        raise ValueError("x must contain 'Lat' and 'Lon' columns")

    if len(x) != len(y_true):
        raise ValueError("Input data and target data must be of the same length")

    # Dummy implementation
    return {col: 0.0 for col in y_true.columns}

def calculate_risk_scores(prediction, lat, lon):
    # Dummy implementation for risk scores
    return {metal: 0.0 for metal in prediction.keys()}
