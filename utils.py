
EPA_THRESHOLDS_PPM = {
    "Fe": 300,
    "Cr": 0.1,
    "Mn": 0.05,
    "Mo": 0.1,
    "In": 0.05,
    "Ta": 0.01
}

def get_epa_warnings(predicted):
    warnings = {}
    for metal, value in predicted.items():
        threshold = EPA_THRESHOLDS_PPM.get(metal, float("inf"))
        warnings[metal] = value > threshold
    return warnings

def calculate_risk_score(predicted):
    weights = {"Fe": 1.2, "Cr": 2.5, "Mn": 1.0, "Mo": 1.8, "In": 3.0, "Ta": 2.2}
    score = sum(predicted[m] * weights.get(m, 1) for m in predicted)
    return round(score / len(predicted), 2)
