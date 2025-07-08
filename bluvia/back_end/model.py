def predict_metals(lat, lng):
    # Your existing AI model logic here
    # Example output (replace with real model):
    return {
        "Fe_ppm": 100.0,
        "Cr_ppm": 10.0,
        "Mn_ppm": 20.0,
        "Mo_ppm": 0.7,
        "In_ppm": 0.01,
        "Ta_ppm": 0.2
    }

def update_metals_with_user_data(predictions, user_data, lat, lng):
    """
    Simple example: average model predictions with any user data at the same lat/lng (if available).
    User data rows must have lat/lng and metal columns.
    """
    # Identify relevant user data (matching lat/lng, or do a proximity check as needed)
    metals = ["Fe_ppm", "Cr_ppm", "Mn_ppm", "Mo_ppm", "In_ppm", "Ta_ppm"]
    relevant = []
    for row in user_data:
        try:
            if float(row.get("lat", 0)) == float(lat) and float(row.get("lng", 0)) == float(lng):
                relevant.append(row)
        except Exception:
            continue

    # If no matching user data, return original predictions
    if not relevant:
        return predictions

    # For each metal, average model prediction and user values
    output = predictions.copy()
    for metal in metals:
        user_vals = []
        for row in relevant:
            try:
                val = float(row.get(metal, 0))
                user_vals.append(val)
            except Exception:
                continue
        if user_vals:
            output[metal] = (predictions[metal] + sum(user_vals) / len(user_vals)) / 2
    return output
