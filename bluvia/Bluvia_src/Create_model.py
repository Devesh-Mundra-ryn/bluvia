# This program doesn't return anything it just trains a base ai ARFRegressor model using the data from soil_sem_data.csv

import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

soil_sem_data = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/soil_sem_data.csv"
GB_save_path = "C:/Users/nikhi/workspaces/bluvia-nsb/GB_model_save_path.joblib"

def creating_training_data(csv_file):
    data_file = pd.read_csv(csv_file)
    data_file.columns = data_file.columns.str.strip().str.lower()
    data_file = data_file.rename(columns={
    'fe': 'Fe_ppm', 'cr': 'Cr_ppm', 'mn': 'Mn_ppm',
    'mo': 'Mo_ppm', 'in': 'In_ppm', 'ta': 'Ta_ppm'
})
    target_columns = ["Fe_ppm", "Cr_ppm", "Mn_ppm", "Mo_ppm", "In_ppm", "Ta_ppm"]
    
    if 'lat' not in data_file.columns or 'lon' not in data_file.columns:
        if "latitude" not in data_file.columns or "longitude" not in data_file.columns:
            raise ValueError("CSV must contain location columns ('lat'/'lon' or 'latitude'/'longitude')")
        data_file = data_file.rename(columns={"latitude": "lat", "longitude": "lon"})
    
    X_train = data_file[["lat", "lon"]].copy()
    Y_train = data_file[target_columns].copy()
    
    Y_train = Y_train.apply(pd.to_numeric, errors='coerce')
    if Y_train.isnull().values.any():
        Y_train = Y_train.fillna(0)
    
    return X_train, Y_train

def train_gb_model(X_train, Y_train, save_path):
    gb_model = GradientBoostingRegressor(
        n_estimators=50,       # Reduced to prevent overfitting
        learning_rate=0.05,     # Lower learning rate for better generalization
        max_depth=2,            # Shallower trees for small dataset
        min_samples_split=3,    # Require more samples to split (since only 6 samples)
        min_samples_leaf=2,     # Require at least 2 samples per leaf
        subsample=0.8,          # Use 80% of samples for each tree
        max_features=1.0,       # Use both features (Lat/Lon) for each tree
        random_state=42,
        validation_fraction=0.2,# Use 20% for early stopping
        n_iter_no_change=5,     # Stop if no improvement after 5 iterations
    )
    
    model = MultiOutputRegressor(gb_model)
    

    model.fit(X_train, Y_train)
    

    joblib.dump(model, save_path)
    print(f"Gradient Boosting model saved to {save_path}")
    return model


x_train, y_train = creating_training_data(soil_sem_data)


gb_model = train_gb_model(x_train, y_train, GB_save_path)