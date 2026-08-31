from app.services.cedants.aca import ACAETL
from app.services.cedants.tripakarta import TripakartaETL
from app.services.cedants.buanaindependent import BuanaIndependentETL
from app.services.cedants.askrida import AskridaETL
from app.services.cedants.jamkridajabar import JamkridaJabarETL
from app.services.cedants.jakrejabar import JakreJabarETL

CEDANT_SERVICES = {
    "aca": ACAETL,
    "tripakarta": TripakartaETL,
    "buanaindependent": BuanaIndependentETL,
    "askrida": AskridaETL,
    "jamkridajabar": JamkridaJabarETL,
    "jamkrida": JamkridaJabarETL,      # Alias fallback
    "jakrejabar": JakreJabarETL,        # Service Jakre Jabar
    "jakre": JakreJabarETL,             # Alias fallback
}

def run_etl_service(cedant: str, tipe_proses: str, file_path: str, target_sheet: str, periode_lengkap: str, override_cob: str = None):
    cedant_key = str(cedant).lower().replace(" ", "").replace("_", "").replace("-", "").strip()
    
    if cedant_key not in CEDANT_SERVICES:
        raise ValueError(f"Cedant '{cedant}' belum terdaftar di ETL Services.")
        
    service = CEDANT_SERVICES[cedant_key]
    tipe = tipe_proses.lower().strip()

    if tipe == "premi":
        return service.process_premi(file_path, target_sheet, periode_lengkap, override_cob)
    elif tipe in ["claim", "klaim"]:
        return service.process_claim(file_path, target_sheet, periode_lengkap, override_cob)
    else:
        raise ValueError(f"Tipe proses '{tipe_proses}' tidak dikenal. Gunakan 'premi' atau 'claim'.")