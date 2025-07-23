import os
from pathlib import Path
from typing import Union

class PathUtils:
    """
    Production-ready path utility class with:
    - Environment variable support
    - Path validation
    - Cross-platform compatibility
    - Type hints
    """
    
    @staticmethod
    def get_base_dir() -> Path:
        """Get the base directory for data files"""
        # Priority: 1. Env var 2. Default location (package-relative)
        base_dir = os.environ.get("BLUVIA_DATA_DIR")
        if base_dir:
            return Path(base_dir)
        return Path(__file__).parent.parent / "data"  # Changed from "Bluvia_csv" to "data"

    @staticmethod
    def get_data_path(filename: str, create_parents: bool = False) -> Path:
        """
        Get full path to a data file with validation
        
        Args:
            filename: Name of the data file
            create_parents: If True, creates parent directories
            
        Returns:
            Absolute Path object
        """
        path = PathUtils.get_base_dir() / filename
        if create_parents:
            path.parent.mkdir(parents=True, exist_ok=True)
        return path.absolute()

    @staticmethod
    def get_model_path(model_name: str = "GB_model.joblib") -> Path:
        """
        Get path to model file with environment variable fallback
        
        Args:
            model_name: Default model filename if not specified in env var
            
        Returns:
            Absolute Path object
        """
        model_path = os.environ.get("BLUVIA_MODEL_PATH")
        if model_path:
            return Path(model_path)
        return (Path(__file__).parent.parent / "models" / model_name).absolute()

    @staticmethod
    def validate_path_exists(path: Union[str, Path]) -> bool:
        """Validate that a path exists"""
        path = Path(path) if isinstance(path, str) else path
        return path.exists()
