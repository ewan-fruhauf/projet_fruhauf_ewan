import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { User, UserSignUp } from '../models/user.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  readonly apiUrl = environment.apiUrl;

  // Signaux d'état
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  currentUser = signal<User | null>(null);

  // Formulaire d'ajout rapide
  showAddForm = signal<boolean>(false);
  userForm: FormGroup = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    password: ['Password123!', [Validators.required, Validators.minLength(6)]],
    role: ['Agent de terrain', Validators.required]
  });

  ngOnInit(): void {
    // Écoute de l'utilisateur courant
    this.userService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors du chargement des utilisateurs depuis l\'API REST.');
      }
    });
  }

  onSelectUser(user: User): void {
    this.userService.setCurrentUser(user);
    this.successMessage.set(`Session active passée sur "${user.prenom} ${user.nom}" (${user.login})`);
    setTimeout(() => this.successMessage.set(null), 3500);
  }

  onDeleteUser(user: User): void {
    if (!user.id) return;

    const confirmMsg = `Confirmez-vous la suppression de l'utilisateur "${user.prenom} ${user.nom}" (${user.login}) ?`;
    if (!confirm(confirmMsg)) return;

    this.isLoading.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage.set(`L'utilisateur #${user.id} (${user.login}) a été supprimé.`);
        setTimeout(() => this.successMessage.set(null), 3500);
        // Si l'utilisateur connecté est celui supprimé, on déconnecte
        if (this.currentUser()?.id === user.id) {
          this.userService.logout();
        }
        this.loadUsers();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la suppression de l\'utilisateur.');
      }
    });
  }

  onSubmitNewUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const values = this.userForm.value;
    const newUser: UserSignUp = {
      login: values.login.trim(),
      email: values.email.trim(),
      nom: values.nom.trim(),
      prenom: values.prenom.trim(),
      password: values.password,
      role: values.role
    };

    this.userService.createUser(newUser).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(`Utilisateur "${newUser.login}" créé avec succès !`);
        setTimeout(() => this.successMessage.set(null), 3500);
        this.userForm.reset({
          password: 'Password123!',
          role: 'Agent de terrain'
        });
        this.showAddForm.set(false);
        this.loadUsers();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la création de l\'utilisateur.');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
  }

  getInitials(user: User): string {
    const p = user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U';
    const n = user.nom ? user.nom.charAt(0).toUpperCase() : '';
    return `${p}${n}`;
  }
}
