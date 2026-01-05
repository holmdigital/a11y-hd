import json
import os

file_path = r'd:\a11y-hd-project\packages\standards\data\rules.nl.json'

translations = {
    "One of the most common reasons for fines from regulators. Especially important for public sector monitoring.": 
    "Een van de meest voorkomende redenen voor boetes van toezichthouders. Vooral belangrijk voor monitoring van de publieke sector.",

    "Keyboard access is fundamental and non-negotiable. Top priority in compliance audits.":
    "Toetsenbordtoegang is fundamenteel en niet onderhandelbaar. Hoogste prioriteit bij compliance-audits.",

    "Especially important for logos and informational graphics. Frequently checked in audits.":
    "Vooral belangrijk voor logo's en informatieve afbeeldingen. Vaak gecontroleerd bij audits.",

    "Forms are critical for e-services. Compliance is strictly enforced in public sector apps.":
    "Formulieren zijn essentieel voor e-services. Naleving wordt strikt gehandhaafd in apps van de publieke sector.",

    "Important for navigation, especially in SPAs where the title must update dynamically.":
    "Belangrijk voor navigatie, vooral in SPA's waar de titel dynamisch moet worden bijgewerkt.",
    
    "Semantic structure is crucial for screen readers to navigate effectively. Auditors often cite 'div-soup' that looks like structure but lacks semantics.":
    "Semantische structuur is cruciaal voor schermlezers om effectief te navigeren. Auditors citeren vaak 'div-soup' die op structuur lijkt maar semantiek mist.",

    "Common problem in graphs and maps where only color coding is used.":
    "Veelvoorkomend probleem in grafieken en kaarten waar alleen kleurcodering wordt gebruikt.",

    "A modern requirement (WCAG 2.1) critical for mobile use and magnified text. DIGG has zero tolerance for horizontal scroll on vertical sites.":
    "Een moderne eis (WCAG 2.1), essentieel voor mobiel gebruik en vergrote tekst. Logius heeft nultolerantie voor horizontaal scrollen op verticale sites.",

    "Often missed requirement regarding focus rings and inactive (but visible) components. Important for understanding the interface.":
    "Vaak gemiste eis betreffende focusringen en inactieve (maar zichtbare) componenten. Belangrijk voor het begrijpen van de interface.",

    "Important for dyslexia adaptations.":
    "Belangrijk voor aanpassingen voor dyslexie.",

    "Common problem with custom tooltips and mega-menus.":
    "Veelvoorkomend probleem bij aangepaste tooltips en megamenu's.",

    "One of the most common deficiencies in the public sector. The legal requirement is strict: video with audio MUST have captions.":
    "Een van de grootste tekortkomingen in de publieke sector. De wettelijke eis is strikt: video met audio MOET ondertiteling hebben.",

    "Can often be solved by 'integrated description' (talking about what is seen), which is more cost-effective.":
    "Kan vaak worden opgelost door 'geïntegreerde beschrijving' (praten over wat er te zien is), wat kosteneffectiever is.",

    "Important for tablets and users who have the device mounted (e.g., wheelchair).":
    "Belangrijk voor tablets en gebruikers die het apparaat gemonteerd hebben (bijv. rolstoel).",

    "Makes it much easier to fill confusing forms (autofill).":
    "Maakt het invullen van verwarrende formulieren veel makkelijker (autofill).",

    "A keyboard trap is a 'blocker' that makes the website unusable. Serious error.":
    "Een toetsenbordval is een 'blocker' die de website onbruikbaar maakt. Ernstige fout.",

    "Important for voice control users (Dragon etc.) where single words can trigger commands accidentally.":
    "Belangrijk voor gebruikers van spraakbesturing (Dragon enz.) waarbij enkele woorden per ongeluk commando's kunnen activeren.",

    "Critical for e-services/banking. Users who read slowly or use assistive technology need more time.":
    "Kritiek voor e-services/bankieren. Gebruikers die langzaam lezen of ondersteunende technologie gebruiken, hebben meer tijd nodig.",

    "Health risk. Zero tolerance.":
    "Gezondheidsrisico. Nultolerantie.",
    
    "Crucial for keyboard navigation order. Often broken by CSS positioning (flex-order etc).":
    "Cruciaal voor de volgorde van toetsenbordnavigatie. Vaak verbroken door CSS-positionering (flex-order enz.).",

    "Important for screen reader users to understand the context of links (e.g. 'Read more').":
    "Belangrijk voor schermlezergebruikers om de context van links te begrijpen (bijv. 'Lees meer').",

    "Titles are critical for users to find their way around the page.":
    "Koppen zijn cruciaal voor gebruikers om hun weg op de pagina te vinden.",

    "Language settings are critical for correct pronunciation by screen readers.":
    "Taalinstellingen zijn cruciaal voor een correcte uitspraak door schermlezers.",
    
    "Critical for users who input data. Legal requirement for GDPR and e-commerce.":
    "Kritiek voor gebruikers die gegevens invoeren. Wettelijke vereiste voor AVG en e-commerce.",
    
    "Syntax errors can break assistive technologies.":
    "Syntaxisfouten kunnen ondersteunende technologieën breken.",
    
    "Custom components must behave like standard HTML elements.":
    "Aangepaste componenten moeten zich gedragen als standaard HTML-elementen."
}

with open(file_path, 'r', encoding='utf-8') as f:
    rules = json.load(f)

count = 0
for rule in rules:
    if 'holmdigitalInsight' in rule and 'dutchInterpretation' in rule['holmdigitalInsight']:
        original = rule['holmdigitalInsight']['dutchInterpretation']
        if original in translations:
            rule['holmdigitalInsight']['dutchInterpretation'] = translations[original]
            count += 1
        else:
            # Fallback text generic replacement
            text = original.replace("DIGG", "Logius").replace("regulators", "toezichthouders").replace("public sector", "publieke sector")
            rule['holmdigitalInsight']['dutchInterpretation'] = text

print(f"Translated {count} rules specifically.")

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(rules, f, indent=4, ensure_ascii=False)
