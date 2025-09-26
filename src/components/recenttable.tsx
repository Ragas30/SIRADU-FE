const RecentTable: React.FC = () => (
  <div className="bg-gray-800/70 border border-gray-700 rounded-2xl overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-700 text-sm font-medium text-gray-200">Aktivitas Terbaru</div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-800/70 text-gray-400">
          <tr>
            <th className="text-left px-4 py-2">Tanggal</th>
            <th className="text-left px-4 py-2">Aktivitas</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Jumlah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {[
            { date: "11 Sep 2025", activity: "Transaksi #INV-10239", status: "Sukses", amount: "Rp 1.250.000" },
            { date: "11 Sep 2025", activity: "Transaksi #INV-10238", status: "Pending", amount: "Rp 310.000" },
            { date: "10 Sep 2025", activity: "Retur Barang R-223", status: "Sukses", amount: "Rp 120.000" },
          ].map((row, i) => (
            <tr key={i} className="hover:bg-gray-800/40">
              <td className="px-4 py-2 text-gray-300">{row.date}</td>
              <td className="px-4 py-2 text-gray-100">{row.activity}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-lg border ${row.status === "Sukses" ? "bg-emerald-900/20 text-emerald-300 border-emerald-700/40" : "bg-yellow-900/20 text-yellow-300 border-yellow-700/40"}`}>{row.status}</span>
              </td>
              <td className="px-4 py-2 text-gray-200">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default RecentTable;
