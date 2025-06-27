# model.py
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split

MODEL_PATH = "geo_metals_model.joblib"

def train_model():
    df = pd.read_csv("baseline_heavy_metals_multi.csv")

    # Print raw columns for debug
    print("Raw columns:", df.columns.tolist())

    # Standardize column names
    df.columns = df.columns.str.strip().str.lower()

    # Try to auto-detect lat/lon columns
    possible_lat = [col for col in df.columns if "lat" in col]
    possible_lon = [col for col in df.columns if "lon" in col]

    if not possible_lat or not possible_lon:
        raise KeyError("Latitude and/or Longitude columns not found. Please check your column names.")

    lat_col = possible_lat[0]
    lon_col = possible_lon[0]

    # Rename consistently
    df = df.rename(columns={
        lat_col: 'Latitude',
        lon_col: 'Longitude',
        'fe': 'Fe_ppm', 'cr': 'Cr_ppm', 'mn': 'Mn_ppm',
        'mo': 'Mo_ppm', 'in': 'In_ppm', 'ta': 'Ta_ppm'
    })

    features = df[["Latitude", "Longitude"]]
    targets = df[["Fe_ppm", "Cr_ppm", "Mn_ppm", "Mo_ppm", "In_ppm", "Ta_ppm"]]

    X_train, X_test, y_train, y_test = train_test_split(features, targets, test_size=0.2, random_state=42)

    model = MultiOutputRegressor(GradientBoostingRegressor())
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)
    return model

model = train_model()

def predict_metals(lat, lon):
    input_data = pd.DataFrame([{
        'Latitude': lat,
        'Longitude': lon
    }])
    prediction = model.predict(input_data)[0]
    metals = ['Fe_ppm', 'Cr_ppm', 'Mn_ppm', 'Mo_ppm', 'In_ppm', 'Ta_ppm']
    return dict(zip(metals, prediction))
