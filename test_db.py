 8import sqlite3

conn = sqlite3.connect('data.db')
cursor = conn.cursor()
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print("Connected to data.db successfully!")
print("Tables:", [t[0] for t in tables])
conn.close()
