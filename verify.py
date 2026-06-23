import sys, os, io
sys.path.insert(0, os.path.dirname(__file__))

# Must disable CSRF before importing app
os.environ['WTF_CSRF_ENABLED'] = 'False'
import flask_wtf.csrf
flask_wtf.csrf.CSRFProtect._disable = True

from app import app
app.config['WTF_CSRF_ENABLED'] = False
app.config['TESTING'] = True

LOGIN_USER = 'superadmin'
LOGIN_PASS = 'admin123'

def test():
    client = app.test_client()
    results = []

    # Login: first GET to get CSRF token
    login_page = client.get('/login')
    print(f'Login page: {login_page.status_code} ({len(login_page.data)}b)')

    rv = client.post('/login', data={'username': LOGIN_USER, 'password': LOGIN_PASS}, follow_redirects=True)
    results.append(('POST /login', rv.status_code, rv.request.path, 'OK' if rv.status_code == 200 else 'FAIL'))
    if rv.status_code != 200:
        body = rv.data.decode('utf-8')
        print(f'  Login response body (first 500 chars): {body[:500]}')

    public_routes = ['GET /login', 'GET /logout']
    protected_routes = [
        'GET /', 'GET /dashboard', 'GET /users', 'GET /users/create',
        'GET /users/export', 'GET /courses', 'GET /courses/create',
        'GET /rooms', 'GET /departments', 'GET /teachers', 'GET /teachers/create',
        'GET /teachers/export', 'GET /students', 'GET /students/create',
        'GET /attendance', 'GET /attendance/create', 'GET /history',
        'GET /exams/', 'GET /timetable/',
    ]

    all_ok = True
    for route_str in protected_routes:
        method_str, path = route_str.split(' ', 1)
        method = getattr(client, method_str.lower())
        rv = method(path, follow_redirects=True)
        ok = rv.status_code == 200
        if not ok:
            all_ok = False
        results.append((f'{method_str} {path}', rv.status_code, f'{len(rv.data)}b', 'OK' if ok else 'FAIL'))

    for label, rv in [
        ('API /timetable/api/courses', client.get('/timetable/api/courses')),
        ('API /timetable/api/teachers', client.get('/timetable/api/teachers')),
        ('API /timetable/api/rooms', client.get('/timetable/api/rooms')),
        ('API /exams/api/exams', client.get('/exams/api/exams')),
        ('API /exams/api/departments', client.get('/exams/api/departments')),
    ]:
        ok = rv.status_code == 200
        if not ok:
            all_ok = False
        results.append((label, rv.status_code, f'{len(rv.data)}b', 'OK' if ok else 'FAIL'))

    # Print results
    print(f'Route Verification Report (logged in as {LOGIN_USER})\n')
    print(f'{"Endpoint":40s} {"Status":7s} {"Size":10s} Result')
    print('-' * 70)
    for endpoint, status, size, result in results:
        print(f'{endpoint:40s} {status:<7d} {size:10s} {result}')

    print(f'\nTotal: {len(results)} | Pass: {sum(1 for r in results if r[3]=="OK")} | Fail: {sum(1 for r in results if r[3]!="OK")}')
    return all_ok

if __name__ == '__main__':
    success = test()
    sys.exit(0 if success else 1)
