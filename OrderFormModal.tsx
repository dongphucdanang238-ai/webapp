import React, { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, ProductDetail, CustomerInfo } from '../types';
import { DeleteIcon } from './icons';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Order) => void;
  initialData?: Order | null;
  collaborators: string[];
  customers: CustomerInfo[];
  onAddNewCustomer: (name: string, phone: string) => void;
}

const emptyProduct: Omit<ProductDetail, 'id'> = {
  productName: '',
  form: '',
  size: '',
  quantity: 0,
  ddovt: '',
  fabricColor: '',
  fabricCode: '',
  ribColor: '',
  ribThread: '',
  printType: '',
  unitPrice: 0,
  printCost: 0,
  totalPrice: 0,
  lineTotal: 0,
  notes: '',
};

const emptyForm: Omit<Order, 'id' | 'orderNumber'> = {
  orderName: '',
  orderDate: new Date().toISOString().split('T')[0],
  customerName: '',
  contactNumber: '',
  products: Array.from({ length: 2 }, (_, i) => ({ id: `new_${i}`, ...emptyProduct })),
  totalOrderValue: 0,
  vat: 0,
  finalAmount: 0,
  discount: 0,
  deposit: 0,
  payment: 0,
  remainingDebt: 0,
  executionDays: 0,
  expectedCompletionDate: '',
  actualCompletionDate: '',
  status: OrderStatus.Pending,
  notes: '',
  collaborator: '',
  discountApplied: false,
  demoImage: '',
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

const readVietnameseCurrency = (number: number): string => {
    if (number == null || isNaN(number)) return '';
    const num = Math.round(Math.abs(number));

    if (num === 0) return 'Không đồng';

    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const suffixes = ['', ' nghìn', ' triệu', ' tỷ'];

    const readThreeDigits = (n: string, isMostSignificant: boolean) => {
        let result = '';
        const numVal = parseInt(n, 10);
        if (numVal === 0) return '';

        const tram = Math.floor(numVal / 100);
        const chuc = Math.floor((numVal % 100) / 10);
        const donvi = numVal % 10;
        
        if (tram > 0) {
            result = units[tram] + ' trăm';
        }

        if (chuc > 1) { // 20-99
            result += (result ? ' ' : '') + units[chuc] + ' mươi';
            if (donvi === 1) result += ' mốt';
        } else if (chuc === 1) { // 10-19
            result += (result ? ' ' : '') + 'mười';
        } else if (donvi > 0) { // 01-09
            // Add 'linh' if there's a hundreds digit OR it's not the most significant group
            if (tram > 0 || !isMostSignificant) {
                result += (result ? ' ' : '') + 'linh';
            }
        }
        
        if (donvi > 0) {
            if (donvi === 5 && chuc >= 1) {
                result += ' lăm';
            } else if (donvi === 1 && chuc > 1) {
                // Already handled by 'mốt'
            } else {
                // Add space before unit if needed
               if (result && !result.endsWith(' ')) {
                   result += ' ';
               }
               result += units[donvi];
            }
        }
        
        return result;
    };

    let numStr = num.toString();
    const groups = [];
    while (numStr.length > 0) {
        groups.unshift(numStr.slice(-3));
        numStr = numStr.slice(0, -3);
    }
    
    let resultText = '';
    for (let i = 0; i < groups.length; i++) {
        const groupVal = parseInt(groups[i], 10);
        if (groupVal === 0) continue;
        
        const isMostSignificant = (i === 0);
        const groupText = readThreeDigits(groups[i].padStart(3, '0'), isMostSignificant);
        
        if (groupText) {
            // Add a leading space if resultText is not empty
            resultText += (resultText ? ' ' : '') + groupText + suffixes[groups.length - 1 - i];
        }
    }
    
    resultText = resultText.trim().replace(/\s+/g, ' ');
    resultText = resultText.charAt(0).toUpperCase() + resultText.slice(1);

    return resultText + ' đồng';
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

const columnFieldsMap: { [key: number]: keyof ProductDetail } = {
    0: 'productName', 1: 'form', 2: 'size', 3: 'quantity', 4: 'ddovt',
    5: 'fabricColor', 6: 'fabricCode', 7: 'ribColor', 8: 'ribThread',
    9: 'printType', 10: 'unitPrice', 11: 'printCost', 12: 'notes'
};

const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, collaborators, customers, onAddNewCustomer }) => {
  const [formData, setFormData] = useState<Omit<Order, 'id' | 'orderNumber'> & { orderNumber?: string }>(emptyForm);
  const [isEditMode, setIsEditMode] = useState(false);
  const [focusedInput, setFocusedInput] = useState<{rowIndex: number, colKey: string} | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // State for copy/paste functionality
  const [clipboard, setClipboard] = useState<Omit<ProductDetail, 'id'> | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowIndex: number } | null>(null);

  // New state for customer lookup
  const [customerCode, setCustomerCode] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [customerNameDisabled, setCustomerNameDisabled] = useState(false);


  useEffect(() => {
    if (initialData) {
      const products = initialData.products || [];
      const paddedProducts = [...products];
      while (paddedProducts.length < 2) {
        paddedProducts.push({ id: `new_${paddedProducts.length}`, ...emptyProduct });
      }

      setFormData({
        ...emptyForm,
        ...initialData,
        products: paddedProducts,
      });
      setIsEditMode(true);
      
      const existingCustomer = customers.find(c => c.phone === initialData.contactNumber);
      if (existingCustomer) {
        setCustomerCode(existingCustomer.customerCode);
        setIsNewCustomer(false);
        setCustomerNameDisabled(true);
      } else {
        setCustomerCode('');
        setIsNewCustomer(!!initialData.contactNumber);
        setCustomerNameDisabled(false);
      }
    } else {
      setFormData(emptyForm);
      setIsEditMode(false);
      setCustomerCode('');
      setIsNewCustomer(false);
      setCustomerNameDisabled(false);
    }
  }, [initialData, customers]);
  
  // Effect to close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Effect to get the new customer code after saving
  useEffect(() => {
    if (isSavingCustomer) {
      const phone = formData.contactNumber;
      const newCustomer = customers.find(c => c.phone === phone);
      if (newCustomer) {
        setCustomerCode(newCustomer.customerCode);
        setIsNewCustomer(false);
        setIsSavingCustomer(false);
        setCustomerNameDisabled(true);
      }
    }
  }, [customers, isSavingCustomer, formData.contactNumber]);
  
  useEffect(() => {
    const newTotalOrderValue = formData.products.reduce((sum, product) => sum + product.lineTotal, 0);
    setFormData(prev => ({ ...prev, totalOrderValue: newTotalOrderValue }));
  }, [formData.products]);


  const calculateFinancials = useCallback(() => {
    setFormData(prev => {
      const finalAmount = Math.round(prev.totalOrderValue * (1 + (prev.vat || 0) / 100));
      const remainingDebt = finalAmount - (prev.discount || 0) - prev.deposit - (prev.payment || 0);
      return { ...prev, finalAmount, remainingDebt };
    });
  }, []);

  useEffect(() => {
    calculateFinancials();
  }, [formData.totalOrderValue, formData.vat, formData.deposit, formData.payment, formData.discount, calculateFinancials]);

  const handleProductChange = (index: number, field: keyof ProductDetail, value: any) => {
    setFormData(prev => {
        const newProducts = [...prev.products];
        const productToUpdate = { ...newProducts[index] };
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'printCost') {
            (productToUpdate as any)[field] = parseFormattedNumber(String(value));
        } else {
            (productToUpdate as any)[field] = value;
        }

        // Recalculate derived fields
        if (field === 'quantity' || field === 'unitPrice' || field ==='printCost') {
            productToUpdate.totalPrice = (Number(productToUpdate.unitPrice) || 0) + (Number(productToUpdate.printCost) || 0);
            productToUpdate.lineTotal = productToUpdate.totalPrice * (Number(productToUpdate.quantity) || 0);
        }

        newProducts[index] = productToUpdate;
        return { ...prev, products: newProducts };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    let parsedValue: string | number | boolean;
    
    parsedValue = isCheckbox 
      ? (e.target as HTMLInputElement).checked 
      : type === 'number' ? parseFloat(value) || 0 : value;

    setFormData(prev => {
      const newFormData = { ...prev, [name]: parsedValue };

      // ---- START DATE LOGIC ----
      if (name === 'executionDays' || name === 'orderDate') {
        const days = name === 'executionDays' ? (parsedValue as number) : newFormData.executionDays;
        const date = name === 'orderDate' ? (parsedValue as string) : newFormData.orderDate;
        
        if (date && days >= 0) {
          try {
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() + days);
            newFormData.expectedCompletionDate = startDate.toISOString().split('T')[0];
          } catch(err) { /* Invalid date, do nothing */ }
        }
      } 
      else if (name === 'expectedCompletionDate') {
        const expectedDateStr = parsedValue as string;
        const startDateStr = newFormData.orderDate;

        if (expectedDateStr && startDateStr) {
          try {
            const startDate = new Date(startDateStr);
            const expectedDate = new Date(expectedDateStr);
            if (expectedDate >= startDate) {
              const diffTime = expectedDate.getTime() - startDate.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              newFormData.executionDays = diffDays;
            }
          } catch(err) { /* Invalid date */ }
        }
      }
      // ---- END DATE LOGIC ----

      return newFormData;
    });
  };
  
  const handleTableKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const { key, shiftKey, ctrlKey, currentTarget } = e;
    const { selectionStart, selectionEnd, value, type } = currentTarget;

    // Handle fill down (Ctrl+D)
    if (key.toLowerCase() === 'd' && ctrlKey) {
        e.preventDefault();
        if (rowIndex > 0) {
            const fieldToCopy = columnFieldsMap[colIndex];
            if (fieldToCopy) {
                const valueToCopy = formData.products[rowIndex - 1][fieldToCopy];
                handleProductChange(rowIndex, fieldToCopy, valueToCopy);

                // Optional: move focus to next row to allow rapid fill
                 setTimeout(() => {
                    const nextInput = document.querySelector(`[data-row-index='${rowIndex + 1}'][data-col-index='${colIndex}']`) as HTMLInputElement;
                    if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                    }
                }, 0);
            }
        }
        return;
    }

    const isAtStart = selectionStart === 0 && selectionEnd === 0;
    const isAtEnd = selectionStart === value.length && selectionEnd === value.length;

    let nextRow = rowIndex;
    let nextCol = colIndex;
    let moved = false;

    const numCols = 15; // Number of columns in the product table
    const numRows = formData.products.length;

    switch (key) {
        case 'ArrowUp':
            nextRow = Math.max(0, rowIndex - 1);
            moved = true;
            break;
        case 'ArrowDown':
        case 'Enter':
            if (key === 'Enter' && shiftKey) {
                nextRow = Math.max(0, rowIndex - 1);
            } else {
                nextRow = Math.min(numRows - 1, rowIndex + 1);
            }
            moved = true;
            break;
        case 'ArrowLeft':
            if (type === 'number' || isAtStart) {
                nextCol = Math.max(0, colIndex - 1);
                moved = true;
            }
            break;
        case 'ArrowRight':
            if (type === 'number' || isAtEnd) {
                nextCol = Math.min(numCols - 1, colIndex + 1);
                moved = true;
            }
            break;
        case 'Tab':
            return; // Let browser handle default Tab behavior
        default:
            return;
    }

    if (moved) {
        e.preventDefault();
        const nextInput = document.querySelector(`[data-row-index='${nextRow}'][data-col-index='${nextCol}']`) as HTMLInputElement;
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent form submission on "Enter" key press in input fields.
    // Allow "Enter" in TEXTAREA for new lines.
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn ảnh có định dạng JPEG, JPG hoặc PNG.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, demoImage: reader.result as string }));
      };
      reader.onerror = (error) => {
          console.error("Lỗi khi đọc file ảnh:", error);
          alert("Đã có lỗi xảy ra khi tải ảnh lên.");
      };
      reader.readAsDataURL(file);
    };
    
  const handleAddProductRow = () => {
    setFormData(prev => {
        if (prev.products.length >= 15) return prev;
        const newProducts = [...prev.products, { id: `new_${prev.products.length}`, ...emptyProduct }];
        return { ...prev, products: newProducts };
    });
  };

  const handleDeleteProductRow = (indexToDelete: number) => {
    setFormData(prev => {
      if (prev.products.length <= 1) {
        alert("Không thể xóa dòng sản phẩm cuối cùng.");
        return prev;
      }
      const newProducts = prev.products.filter((_, index) => index !== indexToDelete);
      return { ...prev, products: newProducts };
    });
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    if (!phone) {
        setIsNewCustomer(false);
        setCustomerNameDisabled(false);
        setCustomerCode('');
        return;
    }

    const foundCustomer = customers.find(c => c.phone === phone);
    if (foundCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: foundCustomer.name,
      }));
      setCustomerCode(foundCustomer.customerCode);
      setIsNewCustomer(false);
      setCustomerNameDisabled(true);
    } else {
      setCustomerCode('');
      setIsNewCustomer(true);
      setCustomerNameDisabled(false);
    }
  };

  const handleSaveCustomer = () => {
    if (formData.customerName && formData.contactNumber && !isSavingCustomer) {
        setIsSavingCustomer(true);
        onAddNewCustomer(formData.customerName, formData.contactNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewCustomer) {
      alert("Vui lòng lưu thông tin khách hàng mới trước khi tạo đơn hàng.");
      return;
    }
    const orderData: Order = {
      ...formData,
      products: formData.products.filter(p => p.productName && p.quantity > 0), // Filter out empty product lines
      id: isEditMode && initialData ? initialData.id : new Date().getTime().toString(),
      orderNumber: isEditMode && initialData ? initialData.orderNumber : '', // Placeholder, will be generated in App.tsx
    };
    onSubmit(orderData);
  };
  
    const handleContextMenu = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      rowIndex,
    });
  };

  const handleCopyRow = () => {
    if (contextMenu) {
      const rowToCopy = formData.products[contextMenu.rowIndex];
      const { id, ...rowData } = rowToCopy;
      setClipboard(rowData);
    }
    setContextMenu(null);
  };

  const handlePasteRow = () => {
    if (contextMenu && clipboard) {
      setFormData(prev => {
        const newProducts = [...prev.products];
        const originalProduct = newProducts[contextMenu.rowIndex];
        
        const pastedData = { ...clipboard };
        const totalPrice = (Number(pastedData.unitPrice) || 0) + (Number(pastedData.printCost) || 0);
        const lineTotal = totalPrice * (Number(pastedData.quantity) || 0);

        newProducts[contextMenu.rowIndex] = {
          id: originalProduct.id,
          ...pastedData,
          totalPrice,
          lineTotal
        };
        return { ...prev, products: newProducts };
      });
    }
    setContextMenu(null);
  };

  if (!isOpen) return null;

  const remainingAmount = formData.finalAmount - (formData.discount || 0) - formData.deposit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      {contextMenu && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }} 
          className="absolute z-[60] bg-white shadow-lg rounded-md py-1 w-40 border text-sm"
        >
          <button 
            onClick={handleCopyRow} 
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span>Sao chép dòng</span>
          </button>
          <button 
            onClick={handlePasteRow} 
            disabled={!clipboard} 
            className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <span>Dán dữ liệu</span>
          </button>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-screen-xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{isEditMode ? 'Chỉnh Sửa Đơn Hàng' : 'Thêm Đơn Hàng Mới'}</h2>
            
            <Section title="1. Thông Tin Đơn Hàng">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                {/* Column 1: Order & Customer Info */}
                <div className="space-y-6">
                  <InputField label="Tên Đơn Hàng" name="orderName" value={formData.orderName} onChange={handleChange} required />
                  
                  <div className="border border-gray-200 rounded-md p-4 space-y-4 bg-gray-50/50">
                      <h4 className="text-sm font-semibold text-gray-600">Thông tin khách hàng</h4>
                      <InputField label="SĐT" name="contactNumber" value={formData.contactNumber} onChange={handleChange} onBlur={handlePhoneBlur} />
                      <InputField label="Mã KH" name="customerCode" value={customerCode || (isNewCustomer ? 'KHÁCH MỚI' : '')} onChange={() => {}} disabled />
                      <InputField label="Tên Khách Hàng" name="customerName" value={formData.customerName} onChange={handleChange} required disabled={customerNameDisabled} />
                      {isNewCustomer && (
                        <button
                          type="button"
                          onClick={handleSaveCustomer}
                          disabled={!formData.customerName || !formData.contactNumber || isSavingCustomer}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          {isSavingCustomer ? 'Đang lưu...' : 'Lưu thông tin KH'}
                        </button>
                      )}
                  </div>
                  
                  <div>
                      <label htmlFor="collaborator" className="block text-sm font-medium text-gray-700">Người bán</label>
                      <input 
                        type="text" 
                        name=" collaborator" 
                        id="collaborator" 
                        list="collaborators-list"
                        value={formData.collaborator || ''} 
                        onChange={handleChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <datalist id="collaborators-list">
                        {collaborators.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                  </div>
                </div>

                {/* Column 2: ID & Dates */}
                <div className="space-y-6">
                  <InputField label="Mã ĐH" name="orderNumber" value={isEditMode ? formData.orderNumber : 'Tự động tạo'} onChange={() => {}} disabled />
                  <InputField label="Ngày ĐH" name="orderDate" type="date" value={formData.orderDate} onChange={handleChange} required />
                  <InputField label="Số Ngày Thực Hiện" name="executionDays" type="number" value={formData.executionDays} onChange={handleChange} />
                  <InputField label="Ngày Giao Hàng" name="expectedCompletionDate" type="date" value={formData.expectedCompletionDate} onChange={handleChange} />
                </div>
                
                {/* Column 3: Image Upload */}
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh Demo Sản Phẩm</label>
                  <div className="relative flex flex-grow justify-center items-center w-full min-h-[13rem] border-2 border-gray-300 border-dashed rounded-md group hover:border-cyan-400 transition-colors">
                    {formData.demoImage ? (
                      <>
                        <img src={formData.demoImage} alt="Demo sản phẩm" className="object-contain w-full h-full p-1 rounded-md" />
                        <label htmlFor="file-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all cursor-pointer">
                          <span className="text-white font-semibold opacity-0 group-hover:opacity-100">Thay đổi ảnh</span>
                        </label>
                      </>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                            <span>Tải ảnh lên</span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                      </div>
                    )}
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="2. Chi Tiết Sản Phẩm">
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-fixed">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th style={{width: '3%'}} className="p-2 border font-medium text-gray-600 text-xs">Xóa</th>
                          <th style={{width: '3%'}} className="p-2 border font-medium text-gray-600 text-xs">STT</th>
                          <th style={{width: '9%'}} className="p-2 border font-medium text-gray-600 text-xs">Tên sản phẩm</th>
                          <th style={{width: '5%'}} className="p-2 border font-medium text-gray-600 text-xs">Form</th>
                          <th style={{width: '5%'}} className="p-2 border font-medium text-gray-600 text-xs">Size</th>
                          <th style={{width: '5%'}} className="p-2 border font-medium text-gray-600 text-xs">Số lượng</th>
                          <th style={{width: '5%'}} className="p-2 border font-medium text-gray-600 text-xs" title="Đơn vị tính">ĐVT</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Màu vải</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Mã vải</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Màu bo</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Chỉ bo</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Loại in/Thêu</th>
                          <th style={{width: '7%'}} className="p-2 border font-medium text-gray-600 text-xs">Đơn giá chưa in</th>
                          <th style={{width: '7%'}} className="p-2 border font-medium text-gray-600 text-xs">Chi phí in/Thêu</th>
                          <th style={{width: '6%'}} className="p-2 border font-medium text-gray-600 text-xs">Tổng giá SP</th>
                          <th style={{width: '7%'}} className="p-2 border font-medium text-gray-600 text-xs">Thành tiền</th>
                          <th style={{width: '8%'}} className="p-2 border font-medium text-gray-600 text-xs">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.products.map((product, index) => (
                          <tr 
                            key={product.id || `product-${index}`} 
                            className="hover:bg-gray-50 cursor-context-menu"
                            onContextMenu={(e) => handleContextMenu(e, index)}
                          >
                            <td className="p-1 border text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteProductRow(index)}
                                disabled={formData.products.length <= 1}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed p-1"
                                title="Xóa dòng này"
                                aria-label={`Xóa dòng sản phẩm ${index + 1}`}
                              >
                                <DeleteIcon className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="p-1 border text-center text-gray-500 text-xs">{index + 1}</td>
                            <td className="p-1 border"><input type="text" value={product.productName} onChange={(e) => handleProductChange(index, 'productName', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 0)} data-row-index={index} data-col-index="0" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.form} onChange={(e) => handleProductChange(index, 'form', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 1)} data-row-index={index} data-col-index="1" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.size} onChange={(e) => handleProductChange(index, 'size', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 2)} data-row-index={index} data-col-index="2" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={focusedInput?.rowIndex === index && focusedInput?.colKey === 'quantity' && product.quantity === 0 ? '' : formatNumberWithDots(product.quantity)} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} onFocus={() => setFocusedInput({rowIndex: index, colKey: 'quantity'})} onBlur={() => setFocusedInput(null)} onKeyDown={(e) => handleTableKeyDown(e, index, 3)} data-row-index={index} data-col-index="3" className="w-full p-1 border-gray-300 rounded text-xs text-right bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.ddovt} onChange={(e) => handleProductChange(index, 'ddovt', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 4)} data-row-index={index} data-col-index="4" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.fabricColor} onChange={(e) => handleProductChange(index, 'fabricColor', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 5)} data-row-index={index} data-col-index="5" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.fabricCode} onChange={(e) => handleProductChange(index, 'fabricCode', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 6)} data-row-index={index} data-col-index="6" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.ribColor} onChange={(e) => handleProductChange(index, 'ribColor', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 7)} data-row-index={index} data-col-index="7" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.ribThread} onChange={(e) => handleProductChange(index, 'ribThread', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 8)} data-row-index={index} data-col-index="8" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={product.printType} onChange={(e) => handleProductChange(index, 'printType', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 9)} data-row-index={index} data-col-index="9" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={focusedInput?.rowIndex === index && focusedInput?.colKey === 'unitPrice' && product.unitPrice === 0 ? '' : formatNumberWithDots(product.unitPrice)} onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)} onFocus={() => setFocusedInput({rowIndex: index, colKey: 'unitPrice'})} onBlur={() => setFocusedInput(null)} onKeyDown={(e) => handleTableKeyDown(e, index, 10)} data-row-index={index} data-col-index="10" className="w-full p-1 border-gray-300 rounded text-xs text-right bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border"><input type="text" value={focusedInput?.rowIndex === index && focusedInput?.colKey === 'printCost' && product.printCost === 0 ? '' : formatNumberWithDots(product.printCost)} onChange={(e) => handleProductChange(index, 'printCost', e.target.value)} onFocus={() => setFocusedInput({rowIndex: index, colKey: 'printCost'})} onBlur={() => setFocusedInput(null)} onKeyDown={(e) => handleTableKeyDown(e, index, 11)} data-row-index={index} data-col-index="11" className="w-full p-1 border-gray-300 rounded text-xs text-right bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                            <td className="p-1 border bg-gray-100 text-right pr-2 font-medium text-xs">{formatNumberWithDots(product.totalPrice)}</td>
                            <td className="p-1 border bg-gray-100 text-right pr-2 font-bold text-xs">{formatNumberWithDots(product.lineTotal)}</td>
                            <td className="p-1 border"><input type="text" value={product.notes} onChange={(e) => handleProductChange(index, 'notes', e.target.value)} onKeyDown={(e) => handleTableKeyDown(e, index, 12)} data-row-index={index} data-col-index="12" className="w-full p-1 border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                    type="button"
                    onClick={handleAddProductRow}
                    disabled={formData.products.length >= 15}
                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    Thêm Dòng
                </button>
              </div>
            </Section>

            <Section title="3. GIÁ TRỊ ĐƠN HÀNG">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DisplayField label="Giá Trị ĐH (từ SP)" value={formatNumberWithDots(formData.totalOrderValue) + ' VND'} />
                <div>
                  <label htmlFor="vat" className="block text-sm font-medium text-gray-700">VAT</label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="number"
                      name="vat"
                      id="vat"
                      value={focusedField === 'vat' && formData.vat === 0 ? '' : formData.vat}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('vat')}
                      onBlur={() => setFocusedField(null)}
                      className="block w-full border border-gray-300 rounded-md p-2 pr-10 text-right bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                      step="0.1"
                      min="0"
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
                <DisplayField label="Thành Tiền" value={formatNumberWithDots(formData.finalAmount) + ' VND'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-start">
                  <div>
                      <label htmlFor="discount" className="block text-sm font-medium text-gray-700">Khuyến mãi</label>
                      <input
                        type="text"
                        name="discount"
                        id="discount"
                        value={focusedField === 'discount' && formData.discount === 0 ? '' : formatNumberWithDots(formData.discount)}
                        onChange={(e) => {
                            const { value } = e.target;
                            setFormData(prev => ({ ...prev, discount: parseFormattedNumber(value) }));
                        }}
                        onFocus={() => setFocusedField('discount')}
                        onBlur={() => setFocusedField(null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-right bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                  </div>
                  <div>
                      <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">Đặt cọc</label>
                      <input
                        type="text"
                        name="deposit"
                        id="deposit"
                        value={focusedField === 'deposit' && formData.deposit === 0 ? '' : formatNumberWithDots(formData.deposit)}
                        onChange={(e) => {
                            const { value } = e.target;
                            setFormData(prev => ({ ...prev, deposit: parseFormattedNumber(value) }));
                        }}
                        onFocus={() => setFocusedField('deposit')}
                        onBlur={() => setFocusedField(null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-right bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Còn Lại</label>
                      <div className="mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md font-bold text-red-600">
                        {formatNumberWithDots(remainingAmount) + ' VND'}
                      </div>
                      {remainingAmount >= 0 && (
                          <p className="text-xs text-gray-500 italic mt-1 min-h-[1rem]">
                              {readVietnameseCurrency(remainingAmount)}
                          </p>
                      )}
                    </div>
              </div>
            </Section>
            
            <Section title="4. Ghi Chú">
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </Section>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">{isEditMode ? 'Lưu Thay Đổi' : 'Tạo Đơn Hàng'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{label: string, name: string, value: any, onChange: any, type?: string, required?: boolean, disabled?: boolean, [x:string]: any}> = ({label, name, value, onChange, type='text', required=false, disabled=false, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" {...props}/>
    </div>
);

const DisplayField: React.FC<{label: string, value: string, className?: string}> = ({label, value, className=''}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className={`mt-1 p-2 bg-gray-100 border border-gray-200 rounded-md ${className}`}>{value}</div>
    </div>
);

export default OrderFormModal;
