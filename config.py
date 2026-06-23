import os
import secrets
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
_KEY_FILE = os.path.join(BASE_DIR, '.secret_key')

def _load_secret_key():
    key = os.environ.get('SECRET_KEY')
    if key:
        return key
    try:
        with open(_KEY_FILE, 'r') as f:
            stored = f.read().strip()
            if stored:
                return stored
    except (FileNotFoundError, OSError):
        pass
    new_key = secrets.token_hex(32)
    try:
        with open(_KEY_FILE, 'w') as f:
            f.write(new_key)
    except OSError:
        pass
    return new_key

class Config:
    SECRET_KEY = _load_secret_key()
    DATABASE = os.path.join(BASE_DIR, 'data.db')
    DEBUG = os.environ.get('FLASK_DEBUG', '0') == '1'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', '1') == '1'
    PERMANENT_SESSION_LIFETIME = timedelta(days=3)
    WTF_CSRF_HEADERS = ['X-CSRFToken', 'X-CSRF-Token']
    WTF_CSRF_TIME_LIMIT = 86400

class ProductionConfig(Config):
    DEBUG = False