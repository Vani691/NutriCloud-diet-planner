import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def fallback_engine(goal, diet):
    """Local rule-based engine if Cloud API fails."""
    return {
        "breakfast": "Oatmeal with fruits and nuts" if diet != "keto" else "Scrambled eggs with spinach",
        "lunch": "Grilled chicken salad" if diet == "omnivore" else "Lentil soup with quinoa",
        "snack": "Greek yogurt" if diet != "vegan" else "Handful of almonds",
        "dinner": "Baked salmon with asparagus" if diet == "omnivore" else "Tofu stir-fry with broccoli",
        "macros": [
            {"name": "Protein", "value": 30},
            {"name": "Carbs", "value": 45},
            {"name": "Fats", "value": 25}
        ],
        "nutrition_summary": f"Estimated for {goal} goal. Approx 1800-2200 kcal. Stay hydrated!"
    }

def generate_diet_plan(age, weight, height, goal, diet):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Using Local Fallback Engine")
        return fallback_engine(goal, diet)
    
    try:
        client = Groq(api_key=api_key)
        prompt = f"""
        Act as an AI Dietitian. Generate a 1-day meal plan for a {age}yo, {weight}kg, {height}cm tall person. Goal: {goal}. Diet: {diet}.
        Respond STRICTLY in JSON format with exact keys: "breakfast", "lunch", "snack", "dinner", "nutrition_summary", and "macros" (an array of 3 objects with "name" [Protein, Carbs, Fats] and "value" [integer percentages]).
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Cloud AI Failed: {e}. Switching to Fallback.")
        return fallback_engine(goal, diet)