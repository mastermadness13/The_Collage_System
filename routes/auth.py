

from flask import Blueprint, render_template, request
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
         if request.method == 'POST':
            if(request.form['username'] and request.form['password'] == "123"):
                return "<h1>Private page</h1>"

        # Here you would add logic to verify the username and password
        # For demonstration, we will just redirect to the dashboard
    return render_template('/auth/login.html', active_page='courses')