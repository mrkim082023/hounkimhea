export default function ClientLogos({ clients }) {
  if (!clients || clients.length === 0) return null;

  // Repeat the list so the strip loops seamlessly even with only a few logos.
  const base = clients.length < 6 ? [...clients, ...clients, ...clients] : clients;
  const loop = [...base, ...base];
  const seconds = Math.max(24, base.length * 5);

  return (
    <div className="group/marquee relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex items-center gap-14 md:gap-20 w-max animate-marquee" style={{ animationDuration: `${seconds}s` }}>
        {loop.map((client, i) => (
          <div key={i} className="shrink-0 flex items-center justify-center h-16 w-36 md:w-44" title={client.name}>
            {client.logo ? (
              <img
                src={client.logo}
                alt={client.name}
                loading="lazy"
                className="max-h-14 max-w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-500"
              />
            ) : (
              <span className="text-sm tracking-widest uppercase text-bone/40 hover:text-gold-300 transition-colors duration-300 whitespace-nowrap">
                {client.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
