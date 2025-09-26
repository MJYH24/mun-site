import Link from "next/link";

type Committee = {
  slug: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  name: string;
  blurb: string;
};

const committees: Committee[] = [
  {
    slug: "ga-beginner",
    level: "Beginner",
    name: "General Assembly — Foundational",
    blurb:
      "Perfect for first-time delegates. Focus on procedure basics, speaking, and simple draft resolutions.",
  },
  {
    slug: "eco-intermediate",
    level: "Intermediate",
    name: "ECOSOC — Economic & Social",
    blurb:
      "For delegates with some experience. Emphasis on bloc building, amendments, and moderated caucuses.",
  },
  {
    slug: "sc-advanced",
    level: "Advanced",
    name: "Security Council — Crisis & Strategy",
    blurb:
      "For experienced delegates. Faster pace, operative detail, and real-time directives/crisis updates.",
  },
];

export default function CommitteesPage() {
  const card =
    "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition";

  const btn =
    "inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 text-sm font-semibold transition-all duration-200 " +
    "shadow-sm hover:shadow-md hover:border-zinc-400 hover:bg-zinc-50";

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-zinc-900">Committees</h1>
        <p className="text-zinc-600">
          Three levels to match your experience. Click a committee to view details and resources.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {committees.map((c) => (
          <article key={c.slug} className={card}>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
              {c.level}
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">{c.name}</h2>
            <p className="text-zinc-700 mt-2">{c.blurb}</p>

            <div className="mt-4 flex gap-3">
              <Link href={`/committees/${c.slug}`} className={btn}>
                View details
              </Link>
              {/* Placeholder resources link; replace with real URL later */}
              <Link href={`/resources/${c.slug}`} className={btn}>
                Resources
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}