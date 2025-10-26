
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, CustomerInfo } from './types';
import Dashboard from './components/Dashboard';
import SearchBar from './components/SearchBar';
import OrderTable from './components/OrderTable';
import OrderFormModal from './components/OrderFormModal';
import { PlusIcon, PrinterIcon, DocumentDuplicateIcon, DocumentArrowDownIcon } from './components/icons';
import CustomerData from './components/CustomerData';
import CollaboratorData from './components/CollaboratorData';
import HomePage from './components/HomePage';
import BusinessReport from './components/BusinessReport';
import PrintConfirmationModal from './components/PrintConfirmationModal';
import PrintDeliveryNoteModal from './components/PrintDeliveryNoteModal';

const MOCK_DATA: Order[] = [
  {
    id: '1',
    orderNumber: 'DH001',
    orderName: 'In áo thun sự kiện',
    orderDate: '2025-10-01',
    customerName: 'Nguyễn Văn A',
    contactNumber: '0901234567',
    products: [
      { id: 'p1-1', productName: 'Áo Thun Cổ Tròn', form: 'Regular', size: 'L', quantity: 50, ddovt: 'Cái', fabricColor: 'Trắng', fabricCode: 'CT01', ribColor: 'Trắng', ribThread: 'Trắng', printType: 'In lụa', unitPrice: 80000, printCost: 20000, totalPrice: 100000, lineTotal: 5000000, notes: 'Logo trước ngực' }
    ],
    totalOrderValue: 5000000,
    vat: 10,
    finalAmount: 5500000,
    discount: 0,
    deposit: 2000000,
    payment: 3500000,
    remainingDebt: 0,
    executionDays: 9,
    expectedCompletionDate: '2025-10-10',
    actualCompletionDate: '2025-10-09',
    status: OrderStatus.Delivered,
    notes: 'In logo trước ngực',
    collaborator: 'Võ Đình Thắng',
    discountApplied: true,
    demoImage: '',
  },
  {
    id: '2',
    orderNumber: 'DH002',
    orderName: 'Thêu sơ mi đồng phục',
    orderDate: '2025-10-05',
    customerName: 'Trần Thị B',
    contactNumber: '0987654321',
    products: [
       { id: 'p2-1', productName: 'Áo Sơ Mi Nam', form: 'Slimfit', size: 'M', quantity: 10, ddovt: 'Cái', fabricColor: 'Xanh da trời', fabricCode: 'KT05', ribColor: 'N/A', ribThread: 'N/A', printType: 'Thêu logo', unitPrice: 220000, printCost: 30000, totalPrice: 250000, lineTotal: 2500000, notes: 'Logo tay áo trái' },
       { id: 'p2-2', productName: 'Áo Sơ Mi Nữ', form: 'Regular', size: 'S', quantity: 10, ddovt: 'Cái', fabricColor: 'Xanh da trời', fabricCode: 'KT05', ribColor: 'N/A', ribThread: 'N/A', printType: 'Thêu logo', unitPrice: 220000, printCost: 30000, totalPrice: 250000, lineTotal: 2500000, notes: 'Logo tay áo trái' }
    ],
    totalOrderValue: 5000000,
    vat: 0,
    finalAmount: 5000000,
    discount: 0,
    deposit: 1500000,
    payment: 0,
    remainingDebt: 3500000,
    executionDays: 10,
    expectedCompletionDate: '2025-10-15',
    actualCompletionDate: '',
    status: OrderStatus.InProgress,
    notes: 'Thêu logo tay áo trái',
    collaborator: 'Tâm Phúc Việt',
    discountApplied: false,
    demoImage: '',
  },
   {
    id: '3',
    orderNumber: 'DH003',
    orderName: 'In mũ quảng cáo',
    orderDate: '2025-10-08',
    customerName: 'Lê Văn C',
    contactNumber: '0912345678',
    products: [
      { id: 'p3-1', productName: 'Mũ Lưỡi Trai', form: 'Standard', size: 'Free', quantity: 100, ddovt: 'Cái', fabricColor: 'Đen', fabricCode: 'KK01', ribColor: 'N/A', ribThread: 'N/A', printType: 'In decal', unitPrice: 35000, printCost: 10000, totalPrice: 45000, lineTotal: 4500000, notes: '' }
    ],
    totalOrderValue: 4500000,
    vat: 10,
    finalAmount: 4950000,
    discount: 0,
    deposit: 2000000,
    payment: 0,
    remainingDebt: 2950000,
    executionDays: 12,
    expectedCompletionDate: '2025-10-20',
    actualCompletionDate: '2025-10-22',
    status: OrderStatus.Completed,
    notes: '',
    collaborator: 'Võ Đình Thắng',
    discountApplied: false,
    demoImage: '',
  },
   {
    id: '4',
    orderNumber: 'DH004',
    orderName: 'In áo khoác nhóm',
    orderDate: '2025-10-11',
    customerName: 'Nguyễn Văn A',
    contactNumber: '0901234567',
    products: [
      { id: 'p4-1', productName: 'Áo Khoác Gió', form: 'Unisex', size: 'L', quantity: 30, ddovt: 'Cái', fabricColor: 'Xanh rêu', fabricCode: 'DU03', ribColor: 'Đen', ribThread: 'Đen', printType: 'In phản quang', unitPrice: 250000, printCost: 50000, totalPrice: 300000, lineTotal: 9000000, notes: 'In lưng áo' }
    ],
    totalOrderValue: 9000000,
    vat: 10,
    finalAmount: 9900000,
    discount: 0,
    deposit: 4000000,
    payment: 0,
    remainingDebt: 5900000,
    executionDays: 15,
    expectedCompletionDate: '2025-10-26',
    actualCompletionDate: '',
    status: OrderStatus.Pending,
    notes: 'In lưng áo',
    collaborator: 'Tâm Phúc Việt',
    discountApplied: true,
    demoImage: '',
  },
];

const generateNextOrderNumber = (existingOrders: Order[]): string => {
  const latestOrder = existingOrders
    .filter(o => o.orderNumber.startsWith('DH'))
    .map(o => parseInt(o.orderNumber.substring(2), 10))
    .sort((a, b) => b - a)[0];
  
  const nextNumber = latestOrder ? latestOrder + 1 : 1;
  return `DH${String(nextNumber).padStart(3, '0')}`;
};

type ActiveTab = 'home' | 'orders' | 'customers' | 'collaborators' | 'reports';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [placeholderOrderId, setPlaceholderOrderId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDeliveryNoteModalOpen, setIsDeliveryNoteModalOpen] = useState(false);

  const [collaborators, setCollaborators] = useState<string[]>(() => {
    const initialCollaborators = new Set(["Võ Đình Thắng", "Tâm Phúc Việt"]);
    MOCK_DATA.forEach(order => {
      if (order.collaborator) {
        initialCollaborators.add(order.collaborator);
      }
    });
    return Array.from(initialCollaborators);
  });

  const customerData = useMemo((): CustomerInfo[] => {
    const customerOrdersMap = new Map<string, Order[]>();
    orders.forEach(order => {
        if (!order.contactNumber || order.contactNumber.trim() === '') return;
        const key = order.contactNumber;
        if (!customerOrdersMap.has(key)) {
            customerOrdersMap.set(key, []);
        }
        customerOrdersMap.get(key)!.push(order);
    });

    const intermediateResult: {
        name: string;
        phone: string;
        totalOrders: number;
        totalSpent: number;
        membershipPoints: number;
    }[] = [];

    customerOrdersMap.forEach((customerOrders, phone) => {
        const nonPlaceholderOrders = customerOrders.filter(o => !o.isPlaceholder);
        if (nonPlaceholderOrders.length === 0 && customerOrders.length > 0) {
            // This is a new customer placeholder, use its data
            intermediateResult.push({
                name: customerOrders[0].customerName,
                phone: customerOrders[0].contactNumber,
                totalOrders: 0,
                totalSpent: 0,
                membershipPoints: 0,
            });
            return;
        }

        const sortedCustomerOrders = [...nonPlaceholderOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        const name = sortedCustomerOrders[0].customerName;
        const totalOrders = sortedCustomerOrders.length;
        const totalSpent = sortedCustomerOrders.reduce((sum, o) => sum + o.finalAmount, 0);

        let membershipPoints = 0;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        
        const twelveMonthsAgo = new Date(yesterday);
        twelveMonthsAgo.setFullYear(yesterday.getFullYear() - 1);
        
        const recentOrders = sortedCustomerOrders.filter(o => {
            const orderDate = new Date(o.orderDate);
            return orderDate >= twelveMonthsAgo && orderDate <= yesterday;
        });

        if (recentOrders.length > 0) {
            const mostRecentOrderInPeriod = recentOrders[0];
            membershipPoints = Math.floor(mostRecentOrderInPeriod.finalAmount * 0.01);
        }
        
        intermediateResult.push({
            name,
            phone,
            totalOrders,
            totalSpent,
            membershipPoints,
        });
    });

    // Sort alphabetically by name to assign stable codes
    intermediateResult.sort((a, b) => a.name.localeCompare(b.name));

    const resultWithCode: CustomerInfo[] = intermediateResult.map((customer, index) => ({
        customerCode: `KH${String(index + 1).padStart(3, '0')}`,
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        membershipPoints: customer.membershipPoints,
    }));

    // Sort by total spent for final display
    return resultWithCode.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const handleAddOrder = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
        setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  const handleFormSubmit = (orderData: Order) => {
    if (orderData.collaborator && !collaborators.includes(orderData.collaborator)) {
        setCollaborators(prev => [...prev, orderData.collaborator!]);
    }

    let ordersToUpdate = [...orders];

    if (placeholderOrderId) {
        const placeholder = orders.find(o => o.id === placeholderOrderId);
        if (placeholder && placeholder.contactNumber === orderData.contactNumber) {
            ordersToUpdate = ordersToUpdate.filter(o => o.id !== placeholderOrderId);
        }
    }

    if (editingOrder) {
      setOrders(ordersToUpdate.map(order => (order.id === orderData.id ? orderData : order)));
    } else {
      const newOrder = {
        ...orderData,
        orderNumber: generateNextOrderNumber(orders),
      };
      setOrders([newOrder, ...ordersToUpdate]);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    setPlaceholderOrderId(null);
  };

  const handleModalClose = () => {
    if (placeholderOrderId) {
        setOrders(prev => prev.filter(o => o.id !== placeholderOrderId));
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    setPlaceholderOrderId(null);
  };

  const handleAddNewCustomer = (name: string, phone: string) => {
    if (placeholderOrderId) return;
    const existingCustomer = customerData.find(c => c.phone === phone);
    if (existingCustomer) return;

    const newPlaceholderId = `placeholder_${new Date().getTime()}`;
    const placeholderOrder: Order = {
      id: newPlaceholderId,
      orderNumber: 'N/A',
      orderName: 'PLACEHOLDER',
      orderDate: new Date().toISOString().split('T')[0],
      customerName: name,
      contactNumber: phone,
      products: [],
      totalOrderValue: 0, vat: 0, finalAmount: 0, discount: 0, deposit: 0, payment: 0, remainingDebt: 0,
      executionDays: 0, expectedCompletionDate: '', actualCompletionDate: '',
      status: OrderStatus.Pending,
      notes: 'Placeholder for new customer creation',
      isPlaceholder: true,
      collaborator: '',
      discountApplied: false,
    };
    setOrders(prev => [...prev, placeholderOrder]);
    setPlaceholderOrderId(newPlaceholderId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleBulkDiscountUpdate = (updates: { [orderId: string]: boolean }) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        updates.hasOwnProperty(order.id)
          ? { ...order, discountApplied: updates[order.id] }
          : order
      )
    );
  };
  
  const handleUpdatePayment = (orderId: string, paymentAmount: number) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const newRemainingDebt = order.finalAmount - order.discount - order.deposit - paymentAmount;
          return { ...order, payment: paymentAmount, remainingDebt: newRemainingDebt };
        }
        return order;
      })
    );
  };

  const handleUpdateDeposit = (orderId: string, depositAmount: number) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const newRemainingDebt = order.finalAmount - order.discount - depositAmount - order.payment;
          return { ...order, deposit: depositAmount, remainingDebt: newRemainingDebt };
        }
        return order;
      })
    );
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleUpdateCustomerName = (phone: string, newName: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.contactNumber === phone
          ? { ...order, customerName: newName }
          : order
      )
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (order.isPlaceholder) return false;
      const query = searchQuery.toLowerCase();
      const matchesSearch = order.orderNumber.toLowerCase().includes(query) ||
                            (order.orderName && order.orderName.toLowerCase().includes(query)) ||
                            order.customerName.toLowerCase().includes(query) ||
                            (order.collaborator && order.collaborator.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
        alert("Không có đơn hàng nào để xuất.");
        return;
    }

    const headers = [
        "Mã ĐH", "Tên Đơn Hàng", "Ngày ĐH", "Tên KH", "SĐT KH",
        "Tên sản phẩm", "Form", "Size", "Số lượng", "ĐVT", "Màu vải", "Mã vải",
        "Màu bo", "Chỉ bo", "Loại in/Thêu", "Đơn giá chưa in", "Chi phí in/Thêu",
        "Tổng giá SP", "Thành tiền SP", "Tổng Giá Trị ĐH", "VAT (%)", "Thành Tiền (sau VAT)",
        "Khuyến mãi", "Đặt cọc", "Thanh Toán", "Còn Nợ", "Số Ngày Thực Hiện", "Ngày Giao Hàng",
        "Ngày Giao Thực Tế", "Tình Trạng", "Người bán", "Chiết Khấu", "Ghi chú ĐH", "Ghi chú SP"
    ];

    const csvRows = [headers.join(',')];

    const formatDateForCSV = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    filteredOrders.forEach(order => {
        if (order.products && order.products.length > 0) {
            order.products.forEach(product => {
                const row = [
                    order.orderNumber, order.orderName, formatDateForCSV(order.orderDate), order.customerName, order.contactNumber,
                    product.productName, product.form, product.size, product.quantity, product.ddovt, product.fabricColor, product.fabricCode,
                    product.ribColor, product.ribThread, product.printType, product.unitPrice, product.printCost, product.totalPrice, product.lineTotal,
                    order.totalOrderValue, order.vat, order.finalAmount, order.discount, order.deposit, order.payment, order.remainingDebt,
                    order.executionDays, formatDateForCSV(order.expectedCompletionDate), formatDateForCSV(order.actualCompletionDate),
                    order.status, order.collaborator, order.discountApplied ? 'Có' : 'Không', order.notes, product.notes
                ].map(escapeCSV);
                csvRows.push(row.join(','));
            });
        } else {
            const row = [
                order.orderNumber, order.orderName, formatDateForCSV(order.orderDate), order.customerName, order.contactNumber,
                '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Empty product fields
                order.totalOrderValue, order.vat, order.finalAmount, order.discount, order.deposit, order.payment, order.remainingDebt,
                order.executionDays, formatDateForCSV(order.expectedCompletionDate), formatDateForCSV(order.actualCompletionDate),
                order.status, order.collaborator, order.discountApplied ? 'Có' : 'Không', order.notes, ''
            ].map(escapeCSV);
            csvRows.push(row.join(','));
        }
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute("href", url);
        link.setAttribute("download", `DanhSachDonHang_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  const TabButton: React.FC<{tabName: ActiveTab, currentTab: ActiveTab, label: string, onClick: () => void}> = ({ tabName, currentTab, label, onClick }) => (
    <button
      onClick={onClick}
      className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
        currentTab === tabName
          ? 'border-cyan-500 text-cyan-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">ĐỒNG PHỤC ĐÀ NẴNG</h1>
            <p className="text-sm text-gray-500 mt-1">Hệ Thống Quản Lý & Theo Dõi Đơn Hàng</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-6" aria-label="Tabs">
            <TabButton tabName="home" currentTab={activeTab} label="Trang Chủ" onClick={() => setActiveTab('home')} />
            <TabButton tabName="orders" currentTab={activeTab} label="Đơn Hàng" onClick={() => setActiveTab('orders')} />
            <TabButton tabName="customers" currentTab={activeTab} label="Khách Hàng" onClick={() => setActiveTab('customers')} />
            <TabButton tabName="collaborators" currentTab={activeTab} label="Người Bán" onClick={() => setActiveTab('collaborators')} />
            <TabButton tabName="reports" currentTab={activeTab} label="Báo Cáo" onClick={() => setActiveTab('reports')} />
          </nav>
        </div>

        {activeTab === 'home' && (
          <HomePage onNavigate={setActiveTab} />
        )}
        
        {activeTab === 'orders' && (
          <>
            <Dashboard orders={orders.filter(o => !o.isPlaceholder)} />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Danh Sách Đơn Hàng</h2>
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg border">
                     <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all"
                    >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        <span>Xuất CSV</span>
                    </button>
                    <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>In XNĐH</span>
                    </button>
                     <button
                        onClick={() => setIsDeliveryNoteModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all"
                    >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                        <span>In BBGH</span>
                    </button>
                    <button
                        onClick={handleAddOrder}
                        className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-cyan-600 rounded-md shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Thêm Đơn Hàng</span>
                    </button>
                </div>
            </div>
            <SearchBar 
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
            <OrderTable 
              orders={filteredOrders}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
              onUpdatePayment={handleUpdatePayment}
              onUpdateDeposit={handleUpdateDeposit}
              onUpdateStatus={handleUpdateStatus}
            />
          </>
        )}

        {activeTab === 'customers' && (
          <CustomerData customers={customerData} onUpdateCustomerName={handleUpdateCustomerName} />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorData
            orders={orders}
            collaborators={collaborators}
            onSaveChanges={handleBulkDiscountUpdate}
          />
        )}
        
        {activeTab === 'reports' && (
          <BusinessReport orders={orders.filter(o => !o.isPlaceholder)} />
        )}

      </main>
      <OrderFormModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        initialData={editingOrder}
        collaborators={collaborators}
        customers={customerData}
        onAddNewCustomer={handleAddNewCustomer}
      />
       <PrintConfirmationModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        orders={orders}
      />
      <PrintDeliveryNoteModal
        isOpen={isDeliveryNoteModalOpen}
        onClose={() => setIsDeliveryNoteModalOpen(false)}
        orders={orders}
      />
    </div>
  );
};

export default App;
