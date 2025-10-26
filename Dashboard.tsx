
import React, { useMemo } from 'react';
import { Order } from '../types';

interface DashboardProps {
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalDebt = orders.reduce((sum, order) => sum + order.remainingDebt, 0);
    return { totalOrders, totalRevenue, totalDebt };
  }, [orders]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <DashboardCard title="Tổng Số Đơn Hàng" value={stats.totalOrders.toString()} />
      <DashboardCard title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} />
      <DashboardCard title="Tổng Nợ Còn Lại" value={formatCurrency(stats.totalDebt)} />
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
  </div>
);

export default Dashboard;
