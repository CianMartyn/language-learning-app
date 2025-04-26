import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface VocabularyCard {
  word: string;
  translation: string;
  example: string;
  category?: string;
  lastReviewed?: Date;
  nextReview?: Date;
  level?: number;
  language: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

@Component({
  selector: 'app-vocabulary',
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VocabularyComponent implements OnInit {
  cards: VocabularyCard[] = [];
  currentCard: VocabularyCard | null = null;
  userAnswer: string = '';
  showTranslation: boolean = false;
  isCorrect: boolean | null = null;
  correctInARow: number = 0;
  bestStreak: number = 0;
  dailyGoal: number = 20;
  cardsReviewedToday: number = 0;
  selectedLanguage: string = 'french';
  isLoading: boolean = false;
  showCelebration: boolean = false;
  allGeneratedWords: Set<string> = new Set();
  
  languages: Language[] = [
    { code: 'french', name: 'French', flag: '🇫🇷' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'german', name: 'German', flag: '🇩🇪' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹' },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { code: 'korean', name: 'Korean', flag: '🇰🇷' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
    { code: 'russian', name: 'Russian', flag: '🇷🇺' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'arabic', name: 'Arabic', flag: '🇸🇦' }
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProgress();
    this.generateVocabulary();
  }

  async generateVocabulary() {
    this.isLoading = true;
    const maxRetries = 3;
    let retryCount = 0;
    let delay = 1000;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} of ${maxRetries}...`);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        const response = await this.http.post<any>(
          `${environment.apiUrl}/api/vocabulary/generate`,
          { language: this.selectedLanguage },
          { headers }
        ).toPromise();

        if (Array.isArray(response)) {
          // Filter out duplicates and add to existing cards
          const newCards = response
            .filter((card: any) => !this.allGeneratedWords.has(card.word))
            .map((card: any) => ({
              ...card,
              lastReviewed: new Date(),
              nextReview: new Date(),
              level: 1,
              language: this.selectedLanguage
            }));

          // Add new words to the set of generated words
          newCards.forEach(card => this.allGeneratedWords.add(card.word));

          // Add new cards to existing ones
          this.cards = [...this.cards, ...newCards];

          this.filterCardsByLanguage();
          this.selectRandomCard();
          this.updateStats();
          this.isLoading = false;
          return;
        } else {
          throw new Error('Invalid response format: not an array');
        }
      } catch (error: any) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        
        if (error.status === 429) {
          if (retryCount < maxRetries - 1) {
            console.log(`Rate limit hit. Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            retryCount++;
            continue;
          }
        }

        const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
        const alert = await this.alertController.create({
          header: 'Error',
          message: `Failed to generate vocabulary: ${errorMessage}`,
          buttons: ['OK']
        });
        await alert.present();
        this.isLoading = false;
        break;
      }
    }
    this.isLoading = false;
  }

  filterCardsByLanguage() {
    this.cards = this.cards.filter(card => card.language === this.selectedLanguage);
  }

  async onLanguageChange() {
    // Clear existing cards and generated words when changing language
    this.cards = [];
    this.allGeneratedWords.clear();
    await this.generateVocabulary();
  }

  updateStats() {
    if (this.correctInARow > this.bestStreak) {
      this.bestStreak = this.correctInARow;
      localStorage.setItem('bestStreak', this.bestStreak.toString());
    }
  }

  selectRandomCard() {
    if (this.cards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    this.currentCard = this.cards[randomIndex];
    this.showTranslation = false;
    this.isCorrect = null;
    this.userAnswer = '';
  }

  checkAnswer() {
    if (!this.currentCard) return;

    const normalizedAnswer = this.userAnswer.toLowerCase().trim();
    const normalizedTranslation = this.currentCard.translation.toLowerCase().trim();
    
    this.isCorrect = normalizedAnswer === normalizedTranslation;
    
    if (this.isCorrect) {
      this.correctInARow++;
      if (this.correctInARow > this.bestStreak) {
        this.bestStreak = this.correctInARow;
        localStorage.setItem('bestStreak', this.bestStreak.toString());
      }
      
      if (this.correctInARow % 5 === 0) {
        this.showCelebration = true;
        setTimeout(() => {
          this.showCelebration = false;
        }, 2000);
      }
    } else {
      this.correctInARow = 0;
      this.showTranslation = true;
    }

    this.cardsReviewedToday++;
    this.updateStats();
    this.saveProgress();
  }

  saveProgress() {
    localStorage.setItem('correctInARow', this.correctInARow.toString());
    localStorage.setItem('bestStreak', this.bestStreak.toString());
    localStorage.setItem('cardsReviewedToday', this.cardsReviewedToday.toString());
    localStorage.setItem('cards', JSON.stringify(this.cards));
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
  }

  loadProgress() {
    const savedCorrectInARow = localStorage.getItem('correctInARow');
    const savedBestStreak = localStorage.getItem('bestStreak');
    const savedReviewed = localStorage.getItem('cardsReviewedToday');
    const savedCards = localStorage.getItem('cards');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    this.correctInARow = savedCorrectInARow ? parseInt(savedCorrectInARow) : 0;
    this.bestStreak = savedBestStreak ? parseInt(savedBestStreak) : 0;
    this.cardsReviewedToday = savedReviewed ? parseInt(savedReviewed) : 0;
    this.selectedLanguage = savedLanguage || 'french';
    
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      this.cards = parsedCards.map((card: any) => ({
        ...card,
        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : new Date(),
        nextReview: card.nextReview ? new Date(card.nextReview) : new Date()
      }));
      this.updateStats();
    }
  }

  revealTranslation() {
    if (this.isCorrect === null) {
      this.showTranslation = true;
      this.isCorrect = false;
      this.correctInARow = 0;
      this.cardsReviewedToday++;
      this.updateStats();
      this.saveProgress();
    }
  }

  nextCard() {
    this.showTranslation = false;
    this.isCorrect = null;
    this.userAnswer = '';
    this.selectRandomCard();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
} 