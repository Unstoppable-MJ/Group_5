import google.generativeai as genai
import os

# Try to get key from environment or settings
api_key = "AIzaSyDIuU1v-mdPvM3LPymEbtng4nwA1MVP5bY"
genai.configure(api_key=api_key)

output_path = r"d:\Project_Intership\EDA\stock_project\available_models.txt"
with open(output_path, "w") as f:
    f.write(f"Current Dir: {os.getcwd()}\n")
    f.write("Listing all available models:\n")
    try:
        models = list(genai.list_models())
        for m in models:
            f.write(f"- {m.name} (Methods: {m.supported_generation_methods})\n")
    except Exception as e:
        f.write(f"Error listing models: {e}\n")
print(f"Done! Written to {output_path}")
