import {
    getDatabaseStats,
    getAllConvergenceRules
} from '@holmdigital/standards';

export default function Home() {
    const stats = getDatabaseStats();
    const rules = getAllConvergenceRules();

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Regulatorisk Kunskapsdatabas
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                    Överbryggar klyftan mellan WCAG, EN 301 549 och DOS-lagen.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Totala Regler</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalRules}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">IKT Manual Checks</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalICTChecks}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Kritiska Risker (DIGG)</dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.rulesByDiggRisk.critical}</dd>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Senaste Regelnätverket</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {rules.slice(0, 5).map((rule) => (
                            <li key={rule.ruleId}>
                                <a href={`/regler/${rule.ruleId}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary-600 truncate">{rule.wcagTitle}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${rule.holmdigitalInsight.diggRisk === 'critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    Risk: {rule.holmdigitalInsight.diggRisk.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    WCAG {rule.wcagCriteria}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    EN {rule.en301549Criteria}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>{rule.dosLagenReference}</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
