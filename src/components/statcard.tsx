const StatCard: React.FC<{ title: string; value: string; desc?: string; icon?: React.ReactNode }> = ({ title, value, desc, icon }) => (
  <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-4 sm:p-5 shadow hover:shadow-gray-900/40 transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-100 mt-1">{value}</h3>
        {desc && <p className="text-xs text-gray-500 mt-1">{desc}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-gray-700/60 border border-gray-600 flex items-center justify-center text-gray-200">
        {icon ?? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3a1 1 0 112 0v8m-2 10h2m7-7H4" />
          </svg>
        )}
      </div>
    </div>
  </div>
);

export default StatCard;
