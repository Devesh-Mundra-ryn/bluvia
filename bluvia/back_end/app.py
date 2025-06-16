# --- 📦 Imports ---
import streamlit as st
import pandas as pd
import numpy as np
import folium
from streamlit_folium import st_folium
import matplotlib.pyplot as plt
from geopy.distance import geodesic
from sklearn.ensemble import RandomForestRegressor
import os

# --- 🌎 Page Setup ---
st.set_page_config(page_title="Urban Waterway Contamination Risk Analyzer", layout="wide")
st.title("🌎 Urban Waterway Contamination Risk Analyzer (AI + GIS Integrated)")
st.markdown("Use this AI-powered tool to predict heavy metal contamination based on surrounding industries and compare against natural soil baselines.")

# --- 📥 Load Industry Locations ---
industry_file = "industry_locations.csv"
if os.path.exists(industry_file):
    industry_df = pd.read_csv(industry_file)
else:
    st.error(f"❌ Missing industry locations file: {industry_file}")
    st.stop()

# --- 📥 Load Soil Baseline Data ---
soil_file = "merged_soil_sem_data.csv"
if os.path.exists(soil_file):
    soil_baseline_df = pd.read_csv(soil_file)
else:
    st.error(f"❌ Missing soil baseline file: {soil_file}")
    st.stop()

# --- 🗺️ Select Site Location on Map ---
st.header("🌎 Select Site Location")
m = folium.Map(location=[33.4484, -112.0740], zoom_start=10)

marker = folium.Marker(
    location=[33.4484, -112.0740],
    draggable=True,
    popup="Drag to your site",
)
marker.add_to(m)

output = st_folium(m, width=700, height=400)

if output["last_clicked"]:
    lat = output["last_clicked"]["lat"]
    lon = output["last_clicked"]["lng"]
    st.success(f"📍 Selected location: Latitude {lat:.4f}, Longitude {lon:.4f}")
else:
    lat = 33.4484
    lon = -112.0740

# --- 🧠 Define Detection Function ---
def detect_nearby_industries(lat, lon, radius_km=3.0):
    results = {
        "MF": 0, "AR": 0, "WT": 0, "EW": 0,
        "LF": 0, "RC": 0, "CS": 0, "BR": 0,
        "AP": 0, "CP": 0, "MS": 0, "OG": 0, "SO": 0
    }
    user_location = (lat, lon)

    for _, row in industry_df.iterrows():
        industry_location = (row["Latitude"], row["Longitude"])
        distance = geodesic(user_location, industry_location).km

        if distance <= radius_km:
            industry_type = row["Industry_Type"]

            if industry_type == "Metal Fabrication":
                results["MF"] = 1
            elif industry_type == "Auto Repair":
                results["AR"] = 1
            elif industry_type == "Wastewater Treatment":
                results["WT"] = 1
            elif industry_type == "E-waste Recycling":
                results["EW"] = 1
            elif industry_type == "Landfill / Dump":
                results["LF"] = 1
            elif industry_type == "Raceways / Tracks":
                results["RC"] = 1
            elif industry_type == "Construction Site":
                results["CS"] = 1
            elif industry_type == "Battery Recycling":
                results["BR"] = 1
            elif industry_type == "Airport":
                results["AP"] = 1
            elif industry_type == "Chemical Plant":
                results["CP"] = 1
            elif industry_type == "Mining Site":
                results["MS"] = 1
            elif industry_type == "Oil/Gas Facility":
                results["OG"] = 1
            elif industry_type == "Stormwater Outfall":
                results["SO"] = 1

    return results

# --- 🧠 Detect Industries Automatically ---
detected_industries = detect_nearby_industries(lat, lon)

st.subheader("🧠 Detected Nearby Industries")
st.json(detected_industries)

# --- 🌧️ Select Stormwater Exposure ---
stormwater = st.selectbox("🌧️ Stormwater Runoff Exposure?", ["No", "Yes"])
storm = 1 if stormwater == "Yes" else 0

# --- 🤖 Train Random Forest AI Model ---
np.random.seed(42)
n_samples = 500
X_train = np.random.randint(0, 2, size=(n_samples, 5))

Y_train = pd.DataFrame({
    "Fe": 2 + 3.8*X_train[:,0] + 2.9*X_train[:,1] + 3.5*X_train[:,2] + 4.2*X_train[:,3] + 1.2*X_train[:,4] + np.random.normal(0, 0.5, n_samples),
    "Cr": 0.3 + 3.8*X_train[:,0] + 1.5*X_train[:,1] + 3.5*X_train[:,2] + 2.0*X_train[:,3] + 0.8*X_train[:,4] + np.random.normal(0, 0.2, n_samples),
    "Mn": 0.5 + 3.8*X_train[:,0] + 2.0*X_train[:,1] + 3.5*X_train[:,2] + 1.8*X_train[:,3] + 1.0*X_train[:,4] + np.random.normal(0, 0.3, n_samples),
    "Mo": 0.2 + 1.5*X_train[:,0] + 2.9*X_train[:,1] + 3.5*X_train[:,2] + 2.5*X_train[:,3] + 1.1*X_train[:,4] + np.random.normal(0, 0.2, n_samples),
    "In": 0.01 + 1.0*X_train[:,0] + 0.8*X_train[:,1] + 0.5*X_train[:,2] + 4.2*X_train[:,3] + 0.5*X_train[:,4] + np.random.normal(0, 0.1, n_samples),
    "Ta": 0.05 + 0.8*X_train[:,0] + 1.2*X_train[:,1] + 0.9*X_train[:,2] + 4.2*X_train[:,3] + 0.6*X_train[:,4] + np.random.normal(0, 0.1, n_samples)
})

rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, Y_train)

# --- 🤖 Predict with AI Model ---
user_features = np.array([[detected_industries["MF"], detected_industries["AR"], detected_industries["WT"], detected_industries["EW"], storm]])
ai_predicted_values = rf_model.predict(user_features)[0]

ai_predictions = {
    "Fe": round(ai_predicted_values[0], 2),
    "Cr": round(ai_predicted_values[1], 2),
    "Mn": round(ai_predicted_values[2], 2),
    "Mo": round(ai_predicted_values[3], 2),
    "In": round(ai_predicted_values[4], 2),
    "Ta": round(ai_predicted_values[5], 2)
}

st.header("🧠 AI Predicted Heavy Metal Concentrations")
st.dataframe(pd.DataFrame(ai_predictions.items(), columns=["Metal", "AI Predicted Concentration (ppm)"]).set_index("Metal"))

# --- 🧪 Compare to Soil Baseline ---
soil_baseline_df["distance"] = ((soil_baseline_df["Lat"] - lat)**2 + (soil_baseline_df["Lon"] - lon)**2)**0.5
nearest_soil = soil_baseline_df.loc[soil_baseline_df["distance"].idxmin()]

soil_baseline_values = {
    "Fe": nearest_soil["Soil_Fe_ppm"],
    "Cr": nearest_soil["Soil_Cr_ppm"],
    "Mn": nearest_soil["Soil_Mn_ppm"],
    "Mo": nearest_soil["Soil_Mo_ppm"]
}

comparison_data = []
for metal in ["Fe", "Cr", "Mn", "Mo", "In"]:
    predicted = ai_predictions.get(metal, 0)
    baseline = soil_baseline_values.get(metal, 0.05)  # Estimate very low In baseline
    delta = round(predicted - baseline, 2)
    risk_score = min(max((predicted / (baseline + 1)) * 25, 0), 100)
    comparison_data.append((metal, predicted, baseline, delta, risk_score))

comparison_df = pd.DataFrame(comparison_data, columns=["Metal", "Predicted (ppm)", "Baseline (ppm)", "Delta (ppm)", "Risk Score (0-100)"])

st.header("⚖️ Contamination Risk Assessment")
st.dataframe(comparison_df.set_index("Metal"))

# --- 🚥 Calculate Overall Contamination Risk Level ---
average_risk = comparison_df["Risk Score (0-100)"].mean()

# Decide color based on average risk
if average_risk < 25:
    marker_color = "green"
    risk_label = "Low Risk"
elif average_risk < 60:
    marker_color = "orange"
    risk_label = "Moderate Risk"
else:
    marker_color = "red"
    risk_label = "High Risk"

st.success(f"🛡️ Overall Risk Level: {risk_label} (Avg Risk Score: {average_risk:.1f})")

# --- 🗺️ Create Interactive Map with Dynamic Marker ---
st.header("🌎 Select Site Location (Dynamic Risk Marker)")

# Create the map
m = folium.Map(location=[33.4484, -112.0740], zoom_start=10)

# Create a color-coded marker based on risk
folium.Marker(
    location=[lat, lon],
    popup=f"Risk Level: {risk_label}\nAvg Risk: {average_risk:.1f}",
    icon=folium.Icon(color=marker_color)
).add_to(m)

# Display the map
st_folium(m, width=700, height=400)


import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# --- 📊 Metal Levels Comparison (Baseline vs Predicted) ---

st.subheader("📊 1. Metal Concentration Comparison (Baseline vs Prediction)")

# Prepare data
metals = comparison_df["Metal"]
baseline = comparison_df["Baseline (ppm)"]
predicted = comparison_df["Predicted (ppm)"]

# Set the style
sns.set_style("whitegrid")
fig1, ax1 = plt.subplots(figsize=(10, 6))

bar_width = 0.35
x = np.arange(len(metals))

# Plot
ax1.bar(x - bar_width/2, baseline, width=bar_width, label="Baseline Soil", color="steelblue")
ax1.bar(x + bar_width/2, predicted, width=bar_width, label="Predicted SEM", color="darkorange")

ax1.set_xlabel("Metal", fontsize=12)
ax1.set_ylabel("Concentration (ppm)", fontsize=12)
ax1.set_title("Metal Concentrations: Baseline vs Predicted", fontsize=14)
ax1.set_xticks(x)
ax1.set_xticklabels(metals)
ax1.legend()
plt.xticks(rotation=45)

# Display plot
st.pyplot(fig1)

# --- 🚦 Risk Assessment Chart (Delta and Risk Score) ---

st.subheader("🚦 2. Risk Assessment for Each Metal")

fig2, ax2 = plt.subplots(figsize=(10, 6))

# Plot Risk Scores
sns.barplot(
    x="Metal",
    y="Risk Score (0-100)",
    data=comparison_df,
    palette="coolwarm",
    ax=ax2
)

ax2.set_ylim(0, 100)
ax2.axhline(25, color='green', linestyle='--', label='Safe Threshold')
ax2.axhline(60, color='orange', linestyle='--', label='Caution Threshold')
ax2.set_ylabel("Risk Score (0-100)", fontsize=12)
ax2.set_title("Contamination Risk Scores per Metal", fontsize=14)
ax2.legend()

st.pyplot(fig2)

# --- 🚨 Highlight Dangerous Metals ---

st.subheader("🚨 3. Metals Exceeding Baseline (Dangerous Metals)")

# Metals that exceed baseline by more than 50%
dangerous_metals = comparison_df[comparison_df["Delta (ppm)"] > (0.5 * comparison_df["Baseline (ppm)"])]

if not dangerous_metals.empty:
    st.dataframe(dangerous_metals.set_index("Metal"))
else:
    st.success("✅ No dangerous metals detected above threshold.")
