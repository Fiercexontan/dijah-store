import { JEANS_GUIDE } from "@/lib/size-guide";

export default function SizeGuide() {
  const guide = JEANS_GUIDE;

  return (
    <details className="glass rounded-2xl p-4">
      <summary className="cursor-pointer font-semibold">{guide.title}</summary>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-b border-white/20">
              {guide.columns.map((c) => (
                <th key={c} className="px-2 py-2 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row[0]} className="border-b border-white/10">
                {row.map((cell, i) => (
                  <td key={i} className={i === 0 ? "px-2 py-2 font-semibold" : "px-2 py-2"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-lilac">{guide.note}</p>
    </details>
  );
}