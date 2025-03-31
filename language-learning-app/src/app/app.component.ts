import { Component, OnInit } from '@angular/core';
import { IonApp, IonContent, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonApp],
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {
    addIcons(allIcons);
  }

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.getDarkMode().subscribe(isDark => {
      document.body.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark-theme', isDark);
    });
  }
}