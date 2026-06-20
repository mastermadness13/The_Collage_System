from flask import Blueprint, render_template




departments_bp = Blueprint('departments', __name__)

@departments_bp.route('/departments')
def departments():
    return render_template('departments/departments.html')