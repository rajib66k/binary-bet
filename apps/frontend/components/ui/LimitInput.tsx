export default function LimitInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
}) {
    return (
        <label className="min-w-0 rounded-2xl border border-gray-200 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
            <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold outline-none" />
        </label>
    );
}