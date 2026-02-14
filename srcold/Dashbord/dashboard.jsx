
import React, { useEffect, useState } from "react";
import ic_logo from '../assets/images/ic_logo.gif';
import withSessionContext from '../HOC/withSessionContext';
import { 
  BarChart3, 
  Users, 
  FileText,
  ArrowRight,
  LayoutGrid,
  PieChart,
  TrendingUp,
  Target,
  LogOut,
  ChevronRight,
  Send,
  Table,
  UserX,

  MailCheck,
  Clock
} from 'lucide-react';


import { useNavigate } from "react-router-dom";

function Dashbord() {

 const fetchTargetSales = async () => {
    //setLoading(true);
    //setError(null);

    try {
      const response = await fetch(
        "http://10.14.84.54/customeranalytics_api/api/TargetSales/TargetSalesMonthYearWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: "Dec-2025",
            firstDay: "2025-12-01",
            lastDay: "2025-12-31",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();

      console.log("result",result)
      // setData(result);
    } 
    
    catch (err) {
     // setError(err.message || "Something went wrong");
    } finally {
    //  setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetSales();
  }, []);




const NavigationCard = ({
  title,
  description,
  icon,
  onClick,
  isActive = false,
  comingSoon = false,
  theme,
  subLinks,
}) => {
  const navigate = useNavigate();

   
  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-lg `}
      onClick={!comingSoon && !subLinks ? onClick : undefined}
      
    >
      {/* Icon */}
      <div className="text-3xl mb-4">{icon}</div>

      {/* Title */}
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* Description */}
      <p className="text-sm opacity-90 mt-1">{description}</p>

      {/* Coming soon */}
      {comingSoon && (
        <span className="mt-3 inline-block text-xs bg-black/30 px-3 py-1 rounded-full">
          Coming Soon
        </span>
      )}

      {/* Sublinks */}
      {subLinks && (
        <div className="mt-4 space-y-2">
          {subLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/30"
            >
              <span>{link.icon}</span>
              <span>{link.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



    const navigationItems = [
    {
      id: 'sales-performance',
     // path: '/targetsales',
      title: 'Polymer Sales Insights',
      description: 'Analyzing sales targets vs actuals sales based on multiple dimensions.',
      icon: <BarChart3 className="w-7 h-7" />,
      theme: { gradientFrom: 'from-blue-500', gradientTo: 'to-purple-600', shadowColor: 'shadow-purple-500/30' },
      subLinks: [
        { title: 'PP & PE Sales Data', description: 'Prodcut type (PP & PE) wise monthly target vs actual sales analysis.', path: '/targetsales/page', icon: <LayoutGrid className="w-4 h-4" /> },
        { title: 'Sector-wise Sales Matrix', description: 'Sector wise matrix of targets and sales for each sector.', path: '/targetsales?view=sectors', icon: <Table className="w-4 h-4" /> },
        { title: 'Auto-Mailer', description: 'Scheduling of automated email reports to FOs .', path: '/reports/scheduler', icon: <Send className="w-4 h-4" /> }
      ]
    },
    {
      id: 'customer-analysis',
     // path: '/dashboard',
      title: 'Customer Analytics',
      description: 'Analytics for Petrochem ZPC, Inactive Customers etc.',
      icon: <Users className="w-7 h-7" />,
      theme: { gradientFrom: 'from-teal-500', gradientTo: 'to-green-600', shadowColor: 'shadow-green-500/30' },
      subLinks: [
        {
          title: 'Zero Product Customers',
          description: 'Customers Registered. No engagement yet.',
         // path: '/dashboard',
          icon: <UserX className="w-4 h-4" />
        },
        {
          title: 'Inactive Customers',
          description: 'Registered Customers with No recent purchases.',
         // path: '/dashboard',
          // CORRECTED: The icon is 'UserClock', not 'Clock'
          icon: <Clock className="w-4 h-4" /> 
        },
        {
          title: 'Auto-Mailer for Field Officers',
          description: 'Auto mailer to FOs for customer engagement.',
         // path: '/dashboard',
          icon: <MailCheck className="w-4 h-4" />
        }
      ]
    }
  ];
 

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      <div className="mx-auto w-full flex flex-col flex-grow">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-xl px-4 md:p-6 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-900 shadow-md">
          <a href="/home" className="flex-shrink-0">
            <img src={ic_logo} alt="IOCL Logo" width={56} height={56} className="h-12 w-auto md:h-14" />
          </a>
          <div className="text-center">
             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-700 via-cyan-700 to-green-900 bg-clip-text text-transparent">
                  Petrochemical Sales Analytics
                </span>
            </h1>
          </div>
          <button  className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg shadow-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </header>

        <main className="p-10">
        <div className="grid grid-cols-2 gap-4">
              {navigationItems.map((item) => (
                <NavigationCard
               
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                
              
                  subLinks={item.subLinks}
                />
              ))}
          </div>
        </main>

 
        
         <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-inner rounded-xl">
          <div className="mx-auto px-4 py-4 text-center text-sm text-gray-200 dark:text-gray-300">
            <p>© {new Date().getFullYear()}{" "}<span className="font-semibold text-white dark:text-white">Developed by P&BD-IS</span>. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default withSessionContext(Dashbord)