import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientSignupComponent } from './client-signup/client-signup.component';
import { PollutionFormComponent } from './pollution-form/pollution-form.component';
import { PollutionRecapComponent } from './pollution-recap/pollution-recap.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ClientSignupComponent, 
    PollutionFormComponent, 
    PollutionRecapComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Front';
  
  // Onglet actif : Exercice 02 sélectionné par défaut
  activeTab = signal<'ex02' | 'tp02'>('ex02');

  // État du TP02 (Suivi de pollution)
  isSubmitted = false;
  formData: any = null;

  selectTab(tab: 'ex02' | 'tp02'): void {
    this.activeTab.set(tab);
  }

  onFormSubmit(data: any): void {
    this.formData = data;
    this.isSubmitted = true;
  }
}
