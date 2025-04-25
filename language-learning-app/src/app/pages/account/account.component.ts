import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { HttpClient } from '@angular/common/http';

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
  bio: string = '';
  country: string = '';
  
  // Mock data
  lessonsCompleted: number = 12;
  languagesLearned: number = 2;
  streakDays: number = 5;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private themeService: ThemeService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Load saved settings from localStorage
    this.loadSettings();
    // Subscribe to theme changes
    this.themeService.getDarkMode().subscribe(isDark => {
      this.darkMode = isDark;
    });
    // Load user profile
    this.loadUserProfile();
  }

  loadUserProfile() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      this.http.get(`http://localhost:5000/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe(
        (response: any) => {
          this.bio = response.bio || '';
          this.country = response.country || '';
        },
        (error) => {
          console.error('Error loading user profile:', error);
        }
      );
    }
  }

  async saveProfile() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      try {
        const response = await this.http.put(`http://localhost:5000/users/${username}`, {
          bio: this.bio,
          country: this.country
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).toPromise();

        const alert = await this.alertController.create({
          header: 'Success',
          message: 'Profile updated successfully',
          buttons: ['OK']
        });
        await alert.present();
      } catch (error) {
        console.error('Error updating profile:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Failed to update profile. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
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
    this.darkMode = event.detail.checked;
    this.toggleDarkMode(this.darkMode);
    localStorage.setItem('darkMode', this.darkMode.toString());
  }

  toggleDarkMode(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  async changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'Image size should be less than 5MB',
              buttons: ['OK']
            });
            await alert.present();
            return;
          }

          // Create a canvas to resize and compress the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();

          img.onload = async () => {
            // Set canvas dimensions (max 200x200 while maintaining aspect ratio)
            const maxSize = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress the image
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedImage = canvas.toDataURL('image/jpeg', 0.7);

            // Send the compressed image to the backend
            const token = localStorage.getItem('token');
            if (token) {
              try {
                const response = await this.http.put('http://localhost:5000/users/avatar', {
                  avatar: compressedImage
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }).toPromise();

                // Update the profile picture in local storage and UI
                localStorage.setItem('profilePicture', compressedImage);
                this.profilePicture = compressedImage;

                const alert = await this.alertController.create({
                  header: 'Success',
                  message: 'Profile picture updated successfully',
                  buttons: ['OK']
                });
                await alert.present();
              } catch (error) {
                console.error('Error updating profile picture:', error);
                const alert = await this.alertController.create({
                  header: 'Error',
                  message: 'Failed to update profile picture',
                  buttons: ['OK']
                });
                await alert.present();
              }
            }
          };

          img.src = URL.createObjectURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Failed to process image',
            buttons: ['OK']
          });
          await alert.present();
        }
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

  async deleteAccount() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      try {
        await this.http.delete(`http://localhost:5000/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).toPromise();

        // Clear local storage and redirect to login
        localStorage.clear();
        this.logout();
      } catch (error) {
        console.error('Error deleting account:', error);
        const errorAlert = await this.alertController.create({
          header: 'Error',
          message: 'Failed to delete account',
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    }
  }
}  