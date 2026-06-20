import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # 🔐 Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-this-secret')

    # 🗄️ Database
    DATABASE = os.path.join(BASE_DIR, 'clean_data.db')

    # ⚙️ App settings
    DEBUG = True

    # 🍪 Session settings
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', '0') == '1'

    # ⏳ مدة تسجيل الدخول (3 أيام)
    PERMANENT_SESSION_LIFETIME = timedelta(days=3)


class ProductionConfig(Config):
    DEBUG = False