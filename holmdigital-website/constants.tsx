import React from 'react';
import { NavItem, ArticleData } from './types';
import { CheckCircle, LayoutTemplate, Globe, Code, Search, Accessibility, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@holmdigital/components';



// --- NAVIGATION ---
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'intro',
    title: 'Home',
    href: 'intro',
  },
  {
    id: 'services',
    title: 'Tjänster',
    href: 'services',
    children: [
      { id: 'tillganglighetsanalys', title: 'Tillgänglighetsanalys', href: 'tillganglighetsanalys' },
      { id: 'seo', title: 'SEO', href: 'seo' },
      { id: 'webbutveckling', title: 'Webbutveckling', href: 'webbutveckling' },
      { id: 'anbud', title: 'Upphandling & Anbud', href: 'anbud' },
      { id: 'consulting', title: 'Konsulttjänster', href: 'consulting' },
    ]
  },
  {
    id: 'opensource',
    title: 'Verktyg (OSS)',
    href: 'opensource',
  },
  {
    id: 'webinars',
    title: 'Webinar',
    href: 'webinars',
  },
  {
    id: 'network',
    title: 'Nätverk',
    href: 'network',
  },
  {
    id: 'about',
    title: 'Om Mig',
    href: 'about',
  },
  {
    id: 'contact',
    title: 'Kontakt',
    href: 'contact',
  },
];

// --- CONTENT MAPPING ---
export const MOCK_ARTICLES: Record<string, ArticleData> = {
  'intro': {
    id: 'intro',
    title: 'Digital konsultbyrå',
    description: 'Jag hjälper företag att nå fler kunder genom en analys av webbplatsens användarvänlighet.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [
      { id: 'services', title: 'Tjänster' },
      { id: 'opensource', title: 'Verktyg' },
      { id: 'network', title: 'Nätverk' }
    ],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-6">
                Digital konsultbyrå
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Jag hjälper företag att nå fler kunder genom en analys av webbplatsens användarvänlighet där jag identifierar dolda hinder utan att företaget behöver bygga om hela sidan eller riskera juridiska konsekvenser.
              </p>
              <div className="flex gap-4">
                <Button size="large" onClick={() => (window.location.href = '#services')}>Boka analys</Button>
                <a href="#services" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Läs mer</a>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://holmdigital.se/wp-content/uploads/elementor/thumbs/Karin-e1750876388640-r7u9hmjx5qqv59qt47gle8yxu1wo3gqsico9gjilfk.jpg"
                alt="Karin Holm"
                className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>

          <hr className="my-16 border-slate-100" />

          {/* Services Teaser */}
          <div className="grid md:grid-cols-3 gap-8 mb-24" id="services">
            <h2 className="sr-only">Våra Tjänster</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mt-0 text-center mb-4">Tillgänglighet</h3>
              <p className="text-sm text-slate-600 mb-6 flex-grow">
                Jag analyserar din webbplats, e-handel eller app för att se vilka hinder som webbplatsen har och vad som behövs förbättras.
                För att du ska kunna följa det nya EU-direktivet som gick laga kraft för privat sektor juni 2025.
              </p>
              <a href="?article=tillganglighetsanalys" className="text-black font-bold text-sm underline hover:no-underline mt-auto inline-block text-center w-full" style={{ color: '#000000' }}>Läs mer →</a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mt-0 text-center mb-4">SEO</h3>
              <p className="text-sm text-slate-600 mb-6 flex-grow">
                Är att sökmotoroptimera din webbplats och ditt innehåll för att förbättra din synlighet och ranking på sökmotorernas resultatlistor.
                Genom att optimera din webbplats hjälper jag Google på vägen att hitta din hemsida. Målet är att attrahera organisk trafik.
              </p>
              <a href="?article=seo" className="text-black font-bold text-sm underline hover:no-underline mt-auto inline-block text-center w-full" style={{ color: '#000000' }}>Läs mer →</a>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mt-0 text-center mb-4">Webbutveckling</h3>
              <p className="text-sm text-slate-600 mb-6 flex-grow">
                Jag hjälper dig att att utveckla din webbplats, e-handel eller app med exempelvis nya sidor, analysverktyg, kassasystem,
                formulär eller text. Gäller även om du vill ha en helt ny webbplats.
              </p>
              <a href="?article=webbutveckling" className="text-black font-bold text-sm underline hover:no-underline mt-auto inline-block text-center w-full" style={{ color: '#000000' }}>Läs mer →</a>
            </div>
          </div>

          {/* OPEN SOURCE PROMO SECTION */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-24 text-white overflow-hidden relative">
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-primary-900/50 text-white font-mono text-xs px-3 py-1 rounded-full mb-4 border border-primary-500">
                  Open Source
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 mt-0">
                  Bygg bättre. Bygg tillgängligt.
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  Vi tror på att dela med oss. Därför har vi släppt vår motor som Open Source.
                  Upptäck <strong>@holmdigital/engine</strong> – verktyget jag själv använder för mina analyser.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="?article=opensource" className="bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-6 rounded-lg text-center transition-colors no-underline">
                    Utforska våra verktyg
                  </a>
                  <a href="https://github.com/holmdigital" target="_blank" className="bg-transparent border border-white text-white hover:bg-white/10 font-bold py-3 px-6 rounded-lg text-center transition-colors no-underline">
                    GitHub
                  </a>
                </div>
              </div>

              {/* Terminal Graphic */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-slate-950 rounded-lg border border-slate-800 shadow-2xl font-mono text-sm p-4">
                  <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-slate-300 space-y-1">
                    <div className="flex">
                      <span className="text-green-400 mr-2">➜</span>
                      <span>npm install @holmdigital/engine</span>
                    </div>
                    <div className="text-slate-500 pb-2">added 1 package in 2s</div>
                    <div className="flex">
                      <span className="text-green-400 mr-2">➜</span>
                      <span>holm-engine scan https://mysite.com</span>
                    </div>
                    <div className="text-blue-400 pt-2">ℹ Starting accessibility scan...</div>
                    <div className="text-slate-300">✔ WCAG 2.1 AA check</div>
                    <div className="text-slate-300">✔ Heading structure</div>
                    <div className="text-slate-300">✔ Color contrast</div>
                    <div className="text-green-400 font-bold pt-2">Scan complete! Score: 98/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </>
    )
  },

  // NEW OPEN SOURCE PAGE
  'opensource': {
    id: 'opensource',
    title: 'Holm Digital Open Source',
    description: 'Vi bygger verktygen för framtidens tillgängliga webb.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [
      { id: 'engine', title: 'Engine' },
      { id: 'standards', title: 'Standards' },
      { id: 'components', title: 'Components' }
    ],
    content: (
      <div className="prose prose-slate max-w-none">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-6">
            <Code className="h-12 w-12 text-slate-900" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Inkludering genom kod.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Vår mission är att förenkla tillgänglighet för utvecklare.
            Genom att öppna källkoden till våra kärnverktyg hoppas vi kunna driva branschen framåt.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="flex flex-col gap-8 mb-24 max-w-3xl mx-auto">
          {/* Engine */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <h3 className="text-2xl font-bold text-white mt-0 mb-2 z-10">@holmdigital/engine</h3>
            <p className="text-slate-400 text-sm font-mono mb-6 z-10 w-full truncate">The core scanning logic</p>
            <p className="text-slate-300 mb-8 flex-grow z-10">
              Motorn som driver våra analyser. Automatiserad WCAG-validering baserad på axe-core, men anpassad för svenska lagkrav.
            </p>
            <div className="z-10 mt-auto">
              <div className="bg-slate-950 rounded p-3 font-mono text-xs text-slate-300 border border-slate-800">
                npm i @holmdigital/engine
              </div>
            </div>
          </div>

          {/* Standards */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold text-slate-900 mt-0 mb-2">@holmdigital/standards</h3>
            <p className="text-slate-500 text-sm font-mono mb-6">Regelverk & Tolkningar</p>
            <p className="text-slate-600 mb-8">
              En samling definitioner som mappar WCAG-regler till praktiska åtgärder och svenska lagtexter.
            </p>
          </div>

          {/* Components */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
            <h3 className="text-xl font-bold text-slate-900 mt-0 mb-2">@holmdigital/components</h3>
            <p className="text-slate-500 text-sm font-mono mb-6">React UI Library</p>
            <p className="text-slate-600 mb-8">
              Tillgängliga komponenter "out-of-the-box". Byggd på Radix UI och Tailwind CSS.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-0">Varför Open Source?</h2>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="bg-green-100 p-2 rounded-lg h-min">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg m-0">Transparens</h3>
                  <p className="text-slate-600 m-0">Du ska kunna lita på resultaten. Genom öppen källkod kan alla granska hur vi mäter.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-blue-100 p-2 rounded-lg h-min">
                  <Globe className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg m-0">Samarbete</h3>
                  <p className="text-slate-600 m-0">Vi blir bättre tillsammans. Communityt bidrar med förbättringar och nya regler.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 border-dashed">
            <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest mb-8">Tech Stack</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">TypeScript</span>
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">Node.js</span>
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">React</span>
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">Vite</span>
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">Tailwind</span>
              <span className="px-4 py-2 bg-white rounded-full font-bold text-slate-700 shadow-sm border border-slate-200">Puppeteer</span>
            </div>
          </div>
        </div>

        {/* comparison section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Holm Digital vs. Andra Verktyg</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Competitors */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-500 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Traditionella Enterprise-verktyg
              </h3>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Dyra månadslicenser</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>"Svart låda" – du vet inte hur de mäter</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Generell WCAG (missar svenska lagkrav)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Låser in data i deras plattform</span>
                </li>
              </ul>
            </div>

            {/* Holm Digital */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                Holm Digital Engine
              </h3>
              <ul className="space-y-4 text-slate-300 relative z-10">
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span><strong className="text-white">Open Source</strong> (Gratis att använda)</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span><strong className="text-white">Transparent</strong> – Granska koden själv</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span><strong className="text-white">Svensk Lag</strong> – Anpassad för DOS-lagen</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span><strong className="text-white">Developer First</strong> – NPM, CLI, CI/CD</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <span><strong className="text-white">Lösningar direkt</strong> – Vi föreslår fixen innan det blir ett problem.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="https://github.com/holmdigital" target="_blank" className="inline-flex items-center justify-center bg-slate-900 text-white font-bold py-4 px-8 rounded-full hover:bg-slate-800 transition-transform hover:scale-105 no-underline">
            <span className="mr-2">Gå till GitHub</span>
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    )
  },

  'services': {
    id: 'services',
    title: 'Holm Digitals Tjänster',
    description: 'Expertis inom digital tillgänglighet, SEO och utveckling.',
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <p className="lead text-xl text-slate-600 mb-8">
            Vi erbjuder expertis inom digital tillgänglighet, SEO och webbutveckling. Välj ett område nedan för att läsa mer.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="?article=tillganglighetsanalys" className="block p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow no-underline">
              <Accessibility className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 m-0 mb-2">Tillgänglighetsanalys</h3>
              <p className="text-slate-600 text-sm m-0">Identifiera hinder och uppfyll legala krav.</p>
            </a>
            <a href="?article=seo" className="block p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow no-underline">
              <Search className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 m-0 mb-2">SEO</h3>
              <p className="text-slate-600 text-sm m-0">Förbättra synlighet och ranking.</p>
            </a>
            <a href="?article=webbutveckling" className="block p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow no-underline">
              <Code className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 m-0 mb-2">Webbutveckling</h3>
              <p className="text-slate-600 text-sm m-0">Framtidssäkra webbplatser och e-handel.</p>
            </a>
          </div>
        </div>
      </>
    ),
  },
  'webinars': {
    id: 'webinars',
    title: 'Webinar',
    description: 'Lär dig mer om SEO, webbutveckling och digital tillgänglighet.',
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <p className="lead text-xl text-slate-600">
            Här hittar du mina webinars. Delta live eller titta i efterhand för att fördjupa dina kunskaper.
          </p>

          <div className="my-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tidigare Webinar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-200 flex items-center justify-center text-slate-400">
                  <span className="font-medium">Video Placeholder</span>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wide">Inspelning</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 mt-0">SEO, tillgänglighet och webbutveckling</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Ett grundläggande webinar om hur dessa tre områden hänger ihop och varför de är viktiga för din affär.
                  </p>
                  <Button variant="secondary" size="small">Se inspelning</Button>
                </div>
              </div>

              <div className="bg-white p-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-200 flex items-center justify-center text-slate-400">
                  <span className="font-medium">Video Placeholder</span>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wide">Inspelning</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 mt-0">Webbutveckling för din hemsida</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Tips och trix för dig som vill kravställa eller bygga en ny webbplats.
                  </p>
                  <Button variant="secondary" size="small">Se inspelning</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
            <h3 className="text-blue-900 font-bold text-xl mt-0 mb-2">Missa inte nästa tillfälle!</h3>
            <p className="text-blue-800 mb-6">
              Jag håller regelbundna webinars. Håll utkik här eller i mina sociala kanaler.
            </p>
            <Button>Se kommande webinar</Button>
          </div>
        </div>
      </>
    )
  },
  'network': {
    id: 'network',
    title: 'Nätverk inom digital tillgänglighet',
    description: 'Ett community för oss som vill skapa ett mer inkluderande internet.',
    lastUpdated: 'December 10, 2025',
    sections: [
      { id: 'about', title: 'Om nätverket' },
      { id: 'benefits', title: 'Varför gå med?' },
      { id: 'join', title: 'Gå med' }
    ],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <p className="lead text-xl text-slate-600">
            Det här är ett nätverk för dig som vill arbeta med och förstå digital tillgänglighet på djupet.
            Det är ingen kurs, utan en community där vi delar erfarenheter, case och praktiska tips.
          </p>

          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Kommande Träffar</h3>
              <div className="space-y-6">
                {/* Event 1 */}
                <div className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div className="text-sm text-purple-700 font-bold mb-1">12 November • Workshop</div>
                  <h4 className="font-bold text-slate-900 m-0 text-lg">Skriva bra alt-texter</h4>
                  <p className="text-slate-600 text-sm mt-2 mb-3">
                    Lär dig skriva texter som gör skillnad för både tillgänglighet och SEO. Teori + praktiska övningar.
                  </p>
                  <div className="text-xs text-slate-500">Med Karin Holm</div>
                </div>

                {/* Event 2 */}
                <div className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div className="text-sm text-purple-700 font-bold mb-1">14 Januari • Gästföreläsning</div>
                  <h4 className="font-bold text-slate-900 m-0 text-lg">Inkluderande design & färgval</h4>
                  <p className="text-slate-600 text-sm mt-2 mb-3">
                    Eva-Lena från Axess Lab föreläser om kontraster, färger och lagkrav.
                  </p>
                </div>

                {/* Event 3 */}
                <div className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div className="text-sm text-purple-700 font-bold mb-1">5 Februari • Workshop</div>
                  <h4 className="font-bold text-slate-900 m-0 text-lg">Tillgängliga PDF:er</h4>
                  <p className="text-slate-600 text-sm mt-2 mb-3">
                    Hur skapar man dokument som alla kan läsa? Genomgång av verktyg och metoder.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
              <h3 className="text-purple-900 font-bold text-xl mt-0 mb-4">Vad vi gör i nätverket</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-purple-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Delar konkreta case och erfarenheter</span>
                </li>
                <li className="flex gap-3 text-purple-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Diskuterar WCAG utan "paragrafdjungel"</span>
                </li>
                <li className="flex gap-3 text-purple-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Online-workshops med experter</span>
                </li>
                <li className="flex gap-3 text-purple-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Årlig fysisk träff</span>
                </li>
                <li className="flex gap-3 text-purple-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Rabatterat pris på tillgänglighetsanalyser</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-900 font-bold text-xl mt-0 mb-4">Varför gå med?</h3>
              <p className="text-slate-600 mb-4">
                Digital tillgänglighet är en konkurrensfördel. Det stärker ditt varumärke och öppnar upp din verksamhet för fler kunder.
              </p>
              <ul className="space-y-2 text-slate-700">
                <li><strong>Lär dig:</strong> Förbättra din webbplats steg för steg.</li>
                <li><strong>Affärsnytta:</strong> Förstå hur inkludering driver affärer.</li>
                <li><strong>Community:</strong> Undvik vanliga fallgropar tillsammans med andra.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl my-12 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">Hur funkar det?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg">
              Vi träffas digitalt via korta workshops (3h) och diskussioner.
              Du får regelbundna möten med experter, inspelade sessioner och ett forum för frågor.
            </p>
            <a
              href="https://holmdigital.se/natverk-inom-digital-tillganglighet/"
              target="_blank"
              className="inline-block bg-primary-600 text-white font-bold py-3 px-8 rounded-full hover:bg-primary-500 transition-colors no-underline"
            >
              Anmäl dig till nätverket
            </a>
          </div>

        </div>
      </>
    )
  },
  'about': {
    id: 'about',
    title: 'Om Mig',
    description: 'Min resa, värdegrund och varför jag brinner för digital inkludering.',
    lastUpdated: 'December 10, 2025',
    sections: [
      { id: 'story', title: 'Min historia' },
      { id: 'values', title: 'Värdegrund' },
      { id: 'why', title: 'Varför välja mig?' }
    ],
    content: (
      <>
        <div className="prose prose-slate max-w-none">

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="lead text-xl text-slate-600 mb-6">
                Jag vill vara din personliga digitala konsult på resan genom din digitala transformation.
              </p>
              <p className="text-slate-600">
                Jag förstår att varje företag är unikt och har sina egna utmaningar och mål. Därför strävar jag
                efter att skapa en helhetslösning som är skräddarsydd för att passa just din verksamhet.
              </p>
            </div>
            <img
              src="https://holmdigital.se/wp-content/uploads/2024/06/karusell_1024-15-min.webp"
              alt="Karin Holm"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
            />
          </div>

          <div className="mb-16 scroll-mt-24" id="values">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Min värdegrund</h2>
            <p className="text-lg text-slate-600 mb-4">
              Vad anser jag att Holm Digital ska stå för?
            </p>
            <div className="bg-purple-50 p-8 rounded-2xl border-l-4 border-purple-500">
              <p className="text-slate-700 italic text-lg m-0">
                "Som person tycker jag att varje människa har lika mycket värde oavsett om man har annan hudfärg eller funktionshinder.
                Därför blir min värdegrund som företagare att inkludering är en viktig aspekt att ha med i mitt företagande."
              </p>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Varför arbetar jag med tillgänglighet?</h3>
              <p className="text-slate-600">
                Det jag brinner mest för är tillgänglighet. Att skapa en webbplats, e-handel eller appar som är anpassade för att
                människor med funktionshinder blir inkluderade i den digitala världen. Att hjälpa de människor som inte alla tänker på.
              </p>
              <p className="text-slate-600 mt-4">
                För mig är detta personligt. Min son är en klippa, men har funktionshinder som gör att han har svårare att använda sig av internet.
                Därför värmer det mitt hjärta att tillgänglighet är på allas läppar nu.
              </p>
            </div>
          </div>

          <hr className="my-12 border-slate-200" />

          <div className="mb-16 scroll-mt-24" id="why">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Varför Välja Mig?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mt-0 mb-3">Engagemang</h3>
                <p className="text-sm text-slate-600 mb-0">
                  Jag prioriterar dina mål och utmaningar. Mitt engagemang sträcker sig bortom tekniska tjänster till att vara en dedikerad partner.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mt-0 mb-3">Resultat</h3>
                <p className="text-sm text-slate-600 mb-0">
                  Jag tror på mätbara resultat. Mina strategier är utformade för att maximera din synlighet och generera konkreta framgångar.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mt-0 mb-3">Långsiktighet</h3>
                <p className="text-sm text-slate-600 mb-0">
                  Jag investerar tid i vår relation och är här för att stödja din kontinuerliga framgång, oavsett var resan tar dig.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mt-0 mb-4">Vill du veta mer?</h3>
            <p className="mb-6 text-slate-600">
              Har du frågor om min bakgrund eller hur jag kan hjälpa dig?
            </p>
            <Button>Kontakta mig</Button>
          </div>

        </div>
      </>
    ),
  },
  'consulting': {
    id: 'consulting',
    title: 'Konsulttjänster',
    description: 'Specifik expertis för upphandlingar och kravställning.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <LayoutTemplate className="h-8 w-8 text-blue-600" />
            Konsulttjänster
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Specifik expertis för upphandlingar och kravställning. Jag hjälper er att navigera i den digitala världen.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mt-0 mb-3">Kravspecifikation</h3>
              <p className="text-slate-600 mb-4">
                Jag hjälper er ta fram tydliga kravspecifikationer för:
              </p>
              <ul className="space-y-2 text-slate-700 list-disc pl-5">
                <li>Ny webbplats (mål, omfång, designkrav)</li>
                <li>Digital tillgänglighet (WCAG-nivåer)</li>
                <li>Upphandling av digitala tjänster</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mt-0 mb-3">Hållbarhetskrav</h3>
              <p className="text-slate-600 mb-4">
                Integrera hållbarhet i era upphandlingar för att möta Agenda 2030-mål.
              </p>
              <ul className="space-y-2 text-slate-700 list-disc pl-5">
                <li>Analys av nuvarande hållbarhetsprestation</li>
                <li>Formulering av skall-krav och målkrav</li>
                <li>Uppföljningsplaner för leverantörer</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    ),
  },
  'contact': {
    id: 'contact',
    title: 'Kontakta Oss',
    description: 'Hör av dig så diskuterar vi hur vi kan hjälpa dig.',
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8">
            Är du intresserad av en analys, behöver hjälp med utveckling eller bara har frågor om digital tillgänglighet?
            Tveka inte att höra av dig.
          </p>

          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-slate-600" />
                E-post
              </h3>
              <a href="mailto:info@holmdigital.se" className="text-primary-600 font-medium hover:underline text-lg">
                info@holmdigital.se
              </a>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-600" />
                Webb
              </h3>
              <a href="https://holmdigital.se" target="_blank" className="text-primary-600 font-medium hover:underline text-lg">
                www.holmdigital.se
              </a>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Boka ett möte</h3>
            <p className="text-slate-600 mb-6">
              Vi tar gärna ett förutsättningslöst möte för att se vad som passar bäst för dig och din verksamhet.
            </p>
            <Button>Boka konsultation</Button>
          </div>

        </div>
      </>
    ),
  },
  'tillganglighetsanalys': {
    id: 'tillganglighetsanalys',
    title: 'Tillgänglighetsanalys',
    description: 'Analys av webbplatsens användarvänlighet för att identifiera dolda hinder.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Accessibility className="h-8 w-8 text-primary-600" />
            Tillgänglighetsanalys
          </h2>
          <p className="text-lg text-slate-600">
            Jag analyserar din webbplats, e-handel eller app för att se vilka hinder som finns och vad som behöver förbättras.
            Detta är kritiskt för att följa det nya EU-direktivet som träder i kraft för privat sektor i juni 2025.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mt-0 mb-4">Analyspaket</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Small */}
                <div className="p-4 border border-slate-100 rounded bg-slate-50">
                  <div className="text-primary-900 font-bold text-lg mb-1">Snabbanalys</div>
                  <div className="text-slate-900 font-bold text-2xl mb-3">20 000 kr</div>
                  <p className="text-xs text-slate-600 mb-4">För mindre webbplatser eller specifika flöden.</p>
                  <ul className="text-sm space-y-2 text-slate-700 mb-4">
                    <li>upp till 5 sidor</li>
                    <li>Automatiska tester</li>
                    <li>Manuell kontroll (rubriker, alt-texter)</li>
                    <li>Rapport med prio</li>
                  </ul>
                </div>
                {/* Medium */}
                <div className="p-4 border-2 border-primary-100 rounded bg-white shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] px-2 py-1 font-bold rounded-bl">POPULÄR</div>
                  <div className="text-primary-900 font-bold text-lg mb-1">Fördjupad</div>
                  <div className="text-slate-900 font-bold text-2xl mb-3">40 000 kr</div>
                  <p className="text-xs text-slate-600 mb-4">Säkerställ att tjänsten håller måttet.</p>
                  <ul className="text-sm space-y-2 text-slate-700 mb-4">
                    <li>5-10 sidor/flöden</li>
                    <li>Manuell WCAG 2.2 AA</li>
                    <li>Användartest med hjälpmedel</li>
                    <li>Genomgångsmöte</li>
                  </ul>
                </div>
                {/* Large */}
                <div className="p-4 border border-slate-100 rounded bg-slate-50">
                  <div className="text-primary-900 font-bold text-lg mb-1">Fullständig</div>
                  <div className="text-slate-900 font-bold text-2xl mb-3">70 000 kr</div>
                  <p className="text-xs text-slate-600 mb-4">För större plattformar med lagkrav.</p>
                  <ul className="text-sm space-y-2 text-slate-700 mb-4">
                    <li>Fullskalig analys</li>
                    <li>Manuella + auto tester</li>
                    <li>Interaktiva komponenter</li>
                    <li>Videogenomgång</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
            <strong>Osäker?</strong> Hör av dig så kikar jag på din tjänst och guidar dig rätt.
          </div>
        </div>
      </>
    ),
  },
  'seo': {
    id: 'seo',
    title: 'SEO',
    description: 'Sökmotoroptimering för att förbättra synlighet och ranking.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Search className="h-8 w-8 text-emerald-600" />
            Sökmotoroptimering (SEO)
          </h2>
          <p className="text-lg text-slate-600 mb-6 font-medium">
            Du har en hemsida idag, men gör den verkligen jobbet åt dig?
          </p>
          <div className="bg-emerald-50 border-emerald-100 p-6 rounded-xl mb-8">
            <p className="text-slate-700 mb-4">
              Jag möter ofta företagare som lagt tid och pengar på en webbplats, men ändå inte får nya kunder via den.
              Sanningen är att en otydlig, långsam eller gammal och ouppdaterad hemsida kan kosta dig affärer istället för att skapa dem.
            </p>
            <p className="text-slate-700 font-bold mb-0">
              "Syns du inte, finns du inte". 38% av besökarna lämnar en sida omedelbart om den ser oprofessionell ut.
            </p>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-4">Vad jag hjälper dig med</h3>
          <p className="text-slate-600 mb-8">
            Jag hjälper dig bygga en webbplats som syns och säljer. Genom att kombinera SEO med digital tillgänglighet når vi
            inte bara högre upp på Google, utan också ut till fler människor.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mt-0 mb-2">On-page SEO</h4>
              <p className="text-sm text-slate-600 m-0">
                Optimering av innehåll, titlar, meta-beskrivningar, och interna länkar direkt på webbplatsen.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mt-0 mb-2">Off-page SEO</h4>
              <p className="text-sm text-slate-600 m-0">
                Arbete utanför webbplatsen, t.ex. kvalitativa backlinks och närvaro på Google My Business.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 mt-0 mb-2">Teknisk SEO</h4>
              <p className="text-sm text-slate-600 m-0">
                Optimering av kod, laddhastighet och struktur för att göra Google nöjd.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
            <h3 className="text-emerald-900 font-bold text-lg mt-0 mb-4">Paket & Priser</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                <span className="font-medium text-emerald-900">Sökordsanalys (10 sökord)</span>
                <span className="font-bold text-emerald-700">5 490 kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                <span className="font-medium text-emerald-900">Grundlig SEO (20h)</span>
                <span className="font-bold text-emerald-700">20 000 kr</span>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  },
  'webbutveckling': {
    id: 'webbutveckling',
    title: 'Webbutveckling',
    description: 'Framtidssäkra webbplatser och digitala lösningar.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Code className="h-8 w-8 text-purple-600" />
            Webbutveckling
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Jag hjälper dig bygga framtidssäkra webbplatser, oftast i WordPress, som är snabba, säkra och enkla att hantera.
          </p>

          <div className="not-prose space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700 font-bold shrink-0 text-xl w-12 h-12 flex items-center justify-center">01</div>
              <div>
                <h3 className="text-slate-900 font-bold text-xl m-0">Ny hemsida från grunden</h3>
                <p className="text-slate-600 m-0 mt-2 leading-relaxed">
                  Behöver du en helt ny hemsida? Jag hjälper dig att ta fram en speciell och framtidssäker webbplats,
                  byggd i WordPress och anpassad efter dina behov. Tillsammans tar vi fram en kravspec. som fungerar som en trygg plan.
                  <br /><br />
                  <strong>Du får en lösning som:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Fungerar på alla enheter (mobilanpassad)</li>
                    <li>Har en lättskött och trygg admin</li>
                    <li>Är snabb, säker och optimerad för sökmotorer</li>
                  </ul>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700 font-bold shrink-0 text-xl w-12 h-12 flex items-center justify-center">02</div>
              <div>
                <h3 className="text-slate-900 font-bold text-xl m-0">Vidareutveckling</h3>
                <p className="text-slate-600 m-0 mt-2 leading-relaxed">
                  Har du redan en webbplats, men behöver förbättra den? Vi kartlägger problemen och vad som ska utvecklas.
                  Jag hjälper dig med nya sidor, formulär, integrationer (t.ex. statistikverktyg eller API:er),
                  kodförbättringar och tillgänglighetsanpassning. Utan att kompromissa med design eller funktion.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700 font-bold shrink-0 text-xl w-12 h-12 flex items-center justify-center">03</div>
              <div>
                <h3 className="text-slate-900 font-bold text-xl m-0">E-handel</h3>
                <p className="text-slate-600 m-0 mt-2 leading-relaxed">
                  Jag utvecklar nya e-handelssidor i WooCommerce. Vi upprättar en kravspecifikation för att tydligt definiera
                  kassaflöden, betallösningar och integrationer. Fokus ligger på konvertering, säkerhet och hållbar teknik.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-700 font-bold shrink-0 text-xl w-12 h-12 flex items-center justify-center">04</div>
              <div>
                <h3 className="text-slate-900 font-bold text-xl m-0">Appar & Digitala verktyg</h3>
                <p className="text-slate-600 m-0 mt-2 leading-relaxed">
                  Behöver du en app eller ett internt verktyg? Jag utvecklar allt från enklare appar till funktionella prototyper.
                  Alltid med fokus på tillgänglighet, prestanda och användarvänlighet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  },
  'anbud': {
    id: 'anbud',
    title: 'Upphandling & Anbud',
    description: 'Expertstöd vid offentlig upphandling (LOU) och anbudsskrivning.',
    hideHeader: true,
    lastUpdated: 'December 10, 2025',
    sections: [],
    content: (
      <>
        <div className="prose prose-slate max-w-none">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <LayoutTemplate className="h-8 w-8 text-blue-600" />
            Anbud & Offentlig Upphandling
          </h2>
          <p className="text-lg text-slate-600 mb-8 font-medium">
            Utifrån ert behov skapar jag de rätta bör- och skall-kraven som behövs till er upphandling.
            Jag hjälper även leverantörer att vinna upphandlingar genom strategisk kravanalys.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-12">
            <h3 className="text-blue-900 font-bold text-lg mt-0 mb-2">Vad är LOU?</h3>
            <p className="text-blue-800 m-0">
              Lagen om Offentlig Upphandling (LOU) styr inköp för stat, kommun och region.
              Det kan kännas krångligt, men rätt hanterat är det en enorm affärsmöjlighet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mt-0 mb-4">För Upphandlare</h3>
              <ul className="space-y-3 text-slate-600 list-none pl-0">
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Kravspecifikation (Bör & Skall)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Teknisk kravställning</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Utvärderingsmodeller</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mt-0 mb-4">För Leverantörer</h3>
              <ul className="space-y-3 text-slate-600 list-none pl-0">
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Strategi och kravanalys</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Struktur i anbudsarbetet</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Hållbarhets- & Tillgänglighetskrav</span>
                </li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-4">Hur jag hjälper dig vinna</h3>
          <div className="not-prose space-y-6 mb-12">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700 font-bold shrink-0">1</div>
              <div>
                <h4 className="font-bold text-slate-900 m-0">Strategisk Analys</h4>
                <p className="text-slate-600 m-0 text-sm">Jag avgör om upphandlingen är värd att satsa på och tolkar utvärderingsmodellen.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700 font-bold shrink-0">2</div>
              <div>
                <h4 className="font-bold text-slate-900 m-0">Skrivstöd</h4>
                <p className="text-slate-600 m-0 text-sm">Formulerar texter som är kärnfulla, tydliga och svarar exakt på kraven.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700 font-bold shrink-0">3</div>
              <div>
                <h4 className="font-bold text-slate-900 m-0">Digital Tillgänglighet</h4>
                <p className="text-slate-600 m-0 text-sm">Säkerställer att ni uppfyller alla krav på WCAG och EN 301 549.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl text-center">
            <p className="text-slate-700 mb-4 font-medium">Behöver du hjälp med en aktuell upphandling?</p>
            <a href="mailto:karin@holmdigital.se" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors no-underline">
              Kontakta mig
            </a>
          </div>
        </div>
      </>
    ),
  },
};