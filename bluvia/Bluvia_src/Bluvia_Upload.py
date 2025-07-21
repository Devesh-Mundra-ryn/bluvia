'''
input: string varible that holds the path to a csv
    Ex input: "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/test_csv.csv"

then call:

intigrate_new_data(data_csv)
    data_csv should be the var that stores user inputed csv path

Now the gb_model will be trained with new data and our master_csv will be updated

Output:
    success message

'''
import pandas as pd
import joblib
import os
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor


soil_sem_data = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/soil_sem_data.csv"
GB_save_path = "C:/Users/nikhi/workspaces/bluvia-nsb/GB_model_save_path.joblib"
master_csv_file = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/master_csv.csv"

def clean_up_df(df):
    df.columns = df.columns.str.strip().str.lower()
    rename_map = {
        'latitude': 'lat',
        'longitude': 'lon',
        'fe': 'fe_ppm', 'cr': 'cr_ppm', 'mn': 'mn_ppm',
        'mo': 'mo_ppm', 'in': 'in_ppm', 'ta': 'ta_ppm',
        'sem_fe_ppm': 'fe_ppm', 'sem_cr_ppm': 'cr_ppm', 'sem_mn_ppm': 'mn_ppm',
        'sem_mo_ppm': 'mo_ppm', 'sem_in_ppm': 'in_ppm', 'sem_ta_ppm': 'ta_ppm'
    }
    df = df.rename(columns=rename_map)
    return df

def creating_New_training_data(new_csv_file):
    df = pd.read_csv(new_csv_file)
    df = clean_up_df(df)

    if 'lat' not in df.columns or 'lon' not in df.columns:
        raise ValueError("CSV must contain 'lat' and 'lon' columns.")

    target_columns = [col for col in df.columns if col not in ['lat', 'lon']]
    X_New = df[['lat', 'lon']].copy()
    Y_New = df[target_columns].apply(pd.to_numeric, errors='coerce').fillna(0)

    return X_New, Y_New

def retrain_gb_model(X_New, Y_New, model_save_path):
    if os.path.exists(model_save_path):
        gb_model = joblib.load(model_save_path)
    else:
        base_model = GradientBoostingRegressor(
            n_estimators=50,
            learning_rate=0.05,
            max_depth=2,
            min_samples_split=3,
            min_samples_leaf=2,
            subsample=0.8,
            random_state=42
        )
        gb_model = MultiOutputRegressor(base_model)

    gb_model.fit(X_New, Y_New)
    joblib.dump(gb_model, model_save_path)
    print("Model retrained and saved to:", model_save_path)
    return gb_model

def creating_master_csv(new_csv_path):
    df_new = pd.read_csv(new_csv_path)
    df_new = clean_up_df(df_new)

    required_columns = ['lat', 'lon', 'fe_ppm', 'cr_ppm', 'mn_ppm', 'mo_ppm', 'in_ppm', 'ta_ppm']
    missing_cols = [col for col in required_columns if col not in df_new.columns]
    if missing_cols:
        raise ValueError(f"New CSV is missing required columns: {missing_cols}")

    df_new = df_new[required_columns]

    if os.path.exists(master_csv_file):
        df_master = pd.read_csv(master_csv_file)
        df_master = clean_up_df(df_master)
        df_combined = pd.concat([df_master, df_new], ignore_index=True)
    else:
        df_combined = df_new

    df_combined.to_csv(master_csv_file, index=False)
    print("Master CSV updated:", master_csv_file)
    return master_csv_file

def intigrate_new_data(data_csv):
    new_file = data_csv.replace("\\", "/")
    print("Integrating data from:", new_file)

    master_csv_file_updated = creating_master_csv(new_file)
    X_new, Y_new = creating_New_training_data(master_csv_file_updated)
    retrain_gb_model(X_new, Y_new, GB_save_path)

    print("Data successfully integrated and model updated.")

