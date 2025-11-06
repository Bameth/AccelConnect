export interface UserBalanceDTO {
  userId: number;
  username: string;
  totalDeposited: number;
  totalSpent: number;
  balance: number;
  hasDebt: boolean;
  debtAmount: number;
  refundableAmount: number;
  message: string;
}

export interface DepositRequest {
  userId: number;
  amount: number;
}

export interface UserBalanceStatsDTO {
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
}