import pandas as pd
from shapely.geometry import Point

# 1. Define your 6 sampling sites
site_data = pd.DataFrame({
    "Site": ["Alvord Lake", "Desert West Lake", "Steele Park", "Gila Canal", "Papago Park", "Tres Rios"],
    "Lat": [33.403, 33.470, 33.506, 33.390, 33.460, 33.381],
    "Lon": [-112.118, -112.166, -112.065, -112.126, -111.944, -112.307],
    "Ewaste_Nearby": [1, 1, 0, 0, 1, 0]  # Proxy for Indium risk (e-waste proximity)
})

# 2. Define mock SEM-EDS results (what you measured from the sediments)
sem_eds = pd.DataFrame({
    "Site": site_data["Site"],
    "SEM_Fe_ppm": [51600, 73000, 3000, 26900, 62800, 68200],
    "SEM_Cr_ppm": [190, 170, 20, 80, 30, 190],
    "SEM_Mn_ppm": [200, 150, 10, 90, 50, 200],
    "SEM_Mo_ppm": [10, 15, 3, 9.3, 7.5, 12.2],
    "SEM_In_ppm": [18.2, 10.4, 0.5, 0.0, 11.0, 0.0]
})

# 3. Define mock soil baseline data (natural background from USGS or AZGS)
soil_baseline = pd.DataFrame({
    "Site": site_data["Site"],
    "Soil_Fe_ppm": [45000, 46000, 48000, 44000, 45500, 47000],
    "Soil_Cr_ppm": [90, 85, 95, 80, 88, 87],
    "Soil_Mn_ppm": [600, 590, 610, 580, 605, 595],
    "Soil_Mo_ppm": [1.2, 1.5, 1.0, 1.3, 1.4, 1.6]
})

# 4. Merge SEM-EDS and Soil Baseline together
merged = sem_eds.merge(soil_baseline, on="Site").merge(site_data[["Site", "Lat", "Lon", "Ewaste_Nearby"]], on="Site")

# 5. Add geometry for GIS operations if needed (optional)
merged["geometry"] = merged.apply(lambda row: Point(row["Lon"], row["Lat"]), axis=1)

# 6. Save the merged file
merged.to_csv("merged_soil_sem_data.csv", index=False)

print("✅ Merged soil and SEM-EDS data successfully saved as 'merged_soil_sem_data.csv'!")
