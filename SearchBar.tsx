import React from 'react';
import { OrderStatus } from '../types';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  searchQuery: string;
  statusFilter: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, onStatusChange, searchQuery, statusFilter }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-grow w-full sm:w-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm theo Mã ĐH, Tên ĐH, Tên KH, hoặc Người bán..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div className="w-full sm:w-auto sm:min-w-[200px]">
        <select
          value={statusFilter}
          onChange={onStatusChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="All">Tất cả Tình Trạng</option>
          {Object.values(OrderStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
