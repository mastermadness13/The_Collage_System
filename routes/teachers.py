from flask import Blueprint, render_template


teachers_bp = Blueprint('teachers', __name__)

@teachers_bp.route('/teachers')
def teachers():
    return render_template('teachers/teachers.html')

