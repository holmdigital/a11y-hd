import RegulatoryMapper from '@/components/RegulatoryMapper';

export default function KonvergensSchemaPage() {
    return (
        <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
                <h1 className="text-3xl font-bold text-gray-900">Konvergensschema</h1>
                <p className="mt-4 text-xl text-gray-500">
                    Den visuella kartläggningen av hur tekniska fel (WCAG) mappar mot juridiska risker (EN 301 549 & DOS-lagen).
                </p>
            </div>

            <RegulatoryMapper />
        </div>
    );
}
