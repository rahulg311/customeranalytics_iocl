import React, { useMemo } from "react";
import { FileDown, Table as TableIcon } from "lucide-react";

function SectorReportTable({ data = [] }) {

  /* ---------------- BASIC ---------------- */
  const zones = useMemo(() => data.map(d => d.zone), [data]);

  const format = n =>
    new Intl.NumberFormat("en-IN").format(Math.round(n || 0));

  const pillColor = p =>
    p >= 75 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";


  const sectorGroups = useMemo(() => {
    const map = {};
    data.forEach(z => {
      z.lstZoneSegmentWise.forEach(seg => {
        if (!map[seg.segment]) map[seg.segment] = new Set();
        seg.lstZoneSegmentwiseTargerVsSales.forEach(s =>
          map[seg.segment].add(s.sector)
        );
      });
    });
    return Object.entries(map).map(([name, sectors]) => ({
      name,
      sectors: Array.from(sectors)
    }));
  }, [data]);


  const getCell = (zone, segment, sector) => {
    const z = data.find(d => d.zone === zone);
    const s = z?.lstZoneSegmentWise.find(x => x.segment === segment);
    const sec = s?.lstZoneSegmentwiseTargerVsSales.find(
      x => x.sector === sector
    );
    return { target: sec?.target || 0, sales: sec?.sales || 0 };
  };


  const getSegmentTotal = (zone, segment) => {
    let t = 0, s = 0;
    sectorGroups
      .find(g => g.name === segment)
      ?.sectors.forEach(sec => {
        const v = getCell(zone, segment, sec);
        t += v.target;
        s += v.sales;
      });
    return { target: t, sales: s };
  };


  const renderTotalRow = (
    label,
    segments,
    bg,
    text = "text-black",
    border = "border-slate-400"
  ) => {

    let grandT = 0;
    let grandS = 0;

    return (
      <tr className={`${bg} ${text} font-bold`}>
        <td className={`sticky left-0 ${bg} p-3 border-b-2 border-r-2 ${border}`}>
          {label}
        </td>

        {zones.map(zone => {
          let t = 0, s = 0;
          segments.forEach(seg => {
            const v = getSegmentTotal(zone, seg);
            t += v.target;
            s += v.sales;
          });

          grandT += t;
          grandS += s;

          const ach = t ? (s / t) * 100 : 0;

          return (
            <React.Fragment key={zone}>
              <td className={`p-3 text-right border-b-2 border-r ${border}`}>
                {format(t)}
              </td>
              <td className={`p-3 text-right border-b-2 border-r ${border}`}>
                {format(s)}
              </td>
              <td className={`p-3 text-center border-b-2 border-r-2 ${border}`}>
                <span className={`px-3 py-1 rounded-md ${pillColor(ach)}`}>
                  {ach.toFixed(0)}%
                </span>
              </td>
            </React.Fragment>
          );
        })}


        <td className={`p-3 text-right border-b-2 border-r ${border}`}>
          {format(grandT)}
        </td>
        <td className={`p-3 text-right border-b-2 border-r ${border}`}>
          {format(grandS)}
        </td>
        <td className={`p-3 text-center border-b-2 border-r-2 ${border}`}>
          <span className={`px-3 py-1 rounded-md ${pillColor((grandS / grandT) * 100)}`}>
            {grandT ? ((grandS / grandT) * 100).toFixed(0) : 0}%
          </span>
        </td>
      </tr>
    );
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-xl border" style={{ marginBottom: "80px" }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TableIcon className="w-7 h-7 text-blue-600" />
          <h2 className="text-2xl font-bold">Sector-wise Detailed Report</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
          <FileDown className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th rowSpan={2} className="sticky left-0 p-3 border-r-2 border-slate-400">
                SECTORS
              </th>

              {zones.map(z => (
                <th key={z} colSpan={3} className="p-3 border-l-2 border-slate-400">
                  {z}
                </th>
              ))}

            
              <th colSpan={3} className="p-3 border-l-2 border-slate-400 bg-slate-800">
                TOTAL
              </th>
            </tr>

            <tr className="bg-slate-600 text-white">
              {[...zones, "TOTAL"].map((z, i) => (
                <React.Fragment key={i}>
                  <th className="p-2 border-l-2 border-r border-slate-400">Target</th>
                  <th className="p-2 border-r border-slate-400">Sales</th>
                  <th className="p-2 border-r-2 border-slate-400">% Ach</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {sectorGroups.map(g => (
              <React.Fragment key={g.name}>
                {g.sectors.map(sec => {
                  let rowT = 0, rowS = 0;

                  return (
                    <tr key={sec}>
                      <td className="sticky left-0 bg-white p-2 font-medium border-b border-r-2 border-slate-300">
                        {sec}
                      </td>

                      {zones.map(z => {
                        const { target, sales } = getCell(z, g.name, sec);
                        rowT += target;
                        rowS += sales;
                        const ach = target ? (sales / target) * 100 : 0;

                        return (
                          <React.Fragment key={z}>
                            <td className="p-2 text-right border-b border-r border-slate-300">
                              {format(target)}
                            </td>
                            <td className="p-2 text-right border-b border-r border-slate-300">
                              {format(sales)}
                            </td>
                            <td className="p-2 text-center border-b border-r-2 border-slate-300">
                              <span className={`px-2 py-0.5 rounded ${pillColor(ach)}`}>
                                {ach.toFixed(0)}%
                              </span>
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* ✅ TOTAL COLUMN */}
                      <td className="p-2 text-right border-b border-r border-slate-300 font-semibold">
                        {format(rowT)}
                      </td>
                      <td className="p-2 text-right border-b border-r border-slate-300 font-semibold">
                        {format(rowS)}
                      </td>
                      <td className="p-2 text-center border-b border-r-2 border-slate-300">
                        <span className={`px-2 py-0.5 rounded ${pillColor((rowS / rowT) * 100)}`}>
                          {rowT ? ((rowS / rowT) * 100).toFixed(0) : 0}%
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {renderTotalRow(`${g.name} Total`, [g.name], "bg-slate-200")}
              </React.Fragment>
            ))}

            {renderTotalRow("PE Total", ["Dedicated", "Swing"], "bg-blue-200")}

            {renderTotalRow(
              "Grand Total",
           ["PP", "Dedicated", "Swing"],
              "bg-blue-900",
              "text-white",
              "border-white"
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectorReportTable;





