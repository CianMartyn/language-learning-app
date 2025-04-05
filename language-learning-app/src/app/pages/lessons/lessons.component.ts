import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-lesson',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class LessonsComponent implements OnInit {
  lessonContent: string = '';
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    const savedLesson = localStorage.getItem('currentLesson');
    if (savedLesson) {
      this.lessonContent = savedLesson;
    } else {
      // If no lesson is found, redirect to home
      this.router.navigate(['/home']);
    }
  }
  
  goBack() {
    this.router.navigate(['/home']);
  }
}