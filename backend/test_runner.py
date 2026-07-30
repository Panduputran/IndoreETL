import os
import pandas as pd
from app.services.premi import proses_data_premi

def uji_dan_bandingkan():
    # 1. Tentukan path file input dan file output lama (benchmark)
    FILE_INPUT = "input/aca/BORD PREMIUM 2Q2025_INDORE.xlsx"
    FILE_OUTPUT_LAMA = "output/clean_premi_aca_Q2_2025.xlsx"  # Ganti dengan path output lama
    
    PERUSAHAAN = "aca"
    PERIODE = "Q2 2025"

    print("=== STARTING TEST ETL RUNNER ===")
    
    # 2. Eksekusi fungsi ETL baru
    if not os.path.exists(FILE_INPUT):
        print(f"[-] File input tidak ditemukan: {FILE_INPUT}")
        return

    print("[+] Memproses data dengan modul baru...")
    df_baru = proses_data_premi(FILE_INPUT, PERUSAHAAN, PERIODE)
    
    # 3. Jika ada file benchmark lama, lakukan komparasi
    if os.path.exists(FILE_OUTPUT_LAMA):
        print("[+] Membaca file output lama untuk komparasi...")
        df_lama = pd.read_excel(FILE_OUTPUT_LAMA)
        
        print("\n--- HASIL EVALUASI / KOMPARASI ---")
        
        # A. Cek Baris & Kolom
        print(f"Bentuk Data Lama (Rows, Cols) : {df_lama.shape}")
        print(f"Bentuk Data Baru (Rows, Cols) : {df_baru.shape}")
        
        if df_lama.shape == df_baru.shape:
            print("✅ Ukuran DataFrame SAMA PERSIS!")
        else:
            print("⚠️ Ukuran DataFrame BERBEDA!")
            
        # B. Cek Nama Kolom
        kolom_sama = list(df_lama.columns) == list(df_baru.columns)
        if kolom_sama:
            print("✅ Susunan Nama Kolom SAMA PERSIS!")
        else:
            print("⚠️ Ada perbedaan susunan nama kolom:")
            print(f"   Lama: {list(df_lama.columns)}")
            print(f"   Baru: {list(df_baru.columns)}")

        # C. Cek Data Murni
        try:
            # Samakan tipe data sederhana sebelum compare
            assert_equal = df_lama.equals(df_baru)
            if assert_equal:
                print("🎉 NILAI DATA 100% IDENTIK!")
            else:
                print("ℹ️ Ada perbedaan isi nilai/tipe data di beberapa sel (Cek formatting/ROE/Dates).")
        except Exception as e:
            print(f"[-] Gagal mengecek presisi nilai: {e}")

    else:
        print("[!] File output lama tidak ditemukan untuk dibandingkan.")
        print(f"[+] Sampel 5 Baris Data Baru:\n{df_baru.head()}")

if __name__ == "__main__":
    uji_dan_bandingkan()