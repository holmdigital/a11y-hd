# HolmDigital Ecosystem Guide 🌍

Detta dokument beskriver filosofin bakom varje paket i vårt ekosystem och hur de samverkar för att skapa tillgänglighet "by design".

## 📦 Paketen – Vart och ett har ett syfte

### 1. `@holmdigital/standards` (Hjärnan 🧠)
**Varför finns det?**
Lagar och regler (WCAG, EN 301 549, DOS-lagen) är komplexa och ändras. Vi vill inte hårda koda dessa regler i komponenter eller testverktyg.
**Vad gör det?**
Det är en "Single Source of Truth". Det är en ren databas (JSON) som mappar tekniska WCAG-kriterier till juridiska paragrafer.
**Användning:**
```typescript
// Hämtar lagrummet för dålig kontrast
const lag = getEN301549Mapping("1.4.3", "sv"); 
// Svar: "9.1.4.3 i EN 301 549 (DOS-lagen 2 §)"
```

### 2. `@holmdigital/components` (Kroppen 💪)
**Varför finns det?**
Att utbilda varje utvecklare i 50+ WCAG-kriterier är omöjligt. Det är bättre att ge dem verktyg som gör rätt från början.
**Vad gör det?**
En uppsättning React-komponenter (`Button`, `FormField`, `Modal`) som *tvingar* fram tillgänglighet.
**Exempel:**
Du kan inte skapa en `Button` utan text eller label. Den skriker på dig i TypeScript. Du behöver inte tänka på `aria-pressed` eller fokus-ringar – komponenten löser det.

### 3. `@holmdigital/engine` (Vakthunden 🐕)
**Varför finns det?**
Vi behöver verifiera att vi faktiskt följer reglerna, automatiskt och kontinuerligt.
**Vad gör det?**
En testmotor som körs i din CI/CD (GitHub Actions). Den besöker din sida, skannar den mot `@holmdigital/standards`, och stoppar bygget om kritiska fel hittas. Tänk på det som en "stavningskontroll" för tillgänglighet.

### 4. `@holmdigital/chrome-extension` (Mikroskopet 🔬)
**Varför finns det?**
Utvecklare och testare behöver se felen med egna ögon i webbläsaren medan de jobbar.
**Vad gör det?**
Ett tillägg som injicerar "Engine" direkt i din Chrome-flik. Det ritar röda ramar runt felen och ger dig förslag på hur du fixar dem direkt.

---

## 📚 Så använder du Wikin / Documentation Hub

Wikin är inte bara en manual – det är din verktygslåda.

### För Utvecklare 👩‍💻
1.  **Hämta kod:** Gå till **"Core Components"** i sidomenyn. Klicka på t.ex. `Forms`. Kopiera koden från "Usage"-exemplen.
2.  **Förstå varför:** Om din `engine`-scan klagar på "Headings", läs artikeln **"Structure & Content"** för att förstå hur du ska strukturera din HTML.
3.  **CI/CD:** Läs **"CI/CD Integration"** för att kopiera YAML-filen som sätter upp dina automatiska tester.

### För Designers 🎨
1.  **Visuella krav:** Läs **"Standards"**-sektionen. Där ser du krav på kontrast och textstorlek som du måste följa i Figma.
2.  **Interaktion:** Titta på **"Navigation"** och **"Feedback"** för att förstå hur menyer och popups måste bete sig (t.ex. att man måste kunna stänga en popup med ESC).

### För Chefer / Produktägare 👔
1.  **Lagen:** Läs **"Introduction"** och **"Features"** för att förstå vilka lagar (DOS-lagen, EAA) som vi säkrar.
2.  **Risk:** Använd Wikin för att förstå skillnaden mellan "Critical" (blockerande lagbrott) och "Minor" (skönhetsfel).

---

### Sammanfattning
*   **Standards** vet reglerna.
*   **Components** följer reglerna.
*   **Engine** testar reglerna.
*   **Wiki** förklarar reglerna.
