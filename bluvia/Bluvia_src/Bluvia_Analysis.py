'''
User input: lat, lon

call fuctions:

detected_industries=detect_nearby_industries(lat, lon)
    detected_industries is a list of all industries in a 3 km rd


prediction = ai_prediction(lat, lon, model_save_path)

x, y_true = creating_New_training_data(master_csv_file)

SE_per_target = find_SE(lat, lon, model_save_path, x, y_true):

risk_scores = calculate_risk_scores(prediction, lat, lon)

output:
    prediction 
    SE_per_target
    risk_scores
    detected_industries
'''

import pandas as pd
import os
import joblib
from geopy.distance import geodesic
from geopy.distance import geodesic



industry_location_file = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/industry_locations.csv"
soil_sem_data = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/soil_sem_data.csv"
master_csv_file = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/master_csv.csv"


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
        print("Detected nearby Industries:")
        print("None")
    else:
        return detected_industries


def creating_New_training_data(new_csv_file):
    data_file = pd.read_csv(new_csv_file)
    data_file.columns = data_file.columns.str.strip().str.lower()
    data_file = data_file.rename(columns={
    'fe': 'Fe_ppm', 'cr': 'Cr_ppm', 'mn': 'Mn_ppm',
    'mo': 'Mo_ppm', 'in': 'In_ppm', 'ta': 'Ta_ppm'})
    if 'lat' not in data_file.columns or 'lon' not in data_file.columns:
        if "latitude" not in data_file.columns or "longitude" not in data_file.columns:
            raise ValueError("New CSV must contain 'lat' and 'lon' columns")
    else:
        if 'lat'  in data_file.columns and 'lon'  in data_file.columns:
            target_columns = data_file.drop(columns=["lat", "lon"]).columns
            X_New = data_file[["lat", "lon"]].copy()
        elif "latitude" not in data_file.columns or "longitude" not in data_file.columns:
            target_columns = data_file.drop(columns=["latitude", "longitude"]).columns
            X_New = data_file[["latitude", "longitude"]].copy()
    Y_New = data_file[target_columns].copy()
    Y_New = Y_New.apply(pd.to_numeric, errors='coerce')
    if Y_New.isnull().values.any():
        Y_New = Y_New.fillna(0)
    return X_New, Y_New

    
def ai_prediction(lat, lon, model_save_path):
    gb_model = joblib.load(model_save_path)
    input_data = pd.DataFrame([[lat, lon]], columns=['lat', 'lon'])
    prediction_array = gb_model.predict(input_data)
    target_columns = ["Fe_ppm", "Cr_ppm", "Mn_ppm", "Mo_ppm", "In_ppm", "Ta_ppm"]
    prediction_dict = {col: round(value, 4) for col, value in zip(target_columns, prediction_array[0])}    
    return prediction_dict

def find_SE(lat, lon, model_path, x, y_true):

    gb_model = joblib.load(model_path)

    if 'lat' not in x.columns or 'lon' not in x.columns:
        if 'latitude' not in x.columns or 'longitude' not in x.columns:
            raise ValueError("x must contain 'lat' and 'lon' columns")

    if len(x) != len(y_true):
        raise ValueError("x and y_true must have the same number of rows")


    x["distance"] = x.apply(
        lambda row: geodesic((lat, lon), (row["lat"], row["lon"])).km, axis=1
    )
    nearest_index = x["distance"].idxmin()
    nearest_row = x.loc[nearest_index]
    true_values = y_true.iloc[nearest_index]


    input_data = pd.DataFrame([[nearest_row["lat"], nearest_row["lon"]]], 
                               columns=['lat', 'lon'])

  
    prediction_array = gb_model.predict(input_data)
    target_columns = ["Fe_ppm", "Cr_ppm", "Mn_ppm", "Mo_ppm", "In_ppm", "Ta_ppm"]
    prediction = prediction_array[0]

    error_dict = {}
    for i, col in enumerate(target_columns):
        abs_error = abs(prediction[i] - true_values[col])
        error_dict[col] = round(abs_error, 2)

    return error_dict

def calculate_risk_scores(ai_predictions, lat, lon):
    site_data = pd.DataFrame({
        "Site": ["Alvord Lake", "Desert West Lake", "Steele Park", "Gila Canal", "Papago Park", "Tres Rios"],
        "Lat": [33.403, 33.470, 33.506, 33.390, 33.460, 33.381],
        "Lon": [-112.118, -112.166, -112.065, -112.126, -111.944, -112.307]})

    soil_baseline_data = pd.DataFrame({
        "Site": site_data["Site"],
        "Soil_Fe_ppm": [45000, 46000, 48000, 44000, 45500, 47000],
        "Soil_Cr_ppm": [90, 85, 95, 80, 88, 87],
        "Soil_Mn_ppm": [600, 590, 610, 580, 605, 595],
        "Soil_Mo_ppm": [1.2, 1.5, 1.0, 1.3, 1.4, 1.6],
        "Soil_In_ppm": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]})

    soil_baseline = pd.merge(site_data, soil_baseline_data, on="Site")
    soil_baseline["distance"] = ((soil_baseline["Lat"] - lat)**2 +
                                  (soil_baseline["Lon"] - lon)**2)**0.5
    nearest_soil = soil_baseline.loc[soil_baseline["distance"].idxmin()]

    soil_baseline_values = {
        "Fe": nearest_soil["Soil_Fe_ppm"],
        "Cr": nearest_soil["Soil_Cr_ppm"],
        "Mn": nearest_soil["Soil_Mn_ppm"],
        "Mo": nearest_soil["Soil_Mo_ppm"],
        "In": nearest_soil["Soil_In_ppm"]
    }

    risk_scores = {}
    for metal in ["Fe", "Cr", "Mn", "Mo", "In"]:
        predicted = ai_predictions.get(f"SEM_{metal}_ppm", 0)
        baseline = soil_baseline_values.get(metal, 0.05)
        risk_score = (predicted / (baseline + 1)) * 25
        risk_score = max(0, min(risk_score, 100))
        risk_scores[metal] = round(risk_score, 1)

    avg_risk = round(sum(risk_scores.values()) / len(risk_scores), 1)
    risk_scores["Average"] = avg_risk


    return risk_scores