import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class HomePage {

  selectedLanguage: string = '';
  customTopic: string = '';
  showCustomLessonForm: boolean = false;
  toastController: any;
  isLoading: boolean = false;
  
  constructor(private router: Router, private http: HttpClient, private toastCtrl: ToastController) {}

  goToChat() {
    this.router.navigate(['/chat']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLessons() {
    this.router.navigate(['/lessons']);
  }

  goToUnits() {
    this.router.navigate(['/units']);
  }

  showCustomLesson() {
    this.showCustomLessonForm = true;
  }

  async generateCustomLesson() {
    if (!this.selectedLanguage || !this.customTopic) {
      const toast = await this.toastCtrl.create({
        message: 'Please select a language and enter a topic',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;
    console.log('Starting lesson generation...');
    
    try {
      console.log('Sending request with:', { language: this.selectedLanguage, topic: this.customTopic });
      const response = await firstValueFrom(
        this.http.post('http://localhost:5000/generate-lesson', {
          language: this.selectedLanguage,
          topic: this.customTopic
        })
      );

      console.log('Received response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      // Store the lesson data in localStorage
      console.log('Storing lesson in localStorage:', response);
      localStorage.setItem('currentLesson', JSON.stringify(response));
      
      // Close the custom lesson form and reset loading state
      this.showCustomLessonForm = false;
      this.selectedLanguage = '';
      this.customTopic = '';
      this.isLoading = false;
      
      // Navigate to the lessons page
      this.router.navigate(['/lessons'], { replaceUrl: true });
    } catch (error) {
      console.error('Error generating lesson:', error);
      await this.showError('Failed to generate lesson. Please try again.');
      this.isLoading = false;
    }
  }

  async showError(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
}
