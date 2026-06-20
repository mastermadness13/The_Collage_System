from flask import Blueprint, render_template

rooms_bp = Blueprint('rooms', __name__)

@rooms_bp.route('/rooms')
def rooms():
    return render_template('rooms/rooms.html')