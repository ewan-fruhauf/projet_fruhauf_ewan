import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css'
})
export class SignupFormComponent {
  user = {
    login: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: ''
  };

  isSubmitted: boolean = false;

  onSubmit(): void {
    if (this.user.password === this.user.confirmPassword) {
      this.isSubmitted = true;
    }
  }

  onReset(): void {
    this.isSubmitted = false;
    this.user = {
      login: '',
      password: '',
      confirmPassword: '',
      nom: '',
      prenom: '',
      email: ''
    };
  }
}