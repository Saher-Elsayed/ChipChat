import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { barChartData } from '../../data/mockData';

const BarChartComponent = ({ customData, dataKeys = ['online', 'inStore'], xAxisKey = 'name' }) => {
  const data = customData || barChartData;
  
  // Define colors for the bars
  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={barColors[index % barColors.length]} 
              name={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;