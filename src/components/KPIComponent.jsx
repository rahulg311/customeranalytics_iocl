import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const KPIComponent = ({title, value, icon: Icon, bgColor = "bg-gray-100", textColor = "text-white",
  iconColor = "text-gray-500",loading=true,per=""}) => {
 return (
    <div
      className={`rounded-2xl border shadow-sm p-4 flex items-center justify-between transition hover:shadow-lg ${bgColor}`}
    >
      {/* Left side */}
      <div className="flex-1">
        <p className={`text-sm font-bold ${textColor}`}>
          {!loading ? <Skeleton width="60%" /> : title}
        </p>
        <h2 className="text-3xl font-bold mt-1">
          {!loading ? <Skeleton width="40%" /> : `${Math.floor(value)} ${per}`}
        </h2>
      </div>

      {/* Right icon */}
      <div className="ml-4">
        {!loading ? (
          <Skeleton circle width={40} height={40} />
        ) : (
          Icon && (
            <div className={`p-2 rounded-full bg-white/60 backdrop-blur ${iconColor}`}>
              <Icon size={22} />
            </div>
          )
        )}
      </div>
    </div>
  );
};



export default KPIComponent;
