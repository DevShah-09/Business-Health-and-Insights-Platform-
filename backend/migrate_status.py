import sqlite3

conn = sqlite3.connect('prod.db')
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(transactions)")
columns = [row[1] for row in cursor.fetchall()]

if 'status' not in columns:
    cursor.execute("ALTER TABLE transactions ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'")
    conn.commit()
    print("Added 'status' column successfully.")
else:
    print("Column 'status' already exists — no changes needed.")

conn.close()
