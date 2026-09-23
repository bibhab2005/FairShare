export const GroupCardSkeleton = () => (
  <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-[2.5rem] p-10 animate-pulse">
    <div className="w-12 h-12 bg-neutral-400/20 rounded-2xl mb-6"></div>
    <div className="h-6 bg-neutral-400/20 rounded-md w-3/4 mb-3"></div>
    <div className="h-4 bg-neutral-400/20 rounded-md w-full mb-8"></div>
    <div className="flex items-center gap-4 mt-6">
      <div className="h-4 bg-neutral-400/20 rounded-md w-1/4"></div>
      <div className="h-4 bg-neutral-400/20 rounded-md w-1/4"></div>
    </div>
  </div>
);

export const ExpenseRowSkeleton = () => (
  <div className="flex items-center justify-between p-6 rounded-3xl bg-white/60 backdrop-blur-sm border border-neutral-200/50 shadow-sm animate-pulse">
    <div className="flex items-center gap-5 min-w-0">
      <div className="w-12 h-12 rounded-full bg-neutral-400/20 shrink-0"></div>
      <div className="min-w-0 space-y-2">
        <div className="h-5 bg-neutral-400/20 rounded-md w-32"></div>
        <div className="h-4 bg-neutral-400/20 rounded-md w-48"></div>
      </div>
    </div>
    <div className="flex items-center gap-6 shrink-0 ml-4">
      <div className="text-right space-y-2">
        <div className="h-6 bg-neutral-400/20 rounded-md w-24"></div>
        <div className="h-4 bg-neutral-400/20 rounded-md w-16 ml-auto"></div>
      </div>
    </div>
  </div>
);

export const BalanceCardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 shadow-sm rounded-3xl p-6">
      <div className="h-4 bg-neutral-400/20 rounded-md w-32 mb-4"></div>
      <div className="flex items-center gap-3">
        <div className="h-8 bg-neutral-400/20 rounded-md w-24"></div>
        <div className="h-4 bg-neutral-400/20 rounded-md w-16"></div>
      </div>
    </div>
    <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 shadow-sm rounded-3xl p-6">
      <div className="h-4 bg-neutral-400/20 rounded-md w-40 mb-4"></div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-400/10 border border-neutral-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-400/20"></div>
              <div className="w-4 h-4 bg-neutral-400/20 rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-neutral-400/20"></div>
              <div className="h-4 bg-neutral-400/20 rounded-md w-24 ml-2"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 bg-neutral-400/20 rounded-md w-16"></div>
              <div className="w-24 h-10 rounded-full bg-neutral-400/20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
