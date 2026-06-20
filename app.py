from flask import Flask 
from config import Config
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.timetable import timetable_bp
from routes.rooms import rooms_bp
from routes.departments import departments_bp
from routes.students import students_bp
from routes.history import history_bp
from routes.users import users_bp
from routes.courses import courses_bp
from routes.attendance import attendance_bp
from routes.teachers import teachers_bp
 
app = Flask(__name__)
app.config.from_object(Config)
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(timetable_bp)
app.register_blueprint(rooms_bp)
app.register_blueprint(departments_bp)
app.register_blueprint(students_bp)
app.register_blueprint(history_bp)
app.register_blueprint(users_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(teachers_bp)




if __name__ == '__main__':
    app.run(debug=True)