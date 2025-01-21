import sqlite3

# Connect to the SQLite database
conn = sqlite3.connect('tasks.db')
cursor = conn.cursor()

# Check if the 'task' table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='task';")
print(cursor.fetchone())  # Should return ('task',) if the table exists

# Close the connection
conn.close()
