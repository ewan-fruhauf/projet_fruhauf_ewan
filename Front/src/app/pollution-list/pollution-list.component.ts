import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PollutionService } from '../services/pollution.service';
import { Pollution, PollutionType } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollutionListComponent implements OnInit {
  private pollutionService = inject(PollutionService);
  private router = inject(Router);

  // État des données avec Signals Angular
  pollutions = signal<Pollution[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  deletingId = signal<number | string | null>(null);
  feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filtres de recherche
  searchTerm = signal<string>('');
  selectedType = signal<string>('');
  selectedGravite = signal<string>('');
  selectedSort = signal<'recent' | 'ancien' | 'gravite'>('recent');

  readonly availableTypes: PollutionType[] = [
    'Plastique',
    'Chimique',
    'Dépôt sauvage',
    'Eau',
    'Air',
    'Autre'
  ];

  readonly graviteLevels = ['Critique', 'Moyenne', 'Faible'];

  // Liste filtrée et triée recalculée automatiquement quand un filtre change
  filteredPollutions = computed(() => {
    let list = this.pollutions();
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const gravite = this.selectedGravite();
    const sort = this.selectedSort();

    if (search) {
      list = list.filter(p =>
        p.titre.toLowerCase().includes(search) ||
        p.lieu.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    if (type) {
      list = list.filter(p => p.type === type);
    }

    if (gravite) {
      list = list.filter(p => p.gravite === gravite);
    }

    return [...list].sort((a, b) => {
      if (sort === 'recent') {
        return new Date(b.dateObservation).getTime() - new Date(a.dateObservation).getTime();
      }
      if (sort === 'ancien') {
        return new Date(a.dateObservation).getTime() - new Date(b.dateObservation).getTime();
      }
      if (sort === 'gravite') {
        const weight: Record<string, number> = { Critique: 3, Moyenne: 2, Faible: 1 };
        return (weight[b.gravite || 'Moyenne'] || 0) - (weight[a.gravite || 'Moyenne'] || 0);
      }
      return 0;
    });
  });

  ngOnInit(): void {
    this.loadPollutions();
  }

  loadPollutions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService.getPollutions().subscribe({
      next: (data) => {
        this.pollutions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger la liste des pollutions.');
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.selectedGravite.set('');
    this.selectedSort.set('recent');
  }

  onDelete(pollution: Pollution, event: Event): void {
    event.stopPropagation();

    if (!confirm(`Voulez-vous vraiment supprimer le signalement « ${pollution.titre} » ?`)) {
      return;
    }

    this.deletingId.set(pollution.id);
    this.pollutionService.deletePollution(pollution.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pollutions.update(list => list.filter(p => p.id !== pollution.id));
        this.showFeedback(`Signalement #${pollution.id} supprimé avec succès.`, 'success');
      },
      error: (err) => {
        this.deletingId.set(null);
        this.showFeedback(`Erreur lors de la suppression : ${err?.error?.message || 'Erreur réseau'}`, 'error');
      }
    });
  }

  onEdit(id: number | string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/pollutions', id, 'edit']);
  }

  goToDetail(id: number | string): void {
    this.router.navigate(['/pollutions', id]);
  }

  private showFeedback(text: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => this.feedbackMessage.set(null), 4000);
  }
}
