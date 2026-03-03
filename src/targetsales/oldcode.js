import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Calendar, ChevronDown } from "lucide-react";

import Header from "../components/header";
import withSessionContext from "../HOC/withSessionContext";

// AG GRID CSS (ensure loaded once in app)
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

/* ======================
   QUARTER → MONTH MAP
====================== */
const quarterMap = {
  Q1: ["April", "May", "June"],
  Q2: ["July", "August", "September"],
  Q3: ["October", "November", "December"],
  Q4: ["January", "February", "March"],
};

// API month number → Quarter + Month
const monthMap = {
  1: { q: "Q1", m: "April" },
  2: { q: "Q1", m: "May" },
  3: { q: "Q1", m: "June" },
  4: { q: "Q2", m: "July" },
  5: { q: "Q2", m: "August" },
  6: { q: "Q2", m: "September" },
  7: { q: "Q3", m: "October" },
  8: { q: "Q3", m: "November" },
  9: { q: "Q3", m: "December" },
  10: { q: "Q4", m: "January" },
  11: { q: "Q4", m: "February" },
  12: { q: "Q4", m: "March" },
};

const TargetSalesMonthToggle = () => {
  const [rowData, setRowData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedYear, setSelectedYear] = useState("");

  const grades = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
  ];

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - i);
  }, []);

  /* ======================
     API DATA TRANSFORM
  ====================== */
  const transformData = (apiData) => {
    const map = {};

    apiData.forEach((item) => {
      const key = `${item.sold_to}_${item.app_Description}`;
      const { q, m } = monthMap[item.month];

      if (!map[key]) {
        map[key] = {
          cust_Name: item.cust_Name,
          sold_to: item.sold_to,
          fieldOfficer: item.fieldOfficer,
          app_Description: item.app_Description,
        };
      }

      map[key][`(${q}) ${m}_target`] = item.total_Target;
      map[key][`(${q}) ${m}_sales`] = item.total_Sales;
      map[key][`(${q}) ${m}_achievement`] = item.achievement;
    });

    return Object.values(map);
  };

  /* ======================
     API CALL
  ====================== */
  const fetchData = async () => {
    try {
      const res = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetAPPTypeFinancialYearWise?strFinancialYear=202526",
        { method: "POST" }
      );
      const data = await res.json();

      console.log("data3",data)
      setRowData(transformData(data));
    } catch (e) {
      console.error("API Error", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ======================
     COLUMN GROUPS
     👉 Quarter click = hide/show months
  ====================== */
  const monthColumnGroups = Object.entries(quarterMap).map(
    ([quarter, months]) => ({
      headerName: quarter,
      marryChildren: true,
      openByDefault: false, // 🔥 default collapsed

      children: [
        // CLOSED STATE (jab quarter band ho)
        {
          headerName: "Total",
          columnGroupShow: "closed",
          valueGetter: () => "",
          width: 90,
        },

        // OPEN STATE (months)
        ...months.map((month) => ({
          headerName: month,
          marryChildren: true,
          columnGroupShow: "open",

          children: [
            {
              headerName: "Target",
              field: `(${quarter}) ${month}_target`,
            },
            {
              headerName: "Sales",
              field: `(${quarter}) ${month}_sales`,
            },
            {
              headerName: "Achievement %",
              field: `(${quarter}) ${month}_achievement`,
              valueFormatter: (p) =>
                p.value !== undefined ? `${p.value}%` : "",
            },
          ],
        })),
      ],
    })
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "Customer Name", field: "cust_Name", pinned: "left" },
      { headerName: "Sold To", field: "sold_to", pinned: "left" },
      { headerName: "FSM", field: "fieldOfficer", pinned: "left" },
      {
        headerName: "App Description",
        field: "app_Description",
        pinned: "left",
      },
      ...monthColumnGroups,
    ],
    []
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      {/* FILTERS */}
      <div className="p-4 bg-white shadow rounded m-4">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Select Period</h3>
          </div>

          <div>
            <label>Grade</label>
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border rounded px-4 py-2 pr-8"
              >
                {grades.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4" />
            </div>
          </div>

          <div>
            <label>Year</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border rounded px-4 py-2 pr-8"
              >
                <option value="">Select</option>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4" />
            </div>
          </div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded">
            Filter
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="p-4">
        <div className="ag-theme-alpine" style={{ height: 550 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              flex: 1,
            }}
            pagination
            paginationPageSize={10}
          />
        </div>
      </div>
    </div>
  );
};

export default withSessionContext(TargetSalesMonthToggle);
