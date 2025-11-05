import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminWalletService } from '../../services/impl/adminWallet.service';
import { DepositRequest, UserWalletStats } from '../../model/adminWallet.model';

@Component({
  selector: 'app-admin-wallet-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './admin-wallet-management-component.html',
  styleUrl: './admin-wallet-management-component.css',
})
export class AdminWalletManagementComponent implements OnInit {
  private readonly adminWalletService = inject(AdminWalletService);

  users = signal<UserWalletStats[]>([]);
  filteredUsers = signal<UserWalletStats[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');

  selectedUser = signal<UserWalletStats | null>(null);
  depositAmount = signal<number | null>(null);
  depositDescription = signal('');
  isDepositing = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Charge tous les utilisateurs avec leurs statistiques
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.adminWalletService.getAllUserStats().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.isLoading.set(false);
        console.log('👥 Utilisateurs chargés:', users);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Recherche d'utilisateurs
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
   * Sélectionne un utilisateur pour dépôt
   */
  selectUser(user: UserWalletStats): void {
    this.selectedUser.set(user);
    this.depositAmount.set(null);
    this.depositDescription.set(`Dépôt pour ${user.username}`);
  }

  /**
   * Ferme le modal de dépôt
   */
  closeDepositModal(): void {
    this.selectedUser.set(null);
    this.depositAmount.set(null);
    this.depositDescription.set('');
  }

  /**
   * Effectue un dépôt
   */
  makeDeposit(): void {
    const user = this.selectedUser();
    const amount = this.depositAmount();

    if (!user || !amount || amount <= 0) {
      alert('Veuillez entrer un montant valide');
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
      next: (transaction) => {
        console.log('✅ Dépôt effectué:', transaction);
        alert(`Dépôt de ${amount} FCFA effectué avec succès !`);
        this.isDepositing.set(false);
        this.closeDepositModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('❌ Erreur lors du dépôt:', error);
        alert(error.error || 'Erreur lors du dépôt');
        this.isDepositing.set(false);
      },
    });
  }

  /**
   * Formate un montant
   */
  formatAmount(amount: number): string {
    return this.adminWalletService.formatAmount(amount);
  }

  /**
   * Obtient la couleur du statut
   */
  getStatusColor(status: string): string {
    return this.adminWalletService.getStatusColor(status);
  }

  /**
   * Trie les utilisateurs par solde
   */
  sortByBalance(ascending: boolean = true): void {
    const sorted = [...this.filteredUsers()].sort((a, b) =>
      ascending ? a.balance - b.balance : b.balance - a.balance
    );
    this.filteredUsers.set(sorted);
  }

  /**
   * Trie les utilisateurs par nom
   */
  sortByName(ascending: boolean = true): void {
    const sorted = [...this.filteredUsers()].sort((a, b) =>
      ascending ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)
    );
    this.filteredUsers.set(sorted);
  }

  /**
   * Filtre par statut
   */
  filterByStatus(status: string): void {
    if (status === 'all') {
      this.filteredUsers.set(this.users());
    } else {
      const filtered = this.users().filter((user) => user.status === status);
      this.filteredUsers.set(filtered);
    }
  }
}
