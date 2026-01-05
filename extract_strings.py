import json

with open(r'd:\a11y-hd-project\packages\standards\data\rules.nl.json', 'r', encoding='utf-8') as f:
    rules = json.load(f)

unique_texts = set()
for r in rules:
    if 'holmdigitalInsight' in r and 'dutchInterpretation' in r['holmdigitalInsight']:
        unique_texts.add(r['holmdigitalInsight']['dutchInterpretation'])

print(f"Found {len(unique_texts)} unique strings.")
for t in unique_texts:
    print(f"--- {t}")
