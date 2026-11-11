export default function ClientLogos({ clients }) {
  if (!clients || clients.length === 0) return null;

  const loop = [...clients, ...clients];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex items-center gap-16 w-max animate-marquee">
        {loop.map((client, i) => (
          <div key={i} className="shrink-0 flex items-center justify-center h-12 w-32">
            {client.logo ? (
              <img
                src={client.logo}
                alt={client.name}
                className="max-h-10 max-w-full object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            ) : (
              <span className="text-sm tracking-widest uppercase text-bone/30 hover:text-gold-300 transition-colors duration-300 whitespace-nowrap">
                {client.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}