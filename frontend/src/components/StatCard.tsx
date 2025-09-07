import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  gradient: string;
  textColor?: string;
}

function StatCard({ title, value, gradient, textColor = "text-white" }: StatCardProps) {
  return (
    <div className={`${gradient} p-6 rounded-xl shadow-lg`}>
      <div>
        <p className={`text-sm font-medium ${textColor} opacity-90`}>{title}</p>
        <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;