import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  readonly apiUrl = environment.apiUrl;

  // Lecture directe du signal de l'utilisateur connecté depuis UserService
  readonly currentUser = this.userService.currentUser;

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/signup']);
  }
}
