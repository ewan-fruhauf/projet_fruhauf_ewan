import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PollutionService } from '../services/pollution.service';
import { Pollution } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pollution-detail.component.html',
  styleUrls: ['./pollution-detail.component.css']
})
export class PollutionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollutionService = inject(PollutionService);

  pollution = signal<Pollution | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage.set('Identifiant de pollution manquant.');
      this.isLoading.set(false);
      return;
    }

    this.loadDetail(idParam);
  }

  loadDetail(id: string | number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService.getPollutionById(id).subscribe({
      next: (data) => {
        this.pollution.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement détail', err);
        this.errorMessage.set(
          err?.error?.message || `Impossible de trouver le signalement #${id}.`
        );
        this.isLoading.set(false);
      }
    });
  }

  onDelete(): void {
    const p = this.pollution();
    if (!p) return;

    const confirmDelete = confirm(`Voulez-vous vraiment supprimer définitivement « ${p.titre} » ?`);
    if (!confirmDelete) return;

    this.isDeleting.set(true);
    this.pollutionService.deletePollution(p.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.router.navigate(['/pollutions']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        alert(`Erreur lors de la suppression : ${err?.error?.message || 'Erreur réseau'}`);
      }
    });
  }

  getMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
