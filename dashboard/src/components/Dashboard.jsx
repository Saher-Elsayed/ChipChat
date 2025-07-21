import React from 'react';
import BarChartComponent from './charts/BarChart';
import PieChartComponent from './charts/PieChart';
import LineChartComponent from './charts/LineChart';
import RadarChartComponent from './charts/RadarChart';
import GaugeChart from './charts/GaugeChart';
import StatsCard from './StatsCard';
import FPGADesignGenerator from './FPGADesignGenerator';
import { designMetrics, recentDesigns, complexityData, activityData, resourceUsageData } from '../data/fpgaData';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">FPGA Design Studio</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {designMetrics.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* FPGA Design Generator */}
      <FPGADesignGenerator />
      
      {/* Recent Designs */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Recent Designs</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentDesigns.map((design) => (
            <div key={design.id} className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-32 bg-indigo-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{design.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{design.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{design.date}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    design.complexity === 'High' || design.complexity === 'Very High'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {design.complexity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Design Activity</h2>
          <div className="h-64">
            <BarChartComponent customData={activityData} dataKeys={['designs', 'components']} xAxisKey="day" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Resource Utilization</h2>
          <div className="h-64">
            <LineChartComponent />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Design Complexity</h2>
          <div className="h-64">
            <PieChartComponent customData={complexityData} dataKey="value" nameKey="name" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Component Usage</h2>
          <div className="h-64">
            <RadarChartComponent />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <GaugeChart value={78} min={0} max={100} title="Learning Progress" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;