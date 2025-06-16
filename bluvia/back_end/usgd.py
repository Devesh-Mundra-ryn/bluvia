import pandas as pd
from shapely.geometry import Point

# 1. Sample Site Coordinates
site_data = pd.DataFrame({
    "Site": ["Alvord Lake", "Desert West Lake", "Steele Park", "Gila Canal", "Papago Park", "Tres Rios"],
    "Lat": [33.403, 33.470, 33.506, 33.390, 33.460, 33.381],
    "Lon": [-112.118, -112.166, -112.065, -112.126, -111.944, -112.307],
    "Ewaste_Nearby": [1, 1, 0, 0, 1, 0]  # proxy for Indium risk
})

# 2. Mock SEM-EDS Results (averaged by site from earlier conversation)
sem_eds = pd.DataFrame({
    "Site": site_data["Site"],
    "SEM_Fe_ppm": [51600, 73000, 3000, 26900, 62800, 68200],
    "SEM_Cr_ppm": [190, 170, 20, 80, 30, 190],
    "SEM_Mn_ppm": [200, 150, 10, 90, 50, 200],
    "SEM_Mo_ppm": [10, 15, 3, 9.3, 7.5, 12.2],
    "SEM_In_ppm": [18.2, 10.4, 0.5, 0.0, 11.0, 0.0]
})

# 3. Mock USGS Soil Baseline Data (approximated from real ranges)
soil_baseline = pd.DataFrame({
    "Site": site_data["Site"],
    "Soil_Fe_ppm": [45000, 46000, 48000, 44000, 45500, 47000],
    "Soil_Cr_ppm": [90, 85, 95, 80, 88, 87],
    "Soil_Mn_ppm": [600, 590, 610, 580, 605, 595],
    "Soil_Mo_ppm": [1.2, 1.5, 1.0, 1.3, 1.4, 1.6],
})

# 4. Estimated Indium Risk (simple scale: 1 if ewaste nearby, else 0)
site_data["Estimated_In_Risk"] = site_data["Ewaste_Nearby"] * 1.0

# 5. Merge all into a master DataFrame
merged = sem_eds.merge(soil_baseline, on="Site").merge(site_data[["Site", "Lat", "Lon", "Estimated_In_Risk"]], on="Site")

# 6. Compute delta (contamination above baseline)
merged["Fe_Delta"] = merged["SEM_Fe_ppm"] - merged["Soil_Fe_ppm"]
merged["Cr_Delta"] = merged["SEM_Cr_ppm"] - merged["Soil_Cr_ppm"]
merged["Mn_Delta"] = merged["SEM_Mn_ppm"] - merged["Soil_Mn_ppm"]
merged["Mo_Delta"] = merged["SEM_Mo_ppm"] - merged["Soil_Mo_ppm"]

# 7. Save all 3 CSV files
sem_eds.to_csv("sem_eds_data.csv", index=False)
soil_baseline.to_csv("arizona_soil_baselines.csv", index=False)
merged.to_csv("merged_soil_sem_data.csv", index=False)

print("✅ Files created:")
print(" - sem_eds_data.csv")
print(" - arizona_soil_baselines.csv")
print(" - merged_soil_sem_data.csv")