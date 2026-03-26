const FEATURES = [
  {
    title: "Brand-first recommendations",
    description: "Every response adapts to your category, voice, audience, and conversion intent.",
  },
  {
    title: "Real-time creative flow",
    description: "Receive guidance token by token so your team can iterate instantly.",
  },
  {
    title: "Production-safe architecture",
    description: "API keys remain protected server-side behind dedicated Express proxy routes.",
  },
];

function FeatureList() {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {FEATURES.map((feature) => (
        <article
          key={feature.title}
          className="rounded-2xl border border-stone-200/70 bg-white/75 p-4 shadow-[0_10px_35px_-28px_rgba(50,30,10,0.5)]"
        >
          <h2 className="text-base text-stone-900">{feature.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}

export default FeatureList;
