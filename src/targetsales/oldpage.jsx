import React, { useMemo, useRef, useState } from 'react';
import { FileDown, Table as TableIcon } from 'lucide-react';

function SectorReportTable({ data }) {
  const rows = [];
  data.forEach((zoneObj) => {
    const zone = zoneObj.zone;
    zoneObj.lstZoneSegmentWise.forEach((seg) => {
      const segment = seg.segment;
      seg.lstZoneSegmentwiseTargerVsSales.forEach((item) => {
        rows.push({
          sector: item.sector,
          zone,
          
          target: item.target,
          sales: item.sales,
          achievement: item.achievement.toFixed(2) + "%",
          segment,
          
        });
      });
    });
  });
  const uniquezone = Array.from(
    new Map(rows.map(item => [item.zone, item])).values()
  );

  console.log("rows",data)



 const tableData = {};

// rows = flat data with segment info (assumed segment available in item.segment)
rows.forEach(item => {
  const { sector, zone, target, sales, segment } = item;

  if (!tableData[segment]) {
    tableData[segment] = {};
  }

  if (!tableData[segment][sector]) {
    tableData[segment][sector] = {
      sector,
      zones: {},
      segment,

    };
  }

  tableData[segment][sector].zones[zone] = {
    target: Number(target),
    sales: Number(sales),
    achievement: target > 0 ? ((sales / target) * 100).toFixed(0) : 0,
  };
});

const finalSegments = Object.entries(tableData).map(([segment, sectors]) => ({
  segment,
  sectors: Object.values(sectors),
}));

const segmentTotals = {};

// rows me segment property hona chahiye (jaise pehle bola)
rows.forEach(({ segment, target, sales }) => {
  if (!segmentTotals[segment]) {
    segmentTotals[segment] = {
      target: 0,
      sales: 0,
    };
  }
  segmentTotals[segment].target += Number(target);
  segmentTotals[segment].sales += Number(sales);
});
  console.log("rows",finalSegments)


  const zones = [...new Set(rows.map(item => item.zone))];


  const formatNumber = (num) => {
    const value = Number(num);

    if (!value || isNaN(value)) return '0';

    return new Intl.NumberFormat('en-IN').format(
      Math.round(value)
    );
  };





  const grandTotals = {};


  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><TableIcon className="w-7 h-7 text-blue-600" /><h3 className="text-2xl font-bold text-gray-800">Sector-wise Detailed Report</h3></div>
        <button onClick={""} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"><FileDown className="w-4 h-4" />Export to Excel</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-700 text-white">
              <th
                rowSpan={2}
                className="sticky left-0 bg-slate-700 p-3 border-r-2 border-slate-400 align-bottom uppercase tracking-wider"
              >
                Sectors
              </th>
              {uniquezone.map((row, idx) => (
                <th
                  // key={`${item.zone}-${index}`}
                  colSpan={3}
                  className="p-3 border-l-2 border-slate-400 text-center uppercase tracking-wider"
                >
                  {row.zone}
                </th>
              ))}

              <th
                colSpan={3}
                className="p-3 border-l-2 border-slate-400 text-center uppercase tracking-wider"
              >
                Total
              </th>
            </tr>
            <tr className="bg-slate-600 text-white font-semibold">
              {data.map((z, index) => (
                <React.Fragment key={z}>
                  <th className={`p-2 font-medium border-r border-slate-500 ${index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-500'}`}>Target</th>
                  <th className="p-2 font-medium border-r border-slate-500">Sales</th>
                  <th className="p-2 border-r-2 border-slate-400 font-medium">% Ach.</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
 <tbody>
  {finalSegments.map(({ segment, sectors }) => {
    const total = segmentTotals[segment];
    const totalAch = total.target > 0 ? ((total.sales / total.target) * 100).toFixed(0) : 0;

    return (
      <React.Fragment key={segment}>
    
        {sectors.map((row, idx) => (
          <tr key={idx} className="border-b">
            <td className="sticky left-0 bg-white p-3 font-semibold border-r-2 border-slate-400">
              {row.sector}
            </td>

            {zones.map(zone => {
              const z = row.zones[zone] || { target: 0, sales: 0, achievement: 0 };
              return (
                <React.Fragment key={zone}>
                  <td className="p-2 text-right">{z.target.toLocaleString()}</td>
                  <td className="p-2 text-right">{z.sales.toLocaleString()}</td>
                  <td className={`p-2 text-center ${z.achievement < 75 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {z.achievement}%
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
        ))}

          <tr className="bg-gray-300 font-bold text-lg sticky top-0">
          <td colSpan={zones.length * 3 + 1}>
            {segment} Segment Total — Target: {total.target.toLocaleString()}, Sales: {total.sales.toLocaleString()}, Ach.: {totalAch}%
          </td>
        </tr>
      </React.Fragment>
    );
  })}
</tbody>

          <tfoot className="sticky bottom-0 bg-blue-900 text-white font-extrabold text-base">
            <tr>
              <td className="sticky left-0 bg-blue-900 p-3 border-r-2 border-blue-700">Grand Total</td>
              {zones.concat('Total').map(zone => {
                const totalData = grandTotals[zone];
                const achievement = totalData > 0 ? (totalData / totalData) * 100 : 0;
                const achievementColor = achievement < 75 ? 'bg-red-500' : 'bg-green-500';
                return (
                  <React.Fragment key={zone}>
                    <td className="p-3 border-l-2 border-blue-700 text-right">{formatNumber(totalData)}</td>
                    <td className="p-3 text-right">{formatNumber(totalData)}</td>
                    <td className={`p-3 border-r-2 border-blue-700 text-center ${achievementColor}`}>{achievement.toFixed(0)}%</td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
export default SectorReportTable