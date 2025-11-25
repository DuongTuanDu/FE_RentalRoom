export interface InvoiceItem {
  _id: string;
  tenantId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
      phoneNumber: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
    address: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contractId: string;
  periodMonth: number;
  periodYear: number;
  invoiceNumber: string;
  totalAmount: number;
  issuedAt: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface IGenerateMonthlyInvoiceRequest {
  roomId: string;
  periodMonth: number;
  periodYear: number;
  includeRent: boolean;
}

export interface IGenerateInvoiceRequest {
  tenantId: string;
  roomId: string;
  contractId: string;
  periodMonth: number;
  periodYear: number;
  invoiceNumber: string;
  dueDate: string;
  items: {
    type: "rent" | "electric" | "water" | "service" | "other";
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    utilityReadingId: string;
  }[];
}

export interface IPayInvoiceRequest {
  paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
  paidAt: string;
  note: string;
}

export interface InvoiceResponse {
  items: InvoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Tenant {
  _id: string;
  email: string;
  userInfo: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    address: {
      _id: string;
      address: string;
      provinceName: string;
      districtName: string;
      wardName: string;
    }[];
  };
}

export interface InvoiceDetailResponse {
  _id: string;
  landlordId: string;
  tenantId: Tenant;
  buildingId: {
    _id: string;
    name: string;
    address: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contractId: {
    _id: string;
    contract: {
      no: string;
      startDate: string;
      endDate: string;
    };
  };
  periodMonth: number;
  periodYear: number;
  invoiceNumber: string;
  items: {
    type: "rent" | "electric" | "water" | "service" | "other";
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  discountAmount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod: string | null;
  emailStatus: "pending" | "sent" | "failed";
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  reminders: {
    channel: "email" | "sms" | "in_app";
    sentAt: string;
    status: "sent" | "failed";
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  emailLastError: string;
  emailSentAt: string;
  sentAt: string;
}

export interface ITenantPayInvoiceRequest {
  paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
  note: string;
}

export interface InvoiceItem {
  _id: string;
  buildingId: {
    _id: string;
    name: string;
    address: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contractId: string;
  periodMonth: number;
  periodYear: number;
  invoiceNumber: string;
  totalAmount: number;
  issuedAt: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface ITenantInvoiceResponse {
  items: InvoiceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITenantInvoiceDetailResponse {
  _id: string;
  landlordId: string;
  tenantId: string;
  buildingId: {
    _id: string;
    name: string;
    address: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contractId: {
    _id: string;
    contract: {
      no: string;
      startDate: string;
      endDate: string;
    };
  };
  periodMonth: number;
  periodYear: number;
  invoiceNumber: string;
  items: {
    type: "rent" | "electric" | "water" | "service" | "other";
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  discountAmount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
  emailStatus: "pending" | "sent" | "failed";
  createdBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  reminders: {
    channel: "email" | "sms" | "in_app";
    sentAt: string;
    status: "sent" | "failed";
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  emailLastError: string | null;
  emailSentAt: string | null;
  sentAt: string | null;
  paidAt: string | null;
  paymentNote?: string;
}

export interface IRoomCompletedContract {
  contractId: string;
  contractStatus: "completed";
  contract: {
    no: string;
    startDate: string;
    endDate: string;
    price: number;
  };
  room: {
    _id: string;
    roomNumber: string;
    status: "available" | "rented" | "maintenance";
    floorId: string;
  };
  building: {
    _id: string;
    name: string;
    address: string;
  };
  tenant: {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
  };
}

export interface IRoomCompletedContractResponse {
  message: string;
  data: IRoomCompletedContract[];
}