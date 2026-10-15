import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutionFormComponent } from './pollution-form/pollution-form.component';
import { PollutionRecapComponent } from './pollution-recap/pollution-recap.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PollutionFormComponent, PollutionRecapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Front';
  isSubmitted = false;
  formData: any = null;

  onFormSubmit(data: any) {
    this.formData = data;
    this.isSubmitted = true;
  }
}
