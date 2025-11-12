import api from './api';
import type { RequisitionWithQuotations } from './quotation.service';

// ============================================
// INTERFACES
// ============================================

export interface PurchaseOrder {
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  requisitionId: number;
  supplierId: number;
  issueDate: string;
  subtotal: number;
  totalIva: number;
  totalDiscount: number;
  totalAmount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    supplierId: number;
    name: string;
    nitCc: string;
  };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  poItemId: number;
  purchaseOrderId: number;
  requisitionItemId: number;
  quotationId: number;
  quantity: number;
  unitPrice: number;
  hasIva: boolean;
  ivaPercentage: number;
  subtotal: number;
  ivaAmount: number;
  discount: number;
  totalAmount: number;
}

export interface ItemPriceDto {
  itemId: number;
  quotationId?: number;
  unitPrice: number;
  hasIva: boolean;
  discount?: number;
}

export interface AssignPricesDto {
  items: ItemPriceDto[];
}

export interface CreatePurchaseOrdersDto {
  issueDate: string;
  items: {
    itemId: number;
    supplierId: number;
    unitPrice: number;
    hasIva: boolean;
    discount?: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// API METHODS
// ============================================

/**
 * Get requisitions ready for purchase orders (estado: cotizada)
 * These requisitions have completed quotations and can have prices assigned
 */
export const getRequisitionsForPurchaseOrders = async (filters?: {
  page?: number;
  limit?: number;
  projectId?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<PaginatedResponse<any>> => {
  const response = await api.get('/purchases/requisitions/for-quotation', {
    params: { ...filters, status: 'cotizada' },
  });
  return response.data;
};

/**
 * Get requisition details with quotations and prices
 */
export const getRequisitionWithPrices = async (
  requisitionId: number
): Promise<RequisitionWithQuotations> => {
  const response = await api.get<RequisitionWithQuotations>(
    `/purchases/requisitions/${requisitionId}/quotation`
  );
  return response.data;
};

/**
 * Assign prices to quotations
 * This saves unit prices, IVA flags, and discounts for each item
 * Must be done before creating purchase orders
 */
export const assignPrices = async (
  requisitionId: number,
  data: AssignPricesDto
): Promise<RequisitionWithQuotations> => {
  const response = await api.post<RequisitionWithQuotations>(
    `/purchases/requisitions/${requisitionId}/assign-prices`,
    data
  );
  return response.data;
};

/**
 * Create purchase orders from a requisition with assigned prices
 * Automatically groups items by supplier and generates one PO per supplier
 * Changes requisition status to 'pendiente_recepcion'
 */
export const createPurchaseOrders = async (
  requisitionId: number,
  data: CreatePurchaseOrdersDto
): Promise<PurchaseOrder[]> => {
  const response = await api.post<PurchaseOrder[]>(
    `/purchases/requisitions/${requisitionId}/purchase-orders`,
    data
  );
  return response.data;
};

/**
 * Get purchase orders for a requisition
 */
export const getPurchaseOrdersByRequisition = async (
  requisitionId: number
): Promise<PurchaseOrder[]> => {
  const response = await api.get<PurchaseOrder[]>(
    `/purchases/requisitions/${requisitionId}/purchase-orders`
  );
  return response.data;
};
