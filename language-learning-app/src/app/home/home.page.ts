import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterModule],
})
export class HomePage {
  lesson: string = '';
  constructor(private http: HttpClient) {}


  generateLesson() {
    this.http.post<any>('http://localhost:5000/generate-lesson', { 
        language: "French", topic: "Greetings" 
    }).subscribe(response => {
        this.lesson = response.lesson;
    });
  }
}
