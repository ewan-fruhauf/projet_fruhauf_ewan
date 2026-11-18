import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PollutionService } from '../services/pollution.service';
import { UserService } from '../services/user.service';
import { Pollution, PollutionType, PollutionGravite, PollutionStatut } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './pollution-form.component.html',
  styleUrls: ['./pollution-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollutionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pollutionService = inject(PollutionService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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

  pollutionForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    type: ['', Validators.required],
    gravite: ['Moyenne', Validators.required],
    statut: ['En attente', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    lieu: ['', Validators.required],
    dateObservation: [new Date().toISOString().split('T')[0], Validators.required],
    latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
    photoUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    auteur: ['']
  });

  ngOnInit(): void {
    // Pré-remplit le nom de l'auteur avec l'utilisateur connecté via UserService
    const user = this.userService.currentUser();
    if (user) {
      const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || user.login;
      this.pollutionForm.patchValue({ auteur: fullName });
    }

    // Vérifie si l'URL contient un ID : si oui, on passe en mode modification
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.editId.set(idParam);
      this.loadExistingData(idParam);
    }
  }

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
        this.errorMessage.set(err?.error?.message || `Impossible de charger le signalement #${id}.`);
      }
    });
  }

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
      const id = this.editId()!;
      this.pollutionService.updatePollution(id, payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(`Signalement #${id} mis à jour avec succès !`);
          setTimeout(() => this.router.navigate(['/pollutions', id]), 900);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(`Erreur de mise à jour : ${err?.error?.message || 'Erreur réseau'}`);
        }
      });
    } else {
      this.pollutionService.createPollution(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Signalement enregistré avec succès !');
          setTimeout(() => this.router.navigate(['/pollutions']), 900);
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
