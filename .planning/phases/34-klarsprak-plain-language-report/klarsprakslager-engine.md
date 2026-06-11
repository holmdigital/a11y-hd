# Klarspråkslager för @holmdigital/engine

Ett textlager som ligger bredvid den tekniska skanningen och översätter varje brist till något en e-handlare förstår och kan agera på. Den råa skanningen finns kvar för utvecklare. Det här är det vi faktiskt skickar till kunden.

---

## Grundprincipen: igenkänning, inte skam

Den största anledningen till att en rapport landar fel är inte att den är teknisk. Det är att den känns som en anklagelse.

Mottagaren ska känna igen sig och slippa skämmas. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak. Felet är inte att de gjort fel, felet är att ingen sagt det förrän nu.

Hela tonen utgår från: du har inte gjort fel, du har bara inte fått veta. Nu vet du, här är vad som är värt att börja med.

---

## Tre saker varje rad ska svara på

1. Vad är det som händer på din sida, i klartext
2. Vem av dina kunder drabbas, och vad det kostar dig i förlorade köp
3. Vad du gör åt det, konkret nästa steg

Affärsnyttan kommer före tekniken. Säg vad det kostar innan du säger vad det är.

---

## Datastruktur i engine

Varje regel får ett `plain`-objekt bredvid det tekniska:

```ts
interface PlainCopy {
  rubrik: string;        // vad det handlar om, utan facktermer
  vadHander: string;     // vad som faktiskt är fel på sidan
  vemPaverkas: string;   // vilka av kundens besökare
  affarsrisk: string;    // vad det kostar i köp, kunder, ranking
  saFixarDu: string;     // konkret nästa steg
  allvarlighet: Allvarlighet;
}

type Allvarlighet =
  | "stoppar-kop"   // kunden kan inte slutföra köpet
  | "hindrar"       // kunden kämpar, många ger upp
  | "forsamrar"     // friktion, en del faller ifrån
  | "putsning";     // mindre, men värt att fixa
```

Allvarlighetsgraden visas i klartext för kunden, aldrig som "nivå A/AA":

| Kod | Visas som | Betyder |
|---|---|---|
| stoppar-kop | Stoppar köp | Kunden kommer inte vidare |
| hindrar | Hindrar kunder | Många ger upp på vägen |
| forsamrar | Försämrar upplevelsen | En del faller ifrån |
| putsning | Värt att putsa | Litet, men enkelt att rätta |

---

## Exempeltexter

Det här är texterna som kan ligga i engine, en per vanlig brist hos e-handlare.

### Produktbilderna saknar beskrivning
- **Vad händer:** Bilderna på sajten har ingen textbeskrivning i koden. En besökare med skärmläsare hör bara ordet "bild", inte vad bilden visar.
- **Vem påverkas:** Kunder med synnedsättning, men också Google, som läser bildtexten för att förstå vad du säljer.
- **Affärsrisk:** Produkter utan beskrivning blir osynliga både för skärmläsare och sökmotorer. Du tappar kunder och ranking på samma gång.
- **Så fixar du:** Lägg en kort beskrivning på varje produktbild, till exempel "Stickad ylletröja i grått". Det tar några sekunder per bild.
- **Allvarlighet:** Hindrar kunder

### Knapptexten är för svag mot bakgrunden
- **Vad händer:** Texten på knappar och länkar har för låg kontrast mot bakgrunden för att alla ska kunna läsa den.
- **Vem påverkas:** Personer med nedsatt syn, äldre, och alla som handlar på mobilen i solljus.
- **Affärsrisk:** Om kunden inte ser "Lägg i varukorg" tydligt så klickar hen inte. Svag kontrast på just köpknappen är dyrt.
- **Så fixar du:** Gör texten mörkare eller bakgrunden ljusare tills kontrasten räcker. Vi anger exakt vilka färger som behöver justeras.
- **Allvarlighet:** Försämrar upplevelsen

### Fälten i kassan saknar tydliga etiketter
- **Vad händer:** Inmatningsfälten i kassan har ingen kopplad etikett. Det syns kanske en grå text i fältet, men den försvinner så fort man börjar skriva.
- **Vem påverkas:** Alla som använder skärmläsare, och den som blir avbruten mitt i ifyllningen och tappar bort var hen var.
- **Affärsrisk:** Kassan är där pengarna finns. Varje hinder här ger övergivna varukorgar.
- **Så fixar du:** Sätt en synlig etikett ovanför varje fält, till exempel "Postnummer", som ligger kvar hela tiden.
- **Allvarlighet:** Stoppar köp

### Länkar som bara säger "läs mer"
- **Vad händer:** Flera länkar saknar beskrivande text och säger bara "läs mer" eller "klicka här".
- **Vem påverkas:** Den som hoppar mellan länkar med tangentbord eller skärmläsare får en lista med "läs mer, läs mer, läs mer" utan att veta vart de leder.
- **Affärsrisk:** Förvirrade besökare klickar inte. Google premierar dessutom länkar som beskriver vad de leder till.
- **Så fixar du:** Byt "läs mer" mot vad länken faktiskt leder till, till exempel "Se hela vinterkollektionen".
- **Allvarlighet:** Försämrar upplevelsen

### Ikonknappar utan namn
- **Vad händer:** Knappar som bara visas som en ikon, till exempel varukorgen eller sök, har inget namn i koden.
- **Vem påverkas:** En skärmläsare läser upp "knapp" utan att säga vad den gör. Kunden vågar inte trycka.
- **Affärsrisk:** Om varukorgsknappen är namnlös vet kunden inte hur hen tar sig till kassan.
- **Så fixar du:** Ge varje ikonknapp ett namn i koden, till exempel "Öppna varukorgen". Det syns inte visuellt men läses upp.
- **Allvarlighet:** Hindrar kunder

### Sajten går inte att använda utan mus
- **Vad händer:** Delar av sajten går inte att nå med bara tangentbordet, och det syns inte var man befinner sig när man hoppar runt.
- **Vem påverkas:** Personer som av olika skäl inte använder mus, och alla som föredrar tangentbord för att handla snabbt.
- **Affärsrisk:** Om en meny eller knapp inte går att nå med tangentbord så är den stängd för den kunden, helt enkelt.
- **Så fixar du:** Se till att allt klickbart går att nå med tab-tangenten, och att det syns tydligt var fokus ligger.
- **Allvarlighet:** Hindrar kunder

### Rubrikerna hänger inte ihop
- **Vad händer:** Rubrikerna på sidan följer ingen ordning i koden, så sidans struktur går inte att läsa av.
- **Vem påverkas:** Skärmläsaranvändare navigerar via rubriker, ungefär som via en innehållsförteckning. Utan ordning blir det en enda röra.
- **Affärsrisk:** En svårnavigerad sida betyder att kunden inte hittar produkten och lämnar.
- **Så fixar du:** Bygg rubrikerna i ordning, en huvudrubrik och underrubriker under den, precis som i ett dokument.
- **Allvarlighet:** Värt att putsa

### Sidan säger inte vilket språk den är på
- **Vad händer:** Koden talar inte om att sidan är på svenska.
- **Vem påverkas:** En skärmläsare läser då upp svensk text med engelskt uttal, vilket blir obegripligt.
- **Affärsrisk:** Kunden förstår inte vad som läses upp och ger upp.
- **Så fixar du:** Lägg till en rad i koden som anger svenska som språk. En enda rad, och den gäller hela sajten.
- **Allvarlighet:** Värt att putsa

---

## Tonregler (fingerprint)

- Du-tilltal hela vägen. Skriv "din kund", aldrig "användaren".
- Ingen facketerm utan att den förklaras i samma mening.
- Aldrig skuldbeläggande. Aldrig "du har gjort fel", alltid "du har inte fått veta förrän nu".
- Affärsnytta före teknik. Vad det kostar kommer före vad det är.
- Konkret nästa steg på varje rad. Aldrig bara konstatera att något är fel.
- Inga tankstreck. Korta stycken, gott om luft.

---

## Rapportens öppning

Den första texten kunden möter sätter tonen för allt annat:

> De flesta sajter vi skannar har mellan 15 och 40 sådana här punkter. Det betyder inte att du gjort något fel. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak.
>
> Nu vet du. Här är vad som är värt att börja med, sorterat efter vad som kostar dig mest kunder.

Det är samma rörelse som hela poängen: någon fick veta, och då rättar man till det.
