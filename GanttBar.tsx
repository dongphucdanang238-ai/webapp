import React from 'react';
import { OrderStatus } from '../types';

interface GanttBarProps {
  orderDate: string;
  expectedCompletionDate: string;
  status: OrderStatus;
}

const GanttBar: React.FC<GanttBarProps> = ({ orderDate, expectedCompletionDate, status }) => {
  // Case 1: Order is already completed
  if (status === OrderStatus.Completed) {
    return (
      <div className="flex flex-col items-start w-32">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <span className="text-xs text-green-700 mt-1 font-semibold">Đã hoàn thành</span>
      </div>
    );
  }

  // Case 2: No expected completion date is set
  if (!expectedCompletionDate) {
    return <span className="text-xs text-gray-500">Chưa có ngày giao hàng</span>;
  }
  
  const start = new Date(orderDate);
  const end = new Date(expectedCompletionDate);
  const now = new Date();

  // Invalidate dates with time for accurate day comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  // Case 3: Dates are not valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return <span className="text-xs text-gray-500">Ngày không hợp lệ</span>;
  }

  const totalDuration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  const elapsedDuration = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 3600 * 24));
  
  const progressPercentage = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

  const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

  let barColor = 'bg-blue-500';
  let textColor = 'text-gray-700';
  let statusText = `Còn ${remainingDays} ngày`;

  // Case 4: Overdue
  if (remainingDays < 0) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
    statusText = `Trễ ${Math.abs(remainingDays)} ngày`;
  } else if (remainingDays <= 3) { // Nearing deadline
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-700';
  }

  return (
    <div className="flex flex-col items-start w-32" title={`Bắt đầu: ${start.toLocaleDateString('vi-VN')} - Giao hàng: ${end.toLocaleDateString('vi-VN')}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
        <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <span className={`text-xs ${textColor} mt-1 font-medium`}>{statusText}</span>
    </div>
  );
};

export default GanttBar;