export default function Loading() {
  return (
    <main className="sm:mx-20 mx-[5vw] md:mt-7 mt-[3vh]">
      <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div key={card} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </main>
  );
}
