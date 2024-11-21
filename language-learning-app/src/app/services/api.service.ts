import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Register a new user
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, data);
  }

  // Login a user
  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, data);
  }

  // Fetch user progress
  getUserProgress(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/progress/${userId}`);
  }
}
