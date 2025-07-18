import pandas as pd
import joblib
from river import stream
from river.forest import ARFRegressor
from river import multioutput as r_multioutput

from .path_utils import get_data_path, get_model_path

soil_sem_data = get_data_path("soil_sem_data.csv")
model_save_path = get_model_path()

def creating_training_data(csv_file):
    data_file = pd.read_csv(csv_file)
    target_columns = ['SEM_Fe_ppm', 'SEM_Cr_ppm', 'SEM_Mn_ppm', 'SEM_Mo_ppm', 'SEM_In_ppm']
    if 'Lat' not in data_file.columns or 'Lon' not in data_file.columns:
        if "Latitude" not in data_file.columns or "Longitude" not in data_file.columns:
            raise ValueError("New CSV must contain 'Lat' and 'Lon' columns")
    X_train = data_file[["Lat", "Lon"]].copy()
    Y_train = data_file[target_columns].copy()
    Y_train = Y_train.apply(pd.to_numeric, errors='coerce')
    if Y_train.isnull().values.any():
        print("Warning: NaN values found in training target data; filling with 0.")
        Y_train = Y_train.fillna(0)
    return X_train, Y_train

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

if __name__ == "__main__":
    x_train, y_train = creating_training_data(soil_sem_data)
    river_model = training_river_model(x_train, y_train, model_save_path)
