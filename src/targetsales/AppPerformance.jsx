import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Calendar, ChevronDown } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Table,
  ChartSpline,
  FileText,
  Users,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";
import withSessionContext from "../HOC/withSessionContext";
import { RingLoader } from "react-spinners";
import KPIComponent from "../components/KPIComponent";
import GradeCompModal from "../components/GradeCompModal";
import GroupwiseGradeCompModal from "../components/GroupwiseGradeCompModal";
import GroupwiseGradeCompModalId from "../components/GroupwiseGradeCompModalId";

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

const TargetSalesMonthToggle = (props) => {
  let zone_Code = props.sessionContext.logininPlantData.zone_code;
  const [rowData, setRowData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [GrupedData, setGrupedData] = useState([]);
  const [GrupedDataId, setGrupedDataId] = useState([]);
  console.log("GrupedDataId", GrupedDataId);
  console.log("GrupedData", GrupedData);
  const [Loader, setLoder] = useState(true);

  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState({});
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [gradeData, setGradeData] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  const [RowDataExcel, setRowDataExcel] = useState([]);

  console.log("gradeDatax", gradeData);

  const [showPrevious, setShowPrevious] = useState();
  const [m, setM] = useState([]);

  const transformData = (apiData, totoltarget) => {
    const map = {};

    apiData.forEach((item) => {
      // const key = item.sold_to;
      // console.log("item",item)
      const key = `${item.sold_to}_${item.app_Description}`;
      const monthName = monthMap[item.month];

      if (!map[key]) {
        map[key] = {
          group_Key: key,
          cust_Name: item.cust_Name,
          sold_to: item.sold_to,
          fieldOfficer: item.fieldOfficer,
          app_Description: item.app_Description,
          zo_Name: item.zo_Name,
          group_Key: item.group_Key,
          zo_Code: item.zo_Code,
          month: item.month,
        };
      }

      map[key][`${monthName}_target`] = item.total_Target;
      map[key][`${monthName}_sales`] = item.total_Sales;
      map[key][`${monthName}_achievement`] = item.achievement;
    });

    totoltarget.forEach((item) => {
      // const key = item.sold_to;
      const key = `${item.sold_to}_${item.app_Description}`;
      const monthName = monthMap[item.month];

      map[key]["monthWise_Total_Target"] = item?.monthWise_Total_Target;
      map[key]["monthWise_Total_Sales"] = item?.monthWise_Total_Sales;
      map[key]["monthWise_Total_Achievement"] = item?.monthWise_Achievement;
    });

    return Object.values(map);
  };

  // useEffect(()=>{
  //   ApiGetCustomerDetailsByGroupWise()
  // },[])

  const handleRowClick = (row) => {
    console.log("row", row);
    setSelectedRow(row);
    ApiGetCustomerDetailsByGroupWise(row);

    setIsModalOpen(true);
  };
  const handleRowClick2 = (data) => {
    setGrupedData([]);
    // console.log("month,type,row",month,type,row)
    setSelectedRow(data);
    ApiGetCustomerDetailsByGroupWises2(data);

    setIsModalOpen(true);
  };

  // Group Wise Customer Details.

  async function ApiGetCustomerDetailsByGroupWise(props) {
    console.log("prossps", props);

    let obj = {
      group_Key: props.group_Key,
      month: props.month || 0,
      financial_Year: "202526",
      zone_Name: props.zo_Code,
      app_Type: props.app_Description,
    };

    console.log("objobj2", obj);

    try {
      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetCustomerDetailsByGroupWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_Key: props.group_Key,
            month: 0,
            financial_Year: "202526",
            zone_Name: String(props.zo_Code),
            app_Type: props.app_Description,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();

      setGrupedData(data);

      console.log("datadatadata", data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async function ApiGetCustomerDetailsByGroupWises2(month) {
    const keyMonth = Object.keys(monthMap).find(
      (key) => monthMap[key] == month.month,
    );
    //  month.month

    let props = month?.rowData;

    let obj = {
      group_Key: props.group_Key,
      month: keyMonth,
      financial_Year: "202526",
      zone_Name: props.zo_Code,
      app_Type: props.app_Description,
    };

    console.log("objobj1", obj);

    try {
      const response2 = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetCustomerPerformanceDetailsTargetVsSalesByGroupWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_Key: props.group_Key,

            month: keyMonth,
            financial_Year: "202526",
            zone_Name: String(props.zo_Code),
            app_Type: String(props.app_Description),
          }),
        },
      );

      console.log("response2", response2);

      const data2 = await response2.json();

      setGrupedDataId(data2);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // 🔹 API CALL
  const fetchData = async () => {
    setLoading(false);
    const res = await fetch(
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetAPPTypeFinancialYearWise?strFinancialYear=202526",
      { method: "POST" },
    );

    const data = await res.json();
    let filterData = data?.lstAPPTypeFinancialYearTotalTargetSalesRes.filter(
      (i) => i.zo_Name == zone_Code,
    );
    let filterData2 =
      data?.lstAPPTypeFinancialYearSumofMonthWiseTotalTargetSalesRes.filter(
        (i) => i.zo_Name == zone_Code,
      );


const transformedData =    zone_Code == "CO"? transformData(
  data?.lstAPPTypeFinancialYearTotalTargetSalesRes,
  data?.lstAPPTypeFinancialYearSumofMonthWiseTotalTargetSalesRes
) :transformData(filterData, filterData2);


const finalData = transformedData.sort((a, b) => {
  if (a.group_Key && !b.group_Key) return -1;
  if (!a.group_Key && b.group_Key) return 1;
  return 0;
});

console.log("finalData",finalData)
setRowData(finalData);


    // setRowData(
    //   zone_Code == "CO"
    //     ? transformData(
    //         data?.lstAPPTypeFinancialYearTotalTargetSalesRes,
    //         data?.lstAPPTypeFinancialYearSumofMonthWiseTotalTargetSalesRes,
    //       )
    //     : transformData(filterData, filterData2),
    // );

    setLoading(true);

    const months = Array.from(
      new Set(
        data?.lstAPPTypeFinancialYearTotalTargetSalesRes
          .map((i) => Number(i.month))
          .filter(Boolean),
      ),
    )
      .sort((a, b) => a - b)
      .map((m) => monthMap[m]);

    setM(months);
  };

  const fetchDataExeldata = async () => {
    const res = await fetch(
      "http://10.14.84.54/Customeranalytics_API/api/TargetSales/ExcelTargetSalesFYGradeWiseRes?strFinancialYear=202526",
      { method: "POST" },
    );

    const resData = await res.json();

    const data = Array.isArray(resData) ? resData : [];
    //  const key = `${item.sold_to}_${item.app_Description}`;
    const finalData =
      zone_Code === "CO"
        ? data
        : data.filter((i) => i.Zo_Short_Name == zone_Code);

    setRowDataExcel(finalData);
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

  async function PopupmoduleFun(propss) {
    setOpenPopup(true);
    setGradeData({});
    setLoder(true);

    const keyMonth = Object.keys(monthMap).find(
      (key) => monthMap[key] == propss.month,
    );

    let props = propss?.rowData;
    console.log("propspropss", propss);

    try {
      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetCustomerPerformanceDetailsTargetVsSalesByIndivisual",
        // "http://10.14.84.54/Customeranalytics_API/api/TargetSales/GetAPPTypeFinancialYearGradeWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_Key: `0000${props.sold_to}`,
            month: keyMonth,
            financial_Year: "202526",
            zone_Name: String(props.zo_Code),
            app_Type: props.app_Description,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();

      let newkey = { ...data };
      newkey["app_Type"] = props.app_Description;
      newkey["sold_to"] = props.sold_to;

      console.log("datts1 ", newkey);
      setGradeData(newkey);
      setLoder(false);
      setOpenPopup(true);
      // console.log("datts ", data);
    } catch (error) {
      console.error("Error:", error);
      setGradeData({});
    }
  }
  // curret financial year
  const today = new Date();
  const currentMonthId = today.getMonth() + 10;

  useEffect(() => {
    GetCustomerapicall();
  }, []);

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
        // body: JSON.stringify({
        //   month: selectedMonth,
        //   financialYear: String(selectedFY),
        //   zone: String(selectedZone),
        //   appType: String(selectedAppType),
        // }),
        body: JSON.stringify({
          month: currentMonthId,
          financialYear: "202526",
          zone: "",
          appType: "",
        }),
      });

      const result = await response.json();

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
        <span style={{ marginRight: 0 }}>
          {showPrevious ? "Previous Months ▶" : "▼"}
        </span>
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
        headerName: "APP",
        field: `${month}_target`,
        minWidth: 100,

        cellStyle: { textAlign: "center" },
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline font-bold"
            onClick={() => {
              if (!params.node.group) {
                // console.log("Clicked Month:", month);
                // console.log("Child Row Data:", params.data);
                params.data.group_Key == null
                  ? PopupmoduleFun({
                      month: month,
                      type: "APP",
                      rowData: params.data,
                    })
                  : handleRowClick2({
                      month: month,
                      type: "APP",
                      rowData: params.data,
                    });
              }

              // console.log("paramsparamsd",params)
              // params.data.group_Key == null ? PopupmoduleFun(params) : handleRowClick2(params.data)
            }}
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
        headerName: "Lifting",
        field: `${month}_sales`,
        minWidth: 100,
        cellStyle: { textAlign: "center" },
        cellRenderer: (params) => (
          <span
            className="text-blue-600 cursor-pointer hover:underline font-bold"
            onClick={() => {
              if (!params.node.group) {
                params.data.group_Key == null
                  ? PopupmoduleFun({
                      month: month,
                      type: "APP",
                      rowData: params.data,
                    })
                  : handleRowClick2({
                      month: month,
                      type: "APP",
                      rowData: params.data,
                    });
              }
            }}
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
        minWidth: 160,
        field: `${month}_achievement`,
        cellRenderer: (params) => {
          if (params.value === null || params.value === undefined) return "";

          const value = Number(params.value);

          // Bar Color Logic
          let barColor = "bg-green-600";
          if (value === 0) barColor = "bg-gray-300";
          else if (value < 75) barColor = "bg-red-500";
          else if (value < 100) barColor = "bg-yellow-500";
          else barColor = "bg-green-600";

          // Text Color Logic
          let textColor =
            value === 0
              ? "text-red-500"
              : value < 75
                ? "text-red-500"
                : value < 100
                  ? "text-yellow-600"
                  : "text-green-600";

          return (
            <div
              className="flex items-center justify-between w-full px-2"
              onClick={() => {
                if (!params.node.group) {
                  params.data.group_Key == null
                    ? PopupmoduleFun({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      })
                    : handleRowClick2({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      });
                }
              }}
            >
              {/* Progress Bar */}
              <div className="flex-1 mr-3 mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${barColor}`}
                    style={{
                      width: `${Math.min(value, 150)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <span className={`text-sm font-semibold ${textColor}`}>
                {value.toFixed(1)}%
              </span>
            </div>
          );
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
        headerName: "APP",
        minWidth: 100,
        width: 20,
        maxWidth: 550,
        cellStyle: { textAlign: "center" },
        field: "monthWise_Total_Target",
        cellRenderer: (params) => (
          <span
            className="text-dark-600 cursor-pointer hover:underline font-bold"
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
        headerName: "Lifting",
        minWidth: 100,
        cellStyle: { textAlign: "center" },
        width: 20,
        maxWidth: 550,
        field: "monthWise_Total_Sales",
        cellRenderer: (params) => (
          <span
            className="text-dark-600 cursor-pointer hover:underline font-bold"
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
        minWidth: 180,
        width: 80,
        maxWidth: 550,
        field: "monthWise_Total_Achievement",
        cellRenderer: (params) => {
          if (params.value === null || params.value === undefined) return "";

          const value = Number(params.value);

          // Bar Color Logic
          let barColor = "bg-green-600";
          if (value === 0) barColor = "bg-gray-300";
          else if (value < 75) barColor = "bg-red-500";
          else if (value < 100) barColor = "bg-yellow-500";
          else barColor = "bg-green-600";

          // Text Color Logic
          let textColor =
            value === 0
              ? "text-red-500"
              : value < 75
                ? "text-red-500"
                : value < 100
                  ? "text-yellow-600"
                  : "text-green-600";

          return (
            <div className="flex items-center justify-between w-full px-2">
              {/* Progress Bar */}
              <div className="flex-1 mr-3 mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${barColor}`}
                    style={{
                      width: `${Math.min(value, 150)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <span className={`text-sm font-semibold ${textColor}`}>
                {value.toFixed(1)}%
              </span>
            </div>
          );
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
  //   const monthColumnGroupss = m.map((month) => ({
  //       headerName: month,
  //   marryChildren: false,
  //   minWidth: 50,
  //   openByDefault: true,
  //   headerClass: "custom-header",
  //   // headerComponentParams: {
  //   //   onHeaderClick: (params) => {
  //   //     console.log("Header clicked", params);
  //   //   }
  //   // },
  //     children: [
  //       {
  //         headerName: "",
  //         // minWidth: 50,
  //         columnGroupShow: "closed",
  //         // width: 40,
  //         valueGetter: () => "",
  //       },
  //       {
  //         headerName: "APP",
  //         field: `${month}_target`,
  // //         onCellClicked={(params) => {
  // //   if (!params.node.group) {
  // //     handleRowClick2(params.data);
  // //   }
  // // }},
  //       //   onCellClicked: (params) => (
  //       //     <span
  //       //       className="text-blue-600 cursor-pointer hover:underline font-bold font-bold"
  //       //       // onClick={() => PopupmoduleFun(params)}
  //       //        onClick={() => {
  //       //   if (!params.node.group) {
  //       //     console.log("Child Data:", params.data);
  //       //     handleRowClick2(params.data);
  //       //   }
  //       // }}
  //       //     >
  //       //       {params.value != null && !isNaN(params.value)
  //       //         ? Math.floor(params.value)
  //       //         : ""}
  //       //     </span>
  //       //   ),
  //         minWidth: 120,
  //         columnGroupShow: "open",
  //         headerStyle: {
  //           backgroundColor: "#99c0fd",
  //           fontWeight: "600",
  //         },
  //       },
  //       {
  //         headerName: "Lifting",
  //         field: `${month}_sales`,
  //         cellRenderer: (params) => (
  //           <span
  //             className="text-blue-600 cursor-pointer hover:underline font-bold"
  //             // onClick={() => PopupmoduleFun(params)}
  //             //   onClick={() =>{
  //             //   console.log("paramsparamsd",params)
  //             //   params.data.group_Key == null ? PopupmoduleFun(params) : handleRowClick2(params.data)
  //             // } }
  //           >
  //             {params.value != null && !isNaN(params.value)
  //               ? Math.floor(params.value)
  //               : ""}
  //           </span>
  //         ),
  //         minWidth: 120,
  //         columnGroupShow: "open",
  //         headerStyle: {
  //           backgroundColor: "#99c0fd",
  //           fontWeight: "600",
  //           cellRenderer: (params) => (
  //             <span
  //               className="text-blue-600 cursor-pointer hover:underline font-bold"
  //               onClick={() => PopupmoduleFun(params)}
  //             >
  //               {params.value}
  //             </span>
  //           ),
  //         },
  //       },
  //       {
  //         headerName: "Achievement ",
  //         minWidth: 170,
  //         field: `${month}_achievement`,
  //         columnGroupShow: "open",

  //         cellRenderer: (params) => {
  //           if (params.value === null || params.value === undefined) return "";

  //           const value = Number(params.value);

  //           // Bar Color Logic
  //           let barColor = "bg-green-600";
  //           if (value === 0) barColor = "bg-gray-300";
  //           else if (value < 75) barColor = "bg-red-500";
  //           else if (value < 100) barColor = "bg-yellow-500";
  //           else barColor = "bg-green-600";

  //           // Text Color Logic
  //           let textColor =
  //             value === 0
  //               ? "text-red-500"
  //               : value < 75
  //                 ? "text-red-500"
  //                 : value < 100
  //                   ? "text-yellow-600"
  //                   : "text-green-600";

  //           return (
  //             <div className="flex items-center justify-between w-full px-2">
  //               {/* Progress Bar */}
  //               <div className="flex-1 mr-3 mt-4">
  //                 <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  //                   <div
  //                     className={`h-2 rounded-full transition-all duration-500 ease-in-out ${barColor}`}
  //                     style={{
  //                       width: `${Math.min(value, 150)}%`,
  //                     }}
  //                   />
  //                 </div>
  //               </div>

  //               {/* Percentage */}
  //               <span className={`text-sm font-semibold ${textColor}`}>
  //                 {value.toFixed(1)}%
  //               </span>
  //             </div>
  //           );
  //         },

  //         headerStyle: {
  //           backgroundColor: "#99c0fd",
  //           fontWeight: "600",
  //         },
  //       },
  //       // {
  //       //   headerName: "Achievement %",
  //       //   field: `${month}_achievement`,
  //       //   valueFormatter: (params) => {
  //       //     if (params.value === null || params.value === undefined) return "";
  //       //     return `${params.value}%`;
  //       //   },
  //       //   minWidth: 120,
  //       //   columnGroupShow: "open",
  //       //   headerStyle: {
  //       //     backgroundColor: "#99c0fd",
  //       //     fontWeight: "600",
  //       //   },
  //       // },
  //     ],
  //   }));

  const monthColumnGroupss = m.map((month) => ({
    headerName: month,
    marryChildren: true,
    minWidth: 50,
    headerStyle: {
      backgroundColor: "#99c0fd",
      fontWeight: "600",
    },
    openByDefault: true,
    headerClass: "custom-header",

    children: [
      {
        headerName: "",
        columnGroupShow: "closed",
        valueGetter: () => "",
      },

      // ✅ APP COLUMN
      {
        headerName: "APP",
        field: `${month}_target`,
        minWidth: 120,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },

        cellRenderer: (params) => {
          const displayValue =
            params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : "";

          return (
            <span
              className="text-blue-600 cursor-pointer hover:underline font-bold"
              onClick={() => {
                if (!params.node.group) {
                  // console.log("Clicked Month:", month);
                  // console.log("Child Row Data:", params.data);
                  params.data.group_Key == null
                    ? PopupmoduleFun({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      })
                    : handleRowClick2({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      });
                }
              }}
            >
              {displayValue}
            </span>
          );
        },
      },

      // ✅ LIFTING COLUMN
      {
        headerName: "Lifting",
        field: `${month}_sales`,
        minWidth: 120,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },

        cellRenderer: (params) => {
          const displayValue =
            params.value != null && !isNaN(params.value)
              ? Math.floor(params.value)
              : "";

          return (
            <span
              className="text-blue-600 cursor-pointer hover:underline font-bold"
              onClick={() => {
                if (!params.node.group) {
                  params.data.group_Key == null
                    ? PopupmoduleFun({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      })
                    : handleRowClick2({
                        month: month,
                        type: "Lifting",
                        rowData: params.data,
                      });
                }
              }}
            >
              {displayValue}
            </span>
          );
        },
      },

      // ✅ ACHIEVEMENT COLUMN
      {
        headerName: "Achievement",
        field: `${month}_achievement`,
        minWidth: 170,
        columnGroupShow: "open",
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },

        cellRenderer: (params) => {
          if (params.value === null || params.value === undefined) return "";

          const value = Number(params.value);

          let barColor = "bg-green-600";
          if (value === 0) barColor = "bg-gray-300";
          else if (value < 75) barColor = "bg-red-500";
          else if (value < 100) barColor = "bg-yellow-500";

          let textColor =
            value === 0
              ? "text-red-500"
              : value < 75
                ? "text-red-500"
                : value < 100
                  ? "text-yellow-600"
                  : "text-green-600";

          return (
            <div
              className="flex items-center justify-between w-full px-2 cursor-pointer"
              onClick={() => {
                if (!params.node.group) {
                  params.data.group_Key == null
                    ? PopupmoduleFun({
                        month: month,
                        type: "APP",
                        rowData: params.data,
                      })
                    : handleRowClick2({
                        month: month,
                        type: "Achievement",
                        rowData: params.data,
                      });
                }
              }}
            >
              <div className="flex-1 mr-3 mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${barColor}`}
                    style={{
                      width: `${Math.min(value, 150)}%`,
                    }}
                  />
                </div>
              </div>

              <span className={`text-sm font-semibold ${textColor}`}>
                {value.toFixed(1)}%
              </span>
            </div>
          );
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
        headerName: "Group Key ",
        // headerClass: "blueHeader",
        field: "group_Key",
        pinned: "left",
        cellClass: "font-bold",
        onCellClicked: ({ data }) => {
          data?.group_Key && handleRowClick(data);
        },
             cellRenderer: (params) => {
          const value = params.value;
           let bgColor = "text-blue-600";

       return (
            <div className="flex justify-center">
              <span
                className={`${bgColor} mt-2 cursor-pointer hover:text-blue-600 `}
              >
                {value}
              </span>
            </div>
          );},
        maxWidth: 530,
        width: 80,
        headerStyle: {
          backgroundColor: "#99c0fd",
    
          fontWeight: "600",
        },
      },
      {
        headerName: "Customer Name",
        // headerClass: "blueHeader",
        field: "cust_Name",
        pinned: "left",
        cellClass: "font-bold",

        maxWidth: 530,
        width: 250,
        headerStyle: {
          backgroundColor: "#99c0fd",
          fontWeight: "600",
        },
      },
      {
        headerName: "Sold To",
        field: "sold_to",
        valueFormatter: (params) => {
          if (!params.value) return "";

          return params.value;
        },
        pinned: "left",
        maxWidth: 530,
        width: 80,
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

        cellRenderer: (params) => {
          const value = params.value;

          let bgColor = "bg-green-600";

          if (value === "PP") bgColor = "bg-blue-600";
          else if (value === "PE") bgColor = "bg-violet-600";
          else if (value === "Flexi") bgColor = "bg-orange-500";

          return (
            <div className="flex justify-center">
              <span
                className={`${bgColor} mt-2 text-white text-xs font-semibold px-4 py-1 rounded-full`}
              >
                {value}
              </span>
            </div>
          );
        },
      },
      // {
      //   headerName: "App Description",
      //   field: "app_Description",
      //   maxWidth: 530,
      //   width: 70,
      //   pinned: "left",

      //   headerStyle: {
      //     backgroundColor: "#99c0fd",
      //     fontWeight: "600",
      //   },
      // },
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
          backgroundColor: "#99c0fd",
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
        headerStyle: { backgroundColor: "#99c0fd", fontWeight: 700 },
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
        headerStyle: { backgroundColor: "#99c0fd", fontWeight: 700 },
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

    if (!RowDataExcel || RowDataExcel.length === 0) return;

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

    const headerRow1 = ["", "", "", "", "", "", ...productKeys.map(() => "")];

    monthNumbers.forEach((m, index) => {
      headerRow1.push(monthNames[index], "", "");
    });

    // Financial Year Block
    headerRow1.push("FINANCIAL YEAR", "", "");

    worksheet.addRow(headerRow1);

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

    headerRow2.push("Total Target", "Total Sales", "Achievement %");

    worksheet.addRow(headerRow2);

    const startMonthCol = 7 + productKeys.length;

    monthNumbers.forEach((_, index) => {
      const colStart = startMonthCol + index * 3;
      worksheet.mergeCells(1, colStart, 1, colStart + 2);
    });

    const fyStartCol = startMonthCol + monthNumbers.length * 3;
    worksheet.mergeCells(1, fyStartCol, 1, fyStartCol + 2);

    RowDataExcel?.forEach((item, index) => {
      const productValues = productKeys.map((key) => item[key] || 0);
      const monthValues = [];

      monthNumbers.forEach((m) => {
        monthValues.push(
          item[`${m}_Target`] || 0,
          item[`${m}_Sales`] || 0,
          (item[`${m}_Ach`] || 0) / 100,
        );
      });

      const row = worksheet.addRow([
        index + 1,
        item.Sold_To_Party,
        item.Customer_Name,
        item.Field_Officer,
        item.Zo_Name,
        item.APP_Type,
        ...productValues,
        ...monthValues,
        item.TotalTarget || 0,
        item.TotalSales || 0,
        (item.AchievementPct || 0) / 100,
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber >= startMonthCol) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
      });

      // Percent Format for Months
      monthNumbers.forEach((_, indexMonth) => {
        const percentCol = startMonthCol + indexMonth * 3 + 2;
        row.getCell(percentCol).numFmt = "0%";
      });

      // Percent format for FY
      row.getCell(fyStartCol + 2).numFmt = "0%";
    });

    const lastRow = worksheet.rowCount;

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

    monthNumbers.forEach((_, index) => {
      const colStart = startMonthCol + index * 3;
      const colEnd = colStart + 2;

      for (let row = 1; row <= lastRow; row++) {
        for (let col = colStart; col <= colEnd; col++) {
          const cell = worksheet.getRow(row).getCell(col);

          cell.border = {
            top:
              row === 1
                ? { style: "medium" }
                : row === 2
                  ? { style: "thin" }
                  : undefined,

            bottom:
              row === 2
                ? { style: "thin" }
                : row === lastRow
                  ? { style: "medium" }
                  : undefined,

            left: col === colStart ? { style: "medium" } : undefined,
            right: col === colEnd ? { style: "medium" } : undefined,
          };
        }
      }
    });

    const fyEndCol = fyStartCol + 2;

    for (let row = 1; row <= lastRow; row++) {
      for (let col = fyStartCol; col <= fyEndCol; col++) {
        const cell = worksheet.getRow(row).getCell(col);

        cell.border = {
          top:
            row === 1
              ? { style: "medium" }
              : row === 2
                ? { style: "thin" }
                : undefined,

          bottom:
            row === 2
              ? { style: "thin" }
              : row === lastRow
                ? { style: "medium" }
                : undefined,

          left: col === fyStartCol ? { style: "medium" } : undefined,
          right: col === fyEndCol ? { style: "medium" } : undefined,
        };
      }
    }

    // Column width
    worksheet.columns.forEach((col) => (col.width = 14));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    saveAs(blob, "NZ_DSR_Designed_Report.xlsx");
  };

  console.log("kpiData", kpiData);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {loadingKpi ? (
        <div className="ag-theme-alpine mb-10 m-1">
          {/* -------- KPI -------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5 mb-5">
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
          </button>

          <div
            className="ag-theme-alpine mb-10"
            style={{ height: 550, width: "100%" }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              ref={gridRef}
              rowHeight={50}
              defaultColGroupDef={{ headerClass: "blueHeader" }}
              defaultColDef={{
                headerClass: "blueHeader",
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
                cellStyle: { textAlign: "left" },
              }}
              pagination
              paginationPageSize={10}
              suppressColumnMoveAnimation={true}
              columnHoverHighlight={true}
              excelStyles={[
                {
                  id: "blueHeader",
                  interior: { color: "#99C0FD", pattern: "Solid" },
                  font: { bold: true, color: "#000000" },
                  alignment: { horizontal: "Center", vertical: "Center" },
                  borders: {
                    borderTop: {
                      lineStyle: "Continuous",
                      weight: 1,
                      color: "#D1D5DB",
                    },
                    borderBottom: {
                      lineStyle: "Continuous",
                      weight: 1,
                      color: "#D1D5DB",
                    },
                    borderLeft: {
                      lineStyle: "Continuous",
                      weight: 1,
                      color: "#D1D5DB",
                    },
                    borderRight: {
                      lineStyle: "Continuous",
                      weight: 1,
                      color: "#D1D5DB",
                    },
                  },
                },
              ]}
            />
          </div>

          {openPopup && (
            <GradeCompModal
              Loader={Loader}
              isOpen={openPopup}
              onClose={() => setOpenPopup(false)}
              gradeData={gradeData}
            />
            // <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            //   <div className="bg-white rounded-lg w-[600px] p-4">
            //     <div className="flex justify-between items-center mb-3">
            //       <h3 className="text-lg font-semibold">Grade Details</h3>
            //       <button
            //         onClick={() => {
            //           setOpenPopup(false);
            //           setGradeData([]);
            //         }}
            //         className="text-red-500 font-bold"
            //       >
            //         ✕
            //       </button>
            //     </div>

            //     <table className="w-full border">
            //       <thead className="bg-gray-100">
            //         <tr>
            //           <th className="border p-2">Grade</th>
            //           <th className="border p-2">App Type</th>
            //           <th className="border p-2">Target</th>
            //           <th className="border p-2">Sales</th>
            //           <th className="border p-2">Achievement</th>
            //         </tr>
            //       </thead>
            //       <tbody>
            //         {gradeData.map((item, index) => (
            //           <tr key={index}>
            //             <td className="border p-2">{item.grade}</td>
            //             <td className="border p-2">{item.app_Type}</td>
            //             <td className="border p-2">{item.total_Target}</td>
            //             <td className="border p-2">{item.total_Sales}</td>
            //             <td className="border p-2">{item.achievement}%</td>
            //           </tr>
            //         ))}
            //       </tbody>
            //     </table>
            //   </div>
            // </div>
          )}
        </div>
      ) : (
        <div style={styles.container}>
          <div style={styles.loaderBox}>
            <RingLoader size={100} color="#3498db" />
            <p style={styles.text}>Loading Data...</p>
          </div>
        </div>
      )}

      {/* Modal for detail table data */}
      {selectedRow &&
        (Array.isArray(GrupedData) && GrupedData.length > 0 ? (
          <GroupwiseGradeCompModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            GrupedData={GrupedData}
          />
        ) : (
          <GroupwiseGradeCompModalId
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            GrupedData={GrupedDataId}
          />
        ))}

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
