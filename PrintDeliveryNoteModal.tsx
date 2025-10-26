
import React, { useState, useEffect, useMemo } from 'react';
import { Order } from '../types';

// Let TypeScript know that html2pdf is available globally from the script tag
declare const html2pdf: any;

// Helper function
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const PrintableDeliveryNoteView: React.FC<{ order: Order }> = ({ order }) => {
    const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0);

    return (
        <div className="printable-area p-4 bg-white text-black text-xs font-sans">
             <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
            {/* Header */}
            <header className="grid grid-cols-7 items-center pb-2 border-b-2 border-black gap-4">
                {/* Column 1: Company Info */}
                <div className="col-span-2">
                    <h1 className="font-bold text-base uppercase">CÔNG TY TNHH DANA DESIGN</h1>
                    <p className="font-semibold text-[10px]">XƯỞNG MAY 2K PLUS - ĐỒNG PHỤC ĐÀ NẴNG</p>
                    <p className="text-[10px]">Địa chỉ: 34 Bình An 7 - Hoà Cường - Tp. Đà Nẵng</p>
                    <p className="text-[10px]">Hotline: (zalo) 0934 845 456 - 0905 984 026</p>
                    <p className="text-[10px]">Website: dongphucdn.com</p>
                    <p className="text-[10px]">Email: dongphucdanang238@gmail.com</p>
                </div>
                
                {/* Column 2: Title */}
                <div className="col-span-3 text-center">
                    <h2 className="font-bold text-xl uppercase text-red-600">BIÊN BẢN GIAO HÀNG</h2>
                    <p>Mã ĐH: <span className="font-semibold">{order.orderNumber}</span></p>
                    <p>Ngày Giao: <span className="font-semibold">{formatDate(new Date().toISOString())}</span></p>
                </div>
                
                {/* Column 3: Logo */}
                <div className="col-span-2 flex justify-end items-center h-full">
                    <img src="https://i.ibb.co/TqdvppkP/LOGO-2-TH-NG-HI-U.png" alt="Company Logo" className="max-w-full max-h-20 object-contain" />
                </div>
            </header>

            {/* Customer Info */}
            <section className="py-2 border-b border-black">
                <h3 className="font-bold uppercase mb-1">Thông tin khách hàng</h3>
                <p>Tên Khách Hàng: <span className="font-semibold">{order.customerName}</span></p>
                <p>Số Điện Thoại: <span className="font-semibold">{order.contactNumber}</span></p>
                <p>Tên đơn hàng: <span className="font-semibold">{order.orderName}</span></p>
            </section>

            {/* Products Table */}
            <section className="py-2">
                <h3 className="font-bold uppercase mb-1">Chi tiết sản phẩm</h3>
                <table className="w-full border-collapse border border-black">
                    <thead className="bg-gray-200 font-bold">
                        <tr>
                            {[
                                'STT', 'Loại sản phẩm', 'Form', 'Size', 'Số lượng', 'Đơn vị tính'
                            ].map(h => <th key={h} className="border border-black p-1">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {order.products.map((p, i) => (
                            <tr key={p.id}>
                                <td className="border border-black p-1 text-center">{i + 1}</td>
                                <td className="border border-black p-1">{p.productName}</td>
                                <td className="border border-black p-1 text-center">{p.form}</td>
                                <td className="border border-black p-1 text-center">{p.size}</td>
                                <td className="border border-black p-1 text-center font-semibold">{p.quantity.toLocaleString('vi-VN')}</td>
                                <td className="border border-black p-1 text-center">{p.ddovt}</td>
                            </tr>
                        ))}
                    </tbody>
                     <tfoot className="font-bold">
                        <tr>
                            <td colSpan={4} className="border border-black p-1 text-right">Tổng số sản phẩm được giao:</td>
                            <td className="border border-black p-1 text-center">{totalQuantity.toLocaleString('vi-VN')}</td>
                            <td className="border border-black p-1 text-center"></td>
                        </tr>
                    </tfoot>
                </table>
            </section>
            
            {/* Footer Signatures */}
            <footer className="flex justify-around pt-16">
                <div className="text-center">
                    <p className="font-bold">Người nhận</p>
                    <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
                    <div className="h-20"></div>
                </div>
                <div className="text-center">
                    <p className="font-bold">Người giao hàng</p>
                    <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
                    <div className="h-20"></div>
                </div>
                 <div className="text-center">
                    <p className="font-bold">KCS</p>
                    <p className="italic text-xs">(Ký và ghi rõ họ tên)</p>
                    <div className="h-20"></div>
                </div>
            </footer>
        </div>
    );
};


interface PrintDeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const PrintDeliveryNoteModal: React.FC<PrintDeliveryNoteModalProps> = ({ isOpen, onClose, orders }) => {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const recentOrders = useMemo(() => {
    return orders
      .filter(o => !o.isPlaceholder)
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 2);
  }, [orders]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
          setStep('input');
          setOrderNumberInput('');
          setOrderToPrint(null);
          setErrorMessage('');
      }, 300); // Delay to allow for closing animation
    }
  }, [isOpen]);

  const handleFindOrder = () => {
    const foundOrder = orders.find(o => o.orderNumber.toLowerCase() === orderNumberInput.toLowerCase().trim());
    if (foundOrder) {
      setOrderToPrint(foundOrder);
      setStep('preview');
      setErrorMessage('');
    } else {
      setErrorMessage('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.');
    }
  };

  const handleSelectRecentOrder = (order: Order) => {
    setOrderToPrint(order);
    setStep('preview');
    setErrorMessage('');
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPdf = () => {
    if (!orderToPrint) return;

    const element = document.getElementById(`printable-delivery-note-${orderToPrint.id}`);
    const opt = {
      margin: 1, // 1cm margin for all sides
      filename: `GiaoHang_DH_${orderToPrint.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().from(element).set(opt).save();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${step === 'input' ? 'w-full max-w-lg' : 'w-full max-w-6xl'}`}>
        
        {step === 'input' && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">In Biên Bản Giao Hàng</h2>
            <p className="text-gray-600 mb-6">Chọn một đơn hàng gần đây hoặc nhập Mã Đơn Hàng để tìm và in biên bản.</p>

            {recentOrders.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">2 đơn hàng gần nhất:</p>
                <div className="space-y-2">
                  {recentOrders.map(order => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => handleSelectRecentOrder(order)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-cyan-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      <div className="flex justify-between items-center">
                          <div>
                              <p className="font-semibold text-cyan-800">{order.orderNumber} - {order.orderName}</p>
                              <p className="text-xs text-gray-500">Khách hàng: {order.customerName} - Ngày: {formatDate(order.orderDate)}</p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm font-medium text-gray-500">Nếu không có trong danh sách</span>
                    </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleFindOrder(); }}>
              <div>
                <label htmlFor="orderNumberInputDelivery" className="block text-sm font-medium text-gray-700">Nhập Mã Đơn Hàng</label>
                <input
                  type="text"
                  id="orderNumberInputDelivery"
                  value={orderNumberInput}
                  onChange={e => setOrderNumberInput(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>
              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">Tìm & Xem trước</button>
              </div>
            </form>
          </div>
        )}

        {step === 'preview' && orderToPrint && (
          <div>
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center no-print">
                <h2 className="text-lg font-bold">Xem trước biên bản giao hàng cho: {orderToPrint.orderNumber}</h2>
                <div className="flex gap-3">
                    <button onClick={() => setStep('input')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Quay lại</button>
                    <button onClick={handleSaveAsPdf} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Lưu PDF</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">In</button>
                    <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Đóng</button>
                </div>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
                 <div id={`printable-delivery-note-${orderToPrint.id}`}>
                    <PrintableDeliveryNoteView order={orderToPrint} />
                 </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintDeliveryNoteModal;
