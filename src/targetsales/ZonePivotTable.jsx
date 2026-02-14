import React, { useRef, useEffect, useMemo } from "react";
import { FileDown, Table as TableIcon } from "lucide-react";

function ZonePivotTable({ ZonewiseTotal, activeTab }) {
  const tableRef = useRef(null);
  console.log("activeTab--", activeTab, ZonewiseTotal)

  const ZonewiseTotals = useMemo(() => {
    return ZonewiseTotal?.lstZonewiseTotaltargetSalesRes ?? [];
  }, [ZonewiseTotal]);

  console.log(ZonewiseTotal.zone, "ZonewiseTotalsss");

  const fetchTargetSales = async () => {
    // API logic can be added later
  };

  useEffect(() => {
    fetchTargetSales();
  }, []);

  const handleExport = () => {
    // Export logic commented intentionally (your original code)
  };


  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 mb-5" style={{ marginBottom: "80px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TableIcon className="w-7 h-7 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            {activeTab == "overview" ? "combined (PP+PE) Performance" : activeTab == "pp" ? " PP Performance" : "PE  Performance"}
          </h3>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <FileDown className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-700 text-white">
              <td className="p-2 border-x border-slate-500">
                Actual Sales
              </td>

              {ZonewiseTotals.map((zone) => (
                <th
                  key={zone.zone}
                  className="p-2 border-x border-slate-500"
                >
                  {zone.zone}
                </th>
              ))}

              <th className="p-2 border-l border-slate-500">Total</th>
            </tr>
          </thead>

          <tbody>
            {/* Total Target */}
            <tr className="odd:bg-white even:bg-slate-50/70 font-medium">
              <td className="p-2 border-b border-r border-slate-200 font-bold">
                Total Target
              </td>
              {ZonewiseTotals.map((zone) => (
                <td
                  key={`target-${zone.zone}`}
                  className="p-2 border-b border-r border-slate-200 font-bold"
                >
                  {zone.totaltarget}
                </td>
              ))}
              <td className="p-2 border-b border-r border-slate-200 font-bold">
                {ZonewiseTotal?.totalzonetarget}
              </td>
            </tr>

            {/* Prorated Target */}
            <tr className="odd:bg-white even:bg-slate-50/70 font-medium">
              <td className="p-2 border-b border-r border-slate-200 font-bold">
                Prorated Target
              </td>
              {ZonewiseTotals.map((zone) => (
                <td
                  key={`prorated-${zone.zone}`}
                  className="p-2 border-b border-r border-slate-200 font-bold"
                >
                  {zone.totalProratedtarget}
                </td>
              ))}
              <td className="p-2 border-b border-r border-slate-200 font-bold">
                {ZonewiseTotal?.totalzoneproratedtarget}
              </td>
            </tr>

            {/* Actual Sales */}
           <tr className="odd:bg-white even:bg-slate-50/70 font-medium">
  <td className="p-2 border-b border-r border-slate-200 font-bold">
    Actual Sales
  </td>
  {ZonewiseTotals.map((zone) => (
    <td
      key={`sales-${zone.zone}`}
      className="p-2 border-b border-r border-slate-200 font-bold"
    >
      {zone.totalsales != null ? Number(zone.totalsales).toFixed(0) : "-"}
    </td>
  ))}
  <td className="p-2 border-b border-r border-slate-200 font-bold">
    {ZonewiseTotal?.totalzonesales != null
      ? Number(ZonewiseTotal.totalzonesales).toFixed(0)
      : "-"}
  </td>
</tr>




            {/* Achievement */}
        <tr className="odd:bg-white even:bg-slate-50/70 font-medium">
  <td className="p-2 border-b border-r border-slate-200 font-bold">
    % Achievement
  </td>

  {ZonewiseTotals.map((zone) => {
    const achievement = zone?.totalAchievement ?? 0;

    return (
      <td
        key={`ach-${zone.zone}`}
        className={`p-2 border-b border-r border-slate-200 font-bold ${
          achievement < 75
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {achievement.toFixed(0)}%
      </td>
    );
  })}

  {(() => {
    const total = ZonewiseTotal?.totalZoneAchievement ?? 0;

    return (
      <td
        className={`p-2 border-b border-r border-slate-200 font-bold ${
          total < 75
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {total.toFixed(0)}%
      </td>
    );
  })()}
</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ZonePivotTable;
