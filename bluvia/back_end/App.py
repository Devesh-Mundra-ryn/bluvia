# app.py
import streamlit as st
import folium
from streamlit_folium import st_folium
from model import predict_metals

st.set_page_config(page_title="GeoMetals Predictor", layout="wide")

st.title("Heavy Metal Concentration Estimator 🌎")
st.markdown("Click on the map to select a location. The app will predict heavy metal concentrations based on geolocation and trained SEM-EDS data.")

with st.expander("How it works"):
    st.markdown("""
    This app predicts concentrations of heavy metals in ppm (parts per million) using a trained Gradient Boosting model. 
    It accounts for location-based proximity to industrial zones and was trained on SEM-EDS data from Arizona.
    """)

default_coords = [33.4484, -112.0740]  # Phoenix center

m = folium.Map(location=default_coords, zoom_start=10)
click = st_folium(m, height=500, width=700)

if click and click["last_clicked"]:
    lat, lon = click["last_clicked"]["lat"], click["last_clicked"]["lng"]
    st.success(f"Selected Location: Latitude {lat:.4f}, Longitude {lon:.4f}")

    prediction = predict_metals(lat, lon)
    st.subheader("Predicted Heavy Metal Concentrations (ppm):")
    for metal, val in prediction.items():
        warning = ""
        if (metal == "Fe_ppm" and val > 48000) or            (metal == "Cr_ppm" and val > 95) or            (metal == "Mn_ppm" and val > 610) or            (metal == "Mo_ppm" and val > 1) or            (metal == "In_ppm" and val > 0.05) or            (metal == "Ta_ppm" and val > 0.5):
            warning = "⚠️ Above EPA Threshold"
        st.markdown(f"**{metal}**: {val:.2f} ppm {warning}")
