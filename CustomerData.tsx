import React, { useState, useMemo } from 'react';
import { CustomerInfo } from '../types';
import { SearchIcon, EditIcon } from './icons';

interface CustomerDataProps {
  customers: CustomerInfo[];
  onUpdateCustomerName: (phone: string, newName: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const CustomerData: React.FC<CustomerDataProps> = ({ customers, onUpdateCustomerName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');


  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const query = searchQuery.toLowerCase();
      return customer.name.toLowerCase().includes(query) ||
             customer.phone.toLowerCase().includes(query);
    });
  }, [customers, searchQuery]);

  const handleEdit = (customer: CustomerInfo) => {
    setEditingPhone(customer.phone);
    setEditedName(customer.name);
  };

  const handleCancel = () => {
    setEditingPhone(null);
    setEditedName('');
  };

  const handleSave = () => {
    if (editingPhone && editedName.trim()) {
      onUpdateCustomerName(editingPhone, editedName.trim());
      handleCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Dữ Liệu Khách Hàng</h2>
      <div className="relative mb-4 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm theo Tên KH hoặc SĐT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã KH</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khách Hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Số Đơn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Chi Tiêu</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm thành viên</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => {
              const isEditing = editingPhone === customer.phone;
              return (
              <tr key={customer.customerCode} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.customerCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-blue-400 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      customer.name
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{customer.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{formatCurrency(customer.totalSpent)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{customer.membershipPoints.toLocaleString('vi-VN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-md hover:bg-blue-600">Lưu</button>
                        <button onClick={handleCancel} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-300">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(customer)} className="text-indigo-600 hover:text-indigo-900" aria-label={`Chỉnh sửa ${customer.name}`}>
                        <EditIcon />
                      </button>
                    )}
                </td>
              </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerData;