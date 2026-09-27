import sqlite3
import json

DB_FILE = "cloud_database.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT)''')
    # Profiles table
    c.execute('''CREATE TABLE IF NOT EXISTS profiles 
                 (user_id INTEGER, age INTEGER, weight REAL, height REAL, goal TEXT, diet TEXT)''')
    # Diet Plans table
    c.execute('''CREATE TABLE IF NOT EXISTS plans 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, plan_data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def execute_query(query, params=()):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(query, params)
    conn.commit()
    return c.lastrowid

def fetch_query(query, params=(), fetchone=False):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(query, params)
    result = c.fetchone() if fetchone else c.fetchall()
    conn.close()
    return dict(result) if result and fetchone else [dict(row) for row in result]