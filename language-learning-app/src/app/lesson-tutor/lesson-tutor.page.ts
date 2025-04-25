import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
  avatar?: string;
}

interface UnitLesson {
  title: string;
  content: string;
}

@Component({
  selector: 'app-lesson-tutor',
  templateUrl: './lesson-tutor.page.html',
  styleUrls: ['./lesson-tutor.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LessonTutorPage implements OnInit {
  @ViewChild(IonContent) private content!: IonContent;
  
  messages: Message[] = [];
  newMessage: string = '';
  language: string = '';
  topic: string = '';
  unitLessons: UnitLesson[] = [];
  scenarioPrompt: string = '';
  isLoading: boolean = false;
  private apiUrl = 'http://localhost:5000';
  tutorAvatar: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    try {
      console.log('LessonTutorPage initializing...');
      
      // Get lesson data from localStorage
      const tutorDataString = localStorage.getItem('tutorLessonData');
      console.log('Raw tutor data from localStorage:', tutorDataString);
      
      if (!tutorDataString) {
        throw new Error('No lesson data found in localStorage');
      }

      const lessonData = JSON.parse(tutorDataString);
      console.log('Parsed lesson data:', {
        language: lessonData.language,
        topic: lessonData.topic,
        hasUnitLessons: !!lessonData.unitLessons,
        scenarioPrompt: !!lessonData.scenarioPrompt
      });
      
      this.language = lessonData.language;
      this.topic = lessonData.topic;
      this.unitLessons = lessonData.unitLessons || [];
      this.scenarioPrompt = lessonData.scenarioPrompt || '';
      this.tutorAvatar = lessonData.tutorAvatar || '';

      if (!this.language || !this.topic || !this.unitLessons.length) {
        console.error('Missing required lesson data:', {
          hasLanguage: !!this.language,
          hasTopic: !!this.topic,
          lessonsCount: this.unitLessons.length
        });
        throw new Error('Missing required lesson data');
      }

      console.log('Lesson data loaded successfully');

      // Add initial welcome message
      const welcomeMessage = `Bonjour! Welcome to your ${this.language} practice session. What would you like to practice today?`;

      this.messages.push({
        role: 'ai',
        content: welcomeMessage,
        time: new Date().toLocaleTimeString(),
        avatar: this.tutorAvatar
      });
    } catch (error) {
      console.error('Error initializing tutor:', error);
      this.showToast('Error loading lesson data. Please try generating the lesson again.', 'danger');
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: this.newMessage.trim(),
      time: new Date().toLocaleTimeString()
    };

    // Add user message to chat
    this.messages.push(userMessage);
    const messageToSend = this.newMessage.trim();
    this.newMessage = '';
    this.scrollToBottom();

    this.isLoading = true;

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      const response = await this.http.post<{ response: string }>(
        `${this.apiUrl}/lesson-tutor`,
        {
          language: this.language,
          topic: this.topic,
          message: messageToSend,
          unitLessons: this.unitLessons,
          scenarioPrompt: this.scenarioPrompt
        },
        { headers }
      ).toPromise();

      if (response) {
        // Add AI response to chat
        this.messages.push({
          role: 'ai',
          content: response.response,
          time: new Date().toLocaleTimeString()
        });
      }

      this.scrollToBottom();
    } catch (error) {
      console.error('Error getting tutor response:', error);
      await this.showToast('Failed to get tutor response', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 100);
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
} 