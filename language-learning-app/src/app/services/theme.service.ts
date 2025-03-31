import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);

  constructor(@Inject(DOCUMENT) private document: Document) {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      this.setDarkMode(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }

    // Listen for changes in system dark mode preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('darkMode')) {
        this.setDarkMode(e.matches);
      }
    });
  }

  getDarkMode() {
    return this.darkMode.asObservable();
  }

  setDarkMode(enabled: boolean) {
    this.darkMode.next(enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
    
    if (enabled) {
      this.document.documentElement.classList.add('dark');
      this.document.body.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
      this.document.body.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    const currentValue = this.darkMode.value;
    this.setDarkMode(!currentValue);
  }
} 