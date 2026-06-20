from flask import Blueprint, render_template


from flask import Blueprint, render_template

timetable_bp = Blueprint('timetable', __name__)

@timetable_bp.route('/timetable')
def timetable():
    return render_template('timetable/timetable.html')

