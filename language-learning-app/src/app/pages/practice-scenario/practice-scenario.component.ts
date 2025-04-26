import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';

interface ScenarioData {
  character: string;
  role: string;
  description: string;
  language: string;
  unitTitle: string;
  unitId: string;
}

@Component({
  selector: 'app-practice-scenario',
  templateUrl: './practice-scenario.component.html',
  styleUrls: ['./practice-scenario.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PracticeScenarioComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  scenarioData: ScenarioData | null = null;
  messages: Array<{ role: string; content: string }> = [];
  userMessage: string = '';
  isLoading: boolean = false;
  username: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location
  ) {
    this.username = localStorage.getItem('username') || 'User';
  }

  ngOnInit() {
    // Load saved scenario data
    const savedScenario = localStorage.getItem('practiceScenario');
    if (!savedScenario) {
      this.router.navigate(['/units']);
      return;
    }

    try {
      const parsedData = JSON.parse(savedScenario) as ScenarioData;
      if (!this.validateScenarioData(parsedData)) {
        throw new Error('Invalid scenario data');
      }

      this.scenarioData = parsedData;
      this.messages.push({
        role: 'assistant',
        content: `Hello! I'm ${parsedData.character}, ${parsedData.role}. ${parsedData.description}`
      });
    } catch (error) {
      console.error('Error loading scenario data:', error);
      this.router.navigate(['/units']);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private validateScenarioData(data: any): data is ScenarioData {
    return (
      typeof data.character === 'string' &&
      typeof data.role === 'string' &&
      typeof data.description === 'string' &&
      typeof data.language === 'string' &&
      typeof data.unitTitle === 'string' &&
      typeof data.unitId === 'string'
    );
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  async sendMessage() {
    if (!this.userMessage.trim() || this.isLoading || !this.scenarioData) return;

    const userMessageContent = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Add user message to chat
    this.messages.push({
      role: 'user',
      content: userMessageContent
    });

    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollToBottom(), 100);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await this.http.post<any>(
        `${environment.apiUrl}/chat/practice-scenario`,
        {
          message: userMessageContent,
          character: this.scenarioData.character,
          role: this.scenarioData.role,
          language: this.scenarioData.language,
          context: this.scenarioData.description,
          history: this.messages
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      ).toPromise();

      if (response?.message) {
        this.messages.push({
          role: 'assistant',
          content: response.message
        });
        // Scroll to bottom after adding assistant message
        setTimeout(() => this.scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({
        role: 'assistant',
        content: "I'm sorry, I'm having trouble understanding right now. Could you try again?"
      });
      // Scroll to bottom after adding error message
      setTimeout(() => this.scrollToBottom(), 100);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.location.back();
  }
} 