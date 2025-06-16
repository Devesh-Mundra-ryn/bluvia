import pandas as pd
import os
import joblib
import numpy as np
#river is another package like sklearn but it support online learning 
from river import stream
from river.forest import ARFRegressor
from geopy.distance import geodesic
from river import multioutput as r_multioutput
import math

# making paths for all my csv files and save paths 
sem_data = "C:/Users/nikhi/workspaces/nsb-ryn/soil_sem_data.csv"
industry_file = "C:/Users/nikhi/workspaces/nsb-ryn/industry_locations.csv"
model_save_path = "C:/Users/nikhi/workspaces/nsb-ryn/saved_model.joblib"
master_csv_save_path = "C:/Users/nikhi/workspaces/nsb-ryn/master_csv.csv"




# Load industry file
if os.path.exists(industry_file):
    industry_df = pd.read_csv(industry_file)
else:
    print(" Error: Missing industry locations file: "+str(industry_file))

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
    print("----Detected Industries in a 3 mile radius----")
    for i in range(len(detected_industries)):
        print(str(i+1)+": "+str(detected_industries[i]))
    if len(detected_industries)==0:
        print("None")

#adding industries to the data so training model is more accurate
def add_industries_to_training_data(df):
    enriched_data = []
    for _, row in df.iterrows():
        lat, lon = row['Lat'], row['Lon']
        industry_count = 0
        industry_presence = {industry: 0 for industry in industry_types}
        for _, i_row in industry_df.iterrows():
            distance = geodesic((lat, lon), (i_row["Latitude"], i_row["Longitude"])).km
            if distance <= 3 and i_row["Industry_Type"] in industry_types:
                industry_presence[i_row["Industry_Type"]] += 1 #( 1 is present and 0 is not present)
                industry_count += 1
        row_features = {'Lat': lat, 'Lon': lon, 'NearbyIndustryCount': industry_count}
        row_features.update(industry_presence)
        enriched_data.append(row_features)
    return pd.DataFrame(enriched_data)

def creating_training_data(csv_file):
    data_file = pd.read_csv(csv_file)
    target_columns = ['SEM_Fe_ppm', 'SEM_Cr_ppm', 'SEM_Mn_ppm', 'SEM_Mo_ppm', 'SEM_In_ppm']
    # chekcing if the required lat lon collums are in the csv file 
    if 'Lat' not in data_file.columns or 'Lon' not in data_file.columns:
        if "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            raise ValueError("New CSV must contain 'Lat' and 'Lon' columns")
       
    X_train = add_industries_to_training_data(data_file)
    Y_train = data_file[target_columns].copy()
    # Y train has to be all numbers bc ARFRegressor can't subtract a string from a float so the next 4 lines take a strings in the csv and replaces it with a zero when making Y train
    Y_train = Y_train.apply(pd.to_numeric, errors='coerce')
    if Y_train.isnull().values.any():
        print("Warning: NaN values found in training target data; filling with 0.")
        Y_train = Y_train.fillna(0)
    return X_train, Y_train

def creating_New_training_data(new_csv_file):
    data_file = pd.read_csv(new_csv_file)
    if 'Lat' not in data_file.columns or 'Lon' not in data_file.columns:
        if "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            raise ValueError("New CSV must contain 'Lat' and 'Lon' columns")
    else:
        if 'Lat'  in data_file.columns and 'Lon'  in data_file.columns:
            target_columns = data_file.drop(columns=["Lat", "Lon"]).columns
        elif "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            target_columns = data_file.drop(columns=["Latitude", "Longitude"]).columns
    X_New = add_industries_to_training_data(data_file)
    Y_New = data_file[target_columns].copy()
    # Y train has to be all numbers bc ARFRegressor can't subtract a string from a float so the next 4 lines take a strings in the csv and replaces it with a zero when making Y train
    Y_New = Y_New.apply(pd.to_numeric, errors='coerce')
    if Y_New.isnull().values.any():
        print("Warning: NaN values found in new target data; filling with 0.")
        Y_New = Y_New.fillna(0)
    return X_New, Y_New

# training river model using AdaptiveRandomForestRegressor
def train_river_model_incremental(model, X_train, Y_train):
    for x_row, y_row in stream.iter_pandas(X_train, Y_train):
        model.learn_one(x_row, y_row)

def training_river_model(X_train, Y_train, model_save_path):
    base_model = ARFRegressor(n_models=10, max_features='sqrt', seed=42)
    target_columns = Y_train.columns.tolist()
    river_model = r_multioutput.RegressorChain(base_model, order=target_columns)
    train_river_model_incremental(river_model, X_train, Y_train)
    joblib.dump(river_model, model_save_path)
    print("The River Model is saved to", model_save_path)
    return river_model

def retrain_river_model(X_New, Y_New, model_save_path):
    # checking to see if we can load a previouly train model and train it further 
    if os.path.exists(model_save_path):
        river_model = joblib.load(model_save_path)
    else:
        base_model = ARFRegressor(n_models=10, max_features='sqrt', seed=42)
        target_columns = Y_New.columns.tolist()
        river_model = r_multioutput.RegressorChain(base_model, order=target_columns)
    train_river_model_incremental(river_model, X_New, Y_New)
    joblib.dump(river_model, model_save_path)
    print("Model retrained and saved to", model_save_path)
    return river_model

 
def ai_prediction(lat, lon, model_save_path):
    river_model = joblib.load(model_save_path)
    dummy_df = pd.DataFrame([{'Lat': lat, 'Lon': lon}])
    enriched_input = add_industries_to_training_data(dummy_df).iloc[0].to_dict()
    prediction = river_model.predict_one(enriched_input)
    print("----AI Predicted Heavy Metal Concentrations----")
    return prediction
# SE calc. function    - chatgpt( i didnt make this)
def find_SE(model, X, Y_true):
    # Convert X DataFrame to list of dicts for river
    X_dicts = X.to_dict(orient='records')
    
    Y_pred = [model.predict_one(x) for x in X_dicts]
    if isinstance(Y_pred[0], dict):
        Y_pred = [list(p.values()) for p in Y_pred]
        Y_true = Y_true.to_numpy()
    else:
        raise ValueError("Expected model to return a dict for each prediction.")

    Y_pred = np.array(Y_pred)
    if Y_pred.shape != Y_true.shape:
        raise ValueError(f"Shape mismatch: predicted {Y_pred.shape}, actual {Y_true.shape}")

    SE_per_target = {}
    num_samples = Y_true.shape[0]
    target_names = list(model.predict_one(X_dicts[0]).keys())

    for i, target in enumerate(target_names):
        errors = Y_pred[:, i] - Y_true[:, i]
        std_dev = np.std(errors, ddof=1)
        se = std_dev / math.sqrt(num_samples)
        SE_per_target[target] = round(se, 4)

    print("Standard Error (SE) per target:")
    for target, se in SE_per_target.items():
        print(f"{target}: ±{se}")

    return SE_per_target


# creating a master csv this was created so we can test if the program is taking in data sucessful but this csv will be used for the SE function as it needs X and Y true
def creating_master_csv(new_csv):
    required_columns = ['Lat', 'Lon', 'SEM_Fe_ppm', 'SEM_Cr_ppm', 'SEM_Mn_ppm', 'SEM_Mo_ppm', 'SEM_In_ppm']
    new_data = pd.read_csv(new_csv)[required_columns]

    if os.path.exists(master_csv_save_path):
        master_csv = pd.read_csv(master_csv_save_path)
        master_csv = pd.concat([master_csv, new_data], ignore_index=True)
    else:
        master_csv = new_data

    master_csv.to_csv(master_csv_save_path, index=False)
    return master_csv_save_path

# risk score calc. mainly taken from the prototype 
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
    # finding nerst soil basline bay calculating the distances from each existing data point
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
    

#training river model 
X_train, Y_train = creating_training_data(sem_data)
river_model = training_river_model(X_train, Y_train, model_save_path=model_save_path)
#Main 
print("----Select action by entering the associated number----")
action = input("Get AI prediction (1)\nInput new SEM data (2)\nEnter: ")
risk_scores={}
if action == "1":
    lat = float(input("Lat: "))
    lon = float(input("Lon: "))
    detect_nearby_industries(lat, lon)
    prediction = ai_prediction(lat, lon, model_save_path=model_save_path)
    for metal, value in prediction.items():
        print(f"{metal}: {round(value, 4)}")
    X, Y_true = creating_training_data(master_csv_save_path)
    find_SE(river_model, X, Y_true)
    risk_scores=calculate_risk_scores(prediction, lat, lon)
    print("\n----Risk Scores----")
    for metal, score in risk_scores.items():
        print(f"{metal}: {score}")


elif action == "2":
    new_file = input("Enter new SEM CSV file: ").replace("\\","/")
    X_new, Y_new = creating_New_training_data(new_file)
    river_model = retrain_river_model(X_new, Y_new, model_save_path=model_save_path)
    print(master_csv_save_path)
