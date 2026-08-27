import pandas as pd
import numpy as np
from app.services.cedants.base import BaseCedantETL
from app.utils.helpers import read_excel_dynamic_header, to_snake_case

class JamkridaJabarETL(BaseCedantETL):
    """
    Modul ETL khusus PT Jamkrida Jabar (Igna Asia)
    Mendukung skema bulanan (JAN, FEB) dan kuartalan/triwulan (TW1, Q1).
    """

    @staticmethod
    def process_premi(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame()

        df.columns = [to_snake_case(str(c)) for c in df.columns]

        # Menempelkan periode apa adanya (misal: "AGUSTUS 2024", "JAN 2025", atau "TW1 2025")
        df['period'] = periode_lengkap
        df['cob'] = override_cob.upper() if override_cob else 'CREDIT'

        return df.where(pd.notnull(df), None).reset_index(drop=True)

    @staticmethod
    def process_claim(file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None) -> pd.DataFrame:
        df = read_excel_dynamic_header(file_path, target_sheet)
        if df is None or df.empty:
            return pd.DataFrame()

        df.columns = [to_snake_case(str(c)) for c in df.columns]

        df['period'] = periode_lengkap
        df['cob'] = override_cob.upper() if override_cob else 'CREDIT'

        return df.where(pd.notnull(df), None).reset_index(drop=True)