from Bluvia_src import Bluvia_Analysis as ba
from Bluvia_src import Bluvia_Upload as bu

GB_save_path = "C:/Users/nikhi/workspaces/bluvia-nsb/GB_model_save_path.joblib" 
master_csv_file = "C:/Users/nikhi/workspaces/bluvia-nsb/Bluvia_csv/master_csv.csv"

print("----Select action by entering the associated number----")
action = input("Get AI prediction (1)\nInput new SEM data (2)\nEnter: ")

if action == "1":
    lat = float(input("Lat: "))
    lon = float(input("Lon: "))
    detected_industries=ba.detect_nearby_industries(lat, lon)
    prediction = ba.ai_prediction(lat, lon, GB_save_path)
    x, y_true = ba.creating_New_training_data(master_csv_file)
    SE_per_target = ba.find_SE(lat, lon, GB_save_path, x, y_true)
    risk_scores = ba.calculate_risk_scores(prediction, lat, lon)

    print("\n Analyzed Results at (Lat: {:.4f}, Lon: {:.4f}):".format(lat, lon))
    print("\n Predicted Concentrations:")
    for metal, value in prediction.items():
        print(f"  - {metal}: {value:.4f}")
    print("\n Standard Error (SE) per Target:")
    for metal, se in SE_per_target.items():
        print(f"  - {metal}: {se:.4f}")
    print("\n Risk Scores:")
    for metal, score in risk_scores.items():
        print(f"  - {metal}: {score:.2f}")

if action =="2":
     new_file = input("Enter new SEM CSV file: ")
     bu.intigrate_new_data(new_file)


