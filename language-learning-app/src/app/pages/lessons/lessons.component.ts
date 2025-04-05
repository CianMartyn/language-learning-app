import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class LessonsComponent implements OnInit {
  lessonContent: string = '';
  lessonTitle: string = '';
  lessonLanguage: string = '';
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('LessonsComponent initialized');
    this.loadLesson();
  }

  loadLesson() {
    try {
      console.log('Loading lesson from localStorage');
      const savedLesson = localStorage.getItem('currentLesson');
      console.log('Saved lesson:', savedLesson);
      
      if (savedLesson) {
        const lessonData = JSON.parse(savedLesson);
        console.log('Parsed lesson data:', lessonData);
        
        if (lessonData.lesson) {
          this.lessonContent = lessonData.lesson;
          console.log('Lesson content loaded, length:', this.lessonContent.length);
        } else {
          this.lessonContent = 'No lesson content available.';
          console.log('No lesson content in data');
        }
        
        // Extract title and language if available
        if (lessonData.language) {
          this.lessonLanguage = lessonData.language;
        }
        
        if (lessonData.topic) {
          this.lessonTitle = lessonData.topic;
        }
      } else {
        console.log('No lesson found in localStorage');
        this.lessonContent = 'No lesson found. Please generate a lesson first.';
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      this.lessonContent = 'Error loading lesson. Please try again.';
    }
  }

  goBack() {
    console.log('Going back');
    // Navigate back to the previous page
    this.router.navigate(['/units'], { replaceUrl: true });
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}