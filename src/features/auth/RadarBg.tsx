export default function RadarBg() {
  return (
    <div className="absolute inset-0 -z-10 bg-neutral-950">
      {/* halos */}
      <div className="absolute -top-20 -left-32 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-3xl animate-[float_12s_ease-in-out_infinite]"></div>

      {/* grid */}
      <div className="absolute inset-0 opacity-[0.18] [background:radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.06)_41%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_24px),repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_24px)] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]"></div>

      {/* RADAR */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative h-[34rem] w-[34rem] rounded-full border border-white/10 overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-white/10"></div>
          <div className="absolute inset-8 rounded-full border border-white/10"></div>
          <div className="absolute inset-16 rounded-full border border-white/10"></div>
          <div className="absolute inset-24 rounded-full border border-white/10"></div>
          <div className="absolute inset-0 origin-center animate-[sweep_6s_linear_infinite] [background:conic-gradient(from_0deg,rgba(99,102,241,0.35),transparent_25%)]"></div>
          {/* Dots */}
          <span className="gps-dot gps1"></span>
          <span className="gps-dot gps2"></span>
          <span className="gps-dot gps3"></span>
        </div>
      </div>
    </div>
  );
}
