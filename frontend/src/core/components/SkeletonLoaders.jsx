export const GroupCardSkeleton = () => (
  <div className="apple-glass-card border border-white/80 rounded-[2.25rem] p-8 shadow-apple-sm animate-pulse">
    <div className="w-12 h-12 bg-slate-200/70 rounded-2xl mb-6"></div>
    <div className="h-6 bg-slate-200/70 rounded-lg w-3/4 mb-3"></div>
    <div className="h-4 bg-slate-200/70 rounded-lg w-full mb-8"></div>
    <div className="flex items-center gap-4 mt-6">
      <div className="h-4 bg-slate-200/70 rounded-lg w-1/4"></div>
      <div className="h-4 bg-slate-200/70 rounded-lg w-1/4"></div>
    </div>
  </div>
);

export const ExpenseRowSkeleton = () => (
  <div className="flex items-center justify-between p-5 rounded-2xl apple-glass-card border border-white/80 shadow-apple-xs animate-pulse">
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-11 h-11 rounded-full bg-slate-200/70 shrink-0"></div>
      <div className="min-w-0 space-y-2">
        <div className="h-4 bg-slate-200/70 rounded-md w-32"></div>
        <div className="h-3.5 bg-slate-200/70 rounded-md w-48"></div>
      </div>
    </div>
    <div className="flex items-center gap-6 shrink-0 ml-4">
      <div className="text-right space-y-2">
        <div className="h-5 bg-slate-200/70 rounded-md w-24"></div>
        <div className="h-3.5 bg-slate-200/70 rounded-md w-16 ml-auto"></div>
      </div>
    </div>
  </div>
);

export const BalanceCardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="apple-glass-card border border-white/80 shadow-apple-sm rounded-[2rem] p-6">
      <div className="h-4 bg-slate-200/70 rounded-md w-32 mb-4"></div>
      <div className="flex items-center gap-3">
        <div className="h-8 bg-slate-200/70 rounded-md w-24"></div>
        <div className="h-4 bg-slate-200/70 rounded-md w-16"></div>
      </div>
    </div>
    <div className="apple-glass-card border border-white/80 shadow-apple-sm rounded-[2rem] p-6">
      <div className="h-4 bg-slate-200/70 rounded-md w-40 mb-4"></div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200/70"></div>
              <div className="w-4 h-4 bg-slate-200/70 rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-slate-200/70"></div>
              <div className="h-4 bg-slate-200/70 rounded-md w-24 ml-2"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 bg-slate-200/70 rounded-md w-16"></div>
              <div className="w-24 h-9 rounded-full bg-slate-200/70"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
