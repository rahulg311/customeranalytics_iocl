import React, { useState } from "react";
import { X } from "lucide-react";
import KPIComponent from "./KPIComponent";
import { Target, TrendingUp, BarChart3 } from "lucide-react";
import GradeCompModal from "./GradeCompModal";

const GroupwiseGradeCompModalId = ({ isOpen, onClose, GrupedData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [childdata, setChilddata] = useState([]);
  const [Loader, setLoder] = useState(true);

  console.log("customerName dfffdf ffss", childdata);

  if (!isOpen) return;

  const handleClick = (row) => {
    console.log("rowddddd", row);
    setIsModalOpen(true);
    PopupmoduleFun(row);
  };

  async function PopupmoduleFun(props) {
    setLoder(true);
    // setOpenPopup(true);
    // setGradeData({});

    // const keyMonth = Object.keys(monthMap).find(
    //   (key) => monthMap[key] == propss.month,
    // );

    // let props = propss?.rowData;
    // console.log("propspropss", props);

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
            group_Key: props.sold_To,
            month: String(props.month),
            financial_Year: "202526",
            zone_Name: String(props.zone_Name),
            app_Type: props.app_Type,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      let newkey = { ...data };
      newkey["app_Type"] = props.app_Type;
      newkey["sold_to"] = props.sold_To;

      console.log("Error:", newkey);

      setChilddata(newkey);
      setLoder(false);
    } catch (error) {
      console.error("Error:", error);
      //   setGradeData({});
    }
  }

  const getAchievementColor = (value) => {
    if (value === 0) return "bg-gray-300";
    if (value < 75) return "bg-red-500";
    if (value < 100) return "bg-yellow-500";
    return "bg-green-600";
  };

  const getTextColor = (value) => {
    if (value === 0) return "text-red-500";
    if (value < 75) return "text-red-500";
    if (value < 100) return "text-yellow-600";
    return "text-green-600";
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-5xl rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full border border-gray-300 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold mb-2 ">Groupwise Customer Details</h2>

        <p className="text-sm text-gray-600 mb-6">
          For Group:{" "}
          <span className="font-semibold text-blue-600">
            {GrupedData[0]?.group_Key}
          </span>{" "}
          Customer details are as follows
          {/* (Sold To Party: <span className="font-semibold text-blue-600">{GrupedData[0].soldTo}</span>)
                    <span className='mr-4'/> */}
          {/* Customer Details as follows  */}
        </p>

        {/* KPI Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPIComponent title='Total APP Quantity' value={`${totalAppQty} MT`} icon={TrendingUp} bgColor='bg-yellow-100' textColor = "text-yellow-700"/>
                    <KPIComponent title='Total Sales Quantity' value={`${totalSalesQty} MT`} icon={Target} bgColor='bg-blue-100' textColor = "text-blue-700"/>
                    <KPIComponent title='Overall Achievement' value={`${overAllAch} %`} icon={BarChart3} bgColor='bg-green-100' textColor = "text-green-700"/>
                </div> */}

        {/* Table */}
        <div
          className="bg-gray-50 rounded-xl overflow-hidden"
          bgColor="bg-yellow-100"
          textColor="text-yellow-700"
        >
          <table className="w-full text-sm">
            <thead className="bg-blue-300  uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3 text-left">Customer Name</th>
                <th className="p-3 text-center">Sold To Party</th>
                <th className="p-3 text-center">Zone</th>
                <th className="p-3 text-center">FSM</th>
                <th className="p-3 text-center">TotalTarget</th>
                <th className="p-3 text-center">TotalSales</th>
                <th className="p-3 text-center">Achievement</th>
              </tr>
            </thead>

            <tbody>
              {GrupedData?.map((row, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition"
                  onClick={(e) => handleClick(row)}
                >
                  <td className="p-3">
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                      {row.cust_Name}
                    </span>
                  </td>
                  <td className="p-3 text-center">{row.sold_To}</td>
                  <td className="p-3 text-center">{row.zone_Name}</td>
                  <td className="p-3 text-center">{row.field_Officer}</td>
                  <td className="p-3 text-center text-blue-600 cursor-pointer hover:underline font-bold">
                    {Math.floor(row.totalTarget)}
                  </td>
                  <td className="p-3 text-center text-blue-600 cursor-pointer hover:underline font-bold">
                    {Math.floor(row.totalSales)}
                  </td>
                  <td className="p-3 text-center text-blue-600 cursor-pointer hover:underline font-bold">
                    {Math.floor(row.achievementPct)}%
                  </td>
                  {/* <td className="p-3">
                                        <div className="flex items-center gap-3 justify-center">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className={`h-2 rounded-full ${getAchievementColor(row.achievement)}`} style={{width: `${Math.min(row.achievement, 150)}%`,}}/>
                                            </div>
                                            <span className={`font-semibold text-sm ${getTextColor(row.achievement)}`}>
                                                {row.achievement}%
                                            </span>
                                        </div>
                                    </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <GradeCompModal
          Loader={Loader}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          gradeData={childdata}
        />
      )}
    </div>
  );
};

export default GroupwiseGradeCompModalId;
