import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ContentSection {
  title?: string;
  content: SafeHtml;
}

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
  formattedContent: ContentSection[] = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
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
          this.formatLessonContent();
        } else {
          this.lessonContent = 'No lesson content available.';
          console.log('No lesson content in data');
          this.formattedContent = [{ content: this.sanitizer.bypassSecurityTrustHtml(this.lessonContent) }];
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
        this.formattedContent = [{ content: this.sanitizer.bypassSecurityTrustHtml(this.lessonContent) }];
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      this.lessonContent = 'Error loading lesson. Please try again.';
      this.formattedContent = [{ content: this.sanitizer.bypassSecurityTrustHtml(this.lessonContent) }];
    }
  }

  formatLessonContent() {
    // Split the content by double newlines to identify sections
    const sections = this.lessonContent.split(/\n\s*\n/);
    
    this.formattedContent = sections.map(section => {
      // Check if the section has a title (starts with a heading-like pattern)
      const titleMatch = section.match(/^(#+\s+.*|\d+\.\s+.*)/);
      
      if (titleMatch) {
        // Extract the title and content
        const title = titleMatch[0].replace(/^#+\s+|\d+\.\s+/, '').trim();
        const content = section.replace(titleMatch[0], '').trim();
        
        // Format the content with paragraphs and lists
        const formattedContent = this.formatText(content);
        
        return {
          title,
          content: this.sanitizer.bypassSecurityTrustHtml(formattedContent)
        };
      } else {
        // Format the content without a title
        const formattedContent = this.formatText(section);
        
        return {
          content: this.sanitizer.bypassSecurityTrustHtml(formattedContent)
        };
      }
    });
  }

  formatText(text: string): string {
    // Replace single newlines with <br> tags
    let formatted = text.replace(/\n/g, '<br>');
    
    // Format lists (lines starting with - or *)
    formatted = formatted.replace(/^-\s+(.*)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\*\s+(.*)$/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> tags
    if (formatted.includes('<li>')) {
      formatted = '<ul>' + formatted + '</ul>';
    }
    
    // Format bold text (text between **)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text (text between *)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format code blocks (text between backticks)
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
  }

  goBack() {
    console.log('Going back');
    // Navigate back to the previous page
    this.router.navigate(['/units'], { replaceUrl: true });
  }

  goToTutor() {
    console.log('Current lesson state:', {
      language: this.lessonLanguage,
      topic: this.lessonTitle,
      hasContent: !!this.lessonContent,
      contentLength: this.lessonContent?.length
    });

    if (!this.lessonLanguage || !this.lessonTitle || !this.lessonContent) {
      console.error('Missing required lesson data');
      this.showError('Missing lesson data. Please try generating the lesson again.');
      return;
    }

    const tutorData = {
      language: this.lessonLanguage,
      topic: this.lessonTitle,
      lessonContent: this.lessonContent
    };

    // Store the current lesson data for the tutor
    localStorage.setItem('tutorLessonData', JSON.stringify(tutorData));
    console.log('Stored tutor data in localStorage:', tutorData);
    
    // Navigate to the tutor page
    this.router.navigate(['/lesson-tutor']);
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