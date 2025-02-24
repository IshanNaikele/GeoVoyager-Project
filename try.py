import pandas as pd
import random

# Load dataset
data = pd.read_csv("Data/Countries.csv")

# Function to generate a random question
def generate_question():
    row = data.sample(1).iloc[0]  # Pick a random country
    country = row["country_name"]
    capital = row["capital_city"]
    currency = row["currency"]
    continent = row["continent"]
    area = row["area"]

    # Define question formats (removed "NOT a capital city" question)
    question_types = [
        (f"What is the capital of {country}?", capital, data["capital_city"]),
        (f"Which country uses {currency} as its currency?", country, data["country_name"]),
        (f"Which continent does {country} belong to?", continent, data["continent"]),
        (f"Which currency is used in {capital}?", currency, data["currency"]),
         
        (f"What is the total area of {country}?", area, data["area"]),
        (f"Which of these countries is in {continent}?", country, data["country_name"])
    ]

    # Select a random question type
    question, correct_answer, option_column = random.choice(question_types)

    # Ensure unique wrong answers
    options = set()
    while len(options) < 3:
        wrong_answer = option_column.sample(1).iloc[0]
        if wrong_answer != correct_answer:  # Ensure wrong answer is different from the correct answer
            options.add(wrong_answer)

    options = list(options)  # Convert set to list
    options.append(correct_answer)  # Add the correct answer
    random.shuffle(options)  # Shuffle options

    return question, options, correct_answer

# Generate and display 10 questions
for i in range(10):
    question, options, correct_answer = generate_question()
    print(f"\nQ{i+1}: {question}")
    for j, option in enumerate(options, 1):
        print(f"   {j}. {option}")
    print(f"(Correct Answer: {correct_answer})")  # Hidden in actual game
