import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Calendar, ChevronDown } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import Header from "../components/header";
import Footer from "../components/footer";
import withSessionContext from "../HOC/withSessionContext";
import { RingLoader } from "react-spinners";

const monthMap = {
  1: "April",
  2: "May",
  3: "June",
  4: "July",
  5: "August",
  6: "September",
  7: "October",
  8: "November",
  9: "December",
  10: "January",
  11: "February",
  12: "March",
};

const TargetSalesMonthToggle = () => {
  const [rowData, setRowData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [gradeData, setGradeData] = useState([]);

  const [RowDataExcel, setRowDataExcel] = useState([]);

  const [showPrevious, setShowPrevious] = useState();
  const [m, setM] = useState([]);
  const [loading, setloading] = useState(false);

  const transformData = (apiData, totoltarget) => {
    const map = {};
    apiData.forEach((item) => {
      const key = item.sold_to;
      const monthName = monthMap[item.month];

      if (!map[key]) {
        map[key] = {
          cust_Name: item.cust_Name,
          sold_to: item.sold_to,
          fieldOfficer: item.fieldOfficer,
          app_Description: item.app_Description,
          zo_Name: item.zo_Name,
        };
      }

      map[key][`${monthName}_target`] = item.total_Target;
      map[key][`${monthName}_sales`] = item.total_Sales;
      map[key][`${monthName}_achievement`] = item.achievement;
    });
    totoltarget.forEach((item) => {
      const key = item.sold_to;
      const monthName = monthMap[item.month];

      map[key]["monthWise_Total_Target"] = item.monthWise_Total_Target;
      map[key]["monthWise_Total_Sales"] = item.monthWise_Total_Sales;
      map[key]["monthWise_Total_Achievement"] = item.monthWise_Achievement;
    });

    return Object.values(map);
  };

  // 🔹 API CALL
  const fetchData = async () => {
    setloading(false);
    const res = await fetch(
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetAPPTypeFinancialYearWise?strFinancialYear=202526",
      { method: "POST" },
    );

    const data = await res.json();
    // console.log(
    //   "transformData(data)",
    //   data,
    //   transformData(
    //     data?.lstAPPTypeFinancialYearTotalTargetSalesRes,
    //     data?.lstAPPTypeFinancialYearSumofMonthWiseTotalTargetSalesRes,
    //   ),
    // );
    setRowData(
      transformData(
        data?.lstAPPTypeFinancialYearTotalTargetSalesRes,
        data?.lstAPPTypeFinancialYearSumofMonthWiseTotalTargetSalesRes,
      ),
    );
    setloading(true);

    // const months = [...new Set(data.map((i) => monthMap[i.month]))];
    //  const months1 = [...new Set(data.map((i) => i.month))];
    //  let vv = months1.sort((a,b)=>a-b)
    //   let vv2  = vv.map((i) =>  monthMap[i] )
    // console.log("months",vv2)
    // setM(vv2);
    const months = Array.from(
      new Set(
        data?.lstAPPTypeFinancialYearTotalTargetSalesRes
          .map((i) => Number(i.month))
          .filter(Boolean),
      ),
    )
      .sort((a, b) => a - b)
      .map((m) => monthMap[m]);

    console.log("months", months);
    setM(months);
  };

  const fetchDataExeldata = async () => {
    const res = await fetch(
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/ExcelTargetSalesFYGradeWiseRes?strFinancialYear=202526",
      { method: "POST" },
    );

    const data = await res.json();

    setRowDataExcel(data);
  };

  useEffect(() => {
    fetchData();
    fetchDataExeldata();
  }, []);
  const gridRef = useRef(null);

  // 🔹 CURRENT / PREVIOUS MONTH LOGIC
  const currentMonthName = new Date().toLocaleString("en-US", {
    month: "long",
  });

  const currentMonthList = m.includes(currentMonthName)
    ? [currentMonthName]
    : [];

  async function PopupmoduleFun(props) {
    setOpenPopup(true);

    const sold_to = props.data.sold_to;

    try {
      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetAPPTypeFinancialYearGradeWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sold_to: sold_to,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();

      console.log("sold_to response", data);

      setGradeData(data || []);
    } catch (error) {
      console.error("Error:", error);
      setGradeData([]);
    }
  }

  const PreviousHeader = ({ setShowPrevious, showPrevious }) => {
    return (
      <div
        onClick={() => setShowPrevious((p) => !p)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          userSelect: "none",
        }}
      >
        {/* <span style={{ marginRight: 0 }}>{showPrevious ? "▼" : "▶"}</span> */}
        {/* Previous Months */}
        {showPrevious ? "Previous Months ▶" : "▼"}
      </div>
    );
  };

  // 🔹 MONTH COLUMN GROUPS
  const monthColumnGroups = m.map((month) => ({
    headerName: month,
    marryChildren: false,
    minWith: 10,
    maxWidth: 40,
    openByDefault: true,
    headerStyle: {
      backgroundColor: "#99c0fd",
      fontWeight: "600",
    },
    children: [
      {
        headerName: "",
        minWidth: 140,
        maxWidth: 40,
        columnGroupShow: "closed",
        width: 0,
        valueGetter: () => "",
      },
      {
        headerName: "Target",
        minWidth: 140,
        field: `${month}_target`,
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Sales",
        field: `${month}_sales`,
        minWidth: 140,
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Achievement %",
        minWidth: 140,
        field: `${month}_achievement`,
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return "";
          return `${params.value}%`;
        },
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
    ],
  }));

  //  total target
  const monthColumnGroupstotal = {
    headerName: "",
    marryChildren: false,
    minWith: 10,
    width: 20,
    maxWidth: 550,
    openByDefault: true,
    headerStyle: {
      backgroundColor: "#99c0fd",
      fontWeight: "600",
    },
    children: [
      {
        headerName: "",

        columnGroupShow: "closed",
        minWith: 10,
        width: 40,
        maxWidth: 80,
        valueGetter: () => "",
      },
      {
        headerName: "Target",
        minWidth: 140,
        width: 20,
        maxWidth: 550,
        field: "monthWise_Total_Target",
        cellRenderer: (params) => (
          <span
          // className="text-blue-600 cursor-pointer hover:underline"
          // onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),

        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Sales",
        minWidth: 140,
        width: 20,
        maxWidth: 550,
        field: "monthWise_Total_Sales",
        cellRenderer: (params) => (
          <span
          // className="text-blue-600 cursor-pointer hover:underline"
          // onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),

        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Achievement %",
        minWidth: 140,
        width: 20,
        maxWidth: 550,
        field: "monthWise_Total_Achievement",
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return "";
          return `${params.value}%`;
        },
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
    ],
  };

  // prev
  const monthColumnGroupss = m.map((month) => ({
    headerName: month,
    marryChildren: false,
    minWith: 50,
    openByDefault: true,
    headerStyle: {
      backgroundColor: "#99c0fd",
      fontWeight: "600",
    },
    children: [
      {
        headerName: "",
        // minWidth: 50,
        columnGroupShow: "closed",
        // width: 40,
        valueGetter: () => "",
      },
      {
        headerName: "Target",
        field: `${month}_target`,
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),
        minWidth: 120,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Sales",
        field: `${month}_sales`,
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => PopupmoduleFun(params)}
          >
            {params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : ""}
          </span>
        ),
        minWidth: 120,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
          cellRenderer: (params) => (
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => PopupmoduleFun(params)}
            >
              {params.value}
            </span>
          ),
        },
      },
      {
        headerName: "Achievement %",
        field: `${month}_achievement`,
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return "";
          return `${params.value}%`;
        },
        minWidth: 120,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
    ],
  }));

  const dummyHiddenColumn = {
    headerName: "",
    field: "__dummy__",
    columnGroupShow: "closed",

    width: 32, // 👈 icon size
    minWidth: 32,
    maxWidth: 32,

    suppressMenu: true,
    filter: false,
    sortable: false,
    resizable: false,

    headerStyle: {
      backgroundColor: "#99c0fd",
      padding: 0,
    },

    valueGetter: () => "",
  };


  
    
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Customer Name",
        headerClass: "blueHeader",
        field: "cust_Name",
        pinned: "left",
        headerClass: "blueHeader",
        // minWith: 10,
        maxWidth: 530,
        width: 130,
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
          headerStyle: {
            backgroundColor: "#99c0fd",
            fontWeight: "600",
            minWidth: 50,
          },
        },
      },
      {
        headerName: "Sold To",
        field: "sold_to",

        pinned: "left",
        maxWidth: 530,
        width: 130,
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",

          minWidth: 50,
        },
      },
      {
        headerName: "FSM",
        field: "fieldOfficer",
        pinned: "left",
        maxWidth: 530,
        width: 130,
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "App Description",
        field: "app_Description",
        maxWidth: 530,
        width: 70,
        pinned: "left",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Zo Name",
        field: "zo_Name",
        maxWidth: 530,
        width: 70,
        pinned: "left",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },

      //  PREVIOUS MONTHS (ARROW + TOGGLE)
      {
        marryChildren: true,
        minWidth: 50,
        headerGroupComponent: () => (
          <PreviousHeader
            showPrevious={showPrevious}
            setShowPrevious={setShowPrevious}
          />
        ),

        headerStyle: {
          backgroundColor: "#fde047",
          textAlign: "center",
          // width:"20px"
        },

        children: showPrevious
          ? monthColumnGroupss.filter(
              (col) => !currentMonthList.includes(col.headerName),
            )
          : [dummyHiddenColumn],
      },
      //  CURRENT MONTH
      {
        headerName: "Current Month",
        marryChildren: true,
        openByDefault: true,
        headerStyle: { backgroundColor: "#86efac", fontWeight: 700 },
        children: monthColumnGroups.filter((col) =>
          currentMonthList.includes(col.headerName),
        ),
      },
      //  total target MONTH
      {
        headerName: "Financial Year Total Target ",
        width: 20,
        maxWidth: 550,
        marryChildren: true,
        openByDefault: true,
        headerStyle: { backgroundColor: "#ef8686", fontWeight: 700 },
        children: [monthColumnGroupstotal],
      },
    ],
    [monthColumnGroups, currentMonthList, showPrevious],
  );

  const exportExcels = () => {
    gridRef.current.api.exportDataAsExcel({
      fileName: "Target_Sales_Report.xlsx",

      // 🔹 column group bhi jayenge
      columnGroups: true,

      // 🔹 sirf visible columns
      onlySelected: false,
      allColumns: false,

      // 🔹 header height / row height
      headerRowHeight: 35,
      rowHeight: 28,

      // 🔹 Excel Styles
      excelStyles: [
        {
          id: "headerBlue",
          interior: {
            color: "#99c0fd",
            pattern: "Solid",
          },
          font: {
            bold: true,
          },
          alignment: {
            horizontal: "Center",
          },
        },
        {
          id: "headerGreen",
          interior: {
            color: "#86efac",
            pattern: "Solid",
          },
          font: {
            bold: true,
          },
        },
        {
          id: "headerYellow",
          interior: {
            color: "#fde047",
            pattern: "Solid",
          },
          font: {
            bold: true,
          },
        },
        {
          id: "cellCenter",
          alignment: {
            horizontal: "Center",
          },
        },
      ],
      
      // 🔹 header styling
      processHeaderCallback: (params) => params.column.getColDef().headerName,

      // 🔹 cell value (Achievement % same rahe)
      processCellCallback: (params) => {
        if (params.column.getColId().includes("achievement")) {
          return params.value != null ? `${params.value}%` : "";
        }
        return params.value;
      },
    });
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("APP Performance");
    console.log("RowDataExcel 0");
    if (!RowDataExcel || RowDataExcel.length === 0) return;
    console.log("RowDataExcel 1");

    const firstObj = RowDataExcel[0];

    const productKeys = Object.keys(firstObj).filter(
      (key) => /^[0-9]/.test(key) && !key.includes("_"),
    );

    const monthNumbers = Object.keys(firstObj)
      .filter((key) => key.includes("_Sales"))
      .map((key) => parseInt(key.split("_")[0]))
      .sort((a, b) => a - b);

    const monthNames = [
      "APR",
      "MAY",
      "JUNE",
      "JULY",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
      "JAN",
      "FEB",
      "MAR",
    ];
    console.log("RowDataExcel 2");


    // HEADER ROW 1
  
    const headerRow1 = ["", "", "", "","","" ,...productKeys.map(() => "")];

    monthNumbers.forEach((m, index) => {
      headerRow1.push(monthNames[index], "", "");
    });

    worksheet.addRow(headerRow1);

    // header 2
    const headerRow2 = [
      "Sr No",
      "Sold to Party Code",
      "Customer Name",
      "FSM",
      "Zone Name",
      "APP Type",
      
      ...productKeys,
    ];

    monthNumbers.forEach(() => {
      headerRow2.push("APP", "Lifting", "%");
    });

    worksheet.addRow(headerRow2);

    // MERGE MONTH HEADERS

    const startMonthCol = 7 + productKeys.length;

    monthNumbers.forEach((_, index) => {
      const colStart = startMonthCol + index * 3;
      worksheet.mergeCells(1, colStart, 1, colStart + 2);
    });

    // DATA ADD

    console.log("RowDataExcel", RowDataExcel);
    RowDataExcel.forEach((item, index) => {
      const productValues = productKeys.map((key) => item[key] || 0);

      const monthValues = [];

      monthNumbers.forEach((m) => {
        monthValues.push(
          item[`${m}_Target`] || 0,
          item[`${m}_Sales`] || 0,
          (item[`${m}_Ach`] || 0) + "%",
        );
      });

      worksheet.addRow([
        index + 1,
        item.Sold_To_Party,
        item.Customer_Name,
        item.Field_Officer,
           item.Zo_Name,
             item.APP_Type,
               
        ...productValues,
        ...monthValues,
      ]);
    });

    // STYLE HEADER

    [1, 2].forEach((rowNumber) => {
      worksheet.getRow(rowNumber).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    worksheet.columns.forEach((col) => (col.width = 14));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    saveAs(blob, "NZ_DSR_Designed_Report.xlsx");
  };

  const exportExcel = () => {
    gridRef.current.api.exportDataAsExcel({
      fileName: "Target_Sales_Report.xlsx",
      columnGroups: true,
      allColumns: false,

      processCellCallback: (params) => {
        if (params.column.getColId().includes("achievement")) {
          return params.value != null ? `${params.value}%` : "";
        }
        return params.value;
      },
    });
  };

  {
    /* <button onClick={downloadExcel}>
        Download Designed Excel
      </button> */
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="ag-theme-alpine mb-10 m-1">
        {/* <button
  onClick={() => downloadExcel()} 
   onClick={() => exportExcels()}
  className="bg-green-600 text-white px-4 py-2 rounded mb-2"
>
  Export to Excel
</button> */}
{ loading ? (<>
        <button
          onClick={() => exportExcels()}
          className="bg-green-600 text-white px-4 py-2 rounded mb-2 me-5"
        >
          Export to Excel 1
        </button>

        <button
          onClick={() => downloadExcel()}
          className="bg-green-600 text-white px-4 py-2 rounded mb-2"
        >
          Export to Excel 2
        </button></> ):("")}

        <div
          className="ag-theme-alpine mb-10"
          style={{ height: 550, width: "100%" }}
        >
          {loading ? (
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              ref={gridRef}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
                cellStyle: { textAlign: "center" },
              }}
              pagination
              paginationPageSize={10}
              suppressColumnMoveAnimation={true}
              columnHoverHighlight={true}
              excelStyles={[
                {
                  id: "blueHeader",
                  interior: { color: "#99c0fd", pattern: "Solid" },
                  font: { bold: true },
                  alignment: { horizontal: "Center" },
                },
                {
                  id: "greenHeader",
                  interior: { color: "#86efac", pattern: "Solid" },
                  font: { bold: true },
                  alignment: { horizontal: "Center" },
                },
                {
                  id: "yellowHeader",
                  interior: { color: "#fde047", pattern: "Solid" },
                  font: { bold: true },
                  alignment: { horizontal: "Center" },
                },
                {
                  id: "redHeader",
                  interior: { color: "#ef8686", pattern: "Solid" },
                  font: { bold: true },
                  alignment: { horizontal: "Center" },
                },
                {
                  id: "cellStyle",
                  font: { name: "Calibri", size: 11 },
                  alignment: { horizontal: "Center" },
                },
              ]}
            />
          ) : (
            <div style={styles.container}>
              <div style={styles.loaderBox}>
                <RingLoader size={100} color="#3498db" loading={!loading} />
                <p style={styles.text}>Loading Data...</p>
              </div>
            </div>
          )}
        </div>

        {openPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[600px] p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Grade Details</h3>
                <button
                  onClick={() => {
                    setOpenPopup(false);
                    setGradeData([]);
                  }}
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Grade</th>
                    <th className="border p-2">App Type</th>
                    <th className="border p-2">Target</th>
                    <th className="border p-2">Sales</th>
                    <th className="border p-2">Achievement</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeData.map((item, index) => (
                    <tr key={index}>
                      <td className="border p-2">{item.grade}</td>
                      <td className="border p-2">{item.app_Type}</td>
                      <td className="border p-2">{item.total_Target}</td>
                      <td className="border p-2">{item.total_Sales}</td>
                      <td className="border p-2">{item.achievement}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
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

export default withSessionContext(TargetSalesMonthToggle);
