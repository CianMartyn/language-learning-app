import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule]
})
export class AccountComponent implements OnInit {
  username: string = localStorage.getItem('username') || '';
  emailNotifications: boolean = true;
  darkMode: boolean = false;
  soundEffects: boolean = true;
  profilePicture: string = localStorage.getItem('profilePicture') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
  
  // Mock data
  lessonsCompleted: number = 12;
  languagesLearned: number = 2;
  streakDays: number = 5;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Load saved settings from localStorage
    this.loadSettings();
    // Subscribe to theme changes
    this.themeService.getDarkMode().subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.emailNotifications = settings.emailNotifications;
      this.soundEffects = settings.soundEffects;
    }
  }

  saveSettings() {
    const settings = {
      emailNotifications: this.emailNotifications,
      soundEffects: this.soundEffects
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }

  onDarkModeChange(event: any) {
    this.themeService.setDarkMode(event.detail.checked);
  }

  async changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.profilePicture = event.target.result;
          localStorage.setItem('profilePicture', this.profilePicture);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }

  logout() {
    this.router.navigate(['/login']);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteAccount() {
    console.log('Account deletion requested');
    this.logout();
  }
} 