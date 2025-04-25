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
        { id: 'basics-3', title: 'Basic Phrases', description: 'Essential everyday expressions', completed: false },
        { id: 'basics-4', title: 'Common Verbs', description: 'Most frequently used verbs', completed: false },
        { id: 'basics-5', title: 'Simple Questions', description: 'How to ask basic questions', completed: false }
      ]
    },
    {
      id: 'greetings',
      title: 'Greetings & Social',
      description: 'Master social interactions',
      icon: 'hand-left-outline',
      color: 'secondary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'greetings-1', title: 'Hello & Goodbye', description: 'Basic greetings', completed: false },
        { id: 'greetings-2', title: 'Introductions', description: 'Introduce yourself and others', completed: false },
        { id: 'greetings-3', title: 'Time of Day', description: 'Greetings for different times', completed: false },
        { id: 'greetings-4', title: 'Small Talk', description: 'Weather, hobbies, and casual conversation', completed: false },
        { id: 'greetings-5', title: 'Social Etiquette', description: 'Cultural norms and politeness', completed: false }
      ]
    },
    {
      id: 'daily',
      title: 'Daily Life',
      description: 'Essential everyday activities',
      icon: 'sunny-outline',
      color: 'tertiary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'daily-1', title: 'Daily Routine', description: 'Describe your daily activities', completed: false },
        { id: 'daily-2', title: 'Time & Schedule', description: 'Talk about time and appointments', completed: false },
        { id: 'daily-3', title: 'Shopping', description: 'Shopping vocabulary and phrases', completed: false },
        { id: 'daily-4', title: 'At Home', description: 'Household items and activities', completed: false },
        { id: 'daily-5', title: 'Technology', description: 'Modern tech vocabulary', completed: false }
      ]
    },
    {
      id: 'food',
      title: 'Food & Dining',
      description: 'Master restaurant scenarios',
      icon: 'restaurant-outline',
      color: 'success',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'food-1', title: 'Basic Foods', description: 'Common food vocabulary', completed: false },
        { id: 'food-2', title: 'Ordering', description: 'How to order at restaurants', completed: false },
        { id: 'food-3', title: 'Preferences', description: 'Express food preferences', completed: false },
        { id: 'food-4', title: 'Cooking Terms', description: 'Kitchen and recipe vocabulary', completed: false },
        { id: 'food-5', title: 'Special Requests', description: 'Dietary needs and modifications', completed: false }
      ]
    },
    {
      id: 'travel',
      title: 'Travel & Transport',
      description: 'Navigate with confidence',
      icon: 'airplane-outline',
      color: 'warning',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'travel-1', title: 'Directions', description: 'Ask for and give directions', completed: false },
        { id: 'travel-2', title: 'Transportation', description: 'Vocabulary for getting around', completed: false },
        { id: 'travel-3', title: 'Accommodation', description: 'Book and check into hotels', completed: false },
        { id: 'travel-4', title: 'Emergency Phrases', description: 'Handle unexpected situations', completed: false },
        { id: 'travel-5', title: 'Sightseeing', description: 'Tourism and attractions', completed: false }
      ]
    },
    {
      id: 'work',
      title: 'Work & Business',
      description: 'Professional communication',
      icon: 'briefcase-outline',
      color: 'danger',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'work-1', title: 'Office Vocabulary', description: 'Common workplace terms', completed: false },
        { id: 'work-2', title: 'Email Writing', description: 'Professional correspondence', completed: false },
        { id: 'work-3', title: 'Phone Calls', description: 'Business phone etiquette', completed: false },
        { id: 'work-4', title: 'Meetings', description: 'Meeting vocabulary and phrases', completed: false },
        { id: 'work-5', title: 'Presentations', description: 'Present ideas clearly', completed: false }
      ]
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      description: 'Medical and wellness topics',
      icon: 'medical-outline',
      color: 'primary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'health-1', title: 'Body Parts', description: 'Human body vocabulary', completed: false },
        { id: 'health-2', title: 'At the Doctor', description: 'Medical appointments', completed: false },
        { id: 'health-3', title: 'Symptoms', description: 'Describe health issues', completed: false },
        { id: 'health-4', title: 'Pharmacy', description: 'Medicine and pharmacy terms', completed: false },
        { id: 'health-5', title: 'Emergencies', description: 'Emergency medical situations', completed: false }
      ]
    },
    {
      id: 'leisure',
      title: 'Hobbies & Leisure',
      description: 'Fun and entertainment',
      icon: 'game-controller-outline',
      color: 'secondary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'leisure-1', title: 'Sports', description: 'Sports and exercise vocabulary', completed: false },
        { id: 'leisure-2', title: 'Entertainment', description: 'Movies, music, and shows', completed: false },
        { id: 'leisure-3', title: 'Arts & Culture', description: 'Cultural activities', completed: false },
        { id: 'leisure-4', title: 'Outdoor Activities', description: 'Nature and adventure terms', completed: false },
        { id: 'leisure-5', title: 'Social Events', description: 'Parties and gatherings', completed: false }
      ]
    },
    {
      id: 'emotions',
      title: 'Emotions & Feelings',
      description: 'Express yourself clearly',
      icon: 'happy-outline',
      color: 'tertiary',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'emotions-1', title: 'Basic Emotions', description: 'Common feelings vocabulary', completed: false },
        { id: 'emotions-2', title: 'Personal States', description: 'Describe your mood', completed: false },
        { id: 'emotions-3', title: 'Relationships', description: 'Talk about relationships', completed: false },
        { id: 'emotions-4', title: 'Opinions', description: 'Express likes and dislikes', completed: false },
        { id: 'emotions-5', title: 'Empathy', description: 'Show understanding and support', completed: false }
      ]
    },
    {
      id: 'numbers',
      title: 'Numbers & Math',
      description: 'Master numerical concepts',
      icon: 'calculator-outline',
      color: 'success',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'numbers-1', title: 'Numbers 11-100', description: 'Count up to one hundred', completed: false },
        { id: 'numbers-2', title: 'Basic Math', description: 'Mathematical operations and terms', completed: false },
        { id: 'numbers-3', title: 'Money & Shopping', description: 'Prices, currency, and transactions', completed: false },
        { id: 'numbers-4', title: 'Dates & Time', description: 'Calendar, schedules, and appointments', completed: false },
        { id: 'numbers-5', title: 'Measurements', description: 'Units, sizes, and quantities', completed: false }
      ]
    },
    {
      id: 'nature',
      title: 'Weather & Nature',
      description: 'Explore the natural world',
      icon: 'leaf-outline',
      color: 'warning',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'nature-1', title: 'Weather Terms', description: 'Describe weather conditions', completed: false },
        { id: 'nature-2', title: 'Seasons', description: 'Seasonal changes and activities', completed: false },
        { id: 'nature-3', title: 'Flora & Fauna', description: 'Plants, animals, and wildlife', completed: false },
        { id: 'nature-4', title: 'Geography', description: 'Landscape and natural features', completed: false },
        { id: 'nature-5', title: 'Environment', description: 'Environmental terms and issues', completed: false }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Topics',
      description: 'Complex conversations',
      icon: 'ribbon-outline',
      color: 'danger',
      completed: false,
      progress: 0,
      lessons: [
        { id: 'advanced-1', title: 'Current Events', description: 'News and media vocabulary', completed: false },
        { id: 'advanced-2', title: 'Abstract Concepts', description: 'Philosophy and ideas', completed: false },
        { id: 'advanced-3', title: 'Idioms', description: 'Common expressions', completed: false },
        { id: 'advanced-4', title: 'Debate Skills', description: 'Argue and discuss topics', completed: false },
        { id: 'advanced-5', title: 'Cultural Insights', description: 'Deep cultural understanding', completed: false }
      ]
    }
  ];

  isLoading: boolean = false;
  selectedLanguage: string = 'French';
  showLessonDetails: boolean = false;
  selectedUnit: Unit | null = null;
  loadingMessage: string = 'Loading...';

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
    this.loadingMessage = 'Generating your lesson...';
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

      // Store complete lesson data including language and topic
      const lessonData = {
        ...response,
        language: this.selectedLanguage,
        topic: lesson.title
      };
      
      localStorage.setItem('currentLesson', JSON.stringify(lessonData));
      localStorage.setItem(`lesson-${lesson.id}`, JSON.stringify(lessonData));
      
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

  hasCompletedLessons(unit: Unit): boolean {
    return unit.lessons.some(lesson => lesson.completed);
  }

  async startUnitTutor(unit: Unit) {
    this.loadingMessage = 'Preparing unit tutor session...';
    this.isLoading = true;
    
    try {
      // Collect all completed lesson content for this unit
      const completedLessons = unit.lessons.filter(lesson => lesson.completed);
      const unitLessons = await Promise.all(
        completedLessons.map(async lesson => {
          const lessonData = JSON.parse(localStorage.getItem(`lesson-${lesson.id}`) || '{}');
          return {
            title: lesson.title,
            content: lessonData.lesson || ''
          };
        })
      );

      // Combine all lesson content
      const combinedLessonData = {
        language: this.selectedLanguage,
        topic: unit.title,
        unitLessons: unitLessons,
        scenarioPrompt: this.getUnitScenarioPrompt(unit.id)
      };

      // Store the data for the tutor
      localStorage.setItem('tutorLessonData', JSON.stringify(combinedLessonData));

      // Close the modal and navigate to tutor
      this.showLessonDetails = false;
      this.selectedUnit = null;
      this.isLoading = false;
      
      // Navigate to the tutor page
      this.router.navigate(['/lesson-tutor']);
    } catch (error) {
      console.error('Error preparing unit tutor session:', error);
      await this.showError('Failed to start unit tutor session. Please try again.');
      this.isLoading = false;
    }
  }

  getUnitScenarioPrompt(unitId: string): string {
    const scenarios: { [key: string]: string } = {
      basics: `You are a friendly language tutor helping a beginner practice basic concepts. Focus on pronunciation, simple vocabulary, and essential expressions. Encourage the student to combine different basic elements they've learned.`,
      
      greetings: `You are a local resident helping a tourist practice social interactions. Create natural situations where the student can practice different types of greetings, introductions, small talk, and cultural etiquette.`,
      
      daily: `You are a friendly local guiding someone through typical daily activities. Create scenarios involving daily routines, scheduling, shopping, home life, and using technology in everyday situations.`,
      
      food: `You are alternating between being a waiter, a chef, and a fellow diner. Create realistic restaurant scenarios where the student can practice ordering food, expressing preferences, discussing cooking, and handling dietary requirements.`,
      
      travel: `You are a helpful local guide assisting a traveler. Switch between being a ticket agent, hotel receptionist, tour guide, and passerby to help the student practice navigation, transportation, accommodation, and emergency situations.`,
      
      work: `You are a business professional helping a colleague adapt to a new workplace. Create scenarios involving office communication, email writing, phone calls, meetings, and presentations.`,
      
      health: `You are alternating between being a doctor, nurse, and pharmacist. Create scenarios where the student can practice describing symptoms, understanding medical instructions, and handling health emergencies.`,
      
      leisure: `You are a local friend helping someone explore entertainment options. Create scenarios involving sports, entertainment venues, cultural activities, outdoor adventures, and social gatherings.`,
      
      emotions: `You are a supportive friend helping someone express their feelings and opinions. Create scenarios where the student can practice discussing emotions, relationships, preferences, and showing empathy.`,
      
      numbers: `You are a helpful tutor helping someone learn about numbers and mathematical concepts. Create scenarios involving counting, calculations, and practical applications of numbers.`,
      
      nature: `You are a local guide helping someone learn about weather and natural environments. Create scenarios involving descriptions of weather conditions, seasonal changes, and environmental issues.`,
      
      advanced: `You are an intellectual conversation partner engaging in complex discussions. Create scenarios involving current events, abstract concepts, cultural nuances, and debate topics while using appropriate idioms and expressions.`
    };

    return scenarios[unitId] || '';
  }
}