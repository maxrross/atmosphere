'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sampleData = [
  { name: 'Jan', aqi: 50 },
  { name: 'Feb', aqi: 45 },
  { name: 'Mar', aqi: 60 },
  { name: 'Apr', aqi: 55 },
  { name: 'May', aqi: 70 },
  { name: 'Jun', aqi: 65 },
];

export function AQIChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="aqi" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-center mt-2 text-slate-500">Sample AQI Trends</p>
    </div>
  );
} 