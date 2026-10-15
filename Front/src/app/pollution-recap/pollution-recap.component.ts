import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pollution-recap.component.html',
  styleUrls: ['./pollution-recap.component.css']
})
export class PollutionRecapComponent {
  @Input() data: any;

  reload() {
    window.location.reload();
  }
}
