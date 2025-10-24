import { Component, inject } from '@angular/core';
import { TabService } from '../../services/tab.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {
  tabService = inject(TabService);
  
  scrollToFeatures() {
    const featuresSection = document.querySelector('app-features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setTab(tab: string) {
    // cast to any since Hero is small and knows tab names
    (this.tabService as any).setTab(tab);
  }
}
