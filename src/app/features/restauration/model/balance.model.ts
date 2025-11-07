// DTO pour le dépôt
export interface DepositRequest {
  userId: number;
  amount: number;
  description?: string;
}

// DTO pour la mise à jour du solde
export interface UpdateBalanceRequest {
  userId: number;
  newBalance: number;
  reason: string;
}

// DTO pour les statistiques utilisateur
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

// DTO pour le solde utilisateur
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