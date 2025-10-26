
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { EditIcon, DeleteIcon } from './icons';
import GanttBar from './GanttBar';

interface OrderTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onUpdatePayment: (orderId: string, paymentAmount: number) => void;
  onUpdateDeposit: (orderId: string, depositAmount: number) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const statusClassMap: { [key in OrderStatus]: string } = {
  [OrderStatus.Completed]: 'bg-green-100 text-green-800',
  [OrderStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.Pending]: 'bg-red-100 text-red-800',
  [OrderStatus.Urgent]: 'bg-orange-100 text-orange-800',
  [OrderStatus.Delivered]: 'bg-purple-100 text-purple-800',
};

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

// Helper to format number string with dots
const formatNumberWithDots = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '';
  const stringValue = String(value).replace(/[^\d]/g, '');
  if (stringValue === '') return '';
  return Number(stringValue).toLocaleString('vi-VN');
};

// Helper to parse formatted string back to number
const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  return parseInt(String(value).replace(/\./g, ''), 10) || 0;
};


const PaymentCell: React.FC<{ order: Order; onUpdatePayment: (orderId: string, paymentAmount: number) => void; }> = ({ order, onUpdatePayment }) => {
  const [paymentValue, setPaymentValue] = useState<string>(formatNumberWithDots(order.payment));

  useEffect(() => {
    setPaymentValue(formatNumberWithDots(order.payment));
  }, [order.payment]);

  const handleSave = () => {
    onUpdatePayment(order.id, parseFormattedNumber(paymentValue));
  };
  
  const hasChanged = parseFormattedNumber(paymentValue) !== (order.payment || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentValue(formatNumberWithDots(e.target.value));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFormattedNumber(e.target.value) === 0) {
      setPaymentValue('');
    }
  };

  const handleBlur = () => {
    if (paymentValue === '') {
      setPaymentValue('0');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={paymentValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-24 border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500 text-right"
        aria-label={`Thanh toán cho ${order.orderNumber}`}
      />
      <button
        onClick={handleSave}
        className="px-3 py-2 bg-cyan-500 text-white text-xs font-bold rounded-md hover:bg-cyan-600 disabled:bg-gray-300"
        disabled={!hasChanged}
      >
        Lưu
      </button>
    </div>
  );
};

const DepositCell: React.FC<{ order: Order; onUpdateDeposit: (orderId: string, depositAmount: number) => void; }> = ({ order, onUpdateDeposit }) => {
  const [depositValue, setDepositValue] = useState<string>(formatNumberWithDots(order.deposit));

  useEffect(() => {
    setDepositValue(formatNumberWithDots(order.deposit));
  }, [order.deposit]);

  const handleSave = () => {
    onUpdateDeposit(order.id, parseFormattedNumber(depositValue));
  };
  
  const hasChanged = parseFormattedNumber(depositValue) !== (order.deposit || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositValue(formatNumberWithDots(e.target.value));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFormattedNumber(e.target.value) === 0) {
      setDepositValue('');
    }
  };

  const handleBlur = () => {
    if (depositValue === '') {
      setDepositValue('0');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={depositValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-24 border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500 text-right"
        aria-label={`Đặt cọc cho ${order.orderNumber}`}
      />
      <button
        onClick={handleSave}
        className="px-3 py-2 bg-cyan-500 text-white text-xs font-bold rounded-md hover:bg-cyan-600 disabled:bg-gray-300"
        disabled={!hasChanged}
      >
        Lưu
      </button>
    </div>
  );
};


const OrderTable: React.FC<OrderTableProps> = ({ orders, onEdit, onDelete, onUpdatePayment, onUpdateDeposit, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-cyan-500">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Mã ĐH</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Ngày Giao Hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Thời Gian Còn Lại</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">Tình Trạng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tên Đơn Hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Sản phẩm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Thành Tiền</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Đặt Cọc</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Thanh Toán</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Còn Nợ</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Người bán</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Chiết Khấu</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.expectedCompletionDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <GanttBar 
                    orderDate={order.orderDate}
                    expectedCompletionDate={order.expectedCompletionDate}
                    status={order.status}
                  />
                </td>
                <td className="px-6 py-4 text-sm">
                   <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className={`w-full p-1 text-xs leading-5 font-semibold rounded-md border-transparent focus:border-cyan-500 focus:ring-0 ${statusClassMap[order.status]}`}
                    aria-label={`Tình trạng cho đơn hàng ${order.orderNumber}`}
                  >
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.orderName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.products?.[0]?.productName || ''} ({order.products?.reduce((acc, p) => acc + p.quantity, 0) || 0})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(order.finalAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <DepositCell order={order} onUpdateDeposit={onUpdateDeposit} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <PaymentCell order={order} onUpdatePayment={onUpdatePayment} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{formatCurrency(order.remainingDebt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.collaborator || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <input 
                        type="checkbox" 
                        checked={order.discountApplied} 
                        disabled
                        className="h-5 w-5 text-cyan-600 border-gray-300 rounded focus:ring-0 cursor-not-allowed opacity-75"
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onEdit(order)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <EditIcon />
                  </button>
                  <button onClick={() => onDelete(order.id)} className="text-red-600 hover:text-red-900">
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={13} className="text-center py-10 text-gray-500">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
