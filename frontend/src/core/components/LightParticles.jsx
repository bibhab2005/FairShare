const LightParticles = () => {
  const particles = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: Math.random() * 50 + 10,
    width: Math.random() * 4 + 4,
    height: Math.random() * 12 + 8,
    delay: Math.random() * -20,
    duration: Math.random() * 20 + 20,
    color: ['bg-emerald-300', 'bg-teal-300', 'bg-blue-300', 'bg-indigo-300', 'bg-sky-300'][Math.floor(Math.random() * 5)],
    opacityDuration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-40">
      <div className="relative w-[800px] h-[800px]" style={{ animation: 'vortex 60s linear infinite' }}>
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.color}`}
            style={{
              top: '50%',
              left: '50%',
              width: `${p.width}px`,
              height: `${p.height}px`,
              transform: `rotate(${p.angle}deg) translateY(-${p.distance}vh)`,
              animation: `pulse-opacity ${p.opacityDuration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LightParticles;
