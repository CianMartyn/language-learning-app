import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
      const toast = await this.toastController.create({
        message: 'Please select a language and enter a topic',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }


    try {
      const response = await this.http.post('http://localhost:5000/generate-lesson', {
        language: this.selectedLanguage,
        topic: this.customTopic
      }).toPromise();

      if (response) {
        localStorage.setItem('currentLesson', JSON.stringify(response));
        this.router.navigate(['/lesson']);
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
      const toast = await this.toastController.create({
        message: 'Failed to generate lesson. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
