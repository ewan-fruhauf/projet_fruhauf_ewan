import { Component } from '@angular/core';
import { SignupFormComponent } from './signup-form/signup-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SignupFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}