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

  selectedLanguage = 'Spanish';
  topic = 'Greetings';
  generatedLesson: string = '';
  loading = false;
  
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

  async generateLesson() {
    if (!this.selectedLanguage || !this.topic) {
      const toast = await this.toastCtrl.create({
        message: 'Please select a language and topic',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    this.loading = true;

    this.http.post<{ lesson: string }>('http://localhost:5000/generate-lesson', {
      language: this.selectedLanguage,
      topic: this.topic
    }).subscribe({
      next: (res) => {
        this.generatedLesson = res.lesson;
        this.loading = false;
      },
      error: async (err) => {
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: 'Failed to generate lesson',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
