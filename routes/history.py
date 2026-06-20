from flask import Blueprint, render_template

history_bp = Blueprint('history', __name__)

@history_bp.route('/history')
def history():
    return render_template('history/history.html', active_page='history')