from abc import ABC, abstractmethod
import pandas as pd

class BaseCedantETL(ABC):
    """Interface standar yang wajib diimplementasikan oleh setiap modul Cedant"""

    @staticmethod
    @abstractmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        """Fungsi wajib untuk pemrosesan PREMI"""
        pass

    @staticmethod
    @abstractmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        """Fungsi wajib untuk pemrosesan KLAIM"""
        pass