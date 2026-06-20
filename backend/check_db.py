import sqlite3

conn = sqlite3.connect("deepshield.db")
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cur.fetchall()]
print("Tables:", tables)

if "users" in tables:
    cur.execute("SELECT id, email, role, is_active FROM users")
    rows = cur.fetchall()
    print(f"Users ({len(rows)}):")
    for r in rows:
        print(" ", r)
else:
    print("No users table found.")

conn.close()
