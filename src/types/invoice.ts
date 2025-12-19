export interface InvoiceItem {
  _id: string;
  landlordId: string;
  tenantId: {
    _id: string;
    email: string;
    userInfo: {
      _id: string;
      fullName: string;
    };
  };
  buildingId: {
    _id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  contractId: string;
  invoiceKind: "periodic" | "deposit";
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
    meta?: {
      previousIndex: number;
      currentIndex: number;
    };
  }[];
  subtotal: number;
  discountAmount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  currency: "VND" | string;
  issuedAt: string;
  dueDate: string;
  status:
    | "draft"
    | "sent"
    | "paid"
    | "transfer_pending"
    | "overdue"
    | "cancelled"
    | "replaced";
  paymentMethod: "cash" | "online_gateway" | null;
  emailStatus: "pending" | "sent" | "failed" | null;
  isDeleted: boolean;
  reminders: {
    channel: "email" | "sms" | "in_app";
    sentAt: string;
    status: "sent" | "failed";
    note: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  note: string;
}

export interface IGenerateMonthlyInvoiceRequest {
  buildingId: string;
  periodMonth: number;
  periodYear: number;
  includeRent: boolean;
  extraItems: {
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface IGenerateInvoiceRequest {
  roomId: string;
  periodMonth: number;
  periodYear: number;
  dueDate: string;
  includeRent: boolean;
  extraItems: {
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface IUpdateInvoiceRequest {
  items?: {
    type: "rent" | "electric" | "water" | "service" | "other";
    label: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    meta?: {
      previousIndex: number;
      currentIndex: number;
    };
  }[];
  note?: string;
  discountAmount?: number;
  lateFee?: number;
  status?:
    | "draft"
    | "sent"
    | "paid"
    | "transfer_pending"
    | "overdue"
    | "cancelled"
    | "replaced";
}

export interface ISendDraftInvoiceRequest {
  buildingId: string;
  periodMonth: number;
  periodYear: number;
}

export interface IPayInvoiceRequest {
  paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
  paidAt: string;
  note: string;
}

export interface InvoiceResponse {
  data: InvoiceItem[];
  total: number;
  page: number;
  limit: number;
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
  data: {
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
    invoiceKind: "periodic" | "deposit";
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
      meta?: {
        previousIndex: number;
        currentIndex: number;
      };
    }[];
    subtotal: number;
    discountAmount: number;
    lateFee: number;
    totalAmount: number;
    paidAmount: number;
    currency: "VND" | string;
    issuedAt: string;
    dueDate: string;
    status:
      | "draft"
      | "sent"
      | "paid"
      | "transfer_pending"
      | "overdue"
      | "cancelled"
      | "replaced";
    paymentMethod: "cash" | "online_gateway" | null;
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
    emailSentAt?: string;
    paymentNote?: string;
    transferProofImageUrl?: string;
    transferRequestedAt?: string;
    note: string;
    replacedAt?: string;
    replacedByInvoiceId?: string;
    replacementOfInvoiceId?: string;
    history: {
      action: string;
      itemsDiff: {
        updated: {
          type: string;
          key: string;
          label: string;
          changes: {
            [key: string]: {
              before: number | string;
              after: number | string;
            };
          };
        }[];
        added: {
          type: string;
          label: string;
          description?: string;
          quantity?: number;
          unitPrice?: number;
          amount?: number;
        }[];
        removed: {
          type: string;
          label: string;
          description?: string;
          quantity?: number;
          unitPrice?: number;
          amount?: number;
        }[];
      };
      metaDiff?: {
        [key: string]: {
          before: string | number | null;
          after: string | number | null;
        };
      };
      updatedBy: {
        _id: string;
        email: string;
      };
      updatedAt: string;
      _id: string;
    }[];
  };
}

export interface ITenantPayInvoiceRequest {
  paymentMethod: "cash" | "bank_transfer" | "online_gateway" | null;
  note: string;
}

export interface IRequestTransferConfirmation {
  proofImageUrl: string;
  amount: number;
  note: string;
}

export interface ITenantInvoiceItem {
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
  status:
    | "draft"
    | "sent"
    | "paid"
    | "transfer_pending"
    | "overdue"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface ITenantInvoiceResponse {
  items: ITenantInvoiceItem[];
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
  status:
    | "draft"
    | "sent"
    | "paid"
    | "transfer_pending"
    | "overdue"
    | "cancelled";
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
  paidAt: string | null;
  transferProofImageUrl?: string;
  transferRequestedAt?: string;
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

export interface IInvoicePaymentInfoResponse {
  message: string;
  invoiceId: string;
  invoiceNumber: string;
  periodMonth: number;
  periodYear: number;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrImageUrl: string;
  };
  transferNote: string;
}

export interface InvoiceHistoryResponse {
  invoiceId: string;
  history: {
    action: string;
    itemsDiff: {
      updated: {
        type: string;
        key: string;
        label: string;
        changes: {
          [key: string]: {
            before: number | string;
            after: number | string;
          };
        };
      }[];
      added: {
        type: string;
        label: string;
        description?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
      }[];
      removed: {
        type: string;
        label: string;
        description?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
      }[];
    };
    metaDiff?: {
      [key: string]: {
        before: string | number | null;
        after: string | number | null;
      };
    };
    updatedBy: {
      _id: string;
      email: string;
    };
    updatedAt: string;
    _id: string;
  }[];
}

export interface CreateInvoiceReplaceRequest {
  items: {
    type: "rent" | "electric" | "water" | "service" | "other";
    label: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    utilityReadingId?: string;
    meta?: {
      previousIndex: number;
      currentIndex: number;
    };
  }[];
  note?: string;
  discountAmount: number;
  lateFee: number;
  dueDate: string;
}
