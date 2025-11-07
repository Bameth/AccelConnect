import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminWalletService, UserWalletStats } from '../../services/impl/adminWallet.service';
import { NotificationService } from '../../../../core/services/impl/notification.service';
import { DepositRequest, UpdateBalanceRequest } from '../../model/adminWallet.model';

@Component({
  selector: 'app-admin-wallet-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './admin-wallet-management-component.html',
  styleUrl: './admin-wallet-management-component.css',
})
export class AdminWalletManagementComponent implements OnInit {
  private readonly adminWalletService = inject(AdminWalletService);
  private readonly notificationService = inject(NotificationService);
  protected readonly Math = Math;

  users = signal<UserWalletStats[]>([]);
  filteredUsers = signal<UserWalletStats[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  selectedUser = signal<UserWalletStats | null>(null);
  depositAmount = signal<number | null>(null);
  depositDescription = signal('');
  isDepositing = signal(false);

  // Pour la mise à jour de solde
  isUpdatingBalance = signal(false);
  updateBalanceAmount = signal<number | null>(null);
  updateBalanceReason = signal('');

  // Statistiques globales
  globalStats = signal({
    totalUsers: 0,
    totalDebt: 0,
    totalRefundable: 0,
    totalDeposited: 0,
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * 📊 Charge tous les utilisateurs avec leurs statistiques
   */
  loadUsers(): void {
    this.isLoading.set(true);

    this.adminWalletService.getAllUserStats().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.calculateGlobalStats(users);
        this.isLoading.set(false);
        console.log('👥 Utilisateurs chargés:', users.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.isLoading.set(false);

        // Notification d'erreur plus précise
        const errorMessage = error.error?.message || error.message || 'Erreur de chargement';
        this.notificationService.error(
          'Erreur',
          `Impossible de charger les utilisateurs: ${errorMessage}`
        );
      },
    });
  }

  /**
   * 📈 Calcule les statistiques globales
   */
  private calculateGlobalStats(users: UserWalletStats[]): void {
    const stats = users.reduce(
      (acc, user) => ({
        totalUsers: acc.totalUsers + 1,
        totalDebt: acc.totalDebt + (user.hasDebt ? user.debtAmount : 0),
        totalRefundable: acc.totalRefundable + user.refundableAmount,
        totalDeposited: acc.totalDeposited + user.totalDeposited,
      }),
      { totalUsers: 0, totalDebt: 0, totalRefundable: 0, totalDeposited: 0 }
    );

    this.globalStats.set(stats);
  }

  /**
   * 🔍 Recherche d'utilisateurs
   */
  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
  }

  /**
   * 👤 Sélectionne un utilisateur pour dépôt
   */
  selectUser(user: UserWalletStats): void {
    this.selectedUser.set(user);
    this.depositAmount.set(null);
    this.depositDescription.set(`Dépôt pour ${user.username}`);
    this.updateBalanceReason.set(`Remboursement pour ${user.username}`);
    this.updateBalanceAmount.set(null);
  }

  /**
   * ❌ Ferme le modal
   */
  closeDepositModal(): void {
    this.selectedUser.set(null);
    this.depositAmount.set(null);
    this.depositDescription.set('');
    this.updateBalanceAmount.set(null);
    this.updateBalanceReason.set('');
  }

  /**
   * 💵 Effectue un dépôt
   */
  makeDeposit(): void {
    const user = this.selectedUser();
    const amount = this.depositAmount();

    if (!user || !amount || amount <= 0) {
      this.notificationService.warning('Attention', 'Veuillez entrer un montant valide');
      return;
    }

    if (!confirm(`Confirmer le dépôt de ${amount} FCFA pour ${user.username} ?`)) {
      return;
    }

    this.isDepositing.set(true);

    const request: DepositRequest = {
      userId: user.userId,
      amount: amount,
      description: this.depositDescription() || `Dépôt pour ${user.username}`,
    };

    this.adminWalletService.depositToUser(request).subscribe({
      next: (response) => {
        console.log('✅ Dépôt effectué:', response);
        this.notificationService.success(
          'Dépôt réussi',
          `${amount} FCFA déposé pour ${user.username}`
        );
        this.isDepositing.set(false);
        this.closeDepositModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('❌ Erreur lors du dépôt:', error);
        const errorMessage = error.error?.message || 'Erreur lors du dépôt';
        this.notificationService.error('Échec du dépôt', errorMessage);
        this.isDepositing.set(false);
      },
    });
  }

  /**
   * 🔄 Met à jour le solde (remboursement effectif)
   */
  updateBalance(): void {
    const user = this.selectedUser();
    const newBalance = this.updateBalanceAmount();

    if (!user || newBalance === null) {
      this.notificationService.warning('Attention', 'Veuillez entrer le nouveau solde');
      return;
    }

    if (!this.updateBalanceReason().trim()) {
      this.notificationService.warning('Attention', 'Veuillez indiquer la raison');
      return;
    }

    if (
      !confirm(
        `Confirmer la mise à jour du solde de ${user.username}\n` +
          `De ${user.balance} FCFA → ${newBalance} FCFA\n` +
          `Raison: ${this.updateBalanceReason()}`
      )
    ) {
      return;
    }

    this.isUpdatingBalance.set(true);

    const request: UpdateBalanceRequest = {
      userId: user.userId,
      newBalance: newBalance,
      reason: this.updateBalanceReason(),
    };

    this.adminWalletService.updateBalance(request).subscribe({
      next: (response) => {
        console.log('✅ Solde mis à jour:', response);
        this.notificationService.success(
          'Solde mis à jour',
          `Solde de ${user.username} ajusté à ${newBalance} FCFA`
        );
        this.isUpdatingBalance.set(false);
        this.closeDepositModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        const errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
        this.notificationService.error('Échec de la mise à jour', errorMessage);
        this.isUpdatingBalance.set(false);
      },
    });
  }

  /**
   * 💱 Formate un montant
   */
  formatAmount(amount: number): string {
    return this.adminWalletService.formatAmount(amount);
  }

  /**
   * 🎨 Obtient la couleur du statut
   */
  getStatusColor(status: string): string {
    return this.adminWalletService.getStatusColor(status);
  }

  /**
   * 📊 Trie les utilisateurs par solde
   */
  sortByBalance(ascending: boolean = true): void {
    const sorted = [...this.filteredUsers()].sort((a, b) =>
      ascending ? a.balance - b.balance : b.balance - a.balance
    );
    this.filteredUsers.set(sorted);
  }

  /**
   * 🔤 Trie les utilisateurs par nom
   */
  sortByName(ascending: boolean = true): void {
    const sorted = [...this.filteredUsers()].sort((a, b) =>
      ascending ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)
    );
    this.filteredUsers.set(sorted);
  }

  /**
   * 🏷️ Filtre par statut
   */
  filterByStatus(status: string): void {
    if (status === 'all') {
      this.filteredUsers.set(this.users());
    } else if (status === 'debt') {
      this.filteredUsers.set(this.users().filter((u) => u.hasDebt));
    } else if (status === 'refundable') {
      this.filteredUsers.set(this.users().filter((u) => u.refundableAmount > 0));
    } else if (status === 'settled') {
      this.filteredUsers.set(this.users().filter((u) => !u.hasDebt && u.refundableAmount === 0));
    }
  }
}
