---
"@holmdigital/engine": patch
---

Intern #63 och #66 — lagraden upprepar inte längre namnet, och 14 länder får rättad lagdata i utlåtandet.

Lagdatan rättades i `@holmdigital/standards` (41 fältändringar, se dess changeset). Motorn plockar upp allt automatiskt, men två poster började rendera namnet **två gånger i rad** när fälten efter attesteringen råkade säga samma sak:

```
Lov om tilgængelighedskrav for produkter og tjenester (Lov om tilgængelighedskrav for produkter og tjenester)
Accessible Canada Act (S.C. 2019, c. 10) (Accessible Canada Act)
```

Båda fälten var var för sig korrekta mot primärkälla, så **felet syntes inte i någon datadiff.** Det syntes när dokumentet renderades.

`resolveNationalLawReference` utelämnar nu parentesen när kortnamnet är ett **prefix** av det långa, eftersom den då inte bär någon ny information. Regeln fångade två fall utöver de uppenbara: `pt-eaa` där kortnamnet plus ` de 6 de dezembro` blev det långa, och `dk-wad` där `law` är en ren avkortning. `(DOS-lagen)` och `(DL 83/2018)` är inga prefix och står kvar, vilket är hela poängen.

Två nya tester: ett som sveper 16 länder × 2 sektorer efter upprepningar, och ett som hindrar att dedupliceringen äter upp parentesen där den bär information.
