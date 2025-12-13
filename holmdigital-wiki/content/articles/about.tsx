import React from 'react';
import { ArticleData } from '../../types';

export const aboutArticle: ArticleData = {
    id: 'about',
    title: 'About HolmDigital',
    description: 'Digital Accessibility, SEO & Web Development Consulting.',
    lastUpdated: 'December 10, 2025',
    sections: [
        { id: 'services', title: 'Our Services' },
        { id: 'audit', title: 'Accessibility Audit' },
        { id: 'seo', title: 'SEO' }
    ],
    content: (
        <>
            <div className="prose prose-slate max-w-none">
                <p className="lead text-xl text-slate-600">
                    Holm Digital helps companies grow through accessible and result-oriented digital solutions
                    that create visibility, impact, and long-term success.
                </p>

                <div className="my-8">
                    <h2 id="audit">Accessibility Analysis (WCAG 2.2)</h2>
                    <p>
                        I help companies reach more customers through an analysis of the website's usability,
                        identifying hidden barriers without the need to rebuild the entire site or risk legal consequences.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <h4 className="mt-0 text-slate-900">Expert Audit Options</h4>
                        <ul className="mb-4">
                            <li><strong>Small Report:</strong> 5-10 prioritized remarks</li>
                            <li><strong>Medium Report:</strong> 15-30 remarks</li>
                            <li><strong>Full WCAG Audit:</strong> 50-100+ remarks with detailed action plan</li>
                        </ul>
                        <a
                            href="https://holmdigital.se/tillganglighetsanalys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Book an Analysis
                        </a>
                    </div>
                </div>

                <div className="my-8">
                    <h2 id="seo">Search Engine Optimization (SEO)</h2>
                    <p>
                        Optimizing your website and content to improve visibility and ranking on search engine result lists.
                        By optimizing your site, I help Google find your homepage. The goal is to attract organic traffic
                        that converts.
                    </p>
                    <a
                        href="https://holmdigital.se/sokmotoroptimering"
                        className="text-primary-600 font-semibold hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read more about SEO Services →
                    </a>
                </div>

                <div className="my-8">
                    <h2 id="dev">Web Development</h2>
                    <p>
                        Helping you develop your website, e-commerce, or app with new pages, analysis tools, forms, or content.
                        Also available for building completely new websites from scratch with accessibility built-in.
                    </p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-center">
                    <div>
                        <h3 className="mt-0 mb-2">Need a custom solution?</h3>
                        <p className="mb-0 text-slate-600">Contact us to discuss your specific needs.</p>
                    </div>
                    <a
                        href="https://holmdigital.se/kontakt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Contact HolmDigital
                    </a>
                </div>

            </div>
        </>
    )
};
