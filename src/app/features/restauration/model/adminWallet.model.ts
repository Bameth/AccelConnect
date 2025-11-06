export interface UserWalletStats {
  userId: number;
  username: string;
  email: string;
  totalDeposited: number;
  totalSpent: number;
  balance: number;
  orderCount: number;
  status: string;
  hasDebt: boolean;
  debtAmount: number;
  refundableAmount: number;
  totalOrders: number;
}

export interface DepositRequest {
  userId: number;
  amount: number;
  description?: string;
}

export interface DepositResponse {
  userId: number;
  amount: number;
  newBalance: number;
  timestamp: string;
}