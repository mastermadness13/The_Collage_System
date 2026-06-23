import sqlite3
conn = sqlite3.connect('C:\\Users\\MD.MASTER\\OneDrive\\Desktop\\collage\\data.db')
conn.execute("UPDATE teachers SET department_id = (SELECT id FROM departments WHERE departments.name = teachers.department) WHERE length(COALESCE(teachers.department, '')) > 0")
conn.commit()
total = conn.execute('SELECT COUNT(*) FROM teachers').fetchone()[0]
filled = conn.execute('SELECT COUNT(*) FROM teachers WHERE department_id IS NOT NULL').fetchone()[0]
print('Total teachers:', total)
print('With department_id set:', filled)
conn.close()
