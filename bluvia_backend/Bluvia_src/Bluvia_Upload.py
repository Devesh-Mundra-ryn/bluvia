'''
input: string varible that holds the path to a csv
    Ex input: "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/test_csv.csv"

then call:

intigrate_new_data(data_csv)
    data_csv should be the var that stores user inputed csv path

Now the river_model will be trained with new data and our master_csv will be updated

Output:
    success message

'''

import pandas as pd
import joblib
import os
from river import stream
from river.forest import ARFRegressor
from river import multioutput as r_multioutput

soil_sem_data = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/soil_sem_data.csv"
model_save_path = "C:/Users/nikhi/workspaces/bluvia-nsb/model_save_path.joblib"
master_csv_file = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/master_csv.csv"



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

def train_river_model_incremental(model, X_train, Y_train):
    for x_row, y_row in stream.iter_pandas(X_train, Y_train):
        model.learn_one(x_row, y_row)

def retrain_river_model(X_New, Y_New, model_save_path):
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

def creating_master_csv(new_csv):
    required_columns = ['Lat', 'Lon', 'SEM_Fe_ppm', 'SEM_Cr_ppm', 'SEM_Mn_ppm', 'SEM_Mo_ppm', 'SEM_In_ppm']
    new_data = pd.read_csv(new_csv)[required_columns]

    if os.path.exists(master_csv_file):
        master_csv = pd.read_csv(master_csv_file)
        master_csv = pd.concat([master_csv, new_data], ignore_index=True)
    else:
        master_csv = new_data

    master_csv.to_csv(master_csv_file, index=False)
    return master_csv_file

def intigrate_new_data(data_csv):
    new_file = data_csv.replace("\\","/")
    X_new, Y_new = creating_New_training_data(new_file)
    retrain_river_model(X_new, Y_new, model_save_path)
    creating_master_csv(new_file)
    
    