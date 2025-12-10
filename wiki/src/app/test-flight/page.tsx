'use client';

import { Button, FormField } from '@holmdigital/components';

export default function TestFlightPage() {
    return (
        <div className="space-y-12 max-w-3xl mx-auto pb-20">
            <div className="border-b border-gray-200 pb-8">
                <h1 className="text-3xl font-bold text-gray-900">Test Flight ✈️</h1>
                <p className="mt-4 text-xl text-gray-500">
                    En testsida designad för att validera @holmdigital/engine.
                    Innehåller både tillgängliga komponenter och avsiktliga fel.
                </p>
            </div>

            {/* SEKTION 1: Avsiktliga Fel (The Bad) */}
            <section className="space-y-6 bg-red-50 p-8 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">❌</span>
                    <h2 className="text-2xl font-bold text-red-800">Avsiktliga Fel</h2>
                </div>
                <p className="text-red-700 mb-4">
                    Dessa element ska flaggas av scannern.
                </p>

                <div className="space-y-8">
                    {/* Regel: color-contrast */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">1. Dålig Kontrast</h3>
                        <button style={{
                            backgroundColor: '#ccc',
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            fontSize: '14px'
                        }}>
                            osynlig text
                        </button>
                    </div>

                    {/* Regel: form-labels */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">2. Saknad Label</h3>
                        <input type="text" placeholder="Skriv här utan label..." style={{ padding: '8px' }} />
                    </div>

                    {/* Regel: alt-text */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">3. Saknad Alt-text</h3>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <img src="https://placehold.co/100x100" />
                    </div>

                    {/* Regel: keyboard-accessible */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">4. Div som knapp (Ej tangentbord)</h3>
                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                        <div onClick={() => alert('Clicked')} style={{
                            padding: '10px',
                            background: '#ddd',
                            display: 'inline-block',
                            cursor: 'pointer'
                        }}>
                            Klicka mig (Div)
                        </div>
                    </div>
                </div>
            </section>

            {/* SEKTION 2: Korrekta Komponenter (The Good) */}
            <section className="space-y-6 bg-green-50 p-8 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">✅</span>
                    <h2 className="text-2xl font-bold text-green-800">HolmDigital Komponenter</h2>
                </div>
                <p className="text-green-700 mb-4">
                    Dessa element ska passera validering.
                </p>

                <div className="space-y-8">
                    {/* Lösning: Button */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">1 & 4. Tillgänglig Knapp</h3>
                        <div className="flex gap-4">
                            <Button variant="primary">Korrekt Kontrast</Button>
                            <Button variant="secondary">Sekundär</Button>
                        </div>
                    </div>

                    {/* Lösning: FormField */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">2. Tillgängligt Formulärfält</h3>
                        <FormField
                            label="E-postadress"
                            placeholder="namn@exempel.se"
                            helpText="Vi delar inte din e-post."
                        />
                    </div>

                    {/* Lösning: Alt-text */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">3. Bild med Alt-text</h3>
                        <img src="https://placehold.co/100x100" alt="Placeholder bild för testning" />
                    </div>
                </div>
            </section>
        </div>
    );
}
