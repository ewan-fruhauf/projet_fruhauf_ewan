import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PollutionService } from '../services/pollution.service';
import { Pollution, PollutionFilter, PollutionType } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css']
})
export class PollutionListComponent implements OnInit {
  private pollutionService = inject(PollutionService);
  private router = inject(Router);

  // État des données avec Signals Angular modernes
  pollutions = signal<Pollution[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  deletingId = signal<number | string | null>(null);
  feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtres multi-critères
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedGravite = signal<string>('');
  selectedSort = signal<'recent' | 'ancien' | 'gravite'>('recent');

  // Types disponibles pour le filtrage
  readonly availableTypes: PollutionType[] = [
    'Plastique',
    'Chimique',
    'Dépôt sauvage',
    'Eau',
    'Air',
    'Autre'
  ];

  readonly graviteLevels = ['Critique', 'Moyenne', 'Faible'];

  // Signal calculé pour la liste filtrée multi-critères
  filteredPollutions = computed(() => {
    let list = this.pollutions();
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const gravite = this.selectedGravite();
    const sort = this.selectedSort();

    // 1. Filtrage par mot-clé (titre, lieu ou description)
    if (search) {
      list = list.filter(p =>
        p.titre.toLowerCase().includes(search) ||
        p.lieu.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    // 2. Filtrage par type
    if (type) {
      list = list.filter(p => p.type === type);
    }

    // 3. Filtrage par gravité
    if (gravite) {
      list = list.filter(p => p.gravite === gravite);
    }

    // 4. Tri
    return [...list].sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.dateObservation).getTime() - new Date(a.dateObservation).getTime();
      } else if (sort === 'ancien') {
        return new Date(a.dateObservation).getTime() - new Date(b.dateObservation).getTime();
      } else if (sort === 'gravite') {
        const weight: Record<string, number> = { Critique: 3, Moyenne: 2, Faible: 1 };
        return (weight[b.gravite || 'Moyenne'] || 0) - (weight[a.gravite || 'Moyenne'] || 0);
      }
      return 0;
    });
  });

  ngOnInit(): void {
    this.loadPollutions();
  }

  /**
   * Charge la liste des pollutions via le service HTTP
   */
  loadPollutions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService.getPollutions().subscribe({
      next: (data) => {
        this.pollutions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement pollutions', err);
        this.errorMessage.set('Impossible de charger la liste des pollutions. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Réinitialise tous les filtres de recherche
   */
  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.selectedGravite.set('');
    this.selectedSort.set('recent');
  }

  /**
   * Supprime une pollution après confirmation
   */
  onDelete(pollution: Pollution, event: Event): void {
    event.stopPropagation(); // Évite la navigation vers le détail

    const confirmation = confirm(`Voulez-vous vraiment supprimer le signalement « ${pollution.titre} » ?`);
    if (!confirmation) {
      return;
    }

    this.deletingId.set(pollution.id);
    this.pollutionService.deletePollution(pollution.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        // Mise à jour de la liste locale
        this.pollutions.update(list => list.filter(p => p.id !== pollution.id));
        this.showFeedback(`Signalement #${pollution.id} supprimé avec succès.`, 'success');
      },
      error: (err) => {
        this.deletingId.set(null);
        this.showFeedback(`Erreur lors de la suppression : ${err?.error?.message || 'Erreur réseau'}`, 'error');
      }
    });
  }

  /**
   * Navigation vers la page de modification
   */
  onEdit(id: number | string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/pollutions', id, 'edit']);
  }

  /**
   * Navigation vers la page de détail
   */
  goToDetail(id: number | string): void {
    this.router.navigate(['/pollutions', id]);
  }

  private showFeedback(text: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 4000);
  }
}
