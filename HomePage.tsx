
import React from 'react';
import { 
    ChartBarIcon, 
    PrinterIcon, 
    DocumentTextIcon,
    DocumentPlusIcon,
    IdentificationIcon,
    UserIcon
} from './icons';

type ActiveTab = 'home' | 'orders' | 'customers' | 'collaborators' | 'reports';

interface HomePageProps {
  onNavigate: (tab: ActiveTab) => void;
}

const ActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  description: string;
}> = ({ icon, title, onClick, description }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
  >
    <div className="mb-4 text-blue-600 group-hover:text-blue-700 transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </button>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const handleNotImplemented = () => {
    alert('Chức năng đang được phát triển. Vui lòng quay lại sau!');
  };

  const actions = [
    {
      icon: <DocumentTextIcon className="w-10 h-10" />,
      title: 'Đơn hàng',
      description: 'Quản lý, tạo mới, và theo dõi đơn hàng.',
      onClick: () => onNavigate('orders'),
    },
    {
      icon: <IdentificationIcon className="w-10 h-10" />,
      title: 'Khách Hàng',
      description: 'Xem thông tin và lịch sử khách hàng.',
      onClick: () => onNavigate('customers'),
    },
    {
      icon: <UserIcon className="w-10 h-10" />,
      title: 'Người bán',
      description: 'Báo cáo chi tiết theo từng người bán.',
      onClick: () => onNavigate('collaborators'),
    },
    {
      icon: <ChartBarIcon className="w-10 h-10" />,
      title: 'Báo cáo kinh doanh',
      description: 'Thống kê và phân tích hiệu quả.',
      onClick: () => onNavigate('reports'),
    },
    {
      icon: <PrinterIcon className="w-10 h-10" />,
      title: 'In phiếu thu',
      description: 'In phiếu thu tiền cọc hoặc thanh toán.',
      onClick: handleNotImplemented,
    },
    {
      icon: <DocumentPlusIcon className="w-10 h-10" />,
      title: 'Tạo hợp đồng',
      description: 'Soạn thảo hợp đồng cho các đơn hàng lớn.',
      onClick: handleNotImplemented,
    },
  ];

  return (
    <div className="p-1 sm:p-4 bg-gray-50 rounded-lg">
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
