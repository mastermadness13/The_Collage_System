from flask import Blueprint, render_template

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance')
def list_attendance():
    return render_template('attendance/list.html', teachers=[], teacher_id=None)

@attendance_bp.route('/attendance/create', methods=['GET', 'POST'])
def create_attendance():
    return render_template('attendance/create.html', teachers=[])
