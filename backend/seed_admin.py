import os
import sys

# Tambahkan backend path ke sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.models.user import AppUser
from app.core.security import hash_password

def seed_default_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(AppUser).filter(AppUser.username == "admin").first()
        if admin_user:
            admin_user.password_hash = hash_password("admin123")
            admin_user.is_active = True
            db.commit()
            print("[SUCCESS] Password user admin berhasil disinkronkan:")
            print("  Username : admin")
            print("  Password : admin123")
            print("  Role     : admin")
            return

        new_admin = AppUser(
            username="admin",
            email="admin@indonesia-re.co.id",
            password_hash=hash_password("admin123"),
            full_name="Administrator IndonesiaRe",
            role="admin",
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print("[SUCCESS] User admin default berhasil dibuat:")
        print("  Username : admin")
        print("  Password : admin123")
        print("  Role     : admin")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Gagal membuat user admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_default_admin()
