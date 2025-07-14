import os

def get_data_path(filename, default_subdir="Bluvia_csv"):
    """Return the full path to a data/model file, using environment variables or default relative paths."""
    base_dir = os.environ.get("BLUVIA_DATA_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", default_subdir)))
    return os.path.abspath(os.path.join(base_dir, filename))

def get_model_path():
    """Return the path to the model file."""
    return os.environ.get("BLUVIA_MODEL_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "model_save_path.joblib")))
