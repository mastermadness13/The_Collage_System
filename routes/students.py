from flask import Blueprint, render_template

students_bp = Blueprint('students', __name__)

@students_bp.route('/students')
def students():
    return render_template('students/students.html')

