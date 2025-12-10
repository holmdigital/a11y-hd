import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  title: string;
  href: string; // Used as ID for this SPA demo
  children?: NavItem[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
}

export interface ArticleData {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  content: ReactNode;
  sections: Section[];
}

export type WcagLevel = 'A' | 'AA' | 'AAA';
export type ImpactLevel = 'Critical' | 'Serious' | 'Moderate' | 'Minor';

export interface Rule {
  id: string;
  name: string;
  wcagId: string;
  wcagLevel: WcagLevel;
  impact: ImpactLevel;
  description: string;
  tags: string[];
  technicalGuidance?: string;
  commonMistakes?: string[];
  whyItMatters?: string;
  codeExample?: string;
  insight?: string;
}