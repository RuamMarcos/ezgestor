import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  gradient: string;
  textColor?: string;
}

function StatCard({ title, value, gradient, textColor = "text-white" }: StatCardProps) {
  return (
    <div className={`${gradient} p-4 sm:p-6 rounded-xl shadow-lg min-w-0 overflow-hidden`}>
      <div className="min-w-0">
        <p className={`text-xs sm:text-sm font-medium ${textColor} opacity-90 truncate`}>{title}</p>
        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColor} mt-1 truncate`} title={value}>{value}</p>
      </div>
    </div>
  );
}

export default StatCard;