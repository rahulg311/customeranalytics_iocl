import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import SelectBox from "../components/SelectBox";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { AgGridReact } from "ag-grid-react";
import {
  Table,
  ChartSpline,
  FileText,
  Users,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import KPIComponent from "../components/KPIComponent";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GradeCompModal from "../components/GradeCompModal";
import axios from "axios";
import { RingLoader } from "react-spinners";
import { style } from "framer-motion/client";

const CustomerAPPsignedvsSales = (props) => {
  let zonedata = props.sessionContext?.logininPlantData?.zone_code ?? [];
  const api = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);
  // months dropdown data
  const months = [
    { id: 0, label: "All Months" },
    { id: 10, label: "January" },
    { id: 11, label: "February" },
    { id: 12, label: "March" },
    { id: 1, label: "April" },
    { id: 2, label: "May" },
    { id: 3, label: "June" },
    { id: 4, label: "July" },
    { id: 5, label: "August" },
    { id: 6, label: "September" },
    { id: 7, label: "October" },
    { id: 8, label: "November" },
    { id: 9, label: "December" },
  ];

 const columnDefs = [
    {
      headerName: "Customer Name",
      field: "customerName",
      cellClass: "font-bold text-gray-700 border-r border-b border-gray-200 p-2 text-left",
    headerClass: "bg-blue-500 text-white font-semibold border-r border-gray-200 p-2 text-left",
      pinned: "left",
      flex: 1,
    },
    {
      headerName: "Sold To Party",
      field: "soldtoparty",
     
   valueFormatter: (params) => {
        if (!params.value) return "";

        return String(params.value).slice(4);
      },
         headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200 p-2 text-left",
      flex: 1,
    },
    {
      headerName: "APP Type",
      field: "appType",
      flex: 1,
       maxWidth: 530,
        width: 10,
        headerStyle: {
        //   backgroundColor: "#99c0fd",
          fontWeight: "600",
          alignItems:"center",

          minWidth: 50,
        },
      cellRenderer: (params) => {
        const value = params.value;
        const color =
          value === "PP"
            ? "bg-blue-700"
            : value === "PE"
            ? "bg-violet-700"
            : value === "Flexi"
            ? "bg-orange-600"
            : "bg-green-600";

        return (
         <div className="mt-2">
             <span
            className={`px-3 ml-5 mt-6 py-1 rounded-xl mt-10 text-sm text-white ${color}` }
          >
            {value}
          </span>
         </div>
        );
      },
    },
    {
      headerName: "APP Sub Type",
      field: "appSubType",
      headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200 p-2 text-left",
      flex: 1,
    },
    {
      headerName: "Field Officer",
      field: "fieldOfficer",
      headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200  text-left",
      flex: 1,
    },
    {
      headerName: "Zone",
      field: "zoneName",
      headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200 p-2 text-left",
      flex: 1,
    },
    {
      headerName: "APP Qty(MT)",
      field: "target",
 headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200 p-2 text-left",
      flex: 1,
    },
    {
      headerName: "Sales Qty(MT)",
      field: "sales",
 headerClass: "bg-blue-500  text-gray-600 text-white font-semibold border-r border-gray-200 p-2 text-left",
      flex: 1,
    },
    {
      headerName: "Achievement",
      field: "achievement",
      flex: 1,
      cellRenderer: (params) => {
        const value = Math.floor(params.value || 0);

        const barColor =
          value === 0
            ? "bg-gray-300"
            : value > 75
            ? "bg-red-500"
            : value < 100
            ? "bg-yellow-500"
            : "bg-green-600";

        const textColor =
          value < 75
            ? "text-red-500"
            : value < 100
            ? "text-yellow-600"
            : "text-green-600";

        return (
          <div className="flex items-center gap-3 mt-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${barColor}`}
                style={{ width: `${Math.min(value, 150)}%` }}
              />
            </div>
            <span className={`font-semibold text-sm ${textColor}`}>
              {value}%
            </span>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      cellRenderer: (params) => (
        <span className="bg-blue-600 text-white px-2 py-1 rounded-xl text-xs font-medium">
          {params.value}
        </span>
      ),
    },
  ];





  const [tableRowData, settableRowData] = useState([]);

  console.log("loading", loading);

  // curret financial year
  const today = new Date();
  const currentMonthId = today.getMonth() + 10;

  const getCurrentFY = () => {
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    return m >= 4 ? `FY-${y}-${y + 1}` : `FY-${y - 1}-${y}`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthId);
  const [fyYears, setFyYears] = useState([]);
  const [selectedFY, setSelectedFY] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("0");
  const [appTypes, setAppTypes] = useState([]);
  const [selectedAppType, setSelectedAppType] = useState("0");
  const [viewChart, setViewChart] = useState(true);

  const [loadingKpi,setLoadingKpi] = useState(false);
  const [kpiData, setKpiData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [ZoneChartData,setZoneChartData] = useState([])

  
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const filteredData = useMemo(() => {
    //  if (!searchText) return tableRowData;
    return tableRowData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase()),
      ),
    );
  }, [tableRowData, searchText]);

  // pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  // Drop down Apis -financial year -----
  const fetchFinancialYears = async () => {
    // ;
    try {
      const res = await axios.get(`${api}/TargetSales/GetAllFY`);
      Array.isArray(res?.data)
        ? setFyYears(
            res.data.map((item) => ({
              ...item,
              id: Number(item.id),
            })),
          )
        : setFyYears([]);
      const currentFYLabel = getCurrentFY();
      console.log(currentFYLabel);
      const matchedFY = res?.data.find((f) => f.label === currentFYLabel);
      if (matchedFY) {
        setSelectedFY(Number(matchedFY.id));
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      // ;
    }
  };

  // Drop down Apis - Zone -----
  const fetchZone = async () => {
    // ;
    try {
      const res = await axios.get(`${api}/TargetSales/ZoneMaster`);
      console.log(res.data);
      if (Array.isArray(res?.data)) {
        const formattedZones = res.data.map((item) => ({
          id: item.zo_Code,
          label: item.zo_Name,
        }));
        setZones([{ id: "0", label: "All Zones" }, ...formattedZones]);
      } else {
        setZones([{ id: "0", label: "All Zones" }]);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      // ;
    }
  };

  useEffect(() => {
    fetchFinancialYears();
    fetchZone();
  }, []);

  // Drop down Apis -APP types -----
  const fetchAPPTypes = async (selectedFY) => {
    if (!selectedFY) return;
    // ;
    try {
      const res = await axios.post(`${api}/TargetSales/GetAllAppType`, {
        fy: String(selectedFY),
      });
      Array.isArray(res?.data)
        ? setAppTypes([{ id: "0", label: "All APP" }, ...res.data])
        : setAppTypes([{ id: "0", label: "All APP" }]);
    } catch (error) {
      console.log("Error", error);
    } finally {
      // ;
    }
  };

  useEffect(() => {
    fetchAPPTypes(selectedFY);
  }, [selectedFY]);

  // dummy kpis data
  useEffect(() => {
    GetCustomerapicall();
    CustomerPerfomanceTargetVsSales();

    ChartGetTargetVsSalesByAppType();
  }, [selectedFY, selectedMonth, selectedZone, selectedAppType]);

//   const ChartGetTargetVsSalesByAppType = async () => {
//     let URL =
//       "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetTargetVsSalesByAppType";
//         let URL_Zone =
//       "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetTargetVsSalesByZoneWise";
      
//     setLoadingKpi(false);
//     setLoading(false);
//     try {
//       const response = await fetch(URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           month: selectedMonth,
//           financialYear: String(selectedFY),
//           zone: String(selectedZone),
//           appType: String(selectedAppType),
//         }),
//       });

//       // 🔹 HTTP error handle
//       if (!response.ok) {
//         throw new Error(`Server Error: ${response.status}`);
//       }

//       const result = await response.json();

//       console.log("datadata 1", result);
//       // 🔹 Empty / invalid data handle
//       if (!result) {
//         throw new Error("No data received from API");
//       }
//      setZoneChartData(result)
//       setChartData(result);
//       setLoadingCharts(false);
//       console.log("response", result);
//     } catch (error) {
//       console.error("API Error:", error.message);
//       setKpiData([]); // optional fallback
//     } finally {
//       setTimeout(() => {
//         setLoadingKpi(true);
//         setLoading(true);
//       }, 500);
//     }
//   };





const ChartGetTargetVsSalesByAppType = async () => {
  let URL =
    "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetTargetVsSalesByAppType";

  let URL_Zone =
    "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetTargetVsSalesByZoneWise";

  setLoadingKpi(false);
  setLoading(false);

  try {
    const bodyData = {
      month: selectedMonth,
      financialYear: String(selectedFY),
      zone: String(selectedZone),
      appType: String(selectedAppType),
    };

    // ✅ Both API call parallel but independent
    const results = await Promise.allSettled([
      fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      }),
      fetch(URL_Zone, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      }),
    ]);

    // 🔹 First API result
    if (results[0].status === "fulfilled") {
      const res1 = results[0].value;
      if (res1.ok) {
        const data1 = await res1.json();
        setChartData(data1);
      } else {
        setChartData([]);
        console.error("AppType API HTTP Error");
      }
    } else {
      setChartData([]);
      console.error("AppType API Failed");
    }

    // 🔹 Second API result
    if (results[1].status === "fulfilled") {
      const res2 = results[1].value;
      if (res2.ok) {
        const data2 = await res2.json();
        setZoneChartData(data2);
      } else {
        setZoneChartData([]);
        console.error("Zone API HTTP Error");
      }
    } else {
      setZoneChartData([]);
      console.error("Zone API Failed");
    }

    setLoadingCharts(false);

  } catch (error) {
    console.error("Unexpected Error:", error.message);
  } finally {
    setTimeout(() => {
      setLoadingKpi(true);
      setLoading(true);
    }, 500);
  }
};

  const GetCustomerapicall = async () => {
    let URL =
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetCustomerAppSignedVsSalesFY";
    setLoadingKpi(false);
    setLoading(false);
    try {
      // ;

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          financialYear: String(selectedFY),
          zone: String(selectedZone),
          appType: String(selectedAppType),
        }),
      });

      // 🔹 HTTP error handle
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();

      console.log("datadata 1", result);
      // 🔹 Empty / invalid data handle
      if (!result) {
        throw new Error("No data received from API");
      }

      setKpiData(result);
      console.log("response", result);
    } catch (error) {
      console.error("API Error:", error.message);
      setKpiData([]); // optional fallback
    } finally {
      setTimeout(() => {
        setLoadingKpi(true);
        setLoading(true);
      }, 500);
    }
  };

  
  const CustomerPerfomanceTargetVsSales = async () => {
    let URL =
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetCustomerPerfomanceTargetVsSales";
    setLoading(false);
    setLoadingKpi(false);
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: selectedMonth,
          financialYear: String(selectedFY),
          zone: String(selectedZone),
          appType: String(selectedAppType),
        }),
      });

      // 🔹 HTTP error handle
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const result = await response.json();

      console.log("datadata 1", result);

      // 🔹 Empty / invalid data handle
      if (!result) {
        throw new Error("No data received from API");
      }

      settableRowData(result);
      console.log("response", result);
    } catch (error) {
      console.error("API Error:", error.message);
      // setKpiData([]); // optional fallback
    } finally {
      setTimeout(() => {
        setLoadingKpi(true);
        setLoading(true);
      }, 500);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 rounded-lg border shadow text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill }}>
            {p.name}: {p.value.toLocaleString()}
            {p.dataKey === "achievement" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  };

  const COLORS = ["#8b5cf6", "#16a34a", "#f59e0b", "#3b82f6"];

  // loading skeleton
  const ChartLoader = () => (
    <div className="p-6">
      <Skeleton height={24} width={160} className="mb-4" />
      <Skeleton height={260} />
    </div>
  );

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };



  const defaultColDef = {
     flex: 1,

  filter: true, // 👈 header filter enable
//   floatingFilter: true, // 👈 header ke niche input box


  flex: 1,
  resizable: true,
  sortable: true,
  cellClass: "border-r border-b border-gray-200 p-0 text-sm",
  headerClass: "bg-blue-500 text-white font-semibold border-r border-gray-200 p-2 text-sm",
};
  return (
    <div className="min-h-screen flex flex-col">
      <Header headerName={"Customer MoU vs Sales Analytics"} />
      <div className="p-4 mb-10">
        {/* -------- Filters -------- */}
        <div className="bg-white rounded-xl shadow border p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectBox
            label="Financial Year"
            value={selectedFY}
            onChange={setSelectedFY}
            options={fyYears}
          />
          <SelectBox
            label="Month"
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={months}
          />
          <SelectBox
            label="Zone"
            value={selectedZone}
            onChange={setSelectedZone}
            options={zones}
          />
          <SelectBox
            label="APP Type"
            value={selectedAppType}
            onChange={setSelectedAppType}
            options={appTypes}
          />
        </div>

        {loading ? (
          <>
            {/* -------- KPI -------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
              <KPIComponent
                title="Total APP Quantity (MT)"
                value={kpiData?.app_Qty}
                icon={FileText}
                loading={loadingKpi}
                bgColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white"
              />
              <KPIComponent
                title="Total Customers"
                value={kpiData?.total_Customer}
                icon={Users}
                loading={loadingKpi}
                bgColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white"
              />
              <KPIComponent
                title="Active APPs"
                value={kpiData?.active_App}
                icon={Target}
                loading={loadingKpi}
                bgColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white"
              />
              <KPIComponent
                title="Sales Achieved (MT)"
                value={kpiData?.sales_AchievedMT}
                icon={TrendingUp}
                loading={loadingKpi}
                bgColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white"
              />
              <KPIComponent
                title="Overall Achievement"
                value={kpiData?.achievement_Per}
                icon={BarChart3}
                per={"%"}
                loading={loadingKpi}
                bgColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white"
              />
            </div>

            {/* -------- Toggle -------- */}
            {/* <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewChart(!viewChart)}
                className="bg-green-700 text-white px-3 py-1 rounded-md flex items-center gap-2"
              >
                {viewChart ? "View table report" : "View charts report"}
                {viewChart ? <Table size={18} /> : <ChartSpline size={18} />}
              </button>
            </div> */}

            {viewChart ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <div className="bg-white rounded-xl shadow border p-5 h-[420px] flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    APP vs Sales by Type
                  </h2>
                  {loadingCharts ? (
                    <ChartLoader />
                  ) : (
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          {" "}
                          <CartesianGrid strokeDasharray="3 3" />
                          {/* X Axis should use appType */}{" "}
                          <XAxis dataKey="appType" />
                          <YAxis yAxisId="left" />
                          {/* <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => ${v}%} /> */}
                          <Tooltip content={<CustomTooltip />} /> 
                                    <Legend 
                        // layout="vertical" 
                        // verticalAlign="middle" 
                        // align="right"
                     
                        // wrapperStyle={{ paddingLeft: "20px" }}
                        />

                          {/* Target */}{" "}
                          <Bar
                            yAxisId="left"
                            dataKey="target"
                            fill="#3b82f6"
                            name="Target"
                          />
                          {/* Sales */}
                          <Bar
                            yAxisId="left"
                            dataKey="sales"
                            fill="#8b5cf6"
                            name="Sales Achieved"
                          />
                          {/* Achievement % */}
                          <Bar
                            yAxisId="right"
                            dataKey="achievement"
                            fill="#16a34a"
                            name="Achievement "
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                {/* -------- Pie Chart -------- */}
                <div className="bg-white rounded-xl shadow border p-5 h-[420px] flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    APP Distribution by Type
                  </h2>
                  {loadingCharts ? (
                    <ChartLoader />
                  ) : (
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="target" // target value
                            nameKey="appType" // app type name
                            outerRadius={110}
                            label
                          >
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>

                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                {/* ------- Zone Chart -------- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow border p-5 h-[420px] flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Zone-wise Performance Analysis
                  </h2>
                  {loadingCharts ? (
                    <ChartLoader />
                  ) : (
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        {/* ZoneChartData */}
                        <BarChart data={ZoneChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="zone" />
                          <YAxis yAxisId="left" />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />

                          <Bar
                            yAxisId="left"
                            dataKey="target"
                            fill="#3b82f6"
                            name="APP Qty"
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="sales"
                            fill="#22c55e"
                            name="Sales Qty"
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="achievement"
                            fill="#f59e0b"
                            name="Achievement %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray rounded-xl shadow border p-4  " >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">
                    Customer Performance Details
                  </h2>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="border rounded px-3 py-1"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="p-2 text-left">Customer Name</th>
                        <th className="p-2">Sold To Party</th>
                        <th className="p-2">APP Type</th>
                        <th className="p-2">APP Sub Type</th>
                        <th className="p-2">Field Officer</th>
                        <th className="p-2">Zone</th>
                        <th className="p-2">APP Qty(MT)</th>
                        <th className="p-2">Sales Qty(MT)</th>
                        <th className="p-2">Achievement</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedData.map((row, i) => (
                        <tr
                          key={i}
                          onClick={() => handleRowClick(row)}
                          className="border-b hover:bg-blue-50"
                        >
                          <td className="p-2 text-left font-bold text-gray-700">
                            {row.customerName}
                          </td>
                          <td className="p-2 text-center text-gray-600">
                            {row.soldtoparty}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-3 py-1 rounded-xl text-sm text-white text-1xl  ${row.appType == "PP" ? "bg-blue-700" : row.appType == "PE" ? "bg-violet-700" : row.appType == "Flexi" ? "bg-orange-600" : "bg-green-600"}`}
                            >
                              {row.appType}
                            </span>
                          </td>
                          <td className="p-2 text-center text-gray-600">
                            {row.appSubType}
                          </td>
                          <td className="p-2 text-center text-gray-600">
                            {row.fieldOfficer}
                          </td>
                          <td className="p-2 text-center text-gray-600">
                            {row.zoneName}
                          </td>
                          <td className="p-2 text-center font-semibold text-gray-800">
                            {row.target}
                          </td>
                          <td className="p-2 text-center font-semibold text-gray-800">
                            {row.sales}
                          </td>
                      
                          <td className="p-2">
                            <div className="flex items-center gap-3">
                      
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          
                                <div
                                  className={`h-2 rounded-full ${
                                    row.achievement === 0
                                      ? "bg-gray-300"
                                      : row.achievement > 75
                                        ? "bg-red-500"
                                        : row.achievement < 100
                                          ? "bg-yellow-500"
                                          : "bg-green-600"
                                  }`}
                                  style={{
                                    width: `${Math.min(Math.floor(row.achievement), 150)}%`,
                                  }}
                                />
                              </div>

                        
                              <span
                                className={`font-semibold text-sm ${row.achievement < 75 ? "text-red-500" : row.achievement < 100 ? "text-yellow-600" : "text-green-600"}`}
                              >
                                {row.achievement}%
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-xl text-xs font-medium">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


{/* 
                <div
      className="ag-theme-alpine "
      style={{  width: "100%"  }}
    >
      <AgGridReact
        rowData={filteredData}
        columnDefs={columnDefs}
            defaultColDef={defaultColDef}
        
        pagination={true}
        paginationPageSize={10}
        onRowClicked={(event) => handleRowClick(event.data)}
        headerHeight={45}
         rowHeight={40}
        domLayout="autoHeight"
      />
    </div> */}

                {/* Pagination */}
                {/* <div className="flex justify-between items-center mt-4 text-sm">
                  <span>
                    Showing {paginatedData.length} of {filteredData.length}{" "}
                    entries
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div> */}
              </div>
            )}
          </>
        ) : (
          <div style={styles.container}>
            <div style={styles.loaderBox}>
              <RingLoader size={100} color="#3498db" loading={!loading} />
              <p style={styles.text}>Loading Data...</p>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Modal for detail table data */}
      {selectedRow && (
        <GradeCompModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerName={selectedRow.customerName}
          soldTo={selectedRow.soldTo}
          appType={selectedRow.appType}
          appSubType={selectedAppType.appSubType}
          totalAppQty={selectedRow.appQty}
          totalSalesQty={selectedRow.salesQty}
          overAllAch={selectedRow.achievement}
          data={[
            {
              grade: "Sample Grade 1",
              appQty: selectedRow.appQty,
              salesQty: selectedRow.salesQty,
              achievement: selectedRow.achievement,
            },
            {
              grade: "Sample Grade 2",
              appQty: 20,
              salesQty: 35,
              achievement: 120,
            },
            {
              grade: "Sample Grade 2",
              appQty: 20,
              salesQty: 35,
              achievement: 120,
            },
          ]}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    // position: "fixed",
    // top: 0,
    // left: 0,
    width: "100%",
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.7)", // optional
    // zIndex: 9999,
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  text: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
};

export default CustomerAPPsignedvsSales;
