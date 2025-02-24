import pandas as pd

# Load CSV
data = pd.read_csv("Data/preprocessed_data.csv")

# Convert to JSON
data.to_json("Data/preprocessed_data.json", orient="records")
