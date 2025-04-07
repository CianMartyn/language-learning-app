import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

interface Unit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  completed: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface LessonProgress {
  completed: boolean;
}

interface UnitProgress {
  completed: boolean;
  progress: number;
  lessons: { [key: string]: LessonProgress };
}

interface Progress {
  units: { [key: string]: UnitProgress };
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UnitsComponent implements OnInit {
  units: Unit[] = [
    {
      id: 'basics',
      title: 'Basics',
      description: 'Learn the fundamentals',
      icon: 'school-outline',
      color: 'primary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'basics-1', title: 'Alphabet & Pronunciation', description: 'Learn the alphabet and basic pronunciation', completed: false },
        { id: 'basics-2', title: 'Numbers 1-10', description: 'Count from one to ten', completed: false },
        { id: 'basics-3', title: 'Basic Phrases', description: 'Essential everyday expressions', completed: false }
      ]
    },
    {
      id: 'greetings',
      title: 'Greetings',
      description: 'Say hello and goodbye',
      icon: 'hand-left-outline',
      color: 'secondary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'greetings-1', title: 'Hello & Goodbye', description: 'Basic greetings', completed: false },
        { id: 'greetings-2', title: 'Introductions', description: 'Introduce yourself and others', completed: false },
        { id: 'greetings-3', title: 'Time of Day', description: 'Greetings for different times', completed: false }
      ]
    },
    {
      id: 'food',
      title: 'Food & Drinks',
      description: 'Order at restaurants',
      icon: 'restaurant-outline',
      color: 'tertiary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'food-1', title: 'Basic Foods', description: 'Common food vocabulary', completed: false },
        { id: 'food-2', title: 'Ordering', description: 'How to order at restaurants', completed: false },
        { id: 'food-3', title: 'Preferences', description: 'Express food preferences', completed: false }
      ]
    },
    {
      id: 'travel',
      title: 'Travel',
      description: 'Navigate your journey',
      icon: 'airplane-outline',
      color: 'success',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'travel-1', title: 'Directions', description: 'Ask for and give directions', completed: false },
        { id: 'travel-2', title: 'Transportation', description: 'Vocabulary for getting around', completed: false },
        { id: 'travel-3', title: 'Booking', description: 'Book tickets and accommodations', completed: false }
      ]
    },
    {
      id: 'numbers',
      title: 'Numbers',
      description: 'Count and tell time',
      icon: 'calculator-outline',
      color: 'warning',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'numbers-1', title: 'Numbers 11-100', description: 'Count to one hundred', completed: false },
        { id: 'numbers-2', title: 'Time', description: 'Tell time and dates', completed: false },
        { id: 'numbers-3', title: 'Money', description: 'Handle currency and prices', completed: false }
      ]
    },
    {
      id: 'family',
      title: 'Family',
      description: 'Talk about your loved ones',
      icon: 'people-outline',
      color: 'danger',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'family-1', title: 'Family Members', description: 'Vocabulary for family relationships', completed: false },
        { id: 'family-2', title: 'Possessives', description: 'Express ownership and relationships', completed: false },
        { id: 'family-3', title: 'Family Activities', description: 'Talk about family activities', completed: false }
      ]
    }
  ];

  isLoading: boolean = false;
  selectedLanguage: string = 'French';
  showLessonDetails: boolean = false;
  selectedUnit: Unit | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'French';
    
    const savedProgress = localStorage.getItem('unitsProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        this.updateUnitsProgress(progress);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }

  onLanguageChange() {
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
  }

  getUnitColor(unit: Unit): string {
    return `var(--ion-color-${unit.color})`;
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

  selectUnit(unit: Unit) {
    this.selectedUnit = unit;
    this.showLessonDetails = true;
  }

  closeLessonDetails() {
    this.showLessonDetails = false;
    this.selectedUnit = null;
  }

  async startLesson(unit: Unit, lesson: Lesson) {
    this.isLoading = true;
    
    try {
      console.log('Starting lesson generation for:', {
        language: this.selectedLanguage,
        topic: lesson.title
      });

      const response = await firstValueFrom(
        this.http.post('http://localhost:5000/generate-lesson', {
          language: this.selectedLanguage,
          topic: lesson.title
        })
      );

      console.log('Received response:', response);

      if (!response) {
        throw new Error('No response received from server');
      }

      localStorage.setItem('currentLesson', JSON.stringify(response));
      
      lesson.completed = true;
      this.updateUnitProgress(unit);
      this.saveProgress();
      
      // Close the modal and reset state before navigation
      this.showLessonDetails = false;
      this.selectedUnit = null;
      
      // Set loading to false and wait a moment before navigating
      this.isLoading = false;
      
      // Use setTimeout to ensure the loading indicator is closed before navigation
      setTimeout(() => {
        this.router.navigate(['/lessons'], { replaceUrl: true });
      }, 500);
    } catch (error) {
      console.error('Error generating lesson:', error);
      await this.showError('Failed to generate lesson. Please try again.');
      this.isLoading = false;
    }
  }

  updateUnitProgress(unit: Unit) {
    const completedLessons = unit.lessons.filter(lesson => lesson.completed).length;
    unit.progress = (completedLessons / unit.lessons.length) * 100;
    unit.completed = unit.progress === 100;
  }

  updateUnitsProgress(progress: any) {
    if (!progress || !progress.units) return;
    
    for (const unitId in progress.units) {
      const unit = this.units.find(u => u.id === unitId);
      if (unit) {
        const unitProgress = progress.units[unitId];
        unit.completed = unitProgress.completed || false;
        unit.progress = unitProgress.progress || 0;
        
        if (unitProgress.lessons) {
          for (const lessonId in unitProgress.lessons) {
            const lesson = unit.lessons.find(l => l.id === lessonId);
            if (lesson) {
              lesson.completed = unitProgress.lessons[lessonId].completed || false;
            }
          }
        }
      }
    }
  }

  saveProgress() {
    const progress: Progress = {
      units: {}
    };
    
    this.units.forEach(unit => {
      progress.units[unit.id] = {
        completed: unit.completed,
        progress: unit.progress,
        lessons: {}
      };
      
      unit.lessons.forEach(lesson => {
        progress.units[unit.id].lessons[lesson.id] = {
          completed: lesson.completed
        };
      });
    });
    
    localStorage.setItem('unitsProgress', JSON.stringify(progress));
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}