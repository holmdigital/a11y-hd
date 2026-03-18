import React from 'react';
import {
    getStatementToolsByCountry,
    getEnforcementBody,
    getNationalLawByFramework,
    type Country
} from '@holmdigital/standards';
import { BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT } from './locale-chrome';

/**
 * Props för AccessibilityStatement-komponenten
 */
export interface AccessibilityStatementProps {
    /**
     * Landskod (SE, NO, DK, FI, DE, FR, ES, IE)
     */
    country: Country;

    /**
     * Sektor avgör om WAD (public) eller EAA (private) tillämpas
     */
    sector: 'public' | 'private';

    /**
     * Organisationens namn
     */
    organizationName: string;

    /**
     * Webbplatsens URL
     */
    websiteUrl: string;

    /**
     * Efterlevnadsnivå
     */
    complianceLevel: 'full' | 'partial' | 'non-compliant';

    /**
     * Datum för senaste granskning
     */
    lastReviewDate: Date;

    /**
     * Kontakt-e-post för tillgänglighetsfrågor
     */
    contactEmail: string;

    /**
     * Datum för när bedömningen gjordes (viktigt för Digg)
     */
    assessmentDate?: Date;

    /**
     * Metod för utvärdering (t.ex. "Automatiserad granskning", "Självskattning")
     */
    evaluationMethod?: string;

    /**
     * (Valfritt) Anpassat verktyg som användes för att generera rapporten
     * Ersätter standardverktyget (t.ex. Digg) om angivet
     */
    generatorTool?: {
        name: string;
        url: string;
    };

    /**
     * (Valfritt) URL eller Base64-sträng för logotyp
     */
    logoUrl?: string;

    /**
     * (Valfritt) Lista över kända problem
     */
    nonComplianceItems?: string[];

    /**
     * (Valfritt) Språk för datumformatering
     * @default 'en'
     */
    locale?: string;

    /**
     * (Valfritt) Extra CSS-klass
     */
    className?: string;

    /**
     * (Valfritt) Telefonnummer för kontakt
     */
    phoneNumber?: string;

    /**
     * (Valfritt) Normal svarstid (t.ex. "2 dagar")
     */
    responseTime?: string;
    /**
     * (Valfritt) URL för tillgänglighets-badge
     */
    badgeUrl?: string;
    /**
     * (Valfritt) Datum för när webbplatsen publicerades
     */
    publishDate?: Date;
}


interface TemplateSection {
    id?: string;
    title: string;
    content: string;
}

interface StatementTemplate {
    title: string;
    intro: string;
    sections: TemplateSection[];
}

// Template logic is now handled in a more flexible way to support externalized templates
// In a real application, these might be loaded from JSON files during build or runtime
const TEMPLATES: Record<string, StatementTemplate> = {
    sv: {
        title: "Tillgänglighet för {<webbplats>}",
        intro: "{<organisation>} står bakom den här webbplatsen. Vi vill att så många som möjligt ska kunna använda den. Det här dokumentet beskriver hur {<webbplats>} uppfyller {<national_law>}, eventuella kända tillgänglighetsproblem och hur du kan rapportera brister till oss så att vi kan åtgärda dem.",
        sections: [
            { id: "how-accessible", title: "Hur tillgänglig är webbplatsen?", content: "{Vi har inga kända brister i tillgängligheten för den här webbplatsen./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information./Vi är medvetna om att delar av webbplatsen inte är helt tillgängliga. Se avsnittet om innehåll som inte är tillgängligt nedan för mer information.}" },
            { id: "what-to-do", title: "Vad kan du göra om du inte kan använda delar av webbplatsen?", content: "Om du behöver innehåll från {<webbplats>} som inte är tillgängligt för dig, men som är undantaget från lagens tillämpningsområde enligt beskrivning nedan, kan du meddela oss.\n\n[Svarstiden är normalt {<svarstid>}.]\n\n[Du kan också kontakta oss på följande sätt:\n\n* skicka e-post till {<e-postadress>}\n* ring {<telefonnummer>}]" },
            { id: "reporting", title: "Rapportera brister i webbplatsens tillgänglighet", content: "Vi strävar hela tiden efter att förbättra webbplatsens tillgänglighet. Om du upptäcker problem som inte är beskrivna på den här sidan, eller om du anser att vi inte uppfyller lagens krav, meddela oss så att vi får veta att problemet finns." },
            { id: "enforcement", title: "Tillsyn", content: "{<enforcement_body>} har ansvaret för tillsyn över {<national_law>}. Du kan anmäla till {<enforcement_body>} om du tycker att vår digitala service har brister i tillgänglighet.\n\nDu kan också anmäla till {<enforcement_body>} om du tycker att vår bedömning av vad som är oskäligt betungande ska granskas, om du tycker att vår tillgänglighetsredogörelse har brister eller om du tycker att vi inte har hanterat din begäran om tillgängliggörande korrekt." },
            { id: "technical", title: "Teknisk information om webbplatsens tillgänglighet", content: "{Den här webbplatsen är helt förenlig med {<national_law>}./Den här webbplatsen är delvis förenlig med {<national_law>}, på grund av de brister som beskrivs nedan./Den här webbplatsen är inte förenlig med {<national_law>}. Otillgängliga delar beskrivs nedan.}" },
            { id: "non-accessible", title: "Innehåll som inte är tillgängligt", content: "Det innehåll som beskrivs nedan är på ett eller annat sätt inte helt tillgängligt.\n\n[\n### Bristande förenlighet med lagkraven\n{<brister>}\n]" },
            { id: "testing", title: "Hur vi testat webbplatsen", content: "{Vi har gjort en självskattning (intern testning) av {<webbplats>}./{<extern aktör>} har gjort en oberoende granskning av {<webbplats>}./Vi har uppskattat tillgängligheten utan granskning.}\n\nSenaste bedömningen gjordes den {<bedömningsdatum>}.\n\n[Granskningsmetod: {<metod>}]\n\nWebbplatsen publicerades den {<publiceringsdatum>}.\n\nRedogörelsen uppdaterades senast den {<uppdateringsdatum>}." }
        ]
    },
    en: {
        title: "Accessibility of {<website>}",
        intro: "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with {<national_law>}, any known accessibility issues, and how you can report problems so that we can fix them.",
        sections: [
            { id: "how-accessible", title: "How accessible is the website?", content: "{There are no known accessibility issues with this website./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren’t fully accessible. See the section on non-accessible content below for more information.}" },
            { id: "what-to-do", title: "What to do if you can’t access parts of this website?", content: "If you need content from this website that is not accessible for you, but is not within the scope of {<national_law>} as described below, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]" },
            { id: "reporting", title: "Reporting accessibility problems with this website", content: "We’re always looking to improve the accessibility of this website. If you find any problems that aren’t listed on this page or if we’re not meeting the requirements of {<national_law>}, contact us and let us know about the problem." },
            { id: "enforcement", title: "Enforcement procedure", content: "The {<enforcement_body>} is responsible for enforcing {<national_law>}. If you experience accessibility issues on our website, you can submit a complaint to {<enforcement_body>}.\n\nYou can also submit a complaint to {<enforcement_body>} if you think that our assessment of what constitutes a disproportionate burden should be reviewed, if you think that our accessibility statement is inadequate, or if you think that your request for excluded content in an accessible format has not been handled correctly." },
            { id: "technical", title: "Technical information about this website’s accessibility", content: "{This website is fully compliant with {<national_law>}./This website is partially compliant with {<national_law>}, due to the non-compliances listed below./This website is not compliant with {<national_law>}. The non-accessible sections are listed below.}" },
            { id: "non-accessible", title: "Non-accessible content", content: "The content described below is, in one way or another, not fully accessible.\n\n[\n### Non-compliance with {<national_law>}\n\n{<issues>}\n]" },
            { id: "testing", title: "How we tested this website", content: "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}." }
        ]
    },
    no: {
        title: "Tilgjengelighet for {<nettsted>}",
        intro: "{<organisasjon>} står bak dette nettstedet. Vi ønsker at flest mulig skal kunne bruke det. Dette dokumentet beskriver hvordan {<nettsted>} oppfyller {<national_law>}, eventuelle kjente tilgjengelighetsproblemer og hvordan du kan rapportere mangler til oss slik at vi kan utbedre dem.",
        sections: [
            { id: "how-accessible", title: "Hvor tilgjengelig er nettstedet?", content: "{Vi har ingen kjente mangler i tilgjengeligheten for dette nettstedet./Vi er klar over at deler av nettstedet ikke er fullt ut tilgjengelig. See avsnittet om innhold som ikke er tilgjengelig nedenfor for mer informasjon./Vi er klar over at deler av nettstedet ikke er fullt ut tilgjengelig. See avsnittet om innhold som ikke er tilgjengelig nedenfor for mer informasjon.}" },
            { id: "what-to-do", title: "Hva kan du gjøre hvis du ikke kan bruke deler av nettstedet?", content: "Hvis du trenger innhold fra {<nettsted>} som ikke er tilgjengelig for deg, men som er unntatt fra lovens anvendelsesområde som beskrevet nedenfor, kan du melde fra til oss.\n\n[Svartiden er normalt {<svartid>}.]\n\n[Du kan også kontakte oss på følgende måter:\n\n* send e-post til {<e-postadresse>}\n* ring {<telefonnummer>}]" },
            { id: "reporting", title: "Rapporter mangler ved nettstedets tilgjengelighet", content: "Vi jobber kontinuerlig med å forbedre nettstedets tilgjengelighet. Hvis du oppdager problemer som ikke er beskrevet på denne siden, eller hvis du mener at vi ikke oppfyller lovens krav, meld fra til oss slik at vi får vite om problemet." },
            { id: "enforcement", title: "Tillsyn", content: "{<enforcement_body>} har ansvaret for tilsyn med {<national_law>}. Du kan klage til {<enforcement_body>} hvis du mener at vår digitale tjeneste har mangler i tilgjengelighet.\n\nDu kan også klage til {<enforcement_body>} hvis du mener at vår vurdering av hva som er uforholdsmessig byrdefullt bør overproves, hvis du mener at vår tilgjengelighetserklæring har mangler eller hvis du mener at vi ikke har håndtert din forespørsel om tilgjengeliggjøring korrekt." },
            { id: "technical", title: "Teknisk informasjon om nettstedets tilgjengelighet", content: "{Dette nettstedet er helt i samsvar med {<national_law>}./Dette nettstedet er delvis i samsvar med {<national_law>}, på grunn av manglene beskrevet nedenfor./Dette nettstedet er ikke i samsvar med {<national_law>}. Utilgjengelige deler er beskrevet nedenfor.}" },
            { id: "non-accessible", title: "Innhold som ikke er tilgjengelig", content: "Innholdet som er beskrevet nedenfor er på en eller annen måte ikke fullt ut tilgjengelig.\n\n[\n### Manglende samsvar med lovkravene\n{<mangler>}\n]" },
            { id: "testing", title: "Hvordan vi har testet nettstedet", content: "{Vi har gjort en egenevaluering (intern testing) av {<nettsted>}./{<ekstern aktor>} har gjort en uavhengig revisjon av {<nettsted>}./Vi har anslått tilgjengeligheten uten testing.}\n\nSiste vurdering ble gjort den {<vurderingsdato>}.\n\n[Vurderingsmetode: {<metode>}]\n\nNettstedet ble publisert den {<publiseringsdato>}.\n\nErklæringen ble sist oppdatert den {<oppdateringsdato>}." }
        ]
    },
    da: {
        title: "Tilgængelighed for {<webbplats>}",
        intro: "{<organisation>} står bag dette websted. Vi ønsker, at så mange som muligt skal kunne bruge det. Dette dokument beskriver, hvordan {<webbplats>} overholder {<national_law>}, eventuelle kendte tilgængelighedsproblemer, og hvordan du kan rapportere mangler til os, så vi kan udbedre dem.",
        sections: [
            { id: "how-accessible", title: "Hvor tilgængeligt er webstedet?", content: "{Vi har ingen kendte mangler i tilgængeligheden for dette websted./Vi er opmærksomme på, at dele af webstedet ikke er helt tilgængelige. Se afsnittet om indhold, der ikke er tilgængeligt nedenfor for mere information./Vi er opmærksomme på, at dele af webstedet ikke er helt tilgængelige. Se afsnittet om indhold, der ikke er tilgængeligt nedenfor for mer information.}" },
            { id: "what-to-do", title: "Hvad kan du gøre, hvis du ikke kan bruge dele af webstedet?", content: "Hvis du har brug for indhold fra {<webbplats>}, som ikke er tilgængeligt for dig, men som er undtaget fra lovens område som beskrevet nedenfor, kan du meddele os det.\n\n[Svartiden er normalt {<svartid>}.]\n\n[Du kan også kontakte os på følgende måder:\n\n* send e-mail til {<e-mailadresse>}\n* ring {<telefonnummer>}]" },
            { id: "reporting", title: "Rapporter mangler i webstedets tilgængelighed", content: "Vi stræber hele tiden efter at forbedre webstedets tilgængelighed. Hvis du opdager problemer, der ikke er beskrevet på denne side, eller hvis du mener, at vi ikke overholder lovens krav, skal du give os besked, så vi ved, at problemet eksisterer." },
            { id: "enforcement", title: "Håndhævelsesprocedure", content: "{<enforcement_body>} har ansvaret for tilsyn med {<national_law>}. Du kan klage til {<enforcement_body>}, hvis du mener, at vores digitale service har mangler i tilgængeligheden.\n\nDu kan også klage til {<enforcement_body>}, hvis du mener, at vores vurdering af, hvad der er en uforholdsmæssig stor byrde, skal gennemgås, hvis du mener, at vores tilgængelighedserklæring har mangler, eller hvis du mener, at vi ikke har håndteret din anmodning om tilgængeliggørelse korrekt." },
            { id: "technical", title: "Teknisk information om webstedets tilgængelighed", content: "{Dette websted er fuldt ud i overensstemmelse med {<national_law>}./Dette websted er delvist i overensstemmelse med {<national_law>} på grund af de mangler, der er beskrevet nedenfor./Dette websted er ikke i overensstemmelse med {<national_law>}. Utilgængelige dele er beskrevet nedenfor.}" },
            { id: "non-accessible", title: "Indhold der ikke er tilgængeligt", content: "Det indhold, der er beskrevet nedenfor, er på den ene eller anden måde ikke helt tilgængeligt.\n\n[\n**Manglende overholdelse af lovkravene**\n\n{<mangler>}\n]" },
            { id: "testing", title: "Hvordan vi har testet webstedet", content: "{Vi har foretaget en selvvurdering (intern test) af {<webbplats>}./{<ekstern aktør>} har foretaget en uafhængig gennemgang af {<webbplats>}./Vi har anslået tilgængeligheden uden test.}\n\nDen seneste vurdering blev foretaget den {<vurderingsdato>}.\n\n[Vurderingsmetode: {<metode>}]\n\nWebstedet blev offentliggjort den {<offentliggørelsesdato>}.\n\nErklæringen blev senest opdateret den {<opdateringsdato>}." }
        ]
    },
    de: {
        title: "Barrierefreiheitserklärung für {<webbplats>}",
        intro: "{<organisation>} ist bemüht, ihre Website im Einklang mit den nationalen Rechtsvorschriften zur Umsetzung der {<national_law>} barrierefrei zugänglich zu machen. Diese Erklärung zur Barrierefreiheit gilt für {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "Stand der Vereinbarkeit mit den Anforderungen", content: "{Diese Website ist vollständig mit der {<national_law>} vereinbar./Diese Website ist wegen der folgenden Unvereinbarkeiten teilweise mit der {<national_law>} vereinbar./Diese Website ist nicht mit der {<national_law>} vereinbar. Die nicht barrierefreien Inhalte sind nachstehend aufgeführt.}" },
            { id: "what-to-do", title: "Nicht barrierefreie Inhalte", content: "Die nachstehend aufgeführten Inhalte sind aus den folgenden Gründen nicht barrierefrei:\n\n[\n**Unvereinbarkeit mit den Barrierefreiheitsanforderungen**\n\n{<mängel>}\n]\n\n[Unsere normale Antwortzeit beträgt {<svarstid>}.]\n\n[Sie können uns auch wie folgt kontaktieren:\n\n* E-Mail an {<e-mailadresse>}\n* Telefon {<telefonnummer>}]" },
            { id: "reporting", title: "Feedback und Kontaktangaben", content: "Wir bemühen uns, die Barrierefreiheit unserer Website stetig zu verbessern. Wenn Sie Mängel bei der Einhaltung der Barrierefreiheitsanforderungen feststellen oder Informationen über von der Richtlinie ausgenommene Inhalte benötigen, können Sie uns kontaktieren." },
            { id: "enforcement", title: "Durchsetzungsverfahren", content: "Die {<enforcement_body>} ist für die Überwachung der {<national_law>} zuständig. Wenn Sie auf unsere Benachrichtigungen oder Anfragen keine zufriedenstellende Antwort erhalten haben, können Sie sich an {<enforcement_body>} wenden.\n\nSie können auch eine Beschwerde bei {<enforcement_body>} einreichen, wenn Sie der Meinung sind, dass unsere Einschätzung einer unverhältnismäßigen Belastung überprüft werden sollte, wenn Sie Mängel in unserer Barrierefreiheitserklärung feststellen oder wenn Sie der Meinung sind, dass wir Ihren Antrag auf barrierefreie Bereitstellung von Inhalten nicht korrekt bearbeitet haben." },
            { id: "technical", title: "Technische Informationen zur Barrierefreiheit der Website", content: "{Diese Website ist vollständig mit der {<national_law>} vereinbar./Diese Website ist wegen der folgenden Unvereinbarkeiten teilweise mit der {<national_law>} vereinbar./Diese Website ist nicht mit der {<national_law>} vereinbar.}" },
            { id: "testing", title: "Erstellung dieser Erklärung zur Barrierefreiheit", content: "{Wir haben eine Selbstbewertung (interner Test) der Website {<webbplats>} durchgeführt./Ein {<externer Dritter>} hat eine unabhängige Prüfung der Website {<webbplats>} durchgeführt./Wir haben die Barrierefreiheit ohne Prüfung geschätzt.}\n\nDie letzte Bewertung wurde am {<bewertungsdatum>} vorgenommen.\n\n[Bewertungsmethode: {<methode>}]\n\nDie Website wurde am {<veröffentlichungsdatum>} veröffentlicht.\n\nDie Erklärung wurde zuletzt am {<aktualisierungsdatum>} aktualisiert." }
        ]
    },
    fr: {
        title: "Déclaration d'accessibilité pour {<webbplats>}",
        intro: "{<organisation>} s'engage à rendre son site internet accessible conformément à la {<national_law>}. Cette déclaration d'accessibilité s'applique à {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "État de conformité", content: "{Ce site est totalement conforme avec la {<national_law>}./Ce site est partiellement conforme avec la {<national_law>} en raison des non-conformités énumérées ci-dessous./Ce site n'est pas conforme avec la {<national_law>}. Les contenus non accessibles sont énumérés ci-dessous.}" },
            { id: "what-to-do", title: "Contenus non accessibles", content: "Les contenus listés ci-dessous ne sont pas accessibles pour les raisons suivantes :\n\n[\n**Non-conformité avec la {<national_law>}**\n\n{<défauts>}\n]\n\n[Notre délai de réponse habituel est de {<svarstid>}.]\n\n[Vous pouvez également nous contacter des manières suivantes :\n\n* envoyer un e-mail à {<e-mailadresse>}\n* appeler le {<telefoonnummer>}]" },
            { id: "reporting", title: "Retour d'information et contact", content: "Nous nous efforçons d'améliorer constamment l'accessibilité de notre site. Si vous constatez un défaut de conformité, vous pouvez nous contacter pour nous en informer." },
            { id: "enforcement", title: "Voies de recours", content: "Le {<enforcement_body>} est responsable du contrôle de la conformité aux exigences d'accessibilité. Si vous ne recevez pas de réponse satisfaisante à votre signalement, vous pouvez contacter {<enforcement_body>}.\n\nVous pouvez également déposer une plainte auprès de {<enforcement_body>} si vous estimez que notre évaluation de la charge disproportionnée doit être revue, si vous constatez des défauts dans notre déclaration d'accessibilité ou si vous estimez que nous n'avons pas traité correctement votre demande de mise en accessibilité." },
            { id: "technical", title: "Informations techniques sur l'accessibilité du site", content: "{Ce site est totalement conforme./Ce site est partiellement conforme en raison des défauts décrits ci-dessous./Ce site n'est pas conforme.}" },
            { id: "testing", title: "Établissement de cette déclaration d'accessibilité", content: "{Nous avons réalisé une auto-évaluation (test interne) du site {<webbplats>}./Un {<tiers externe>} a réalisé un audit indépendant du site {<webbplats>}./Nous avons estimé l'accessibilité sans audit.}\n\nLa dernière évaluation a été réalisée le {<date_evaluation>}.\n\n[Méthode d'évaluation : {<méthode>}]\n\nLe site a été publié le {<date_publication>}.\n\nLa déclaration a été mise à jour pour la dernière fois le {<date_mise_a_jour>}." }
        ]
    },
    es: {
        title: "Declaración de accesibilidad para {<webbplats>}",
        intro: "{<organisation>} se ha comprometido a hacer accesible su sitio web de conformidad con la {<national_law>}. Esta declaración de accesibilidad se aplica a {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "Situación de cumplimiento", content: "{Este sitio web es plenamente conforme con la {<national_law>}./Este sitio web es parcialmente conforme con la {<national_law>} debido a las faltas de conformidad que se indican a continuación./Este sitio web no es conforme con la {<national_law>}. Los contenidos no accesibles se indican a continuación.}" },
            { id: "what-to-do", title: "Contenido no accesible", content: "El contenido que se recoge a continuación no es accesible por los siguientes motivos:\n\n[\n**Falta de conformidad con el estándar**\n\n{<deficiencias>}\n]\n\n[Nuestro tiempo de respuesta normal es de {<svarstid>}.]\n\n[También puede contactar con nosotros de las siguientes maneras:\n\n* enviar un correo electrónico a {<e-mailadresse>}\n* llamar al {<telefoonnummer>}]" },
            { id: "reporting", title: "Mecanismo de comunicación y datos de contacto", content: "Nos esforzamos por mejorar constantemente la accesibilidad de nuestro sitio web. Si encuentra algún problema de accesibilidad, puede ponerse en contacto con nosotros para informarnos." },
            { id: "enforcement", title: "Procedimiento de aplicación", content: "El {<enforcement_body>} es responsable de supervisar los requisitos de accesibilidad. Si no ha recibido una respuesta satisfactoria a su notificación, puede ponerse en contacto con {<enforcement_body>}.\n\nTambién puede presentar una reclamación ante {<enforcement_body>} si considera que nuestra evaluación de lo que constituye una carga desproporcionada debe ser revisada, si encuentra deficiencias en nuestra declaración de accesibilidad o si considera que no hemos gestionado correctamente su solicitud de accesibilidad." },
            { id: "technical", title: "Información técnica sobre la accesibilidad del sitio web", content: "{Este sitio web es plenamente conforme./Este sitio web es parcialmente conforme debido a las deficiencias descritas a continuación./Este sitio web no es conforme.}" },
            { id: "testing", title: "Preparación de la presente declaración de accesibilidad", content: "{Hemos realizado una autoevaluación (prueba interna) del sitio web {<webbplats>}./Un {<tercero externo>} ha realizado una auditoría independiente del sitio web {<webbplats>}./Hemos estimado la accesibilidad sin realizar pruebas.}\n\nLa última evaluación se realizó el {<fecha_evaluacion>}.\n\n[Método de evaluación: {<metodo>}]\n\nEl sitio web se publicó el {<fecha_publicacion>}.\n\nLa declaración se actualizó por última vez el {<fecha_actualizacion>}." }
        ]
    },
    fi: {
        title: "Saavutettavuusseloste: {<webbplats>}",
        intro: "{<organisation>} on tämän verkkosivuston ylläpitäjä. Haluamme, että mahdollisimman monet voivat käyttää sivustoa. Tässä asiakirjassa kuvataan, miten {<webbplats>} täyttää {<national_law>} vaatimukset, mahdolliset tiedossa olevat saavutettavuusongelmat ja miten voit ilmoittaa meille puutteista, jotta voimme korjata ne.",
        sections: [
            { id: "how-accessible", title: "Kuinka saavutettava verkkosivusto on?", content: "{Tämän verkkosivuston saavutettavuudessa ei ole tiedossa olevia puutteita./Olemme tietoisia siitä, että osat verkkosivustosta eivät ole täysin saavutettavia. Lisätietoja on jäljempänä osiossa saavutettavuusvaatimusten vastainen sisältö./Olemme tietoisia siitä, että osat verkkosivustosta eivät ole täysin saavutettavia. Lisätietoja on jäljempänä osiossa saavutettavuusvaatimusten vastainen sisältö.}" },
            { id: "what-to-do", title: "Mitä voit tehdä, jos et pysty käyttämään osia verkkosivustosta?", content: "Jos tarvitset sisältöä verkkosivustolta {<webbplats>}, joka ei ole sinulle saavutettavissa, mutta joka on jätetty lain soveltamisalan ulkopuolelle jäljempänä kuvatulla tavalla, voit ilmoittaa siitä meille.\n\n[Vastausaika on yleensä {<svarstid>}.]\n\n[Voit myös ottaa meihin yhteyttä seuraavilla tavoilla:\n\n* lähetä sähköpostia osoitteeseen {<e-mailosoite>}\n* soita numeroon {<puhelinnumero>}]" },
            { id: "reporting", title: "Anna palautetta saavutettavuuspuutteista", content: "Pyrimme jatkuvasti parantamaan verkkosivuston saavutettavuutta. Jos havaitset ongelmia, joita ei ole kuvattu tällä sivulla, tai jos katsot, ettemme täytä lain vaatimuksia, ilmoita siitä meille, jotta saamme tietää ongelmasta." },
            { id: "enforcement", title: "Täytäntöönpanomenettely", content: "{<enforcement_body>} vastaa {<national_law>} valvonnasta. Voit tehdä ilmoituksen {<enforcement_body>}lle, jos katsot, että digitaalisessa palvelussamme on saavutettavuuspuutteita.\n\nVoit myös tehdä ilmoituksen {<enforcement_body>}lle, jos katsot, että arviomme kohtuuttomasta rasitteesta on tarkistettava, jos katsot saavutettavuusselosteessamme olevan puutteita tai jos katsot, ettemme ole käsitelleet saavutettavuuspyyntöäsi oikein." },
            { id: "technical", title: "Teknistä tietoa verkkosivuston saavutettavuudesta", content: "{Tämä verkkosivusto on täysin {<national_law>} mukainen./Tämä verkkosivusto on osittain {<national_law>} mukainen jäljempänä mainittujen puutteiden vuoksi./Tämä verkkosivusto ei ole {<national_law>} mukainen. Puutteelliset osat on kuvattu jäljempänä.}" },
            { id: "non-accessible", title: "Sisältö joka ei ole saavutettavaa", content: "Jäljempänä mainittu sisältö ei ole täysin saavutettavaa.\n\n[\n**Puutteet lain vaatimusten täyttämisessä**\n\n{<puutteet>}\n]" },
            { id: "testing", title: "Kuinka olemme testanneet verkkosivuston", content: "{Olemme tehneet itsearvion (sisäinen testaus) verkkosivustolle {<webbplats>}./{<ulkoinen taho>} on tehnyt riippumattoman tarkastuksen verkkosivustolle {<webbplats>}./Olemme arvioineet saavutettavuuden ilman testausta.}\n\nViimeisin arviointi on tehty {<arviointipäivä>}.\n\n[Arviointimenetelmä: {<metodi>}]\n\nVerkkosivusto on julkaistu {<julkaisupäivä>}.\n\nSeloste on päivitetty viimeksi {<päivityspäivä>}." }
        ]
    },
    nl: {
        title: "Toegankelijkheidsverklaring voor {<webbplats>}",
        intro: "{<organisation>} is verantwoordelijk voor deze website. Wij willen dat iedereen onze website kan gebruiken. In dit document wordt beschreven hoe {<webbplats>} voldoet aan de {<national_law>}, welke toegankelijkheidsproblemen bekend zijn en hoe u eventuele gebreken aan ons kunt melden, zodat we deze kunnen verhelpen.",
        sections: [
            { id: "how-accessible", title: "Hoe toegankelijk is de website?", content: "{Er zijn geen toegankelijkheidsproblemen bekend bij deze website./Wij zijn ervan op de hoogte dat delen van de website niet volledig toegankelijk zijn. Zie de sectie over inhoud die niet toegankelijk is hieronder voor meer informatie./Wij zijn ervan op de hoogte dat delen van de website niet volledig toegankelijk zijn. Zie de sectie over inhoud die niet toegankelijk is hieronder voor meer informatie.}" },
            { id: "what-to-do", title: "Wat kunt u doen als u delen van de website niet kunt gebruiken?", content: "Als u inhoud van {<webbplats>} nodig heeft die voor u niet toegankelijk is, maar die buiten het toepassingsgebied van de wet valt zoals hieronder beschreven, kunt u dit aan ons melden.\n\n[De reactietijd is normaal gesproken {<svarstid>}.]\n\n[U kunt ook op de volgende manieren contact met ons opnemen:\n\n* stuur een e-mail naar {<e-mailadres>}\n* bel naar {<telefoonnummer>}]" },
            { id: "reporting", title: "Meld toegankelijkheidsproblemen", content: "Wij streven er voortdurend naar de toegankelijkheid van onze website te verbeteren. Als u problemen tegenkomt die niet op deze pagina worden vermeld, of als u van mening bent dat wij niet aan de wettelijke eisen voldoen, laat het ons dan weten, zodat we op de hoogte zijn van het probleem." },
            { id: "enforcement", title: "Handhavingsprocedure", content: "{<enforcement_body>} is verantwoordelijk voor het toezicht op de naleving van de {<national_law>}. U kunt een klacht indienen bij {<enforcement_body>} als u van mening bent dat onze digitale dienstverlening gebreken vertoont op het gebied van toegankelijkheid.\n\nU kunt ook een klacht indienen bij {<enforcement_body>} als u vindt dat ons oordeel over wat een onevenredige last is, moet worden herzien, als u vindt dat onze toegankelijkheidsverklaring gebreken vertoont of als u vindt dat wij uw verzoek om toegankelijkmaking niet correct hebben behandeld." },
            { id: "technical", title: "Technische informatie over de toegankelijkheid van de website", content: "{Deze website is volledig in overeenstemming met de {<national_law>}./Deze website is gedeeltelijk in overeenstemming met de {<national_law>}, vanwege de hieronder beschreven gebreken./Deze website is niet in overeenstemming met de {<national_law>}. De niet-toegankelijke delen worden hieronder beschreven.}" },
            { id: "non-accessible", title: "Inhoud die niet toegankelijk is", content: "De hieronder beschreven inhoud is op de een of andere manier niet volledig toegankelijk.\n\n[\n**Niet-naleving van de wettelijke eisen**\n\n{<gebreken>}\n]" },
            { id: "testing", title: "Hoe wij de website hebben getest", content: "{Wij hebben een zelfevaluatie (interne test) uitgevoerd van {<webbplats>}./{<externe partij>} heeft een onafhankelijke controle uitgevoerd van {<webbplats>}./Wij hebben de toegankelijkheid ingeschat zonder te testen.}\n\nDe laatste beoordeling is uitgevoerd op {<beoordelingsdatum>}.\n\n[Beoordelingsmethode: {<methode>}]\n\nDe website is gepubliceerd op {<publicatiedatum>}.\n\nDe verklaring is voor het laatst bijgewerkt op {<updatedatum>}." }
        ]
    },
    'en-gb': {
        title: "Accessibility of {<website>}",
        intro: "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018, any known accessibility issues, and how you can report problems so that we can fix them.",
        sections: [
            { id: "how-accessible", title: "How accessible is the website?", content: "{There are no known accessibility issues with this website./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information.}" },
            { id: "what-to-do", title: "What to do if you can't access parts of this website?", content: "If you need content from this website that is not accessible for you, but is not within the scope of the accessibility regulations as described below, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]" },
            { id: "reporting", title: "Reporting accessibility problems with this website", content: "We're always looking to improve the accessibility of this website. If you find any problems that aren't listed on this page or if we're not meeting the requirements of the accessibility regulations, contact us and let us know about the problem." },
            { id: "enforcement", title: "Enforcement procedure", content: "The {<enforcement_body>} is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018. If you are not happy with how we respond to your complaint, contact the {<enforcement_body>}.\n\nYou can also contact the {<enforcement_body>} if you think our accessibility statement does not accurately reflect our website's accessibility, if you believe we have not properly responded to your request for accessible content, or if you disagree with our assessment of what constitutes a disproportionate burden." },
            { id: "technical", title: "Technical information about this website's accessibility", content: "{This website is fully compliant with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018./This website is partially compliant with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018, due to the non-compliances listed below./This website is not compliant with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018. The non-accessible sections are listed below.}" },
            { id: "non-accessible", title: "Non-accessible content", content: "The content described below is, in one way or another, not fully accessible.\n\n[\n### Non-compliance with the accessibility regulations\n\n{<issues>}\n]" },
            { id: "testing", title: "How we tested this website", content: "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}." }
        ]
    },
    'en-us': {
        title: "Accessibility of {<website>}",
        intro: "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with Section 508 of the Rehabilitation Act, any known accessibility issues, and how you can report problems so that we can fix them.",
        sections: [
            { id: "how-accessible", title: "How accessible is the website?", content: "{There are no known accessibility issues with this website./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information.}" },
            { id: "what-to-do", title: "What to do if you can't access parts of this website?", content: "If you need content from this website that is not accessible for you, but is not within the scope of the accessibility regulations as described below, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]" },
            { id: "reporting", title: "Reporting accessibility problems with this website", content: "We're always looking to improve the accessibility of this website. If you find any problems that aren't listed on this page or if we're not meeting the requirements of the accessibility regulations, contact us and let us know about the problem." },
            { id: "enforcement", title: "Enforcement procedure", content: "The {<enforcement_body>} is responsible for enforcing web accessibility under Section 508 of the Rehabilitation Act and the Americans with Disabilities Act (ADA). If you experience accessibility issues on our website, you can file a complaint with the {<enforcement_body>}.\n\nYou may also file a complaint if you believe our accessibility statement does not accurately reflect our website's accessibility or if your request for accessible content has not been properly addressed." },
            { id: "technical", title: "Technical information about this website's accessibility", content: "{This website is fully compliant with Section 508 of the Rehabilitation Act./This website is partially compliant with Section 508 of the Rehabilitation Act, due to the non-compliances listed below./This website is not compliant with Section 508 of the Rehabilitation Act. The non-accessible sections are listed below.}" },
            { id: "non-accessible", title: "Non-accessible content", content: "The content described below is, in one way or another, not fully accessible.\n\n[\n### Non-compliance with the accessibility regulations\n\n{<issues>}\n]" },
            { id: "testing", title: "How we tested this website", content: "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}." }
        ]
    },
    'en-ca': {
        title: "Accessibility of {<website>}",
        intro: "This website is run by {<organisation>}. We want as many people as possible to be able to use it, and this document describes how {<website>} complies with the Accessible Canada Act and the Accessibility for Ontarians with Disabilities Act, any known accessibility issues, and how you can report problems so that we can fix them.",
        sections: [
            { id: "how-accessible", title: "How accessible is the website?", content: "{There are no known accessibility issues with this website./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information./We know some parts of this website aren't fully accessible. See the section on non-accessible content below for more information.}" },
            { id: "what-to-do", title: "What to do if you can't access parts of this website?", content: "If you need content from this website that is not accessible for you, but is not within the scope of the accessibility regulations as described below, please contact us.\n\n[Our normal response time is {<response time>}.]\n\n[You can also contact us in the following ways:\n\n* email {<email address>}\n* call {<telephone number>}]" },
            { id: "reporting", title: "Reporting accessibility problems with this website", content: "We're always looking to improve the accessibility of this website. If you find any problems that aren't listed on this page or if we're not meeting the requirements of the accessibility regulations, contact us and let us know about the problem." },
            { id: "enforcement", title: "Enforcement procedure", content: "The {<enforcement_body>} is responsible for enforcing the Accessible Canada Act. If you experience accessibility issues on our website, you can file a complaint with the {<enforcement_body>}.\n\nYou may also file a complaint if you believe our accessibility statement does not accurately reflect our website's accessibility, if you disagree with our assessment of what constitutes an undue burden, or if your request for accessible content has not been properly addressed." },
            { id: "technical", title: "Technical information about this website's accessibility", content: "{This website is fully compliant with the Accessible Canada Act and the Accessibility for Ontarians with Disabilities Act./This website is partially compliant with the Accessible Canada Act and the Accessibility for Ontarians with Disabilities Act, due to the non-compliances listed below./This website is not compliant with the Accessible Canada Act and the Accessibility for Ontarians with Disabilities Act. The non-accessible sections are listed below.}" },
            { id: "non-accessible", title: "Non-accessible content", content: "The content described below is, in one way or another, not fully accessible.\n\n[\n### Non-compliance with the accessibility regulations\n\n{<issues>}\n]" },
            { id: "testing", title: "How we tested this website", content: "{We have performed a self-assessment (internal testing) of {<website>}./{<third party>} has tested {<website>}./We have estimated the accessibility without testing.}\n\nThe last assessment was made on {<assessment date>}.\n\n[Assessment method: {<method>}]\n\nThe website was published on {<publish date>}.\n\nThe statement was last updated on {<update date>}." }
        ]
    },
    it: {
        title: "Dichiarazione di accessibilità per {<webbplats>}",
        intro: "{<organisation>} si impegna a rendere accessibile il proprio sito web ai sensi della {<national_law>}. La presente dichiarazione di accessibilità si applica a {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "Stato di conformità", content: "{Questo sito web è pienamente conforme alla {<national_law>}./Questo sito web è parzialmente conforme alla {<national_law>} a causa delle non conformità elencate di seguito./Questo sito web non è conforme alla {<national_law>}. I contenuti non accessibili sono elencati di seguito.}" },
            { id: "what-to-do", title: "Contenuti non accessibili", content: "I contenuti elencati di seguito non sono accessibili per i seguenti motivi:\n\n[\n**Non conformità alla {<national_law>}**\n\n{<carenze>}\n]\n\n[Il nostro tempo di risposta abituale è di {<svarstid>}.]\n\n[È anche possibile contattarci nei seguenti modi:\n\n* inviare un'e-mail a {<e-mailadresse>}\n* chiamare il {<telefoonnummer>}]" },
            { id: "reporting", title: "Meccanismo di feedback e dati di contatto", content: "Ci impegniamo a migliorare costantemente l'accessibilità del nostro sito web. Se riscontri problemi di accessibilità, puoi contattarci per segnalarceli." },
            { id: "enforcement", title: "Procedura di applicazione", content: "{<enforcement_body>} è responsabile del controllo dei requisiti di accessibilità. Se non hai ricevuto una risposta soddisfacente alla tua segnalazione, puoi contattare {<enforcement_body>}.\n\nPuoi anche presentare un reclamo a {<enforcement_body>} se ritieni che la nostra valutazione di ciò che costituisce un onere sproporzionato debba essere rivista, se riscontri carenze nella nostra dichiarazione di accessibilità o se ritieni che non abbiamo gestito correttamente la tua richiesta di accessibilità." },
            { id: "technical", title: "Informazioni tecniche sull'accessibilità del sito web", content: "{Questo sito web è pienamente conforme alla {<national_law>}./Questo sito web è parzialmente conforme alla {<national_law>} a causa delle non conformità descritte di seguito./Questo sito web non è conforme alla {<national_law>}.}" },
            { id: "testing", title: "Preparazione della presente dichiarazione di accessibilità", content: "{Abbiamo effettuato una valutazione interna (test interno) del sito web {<webbplats>}./{<terza parte>} ha effettuato un audit indipendente del sito web {<webbplats>}./Abbiamo stimato l'accessibilità senza effettuare test.}\n\nL'ultima valutazione è stata effettuata il {<data_valutazione>}.\n\n[Metodo di valutazione: {<metodo_it>}]\n\nIl sito web è stato pubblicato il {<data_pubblicazione>}.\n\nLa dichiarazione è stata aggiornata per l'ultima volta il {<data_aggiornamento>}." }
        ]
    },
    pt: {
        title: "Declaração de acessibilidade para {<webbplats>}",
        intro: "{<organisation>} compromete-se a tornar o seu sítio web acessível em conformidade com a {<national_law>}. A presente declaração de acessibilidade aplica-se a {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "Estado de conformidade", content: "{Este sítio web está plenamente em conformidade com a {<national_law>}./Este sítio web está parcialmente em conformidade com a {<national_law>} devido às não conformidades enumeradas abaixo./Este sítio web não está em conformidade com a {<national_law>}. Os conteúdos não acessíveis estão enumerados abaixo.}" },
            { id: "what-to-do", title: "Conteúdo não acessível", content: "O conteúdo abaixo descrito não é acessível pelos seguintes motivos:\n\n[\n**Não conformidade com a {<national_law>}**\n\n{<deficiências>}\n]\n\n[O nosso tempo de resposta habitual é de {<svarstid>}.]\n\n[Também pode contactar-nos das seguintes formas:\n\n* enviar um e-mail para {<e-mailadresse>}\n* ligar para {<telefoonnummer>}]" },
            { id: "reporting", title: "Mecanismo de feedback e contacto", content: "Esforçamo-nos por melhorar continuamente a acessibilidade do nosso sítio web. Se encontrar problemas de acessibilidade, pode contactar-nos para nos informar." },
            { id: "enforcement", title: "Procedimento de execução", content: "{<enforcement_body>} é responsável pela supervisão dos requisitos de acessibilidade. Se não tiver recebido uma resposta satisfatória à sua notificação, pode contactar {<enforcement_body>}.\n\nTambém pode apresentar uma reclamação a {<enforcement_body>} se considerar que a nossa avaliação do que constitui um encargo desproporcionado deve ser revista, se encontrar deficiências na nossa declaração de acessibilidade ou se considerar que não tratámos corretamente o seu pedido de acessibilidade." },
            { id: "technical", title: "Informações técnicas sobre a acessibilidade do sítio web", content: "{Este sítio web está plenamente em conformidade com a {<national_law>}./Este sítio web está parcialmente em conformidade com a {<national_law>} devido às deficiências descritas abaixo./Este sítio web não está em conformidade com a {<national_law>}.}" },
            { id: "testing", title: "Elaboração da presente declaração de acessibilidade", content: "{Realizámos uma autoavaliação (teste interno) do sítio web {<webbplats>}./{<terceiro externo>} realizou uma auditoria independente do sítio web {<webbplats>}./Estimámos a acessibilidade sem realizar testes.}\n\nA última avaliação foi realizada em {<data_avaliacao>}.\n\n[Método de avaliação: {<metodo_pt>}]\n\nO sítio web foi publicado em {<data_publicacao>}.\n\nA declaração foi atualizada pela última vez em {<data_atualizacao>}." }
        ]
    },
    pl: {
        title: "Deklaracja dostępności dla {<webbplats>}",
        intro: "{<organisation>} zobowiązuje się zapewnić dostępność swojej strony internetowej zgodnie z {<national_law>}. Niniejsza deklaracja dostępności dotyczy strony {<webbplats>}.",
        sections: [
            { id: "how-accessible", title: "Status pod względem zgodności", content: "{Ta strona internetowa jest w pełni zgodna z {<national_law>}./Ta strona internetowa jest częściowo zgodna z {<national_law>} z powodu niezgodności wymienionych poniżej./Ta strona internetowa nie jest zgodna z {<national_law>}. Niedostępne treści wymieniono poniżej.}" },
            { id: "what-to-do", title: "Treści niedostępne", content: "Treści wymienione poniżej są niedostępne z następujących powodów:\n\n[\n**Niezgodność z {<national_law>}**\n\n{<braki>}\n]\n\n[Nasz typowy czas odpowiedzi wynosi {<svarstid>}.]\n\n[Można się z nami skontaktować również w następujący sposób:\n\n* wysyłając e-mail na adres {<e-mailadresse>}\n* dzwoniąc pod numer {<telefoonnummer>}]" },
            { id: "reporting", title: "Procedura zgłaszania problemów z dostępnością i dane kontaktowe", content: "Nieustannie dążymy do poprawy dostępności naszej strony internetowej. Jeśli napotkasz problemy z dostępnością, możesz się z nami skontaktować, aby nas o tym poinformować." },
            { id: "enforcement", title: "Procedura egzekwowania przepisów", content: "{<enforcement_body>} jest odpowiedzialny za nadzór nad wymogami dostępności. Jeśli nie otrzymałeś satysfakcjonującej odpowiedzi na swoje zgłoszenie, możesz skontaktować się z {<enforcement_body>}.\n\nMożesz również złożyć skargę do {<enforcement_body>}, jeśli uważasz, że nasza ocena tego, co stanowi nieproporcjonalne obciążenie, powinna zostać zrewidowana, jeśli znajdziesz braki w naszej deklaracji dostępności lub jeśli uważasz, że nie obsłużyliśmy prawidłowo Twojego wniosku o dostępność." },
            { id: "technical", title: "Informacje techniczne na temat dostępności strony internetowej", content: "{Ta strona internetowa jest w pełni zgodna z {<national_law>}./Ta strona internetowa jest częściowo zgodna z {<national_law>} z powodu niezgodności opisanych poniżej./Ta strona internetowa nie jest zgodna z {<national_law>}.}" },
            { id: "testing", title: "Sporządzenie niniejszej deklaracji dostępności", content: "{Przeprowadziliśmy samoocenę (wewnętrzne testy) strony internetowej {<webbplats>}./{<podmiot zewnętrzny>} przeprowadził niezależny audyt strony internetowej {<webbplats>}./Oszacowaliśmy dostępność bez przeprowadzania testów.}\n\nOstatnia ocena została przeprowadzona dnia {<data_oceny>}.\n\n[Metoda oceny: {<metoda_pl>}]\n\nStrona internetowa została opublikowana dnia {<data_publikacji>}.\n\nDeklaracja została ostatnio zaktualizowana dnia {<data_aktualizacji>}." }
        ]
    }
};


// Helper to format date "1 January 2023"
const formatDiggDate = (date: Date, locale: string) => {
    const localeMap: Record<string, string> = {
        sv: 'sv-SE',
        no: 'no-NO',
        nb: 'no-NO',
        da: 'da-DK',
        fi: 'fi-FI',
        nl: 'nl-NL',
        de: 'de-DE',
        fr: 'fr-FR',
        es: 'es-ES',
        it: 'it-IT',
        pt: 'pt-PT',
        pl: 'pl-PL',
        'en-gb': 'en-GB',
        'en-us': 'en-US',
        'en-ca': 'en-CA'
    };
    return date.toLocaleDateString(localeMap[locale] || 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Tillgänglighetsredogörelse-komponent
 * 
 * Genererar en juridiskt korrekt tillgänglighetsredogörelse 
 * baserat på tillämplig EU-lagstiftning (WAD/EAA) och nationell lag.
 * 
 * Uppfyller:
 * - WCAG 2.1 Level AA (semantic HTML)
 * - EN 301 549 (accessible document structure)
 * - WAD Article 7 / EAA Annex V (accessibility statement requirements)
 */
export const AccessibilityStatement: React.FC<AccessibilityStatementProps> = ({
    country,
    sector,
    organizationName,
    websiteUrl: _websiteUrl,
    complianceLevel,
    lastReviewDate,
    contactEmail,
    assessmentDate,
    evaluationMethod,
    generatorTool,
    logoUrl,
    nonComplianceItems = [],
    locale = 'en',
    className = '',
    phoneNumber,
    responseTime,
    badgeUrl,
    publishDate
}) => {
    // Localization & Template Logic
    const supportedLocales: Record<string, string> = {
        sv: 'sv', en: 'en', no: 'no', nb: 'no', dk: 'da',
        da: 'da', de: 'de', fr: 'fr', es: 'es', fi: 'fi', nl: 'nl',
        it: 'it', pt: 'pt', pl: 'pl',
        'en-gb': 'en-gb', 'en-us': 'en-us', 'en-ca': 'en-ca'
    };
    const lang = supportedLocales[locale];
    if (!lang) {
        console.warn(`AccessibilityStatement: unsupported locale "${locale}", falling back to English`);
    }
    const effectiveLang = lang ?? 'en';
    const template = TEMPLATES[effectiveLang] || TEMPLATES.en;

    // Helper to format date
    const d = (date: Date) => formatDiggDate(date, locale);

    // Resolve enforcement body based on country and sector
    const enforcementBody = getEnforcementBody(country, sector);

    // Data Map for replacements
    const replacements: Record<string, string> = {
        '{<webbplats>}': organizationName, // Or websiteUrl, but usually org/site name
        '{<website>}': organizationName,
        '{<organisation>}': organizationName,
        '{<e-postadress>}': contactEmail,
        '{<email address>}': contactEmail,
        '{<telefonnummer>}': phoneNumber || '',
        '{<telephone number>}': phoneNumber || '',
        '{<svarstid>}': responseTime || '',
        '{<response time>}': responseTime || '',
        '{<bedömningsdatum>}': assessmentDate ? d(assessmentDate) : d(lastReviewDate),
        '{<assessment date>}': assessmentDate ? d(assessmentDate) : d(lastReviewDate),
        '{<uppdateringsdatum>}': d(lastReviewDate),
        '{<update date>}': d(lastReviewDate),
        '{<publiceringsdatum>}': publishDate ? d(publishDate) : '2024-01-01', // Default to a realistic value if unknown
        '{<publish date>}': publishDate ? d(publishDate) : '2024-01-01',
        '{<metod>}': evaluationMethod || 'Automated Scan',
        '{<method>}': evaluationMethod || 'Automated Scan',
        '{<extern aktör>}': generatorTool?.name || 'HolmDigital Engine',
        '{<third party>}': generatorTool?.name || 'HolmDigital Engine',
        '{<enforcement_body>}': enforcementBody,
        '{<national_law>}': (() => {
            const law = getNationalLawByFramework(sector === 'private' ? 'EAA' : 'WAD', country);
            return law ? `${law.fullName} (${law.law})` : '';
        })(),
    };

    // Construct issue list string
    let issuesContent = '';
    if (nonComplianceItems.length > 0) {
        issuesContent = nonComplianceItems.map(item => `* ${item}`).join('\n');
    } else {
        const noIssuesText: Record<string, string> = {
            sv: 'Inga kända brister.',
            no: 'Ingen kjente mangler.',
            da: 'Ingen kendte problemer.',
            de: 'Keine bekannten Mängel.',
            fr: 'Aucun problème connu.',
            es: 'No se conocen problemas.',
            fi: 'Ei tunnettuja puutteita.',
            nl: 'Geen bekende problemen.',
            it: 'Nessun problema noto.',
            pt: 'Nenhum problema conhecido.',
            pl: 'Brak znanych problemów.',
        };
        issuesContent = noIssuesText[effectiveLang] || 'No known issues.';
    }
    replacements['{<brister>}'] = issuesContent;
    replacements['{<issues>}'] = issuesContent;
    replacements['{<mangler>}'] = issuesContent;

    // NO-specific mappings
    replacements['{<nettsted>}'] = organizationName;
    replacements['{<organisasjon>}'] = organizationName;
    replacements['{<svartid>}'] = responseTime || '';
    replacements['{<vurderingsdato>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<publiseringsdatum>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<ekstern aktor>}'] = generatorTool?.name || 'HolmDigital Engine';
    // NO placeholder bug fixes (4 missing mappings)
    replacements['{<e-postadresse>}'] = contactEmail;
    replacements['{<oppdateringsdato>}'] = d(lastReviewDate);
    replacements['{<metode>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<publiseringsdato>}'] = publishDate ? d(publishDate) : '2024-01-01';

    // DA-specific mappings
    replacements['{<e-mailadresse>}'] = contactEmail;
    replacements['{<ekstern aktør>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<offentliggørelsesdato>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<opdateringsdato>}'] = d(lastReviewDate);

    // DE-specific mappings
    replacements['{<bewertungsdatum>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<veröffentlichungsdatum>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<aktualisierungsdatum>}'] = d(lastReviewDate);
    replacements['{<methode>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<externer Dritter>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<mängel>}'] = issuesContent;

    // FR-specific mappings
    replacements['{<date_evaluation>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<date_publication>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<date_mise_a_jour>}'] = d(lastReviewDate);
    replacements['{<méthode>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<tiers externe>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<défauts>}'] = issuesContent;
    replacements['{<telefoonnummer>}'] = phoneNumber || '';

    // ES-specific mappings
    replacements['{<fecha_evaluacion>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<fecha_publicacion>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<fecha_actualizacion>}'] = d(lastReviewDate);
    replacements['{<metodo>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<tercero externo>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<deficiencias>}'] = issuesContent;

    // FI-specific mappings
    replacements['{<arviointipäivä>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<julkaisupäivä>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<päivityspäivä>}'] = d(lastReviewDate);
    replacements['{<metodi>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<ulkoinen taho>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<puutteet>}'] = issuesContent;
    replacements['{<e-mailosoite>}'] = contactEmail;
    replacements['{<puhelinnumero>}'] = phoneNumber || '';

    // NL-specific mappings
    replacements['{<beoordelingsdatum>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<publicatiedatum>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<updatedatum>}'] = d(lastReviewDate);
    replacements['{<externe partij>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<gebreken>}'] = issuesContent;
    replacements['{<e-mailadres>}'] = contactEmail;

    // IT-specific mappings
    replacements['{<data_valutazione>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<data_pubblicazione>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<data_aggiornamento>}'] = d(lastReviewDate);
    replacements['{<metodo_it>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<terza parte>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<carenze>}'] = issuesContent;

    // PT-specific mappings
    replacements['{<data_avaliacao>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<data_publicacao>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<data_atualizacao>}'] = d(lastReviewDate);
    replacements['{<metodo_pt>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<terceiro externo>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<deficiências>}'] = issuesContent;

    // PL-specific mappings
    replacements['{<data_oceny>}'] = assessmentDate ? d(assessmentDate) : d(lastReviewDate);
    replacements['{<data_publikacji>}'] = publishDate ? d(publishDate) : '2024-01-01';
    replacements['{<data_aktualizacji>}'] = d(lastReviewDate);
    replacements['{<metoda_pl>}'] = evaluationMethod || 'Automated Scan';
    replacements['{<podmiot zewnętrzny>}'] = generatorTool?.name || 'HolmDigital Engine';
    replacements['{<braki>}'] = issuesContent;

    const renderTemplate = (tmpl: string) => {
        let text = tmpl;

        // 1. Handle Conditional Blocks [ ... ] using Regex
        text = text.replace(/\[([\s\S]*?)\]/g, (_match, content) => {
            // Response time blocks
            if (content.includes('{<svarstid>}') || content.includes('{<response time>}')
                || content.includes('{<svartid>}')) {
                return responseTime ? content : '';
            }
            // Phone/email contact blocks -- all locale variants of phone placeholder
            if (content.includes('{<telefonnummer>}') || content.includes('{<telephone number>}')
                || content.includes('{<puhelinnumero>}') || content.includes('{<telefoonnummer>}')) {
                return phoneNumber ? content : '';
            }
            // Issues/defects blocks -- all locale variants
            if (content.includes('{<brister>}') || content.includes('{<issues>}')
                || content.includes('{<mangler>}') || content.includes('{<mängel>}')
                || content.includes('{<défauts>}') || content.includes('{<deficiencias>}')
                || content.includes('{<puutteet>}') || content.includes('{<gebreken>}')
                || content.includes('{<carenze>}') || content.includes('{<deficiências>}') || content.includes('{<braki>}')) {
                return complianceLevel !== 'full' ? content : '';
            }
            // Add a newline before and after content to ensure separation from headings
            return '\n' + content.trim() + '\n';
        });

        // 2. Variable Substitution
        for (const [key, value] of Object.entries(replacements)) {
            text = text.replaceAll(key, value);
        }

        // 3. Handle Choices { A / B / C }
        text = text.replace(/\{([^{}]*?)\}/g, (_match, content) => {
            const parts = content.split('/');
            if (parts.length >= 2) {
                let idx = 0;
                if (complianceLevel === 'partial') idx = 1;
                if (complianceLevel === 'non-compliant') idx = parts.length > 2 ? 2 : 1;
                return parts[idx].trim();
            }
            return _match; // Return as is if not a choice block
        });

        return text;
    };

    const renderSections = (sections: TemplateSection[]) => {
        return sections.map((section, i) => {
            const content = renderTemplate(section.content);
            const trimmed = content.trim();
            if (!trimmed) return null;

            // Define icons based on section id or title
            let IconNode = null;
            if (section.id === 'how-accessible' || trimmed.includes('Hur tillgänglig') || trimmed.includes('How accessible') || trimmed.includes('Hvor tilgjengelig') || trimmed.includes('Hvor tilgængeligt') || trimmed.includes('Kuinka saavutettava') || trimmed.includes('Hoe toegankelijk') || trimmed.includes('Stand der Vereinbarkeit') || trimmed.includes('État de conformité') || trimmed.includes('Situación de cumplimiento')) {
                IconNode = <IconWrapper><EyeIcon /></IconWrapper>;
            } else if (section.id === 'what-to-do' || trimmed.includes('Vad kan du göra') || trimmed.includes('What to do') || trimmed.includes('Hva kan du gjøre') || trimmed.includes('Hvad kan du gøre') || trimmed.includes('Mitä voit tehdä') || trimmed.includes('Wat kunt u doen') || trimmed.includes('Nicht barrierefreie Inhalte') || trimmed.includes('Contenus non accessibles') || trimmed.includes('Contenido no accesible')) {
                IconNode = <IconWrapper><HelpCircleIcon /></IconWrapper>;
            } else if (section.id === 'reporting' || trimmed.includes('Rapporter brister') || trimmed.includes('Reporting accessibility') || trimmed.includes('Rapporter mangler') || trimmed.includes('Anna palautetta') || trimmed.includes('Meld toegankelijkheidsproblemen') || trimmed.includes('Feedback und Kontaktangaben') || trimmed.includes('Retour d\'information') || trimmed.includes('Mecanismo de comunicación')) {
                IconNode = <IconWrapper><AlertOctagonIcon /></IconWrapper>;
            } else if (section.id === 'enforcement' || trimmed.includes('Tillsyn') || trimmed.includes('Enforcement procedure') || trimmed.includes('Tilsyn') || trimmed.includes('Håndhævelsesprocedure') || trimmed.includes('Täytäntöönpanomenettely') || trimmed.includes('Handhavingsprocedure') || trimmed.includes('Durchsetzungsverfahren') || trimmed.includes('Voies de recours') || trimmed.includes('Procedimiento de aplicación')) {
                IconNode = <IconWrapper><GavelIcon /></IconWrapper>;
            } else if (section.id === 'technical' || trimmed.includes('Teknisk information') || trimmed.includes('Technical information')) {
                IconNode = <IconWrapper><CpuIcon /></IconWrapper>;
            } else if (section.id === 'testing' || trimmed.includes('Hur vi testat') || trimmed.includes('How we tested') || trimmed.includes('Hvordan vi har testet') || trimmed.includes('Kuinka olemme testanneet') || trimmed.includes('Hoe wij de website hebben getest') || trimmed.includes('Erstellung dieser Erklärung') || trimmed.includes('Établissement de cette déclaration') || trimmed.includes('Preparación de la presente declaración')) {
                IconNode = <IconWrapper><CheckCircleIcon /></IconWrapper>;
            }


            // Render section header
            const SectionHeader = (
                <h2 key={`h2-${i}`} style={styles.sectionTitle}>
                    {IconNode}
                    {section.title}
                </h2>
            );

            // Split content into paragraphs for better rendering
            const blocks = trimmed.split('\n\n').map((block, bi) => {
                const blockTrimmed = block.trim();
                if (!blockTrimmed) return null;

                if (blockTrimmed.startsWith('## ')) {
                    const title = blockTrimmed.replace('## ', '');
                    return (
                        <h2 key={`${i}-${bi}`} style={styles.sectionTitle}>
                            {title}
                        </h2>
                    );
                }
                if (blockTrimmed.startsWith('### ')) {
                    return <h3 key={`${i}-${bi}`} style={{ ...styles.sectionTitle, fontSize: '1.4rem' }}>{blockTrimmed.replace('### ', '')}</h3>;
                }

                // Handle lists
                if (blockTrimmed.includes('* ') || blockTrimmed.includes('• ')) {
                    const lines = blockTrimmed.split('\n');
                    return (
                        <ul key={`${i}-${bi}`} style={styles.list}>
                            {lines.map((line, li) => {
                                const cleanLine = line.trim().replace(/^[*\-\u2022]\s*/, '');
                                if (!cleanLine) return null;
                                return (
                                    <li key={li} style={styles.listItem}>
                                        <div style={styles.listBullet} />
                                        {cleanLine}
                                    </li>
                                );
                            })}
                        </ul>
                    );
                }

                // Wrap contact info in cards
                const isCardSection = blockTrimmed.includes('e-post') || blockTrimmed.includes('email') || blockTrimmed.includes('ring ') || blockTrimmed.includes('call ');
                if (isCardSection) {
                    return <div key={`${i}-${bi}`} style={styles.card}>{blockTrimmed}</div>;
                }

                return <p key={`${i}-${bi}`} style={styles.paragraph}>{blockTrimmed}</p>;
            });

            return (
                <section key={i} style={styles.section}>
                    {SectionHeader}
                    {blocks}
                </section>
            );
        });
    };

    // Get statement tools for this country (fallback/reference)
    const statementTools = getStatementToolsByCountry(country);

    // Use custom generator tool if provided, otherwise fallback to national recommendation
    const usedTool = generatorTool || statementTools.find(t => t.recommended) || statementTools[0];

    // Placeholder styles
    const styles: Record<string, React.CSSProperties> = {
        page: {
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#334155', // Slate 700
            lineHeight: 1.6,
            maxWidth: '100%',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #f8fafc'
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            marginRight: '2rem'
        },
        divider: {
            height: '2rem',
            width: '1px',
            backgroundColor: '#e2e8f0',
            marginRight: '2rem',
            display: 'block'
        },
        websiteContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            color: '#64748b', // Slate 500
            fontWeight: 500,
            fontSize: '0.925rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '100px',
            border: '1px solid #f1f5f9'
        },
        container: {
            maxWidth: '1000px',
            margin: '4rem auto',
            padding: '6rem',
            backgroundColor: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(15, 23, 42, 0.08)',
            border: '1px solid #f1f5f9',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#1e293b', // Slate 800
            lineHeight: 1.8,
            fontSize: '1.125rem',
            position: 'relative',
            overflow: 'hidden'
        },
        mainHeading: {
            fontSize: '3.5rem',
            fontWeight: 800,
            color: '#0f172a', // Slate 900
            marginTop: '0',
            marginBottom: '1.5rem',
            letterSpacing: '-0.05em',
            lineHeight: 1.05
        },
        metaData: {
            color: '#64748b', // Slate 500
            fontSize: '0.925rem',
            marginBottom: '5rem',
            fontWeight: 500,
            display: 'flex',
            gap: '2rem',
            padding: '1.25rem 2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '1rem',
            border: '1px solid #f1f5f9',
            width: 'fit-content'
        },
        section: {
            marginBottom: '6rem'
        },
        sectionTitle: {
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '2rem',
            marginTop: 0,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        card: {
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        paragraph: {
            marginBottom: '1.75rem',
            maxWidth: '70ch',
            whiteSpace: 'pre-line',
            color: '#475569' // Slate 600
        },
        link: {
            color: '#0ea5e9', // Primary 500
            textDecoration: 'none',
            fontWeight: 600,
            borderBottom: '1.5px solid rgba(14, 165, 233, 0.2)',
            transition: 'all 0.2s',
            cursor: 'pointer'
        },
        list: {
            listStyleType: 'none',
            paddingLeft: 0,
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        listItem: {
            padding: '1.25rem 1.75rem 1.25rem 3.5rem',
            position: 'relative',
            backgroundColor: '#f8fafc',
            borderRadius: '1rem',
            border: '1px solid #f1f5f9',
            fontSize: '1rem',
            color: '#334155'
        },
        listBullet: {
            position: 'absolute',
            left: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0.75rem',
            height: '0.75rem',
            borderRadius: '4px',
            backgroundColor: '#0ea5e9',
            opacity: 0.8
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.25rem',
            borderRadius: '100px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: complianceLevel === 'full' ? '#f0fdf4' : complianceLevel === 'partial' ? '#fffbeb' : '#fef2f2',
            color: complianceLevel === 'full' ? '#166534' : complianceLevel === 'partial' ? '#92400e' : '#991b1b',
            border: `1px solid ${complianceLevel === 'full' ? '#dcfce7' : complianceLevel === 'partial' ? '#fef3c7' : '#fee2e2'}`,
            letterSpacing: '0.01em'
        },
        iconWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            color: '#0ea5e9'
        }
    };

    const Logo = () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#0F172A" />
            <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="#38BDF8" />
            <path d="M16 12L20 16L16 20L12 16L16 12Z" fill="#0F172A" />
        </svg>
    );

    // Icon Components (Lucide-style)
    const IconWrapper = ({ children }: { children: React.ReactNode }) => (
        <div style={styles.iconWrapper}>{children}</div>
    );

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    );

    const HelpCircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    );

    const AlertOctagonIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    );

    const GavelIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 13-5 5 2 2 5-5-2-2Z" /><path d="m3 21 2-2 5-5-2-2-5 5-2 2Z" /><path d="m15 6 5 5-11 11-5-5L15 6Z" /><path d="M13 2 18 7" /></svg>
    );

    const CpuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
    );

    const CheckCircleIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    );


    return (
        <main
            role="main"
            className={className}
            style={styles.container}
            aria-labelledby="a11y-statement-title"
        >
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href="https://holmdigital.se" style={styles.logoContainer} target="_blank" rel="noreferrer">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Holm Digital" style={{ height: '3rem', width: 'auto' }} />
                        ) : (
                            <>
                                <Logo />
                                <span style={{ marginLeft: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: '#0c4a6e' }}>HolmDigital</span>
                            </>
                        )}
                    </a>

                    <div style={styles.divider} aria-hidden="true" />

                    <a href="https://holmdigital.se" style={styles.websiteContainer} target="_blank" rel="noreferrer">
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.375rem', display: 'flex' }}>
                            {/* Simple Globe Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }} aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </span>
                        <span>holmdigital<span style={{ color: '#0284c7' }}>.se</span></span>
                    </a>
                </div>

                {badgeUrl && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={badgeUrl} alt="Accessibility Badge" style={{ height: '1.5rem', width: 'auto' }} />
                    </div>
                )}
            </header>

            {/* Header Title strictly from Template (First part of template?) No, Digg template has no H1, it starts with text. 
                 But we want the H1... 
                 Actually, the 'title' key in Digg template is implicit or the document itself.
                 The provided template strings start with the title "Tillgänglighet för..."
             */}
            {/* 
            <h1 id="a11y-statement-title" style={styles.mainHeading}>
                {effectiveLang === 'sv' ? 'Tillgänglighetsredogörelse' : 'Accessibility Statement'}
            </h1>
            Wait, the template starts with "Tillgänglighet för {<webbplats>}" which IS the title.
            We should render the first line as H1?
            The template text:
            `Tillgänglighet för {<webbplats>}
            {<organisation>} står bakom...`
            
            So the first line is the Heading. I will handle this in renderTemplate by checking for index 0 if it's not starting with #.
            Or better: I will manually extract the first line as title, or let the renderer handle it.
            
            Let's let renderTemplate handle it. But we want H1 semantics.
            I will modify renderTemplate to make the first block an H1 if it's the very first line.
            */}

            {/* Template Rendered Content */}
            <div className="statement-content">
                <header style={{ marginBottom: '4rem' }}>
                    <h1 id="a11y-statement-title" style={styles.mainHeading}>
                        {renderTemplate(template.title)}
                    </h1>

                    <div style={styles.metaData}>
                        <span>Status: <span style={styles.statusBadge}>
                            {(BADGE_LABELS[effectiveLang] || BADGE_LABELS['en'])[complianceLevel]}
                        </span></span>
                        <span style={{ color: '#e2e8f0' }}>|</span>
                        <span>{UPDATED_LABEL[effectiveLang] || UPDATED_LABEL['en']} {d(lastReviewDate)}</span>
                    </div>
                </header>

                <p style={{ ...styles.paragraph, fontSize: '1.25rem', color: '#1e293b', fontWeight: 500, marginBottom: '4rem' }}>
                    {renderTemplate(template.intro)}
                </p>
                {renderSections(template.sections)}
            </div>


            {/* Footer with Tool attribution */}
            <footer style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                <p>
                    {FOOTER_TEXT[effectiveLang] || FOOTER_TEXT['en']}{' '}
                    <a href={usedTool?.url || 'https://holmdigital.se'} style={styles.link} target="_blank" rel="noopener noreferrer">
                        {usedTool?.name || 'HolmDigital Engine'}
                    </a>
                </p>
            </footer>
        </main>
    );
};

AccessibilityStatement.displayName = 'AccessibilityStatement';
