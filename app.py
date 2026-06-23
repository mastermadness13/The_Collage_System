from flask import Flask, g, redirect, session, url_for
from flask_wtf.csrf import CSRFProtect
from config import Config
import db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.timetable import timetable_bp
from routes.rooms import rooms_bp
from routes.departments import departments_bp
from routes.students import students_bp
from scripts.routes.history import history_bp
from routes.users import users_bp
from routes.courses import courses_bp
from routes.attendance import attendance_bp
from routes.teachers import teachers_bp
from routes.exam_flow import exam_flow_bp

app = Flask(__name__)
app.config.from_object(Config)
csrf = CSRFProtect(app)
app.teardown_appcontext(db.close_db)

@app.before_request
def load_logged_in_user():
    g.active_account = None
    user_id = session.get('user_id')
    if user_id is not None:
        g.active_account = {
            'id': user_id,
            'username': session.get('username'),
            'role': session.get('role'),
            'label': session.get('label'),
            'department_id': session.get('department_id'),
        }

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(timetable_bp)
app.register_blueprint(rooms_bp)
app.register_blueprint(departments_bp)
app.register_blueprint(students_bp)
app.register_blueprint(history_bp, url_prefix='/history')
app.register_blueprint(users_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(teachers_bp)
app.register_blueprint(exam_flow_bp)

@app.route('/')
def index():
    return redirect(url_for('auth.login'))

# Initialize database schema at startup
try:
    db.init_db()
except Exception as e:
    import sys
    print(f'DB init warning: {e}', file=sys.stderr)

if __name__ == '__main__':
    app.run(debug=True)