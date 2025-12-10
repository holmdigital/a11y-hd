# 🧪 Testmiljö & Verifiering

Här beskrivs hur du sätter upp miljön för att testa hela ekosystemet, från regulatoriska data till CLI-scanning.

## 🏁 Snabbstart (End-to-End)

Vi använder vår egen **Wiki** som testobjekt eftersom den innehåller en dedikerad testsida (`/test-flight`) med både fel och korrekta komponenter.

### 1. Bygg hela projektet
Först måste vi bygga alla paket så att de kan användas av varandra.

```bash
# I roten
npm install
npm run build
```

*Detta kompilerar standards, components och engine.*

### 2. Starta Wikin (Test Target)
Öppna en **ny terminal** och kör:

```bash
# I roten
npm run dev --workspace=holmdigital-wiki
```
Wikin startar nu på `http://localhost:3000`.

### 3. Kör Scannern
Gå tillbaka till din **första terminal** och kör scannern mot testsidan:

```bash
# I roten
npx hd-a11y-scan http://localhost:3000/test-flight
```

---

## 🧐 Vad du ska förvänta dig

När du kör scannern mot `/test-flight` kommer du se följande output:

### ❌ Förväntade Fel
Scannern bör flagga fel i den röda sektionen "Avsiktliga Fel":
- **Color Contrast**: På den grå knappen.
- **Labels**: På input-fältet utan label.
- **Alt-text**: På bilden utan alt-attribut.
- **Keyboard**: På `div`-elementet som agerar knapp.

### ✅ Preskriptiva Lösningar
För varje fel ska du se en rekommendation:
> 💡 **Prescriptive Fix:** Use component: **@holmdigital/components/Button**

### 🧪 Pseudo-automation
Om du kör med flaggan `--generate-tests`:
```bash
npx hd-a11y-scan http://localhost:3000/test-flight --generate-tests
```
...ska du se genererad Playwright-kod för att testa tangentbordsnavigationen på div-knappen.

---

## 🛠️ Enhetstester

För att köra enhetstester för logiken i paketen:

```bash
# Alla paket
npm run test

# Specifikt paket
npm run test --workspace=@holmdigital/standards
npm run test --workspace=@holmdigital/engine
```

## 🐛 Felsökning

**Wikin hittar inte paketen?**
- Säkerställ att du kört `npm run build` i roten. Next.js behöver de byggda JS-filerna från `dist`-mapparna.

**Scannern kör inte?**
- Säkerställ att du står i roten när du kör `npx hd-a11y-scan`.
- Om det krånglar, försök bygga engine specifikt: `npm run build --workspace=@holmdigital/engine`.
