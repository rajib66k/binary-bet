export default function EmptyState({ title, description }: { title: string; description: string; }) {
    return (
        <section className="rounded-3xl border border-[#03a9f4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{description}</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">{title}</h2>
        </section>
    );
}