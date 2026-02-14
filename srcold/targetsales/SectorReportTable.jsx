import React, { useMemo, useRef } from 'react';
import { FileDown, Table as TableIcon } from 'lucide-react';

 function SectorReportTable() {

     const zones = [];
const sortedSectorGroups = [];

const formatNumber = (num) => {
  const value = Number(num);

  if (!value || isNaN(value)) return '0';

  return new Intl.NumberFormat('en-IN').format(
    Math.round(value)
  );
};



const  processedData= [];
const  peTotalData= [];
const  ungroupedSectors= [];
const  grandTotals= {};




const calculateTotal = (sectorList) => {
  const totalRow = {};

  zones.forEach((zone) => {
    totalRow[zone] = {  };
  });

  sectorList.forEach((sector) => {
    if (processedData?.[sector]) {
      zones.forEach((zone) => {
        totalRow[zone]+=
          Number(processedData[sector]?.[zone]);

        totalRow[zone].actualSales +=
          Number(processedData[sector]?.[zone]?.actualSales || 0);
      });
    }
  });

  return totalRow;
};



const getAchievementPillColor = (achievement) => {
  if (achievement < 75) return 'bg-red-100 text-red-800';
  return 'bg-green-100 text-green-800';
};

const renderTotalRow = (label, totalData) => {
  const grandTotal = { };

  zones.forEach((zone) => {
    if (totalData?.[zone]) {
      grandTotal += Number(totalData[zone]);
      grandTotal.actualSales += Number(totalData[zone].actualSales || 0);
    }
  });

  const totalAchievement =
    grandTotal > 0
      ? (grandTotal / grandTotal) * 100
      : 0;

  return (
    <tr className="bg-slate-200 font-extrabold text-slate-800 text-base">
      <td className="sticky left-0 bg-slate-200 p-3 border-b-2 border-slate-400 border-r-2 border-slate-300">
        {label}
      </td>

      {zones.map((zone) => {

        const achievement = {};

        return (
          <React.Fragment key={zone}>
            <td className="p-3 border-b-2 border-slate-400 border-r border-gray-300 text-right">
              {formatNumber()}
            </td>

            <td className="p-3 border-b-2 border-slate-400 border-r border-gray-300 text-right">
              {formatNumber()}
            </td>

            <td className="p-3 border-b-2 border-slate-400 border-r-2 border-slate-300 text-center">
              <span
                className={`px-2 py-1 rounded-md ${getAchievementPillColor(
                  achievement
                )}`}
              >
                {achievement.toFixed(0)}%
              </span>
            </td>
          </React.Fragment>
        );
      })}

      <td className="p-3 border-b-2 border-slate-400 border-r border-gray-300 text-right">
        {formatNumber(grandTotal)}
      </td>

      <td className="p-3 border-b-2 border-slate-400 border-r border-gray-300 text-right">
        {formatNumber(grandTotal)}
      </td>

      <td className="p-3 border-b-2 border-slate-400 text-center">
        <span
          className={`px-2 py-1 rounded-md ${getAchievementPillColor(
            totalAchievement
          )}`}
        >
          {totalAchievement.toFixed(0)}%
        </span>
      </td>
    </tr>
  );
};







  const renderSectorRow = () => {
    const rowData = [];
    const rowExists = !!rowData;
    const rowTotal = {};
    if (rowExists) {
        zones.forEach(zone => {
            rowTotal += rowData[zone];
            rowTotal.actualSales += rowData[zone]?.actualSales || 0;
        });
    }
    const rowAchievement = rowTotal > 0 ? (rowTotal.actualSales / rowTotal) * 100 : 0;
    return (
      <tr  className="hover:bg-blue-50/50 transition-colors duration-150">
        <td className="sticky left-0 bg-white hover:bg-blue-50/50 p-2 border-b border-r-2 border-gray-300 font-semibold text-gray-800">{}</td>
        {/* {zones.map(zone => {
          const cellData = rowExists ? (rowData[zone] || { target: 0, actualSales: 0 }) : { target: 0, actualSales: 0 };
          const achievement = cellData.target > 0 ? (cellData.actualSales / cellData.target) * 100 : 0;
          return (
            <React.Fragment key={zone}>
              <td className="p-2 border-b border-r border-gray-200 text-right font-mono text-gray-700">{formatNumber(cellData.target)}</td>
              <td className="p-2 border-b border-r border-gray-200 text-right font-mono font-semibold text-gray-900">{formatNumber(cellData.actualSales)}</td>
              <td className="p-2 border-b border-r-2 border-gray-300 text-center"><span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${getAchievementPillColor(achievement)}`}>{achievement.toFixed(0)}%</span></td>
            </React.Fragment>
          );
        })} */}
        <td className="p-2 border-b border-r border-gray-200 text-right font-mono font-bold text-gray-800">{formatNumber(rowTotal)}</td>
        <td className="p-2 border-b border-r border-gray-200 text-right font-mono font-extrabold text-black">{formatNumber(rowTotal)}</td>
        <td className="p-2 border-b border-gray-200 text-center"><span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${getAchievementPillColor(rowAchievement)}`}>{rowAchievement.toFixed(0)}%</span></td>
      </tr>
    );
  };
     
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
              <th rowSpan={2} className="sticky left-0 bg-slate-700 p-3 border-r-2 border-slate-400 align-bottom uppercase tracking-wider">Sectors</th>
              {zones.map(zone => (<th key={zone} colSpan={3} className="p-3 border-l-2 border-slate-400 text-center uppercase tracking-wider">{zone}</th>))}
              <th colSpan={3} className="p-3 border-l-2 border-slate-400 text-center uppercase tracking-wider">Total</th>
            </tr>
            <tr className="bg-slate-600 text-white font-semibold">
              {zones.concat('Total').map((z, index) => (
                <React.Fragment key={z}>
                  <th className={`p-2 font-medium border-r border-slate-500 ${index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-500'}`}>Target</th>
                  <th className="p-2 font-medium border-r border-slate-500">Sales</th>
                  <th className="p-2 border-r-2 border-slate-400 font-medium">% Ach.</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSectorGroups.map(group => (
              <React.Fragment key={group.name}>
                {group.sectors.sort().map(sectorInGroup => renderSectorRow(sectorInGroup))}
                {renderTotalRow(group.name, calculateTotal(group.sectors))}
                
                {group.name === 'Swing Total' && peTotalData && (
                    renderTotalRow('PE Total', peTotalData)
                )}
              </React.Fragment>
            ))}
            {ungroupedSectors.map(ungroupedSector => renderSectorRow(ungroupedSector))}
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