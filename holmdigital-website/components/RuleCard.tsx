import React from 'react';
import { Rule, WcagLevel, ImpactLevel } from '../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface RuleCardProps {
  rule: Rule;
}

const ImpactIcon = ({ level }: { level: ImpactLevel }) => {
  switch (level) {
    case 'Critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'Serious': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'Moderate': return <Info className="h-4 w-4 text-blue-600" />;
    case 'Minor': return <CheckCircle2 className="h-4 w-4 text-slate-500" />;
  }
};

const ImpactBadge = ({ level }: { level: ImpactLevel }) => {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border-red-200',
    Serious: 'bg-amber-50 text-amber-700 border-amber-200',
    Moderate: 'bg-blue-50 text-blue-700 border-blue-200',
    Minor: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level]}`}>
      <ImpactIcon level={level} />
      {level}
    </span>
  );
};

const LevelBadge = ({ level }: { level: WcagLevel }) => {
  const styles = {
    A: 'bg-slate-100 text-slate-600 border-slate-200',
    AA: 'bg-primary-50 text-primary-700 border-primary-200',
    AAA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${styles[level]}`}>
      {level}
    </span>
  );
};

export const RuleCard: React.FC<RuleCardProps> = ({ rule }) => {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-primary-300 transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-mono text-slate-600 mb-1 block">WCAG {rule.wcagId}</span>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
            {rule.name}
          </h3>
        </div>
        <LevelBadge level={rule.wcagLevel} />
      </div>

      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
        {rule.description}
      </p>

      {/* RICH CONTENT EXPANSION */}
      <div className="space-y-4 mb-4 border-t border-slate-100 pt-3">
        {rule.whyItMatters && (
          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <strong className="text-slate-900 block mb-1 text-xs uppercase tracking-wide">Why it matters</strong>
            <p className="text-slate-700">{rule.whyItMatters}</p>
          </div>
        )}

        <details className="group/details">
          <summary className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 list-none">
            <span className="group-open/details:rotate-90 transition-transform inline-block">▶</span> Show Technical Details
          </summary>
          <div className="pt-3 space-y-3 pl-4">
            {rule.technicalGuidance && (
              <div>
                <strong className="text-slate-900 text-xs block mb-1">Technical Guidance</strong>
                <p className="text-slate-600 text-sm">{rule.technicalGuidance}</p>
              </div>
            )}

            {rule.commonMistakes && rule.commonMistakes.length > 0 && (
              <div>
                <strong className="text-slate-900 text-xs block mb-1">Common Mistakes</strong>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {rule.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}

            {rule.codeExample && (
              <div className="mt-2">
                <strong className="text-slate-900 text-xs block mb-1">Code Example</strong>
                <pre className="bg-slate-900 text-primary-200 p-3 rounded-md text-xs font-mono overflow-x-auto">
                  {rule.codeExample}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <ImpactBadge level={rule.impact} />

        <div className="flex gap-2">
          {rule.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {rule.tags.length > 2 && (
            <span className="text-xs text-slate-600 px-1 py-1">+ {rule.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
};