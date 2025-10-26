export enum OrderStatus {
  Pending = "Cần làm",
  Urgent = "Gấp",
  InProgress = "Đang làm",
  Completed = "Đã xong",
  Delivered = "Đã giao",
}

export interface ProductDetail {
  id: string;
  productName: string;
  form: string;
  size: string;
  quantity: number;
  ddovt: string;
  fabricColor: string;
  fabricCode: string;
  ribColor: string;
  ribThread: string;
  printType: string;
  unitPrice: number; // Đơn giá chưa in
  printCost: number; // Chi phí in/thêu
  totalPrice: number; // Tổng giá SP (unitPrice + printCost)
  lineTotal: number; // Thành tiền (totalPrice * quantity)
  notes: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderName: string;
  orderDate: string;
  customerName: string;
  contactNumber: string;
  products: ProductDetail[];
  totalOrderValue: number;
  vat: number;
  finalAmount: number;
  discount: number;
  deposit: number;
  payment: number;
  remainingDebt: number;
  executionDays: number;
  expectedCompletionDate: string;
  actualCompletionDate: string;
  status: OrderStatus;
  notes: string;
  collaborator?: string;
  discountApplied: boolean;
  demoImage?: string;
  isPlaceholder?: boolean;
}

export interface CustomerInfo {
  customerCode: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  membershipPoints: number;
}