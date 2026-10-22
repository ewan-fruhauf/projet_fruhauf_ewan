import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PollutionService } from '../services/pollution.service';
import { Pollution, PollutionType, PollutionGravite, PollutionStatut } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pollution-form.component.html',
  styleUrls: ['./pollution-form.component.css']
})
export class PollutionFormComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private pollutionService = inject(PollutionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pollutionForm: FormGroup;
  isEditMode = signal<boolean>(false);
  editId = signal<number | string | null>(null);
  isLoading = signal<boolean>(false);
  isFetchingInitial = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  readonly pollutionTypes: PollutionType[] = [
    'Plastique',
    'Chimique',
    'Dépôt sauvage',
    'Eau',
    'Air',
    'Autre'
  ];

  readonly graviteLevels: PollutionGravite[] = ['Faible', 'Moyenne', 'Critique'];
  readonly statusOptions: PollutionStatut[] = ['En attente', 'En cours', 'Traité'];

  constructor() {
    this.pollutionForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      gravite: ['Moyenne', Validators.required],
      statut: ['En attente', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      lieu: ['', Validators.required],
      dateObservation: [new Date().toISOString().split('T')[0], Validators.required],
      latitude: ['', [Validators.required, Validators.pattern(/^-?([1-8]?[0-9](\.\d+)?|90(\.0+)?)$/)]],
      longitude: ['', [Validators.required, Validators.pattern(/^-?((1[0-7][0-9]|[1-9]?[0-9])(\.\d+)?|180(\.0+)?)$/)]],
      photoUrl: [''],
      auteur: ['']
    });
  }

  ngOnInit(): void {
    // Vérifie si un utilisateur est stocké en session pour pré-remplir l'auteur
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const name = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.login;
        if (name) {
          this.pollutionForm.patchValue({ auteur: name });
        }
      } catch {
        // Ignorer si non présent
      }
    }

    // Détection du mode Édition via le paramètre d'URL :id
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.editId.set(idParam);
      this.loadExistingData(idParam);
    }
  }

  /**
   * Charge les données existantes pour pré-remplir le formulaire en mode édition
   */
  loadExistingData(id: string | number): void {
    this.isFetchingInitial.set(true);
    this.errorMessage.set(null);

    this.pollutionService.getPollutionById(id).subscribe({
      next: (pollution) => {
        this.pollutionForm.patchValue({
          titre: pollution.titre,
          type: pollution.type,
          gravite: pollution.gravite || 'Moyenne',
          statut: pollution.statut || 'En attente',
          description: pollution.description,
          lieu: pollution.lieu,
          dateObservation: pollution.dateObservation,
          latitude: pollution.latitude,
          longitude: pollution.longitude,
          photoUrl: pollution.photoUrl || '',
          auteur: pollution.auteur || ''
        });
        this.isFetchingInitial.set(false);
      },
      error: (err) => {
        this.isFetchingInitial.set(false);
        this.errorMessage.set(
          err?.error?.message || `Impossible de charger les données du signalement #${id}.`
        );
      }
    });
  }

  /**
   * Soumission du formulaire (Création ou Mise à jour)
   */
  onSubmit(): void {
    if (this.pollutionForm.invalid) {
      this.pollutionForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValues = this.pollutionForm.value;
    const payload: Partial<Pollution> = {
      titre: formValues.titre.trim(),
      type: formValues.type,
      gravite: formValues.gravite,
      statut: formValues.statut,
      description: formValues.description.trim(),
      lieu: formValues.lieu.trim(),
      dateObservation: formValues.dateObservation,
      latitude: parseFloat(formValues.latitude),
      longitude: parseFloat(formValues.longitude),
      photoUrl: formValues.photoUrl ? formValues.photoUrl.trim() : undefined,
      auteur: formValues.auteur ? formValues.auteur.trim() : 'Agent Anonyme'
    };

    if (this.isEditMode()) {
      // --- MODE MODIFICATION (PUT) ---
      const id = this.editId()!;
      this.pollutionService.updatePollution(id, payload).subscribe({
        next: (updated) => {
          this.isLoading.set(false);
          this.successMessage.set(`Signalement #${id} mis à jour avec succès !`);
          this.formSubmit.emit(updated);
          setTimeout(() => {
            this.router.navigate(['/pollutions', id]);
          }, 1000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(`Erreur de mise à jour : ${err?.error?.message || 'Erreur réseau'}`);
        }
      });
    } else {
      // --- MODE CRÉATION (POST) ---
      this.pollutionService.createPollution(payload).subscribe({
        next: (created) => {
          this.isLoading.set(false);
          this.successMessage.set('Signalement enregistré avec succès dans l\'API mockée !');
          this.formSubmit.emit(created);
          setTimeout(() => {
            this.router.navigate(['/pollutions']);
          }, 1000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(`Erreur d'enregistrement : ${err?.error?.message || 'Erreur réseau'}`);
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/pollutions', this.editId()]);
    } else {
      this.router.navigate(['/pollutions']);
    }
  }
}
