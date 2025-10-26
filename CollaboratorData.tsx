import React, { useState, useMemo, useEffect } from 'react';
import { Order } from '../types';

interface CollaboratorDataProps {
  orders: Order[];
  collaborators: string[];
  onSaveChanges: (updates: { [orderId: string]: boolean }) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


const getOctober2025DateRange = () => {
    const year = 2025;
    const month = 9; // 0-indexed for Date, so 9 is October
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
    };
};

const CollaboratorData: React.FC<CollaboratorDataProps> = ({ orders, collaborators, onSaveChanges }) => {
  const { start, end } = getOctober2025DateRange();
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('All');
  const [pendingChanges, setPendingChanges] = useState<{ [orderId: string]: boolean }>({});

  useEffect(() => {
    // Clear pending changes if the user changes the filter criteria
    setPendingChanges({});
  }, [startDate, endDate, selectedCollaborator]);


  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) {
        return [];
    }
    
    return orders.filter(order => {
        const matchesCollaborator = selectedCollaborator === 'All' || order.collaborator === selectedCollaborator;
        const inDateRange = order.orderDate >= startDate && order.orderDate <= endDate;
        return matchesCollaborator && inDateRange;
    }).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, selectedCollaborator, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredOrders.reduce((acc, order) => {
        acc.totalRevenue += order.finalAmount;
        acc.totalDeposit += order.deposit;
        acc.totalDebt += order.remainingDebt;
        return acc;
    }, { totalOrders: filteredOrders.length, totalRevenue: 0, totalDeposit: 0, totalDebt: 0 });
  }, [filteredOrders]);
  
  const handleCheckboxChange = (orderId: string, newStatus: boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  const handleSave = () => {
    onSaveChanges(pendingChanges);
    setPendingChanges({});
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Báo Cáo Chi Tiết - Người Bán</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="w-full sm:w-auto flex-grow">
          <label htmlFor="collaborator-select" className="block text-sm font-medium text-gray-700 mb-1">Người Bán</label>
          <select
            id="collaborator-select"
            value={selectedCollaborator}
            onChange={(e) => setSelectedCollaborator(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Tất cả Người Bán</option>
            {collaborators.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto flex-grow">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Từ Ngày</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-auto flex-grow">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Đến Ngày</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Tổng Số Đơn" value={summary.totalOrders.toString()} />
        <SummaryCard title="Tổng Doanh Thu" value={formatCurrency(summary.totalRevenue)} />
        <SummaryCard title="Tổng Đã Cọc" value={formatCurrency(summary.totalDeposit)} />
        <SummaryCard title="Tổng Nợ Còn Lại" value={formatCurrency(summary.totalDebt)} />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Đơn Hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh Thu</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đặt Cọc</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nợ Còn Lại</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chiết Khấu</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.orderDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.orderName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{formatCurrency(order.finalAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(order.deposit)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{formatCurrency(order.remainingDebt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                        type="checkbox"
                        checked={pendingChanges.hasOwnProperty(order.id) ? pendingChanges[order.id] : order.discountApplied}
                        onChange={(e) => handleCheckboxChange(order.id, e.target.checked)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Không có đơn hàng nào cho lựa chọn này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasPendingChanges && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
          >
            Lưu Thay Đổi Chiết Khấu
          </button>
        </div>
      )}
    </div>
  );
};

interface SummaryCardProps {
    title: string;
    value: string;
}
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-semibold text-gray-800 mt-1">{value}</p>
    </div>
);

export default CollaboratorData;