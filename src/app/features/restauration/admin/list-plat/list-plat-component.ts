import { Component, inject, OnInit, signal } from '@angular/core';
import { PlatService } from '../../services/impl/plat.service';
import { Meal } from '../../model/plat.model';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../../core/services/impl/notification.service';
import { ConfirmationService } from '../../../../core/services/impl/ConfirmationDialog.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-plat-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './list-plat-component.html',
  styleUrl: './list-plat-component.css',
})
export class ListPlatComponent implements OnInit {
  private readonly platService = inject(PlatService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);

  plats = signal<Meal[]>([]);
  totalPlats = signal<number>(0);
  isEditModalOpen = signal(false);
  selectedPlat = signal<Meal | null>(null);
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadPlats();
  }

  loadPlats(): void {
    this.platService.getPlats().subscribe({
      next: (data) => {
        this.plats.set(data);
        this.totalPlats.set(data.length);
      },
      error: (error) => {
        console.error(error);
        this.notificationService.error('Erreur de chargement', 'Impossible de charger les plats');
      },
    });
  }

  openEditModal(plat: Meal): void {
    this.selectedPlat.set({ ...plat });
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedPlat.set(null);
    this.isSubmitting.set(false);
  }

  updatePlat(event: Event): void {
    event.preventDefault();
    const plat = this.selectedPlat();

    if (!plat || !plat.id) return;

    // Validation
    if (!plat.mealName?.trim()) {
      this.notificationService.warning('Champ requis', 'Le nom du plat est obligatoire');
      return;
    }

    if (!plat.unitPrice || plat.unitPrice <= 0) {
      this.notificationService.warning('Prix invalide', 'Le prix doit être supérieur à 0');
      return;
    }

    this.isSubmitting.set(true);

    this.platService.updatePlat(plat.id, plat).subscribe({
      next: (updated) => {
        const currentPlats = this.plats();
        const index = currentPlats.findIndex((p) => p.id === updated.id);

        if (index !== -1) {
          currentPlats[index] = updated;
          this.plats.set([...currentPlats]);
        }

        this.notificationService.success(
          'Plat modifié',
          `${updated.mealName} a été mis à jour avec succès`
        );
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Erreur mise à jour:', error);
        this.isSubmitting.set(false);
        this.notificationService.error('Erreur de modification', 'Impossible de modifier le plat');
      },
    });
  }

  deletePlat(plat: Meal): void {
    this.confirmationService.confirmDelete(
      'Supprimer ce plat ?',
      `Êtes-vous sûr de vouloir supprimer "${plat.mealName}" ? Cette action est irréversible.`,
      () => {
        if (!plat.id) return;

        this.platService.deletePlat(plat.id).subscribe({
          next: () => {
            const currentPlats = this.plats().filter((p) => p.id !== plat.id);
            this.plats.set(currentPlats);
            this.totalPlats.set(currentPlats.length);

            this.notificationService.success(
              'Plat supprimé',
              `${plat.mealName} a été supprimé avec succès`
            );
          },
          error: (error) => {
            console.error('Erreur suppression:', error);
            this.notificationService.error(
              'Erreur de suppression',
              'Impossible de supprimer le plat'
            );
          },
        });
      }
    );
  }

  updateField(field: keyof Meal, value: any): void {
    const plat = this.selectedPlat();
    if (plat) {
      this.selectedPlat.set({ ...plat, [field]: value });
    }
  }
}
