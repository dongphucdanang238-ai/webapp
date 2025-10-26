// FIX: Import React and necessary hooks (useState, useMemo) to resolve "Cannot find name" errors.
import React, { useState, useMemo } from 'react';
import { Order } from '../types';

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

const ReportCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const HorizontalBarChart: React.FC<{ data: { label: string, value: number }[], unit?: string }> = ({ data, unit }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">Không có dữ liệu để hiển thị.</p>;
  }
  
  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.label} className="flex items-center text-sm">
          <div className="w-1/3 truncate pr-2 font-medium text-gray-600" title={item.label}>{item.label}</div>
          <div className="w-2/3 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-5 relative">
              <div
                className="bg-blue-500 h-5 rounded-full"
                style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-bold text-white shadow-sm">
                {unit === 'VND' ? formatCurrency(item.value) : `${item.value.toLocaleString('vi-VN')} ${unit || ''}`.trim()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BusinessReport: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const getInitialDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const currentDay = today.toISOString().split('T')[0];
    return { firstDay, currentDay };
  };

  const [startDate, setStartDate] = useState(getInitialDates().firstDay);
  const [endDate, setEndDate] = useState(getInitialDates().currentDay);
  const [activePreset, setActivePreset] = useState<string>('thisMonth');

  const handleSetDateRange = (preset: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    let newStartDate: Date;
    let newEndDate: Date;
    
    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    switch (preset) {
      case 'thisMonth':
        newStartDate = new Date(year, month, 1);
        newEndDate = today;
        break;
      case 'lastMonth':
        newStartDate = new Date(year, month - 1, 1);
        newEndDate = new Date(year, month, 0); // Last day of previous month
        break;
      case 'twoMonthsAgo':
        newStartDate = new Date(year, month - 2, 1);
        newEndDate = new Date(year, month - 1, 0);
        break;
      case 'lastQuarter':
        const currentQuarter = Math.floor(month / 3); // 0, 1, 2, 3
        if (currentQuarter === 0) { // If Q1, last quarter was last year's Q4
            newStartDate = new Date(year - 1, 9, 1); // Oct 1
            newEndDate = new Date(year - 1, 11, 31); // Dec 31
        } else {
            const lastQuarterMonthStart = (currentQuarter - 1) * 3;
            newStartDate = new Date(year, lastQuarterMonthStart, 1);
            newEndDate = new Date(year, lastQuarterMonthStart + 3, 0);
        }
        break;
      case 'firstHalf':
        newStartDate = new Date(year, 0, 1); // Jan 1
        newEndDate = new Date(year, 5, 30); // Jun 30
        break;
      case 'secondHalf':
        newStartDate = new Date(year, 6, 1); // Jul 1
        newEndDate = new Date(year, 11, 31); // Dec 31
        break;
      case 'lastYear':
        newStartDate = new Date(year - 1, 0, 1);
        newEndDate = new Date(year - 1, 11, 31);
        break;
      default:
        return;
    }
    
    setStartDate(formatDateForInput(newStartDate));
    setEndDate(formatDateForInput(newEndDate));
    setActivePreset(preset);
  };
  
  const handleCustomDateChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setActivePreset(null);
  };

  const presets = [
    { key: 'thisMonth', label: 'Tháng này' },
    { key: 'lastMonth', label: '1 Tháng trước' },
    { key: 'twoMonthsAgo', label: '2 tháng trước' },
    { key: 'lastQuarter', label: '1 Quý trước' },
    { key: 'firstHalf', label: '6 Tháng đầu năm' },
    { key: 'secondHalf', label: '6 Tháng cuối năm' },
    { key: 'lastYear', label: '1 năm trước' },
  ];

  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return orders.filter(o => {
      const orderDate = new Date(o.orderDate);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, startDate, endDate]);

  const productStats = useMemo(() => {
    const stats = new Map<string, number>();
    filteredOrders.forEach(order => {
      order.products.forEach(product => {
        // Create a unique key using product name and its unit for accurate counting
        const key = `${product.productName} (${product.ddovt || 'N/A'})`;
        stats.set(key, (stats.get(key) || 0) + product.quantity);
      });
    });
    return Array.from(stats.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const totalProductQuantity = useMemo(() => {
    // Calculate total quantity from all products in the filtered orders
    return filteredOrders.reduce((total, order) => {
        return total + order.products.reduce((orderTotal, product) => orderTotal + product.quantity, 0);
    }, 0);
  }, [filteredOrders]);

  const financialOverview = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const totalPaid = filteredOrders.reduce((sum, o) => sum + o.deposit + o.payment, 0);
    const totalDebt = filteredOrders.reduce((sum, o) => sum + o.remainingDebt, 0);
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + o.discount, 0);
    const totalVat = filteredOrders.reduce((sum, o) => sum + (o.finalAmount - o.totalOrderValue), 0);
    
    return {
      totalRevenue,
      totalVat,
      totalDiscount,
      chartData: [
        { label: 'Đã thanh toán', value: totalPaid, color: 'bg-green-500' },
        { label: 'Còn nợ', value: totalDebt, color: 'bg-red-500' },
        { label: 'Khuyến mãi', value: totalDiscount, color: 'bg-yellow-500' },
      ]
    };
  }, [filteredOrders]);

  const debtOrders = useMemo(() => {
    return filteredOrders.filter(o => o.remainingDebt > 0);
  }, [filteredOrders]);

  const collaboratorRevenue = useMemo(() => {
    const stats = new Map<string, number>();
    filteredOrders.forEach(order => {
      const collaborator = order.collaborator || 'Chưa xác định';
      stats.set(collaborator, (stats.get(collaborator) || 0) + order.finalAmount);
    });
    return Array.from(stats.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);
  
  const lateDeliveries = useMemo(() => {
      return filteredOrders
          .filter(o => o.actualCompletionDate && o.expectedCompletionDate && new Date(o.actualCompletionDate) > new Date(o.expectedCompletionDate))
          .map(o => {
              const expected = new Date(o.expectedCompletionDate);
              const actual = new Date(o.actualCompletionDate);
              const diffTime = actual.getTime() - expected.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return { ...o, daysLate: diffDays };
          });
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">Báo Cáo Kinh Doanh</h2>
          <div className="flex-grow h-px bg-gray-200 hidden sm:block"></div>
          <div className="w-full sm:w-auto">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Từ Ngày</label>
            <input type="date" id="startDate" value={startDate} onChange={handleCustomDateChange(setStartDate)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Đến Ngày</label>
            <input type="date" id="endDate" value={endDate} onChange={handleCustomDateChange(setEndDate)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-600 mr-2">Chọn nhanh:</span>
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => handleSetDateRange(p.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                activePreset === p.key 
                ? 'bg-blue-600 text-white shadow' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard title="Thống kê Sản phẩm Bán ra">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="font-semibold text-gray-700">Tổng số lượng bán ra:</h4>
                <span className="text-blue-600 font-bold text-lg">
                    {totalProductQuantity.toLocaleString('vi-VN')}
                </span>
            </div>
            <HorizontalBarChart data={productStats} unit="" />
        </ReportCard>

        <ReportCard title="Tổng quan Tài chính">
            {financialOverview.totalRevenue > 0 ? (
                <>
                    <div className="text-center mb-4">
                        <div className="text-sm text-gray-500">Tổng Doanh thu</div>
                        <div className="text-3xl font-bold text-gray-800">{formatCurrency(financialOverview.totalRevenue)}</div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden" title={`Doanh thu = ${formatCurrency(financialOverview.chartData[0].value)} (Thanh toán) + ${formatCurrency(financialOverview.chartData[1].value)} (Nợ) + ${formatCurrency(financialOverview.chartData[2].value)} (Khuyến mãi)`}>
                        {financialOverview.chartData.map(part => (
                            part.value > 0 && <div
                                key={part.label}
                                className={`${part.color} transition-all duration-300`}
                                style={{ width: `${(part.value / financialOverview.totalRevenue) * 100}%` }}
                                title={`${part.label}: ${formatCurrency(part.value)} (${((part.value / financialOverview.totalRevenue) * 100).toFixed(1)}%)`}
                            ></div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        {financialOverview.chartData.map(item => (
                            <div key={item.label} className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
                                    <span className="font-medium text-gray-700">{item.label}:</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">Tổng VAT (đã bao gồm trong doanh thu):</span>
                            <span className="font-semibold">{formatCurrency(financialOverview.totalVat)}</span>
                        </div>
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-sm">Không có doanh thu trong kỳ này.</p>
            )}
        </ReportCard>
        
        <ReportCard title="Doanh thu theo Người bán">
            <HorizontalBarChart data={collaboratorRevenue} unit="VND" />
        </ReportCard>

        <ReportCard title="Danh sách Đơn hàng còn nợ">
          {debtOrders.length > 0 ? (
            <div className="overflow-x-auto max-h-80">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Mã ĐH</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Tên ĐH</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Tên KH</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">SĐT</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Còn Nợ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {debtOrders.map(o => (
                    <tr key={o.id}>
                      <td className="px-4 py-2 font-medium text-gray-900">{o.orderNumber}</td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{o.orderName}</td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{o.customerName}</td>
                      <td className="px-4 py-2 text-gray-700">{o.contactNumber}</td>
                      <td className="px-4 py-2 text-right font-semibold text-red-600">{formatCurrency(o.remainingDebt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-500 text-sm">Không có đơn hàng nào còn nợ.</p>}
        </ReportCard>
        
        <ReportCard title="Thống kê Đơn hàng giao trễ" className="lg:col-span-2">
            {lateDeliveries.length > 0 ? (
                 <div className="overflow-x-auto max-h-80">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Mã ĐH</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Tên KH</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Ngày dự kiến</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Ngày giao thực tế</th>
                                <th className="px-4 py-2 text-center font-medium text-gray-500">Số ngày trễ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lateDeliveries.map(o => (
                                <tr key={o.id}>
                                    <td className="px-4 py-2 font-medium text-gray-900">{o.orderNumber}</td>
                                    <td className="px-4 py-2 text-gray-700">{o.customerName}</td>
                                    <td className="px-4 py-2 text-gray-700">{formatDate(o.expectedCompletionDate)}</td>
                                    <td className="px-4 py-2 text-gray-700">{formatDate(o.actualCompletionDate)}</td>
                                    <td className="px-4 py-2 text-center font-semibold text-orange-600">{o.daysLate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            ) : <p className="text-gray-500 text-sm">Không có đơn hàng nào bị giao trễ trong kỳ.</p>}
        </ReportCard>
      </div>
    </div>
  );
};

export default BusinessReport;