export default function DecisionValue({ label, value }: { label: string; value: string; }) {
    return (
        <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-2 break-words text-sm font-medium text-gray-800">{value}</p>
        </div>
    );
}