from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import database_service as db
import storage_service as storage
import ai_engine as ai

app = FastAPI(title="NutriCloud API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    db.init_db()
    storage.init_storage()

@app.post("/register")
def register(email: str = Form(...), password: str = Form(...), name: str = Form(...)):
    try:
        user_id = db.execute_query("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", (email, password, name))
        return {"message": "User registered", "user_id": user_id}
    except Exception:
        raise HTTPException(status_code=400, detail="Email already exists")

@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    user = db.fetch_query("SELECT * FROM users WHERE email = ? AND password = ?", (email, password), fetchone=True)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": user['id'], "name": user['name']}

@app.post("/generate-plan")
def generate_plan(user_id: int = Form(...), age: int = Form(...), weight: float = Form(...), 
                  height: float = Form(...), goal: str = Form(...), diet: str = Form(...)):
    
    # 1. Update Profile in DB
    db.execute_query("DELETE FROM profiles WHERE user_id = ?", (user_id,))
    db.execute_query("INSERT INTO profiles (user_id, age, weight, height, goal, diet) VALUES (?, ?, ?, ?, ?, ?)",
                     (user_id, age, weight, height, goal, diet))
    
    # 2. Call AI Engine
    plan = ai.generate_diet_plan(age, weight, height, goal, diet)
    
    # 3. Save Plan to DB
    db.execute_query("INSERT INTO plans (user_id, plan_data) VALUES (?, ?)", (user_id, json.dumps(plan)))
    
    return plan

@app.get("/my-plans/{user_id}")
def get_plans(user_id: int):
    plans = db.fetch_query("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    return [{"id": p['id'], "plan": json.loads(p['plan_data']), "date": p['created_at']} for p in plans]

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    path = storage.upload_file_to_bucket(file.filename, file.file)
    return {"message": f"File securely stored in simulated cloud bucket at {path}"}