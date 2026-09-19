const FluidAurora = () => {
  return (
    <>
      <style>{`
        @keyframes blob1 {
          0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
          33% { transform: translate(10%, -15%) scale(1.1) rotate(10deg); }
          66% { transform: translate(-10%, 10%) scale(0.9) rotate(-10deg); }
          100% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
        }
        @keyframes blob2 {
          0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
          33% { transform: translate(-15%, 10%) scale(0.9) rotate(-15deg); }
          66% { transform: translate(15%, -15%) scale(1.1) rotate(10deg); }
          100% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
        }
        @keyframes blob3 {
          0% { transform: translate(0%, 0%) scale(1.1) rotate(0deg); }
          50% { transform: translate(20%, 20%) scale(0.9) rotate(20deg); }
          100% { transform: translate(0%, 0%) scale(1.1) rotate(0deg); }
        }
        .animate-aurora-1 { animation: blob1 18s infinite alternate ease-in-out; }
        .animate-aurora-2 { animation: blob2 22s infinite alternate-reverse ease-in-out; }
        .animate-aurora-3 { animation: blob3 25s infinite alternate ease-in-out; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center bg-black">
        <div className="relative w-full h-full max-w-7xl mix-blend-screen opacity-100">
          <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-indigo-600/60 rounded-full filter blur-[100px] animate-aurora-1"></div>
          <div className="absolute top-[20%] right-[10%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-fuchsia-600/60 rounded-full filter blur-[100px] animate-aurora-2"></div>
          <div className="absolute bottom-[10%] left-[30%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-600/60 rounded-full filter blur-[100px] animate-aurora-3"></div>
        </div>
      </div>
    </>
  );
};

export default FluidAurora;
