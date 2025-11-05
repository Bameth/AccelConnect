export interface UserWalletStats {
  userId: number;
  username: string;
  email: string;
  balance: number;
  totalDeposited: number;
  totalSpent: number;
  totalOrders: number;
  status: string;
}

export interface DepositRequest {
  userId: number;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: number;
  walletId: number;
  orderId?: number;
  orderReference?: string;
  type: 'CREDIT' | 'DEBIT' | 'REFUND';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdByUsername?: string;
  createdAt: string;
}
