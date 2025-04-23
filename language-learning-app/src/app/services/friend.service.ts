import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface Friend {
  _id: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('FriendService - Current token:', token);
    console.log('FriendService - Current username:', localStorage.getItem('username'));
    
    if (!token) {
      console.error('FriendService - No token found in localStorage');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  sendFriendRequest(toUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/friend-request`, { toUsername }, {
      headers: this.getAuthHeaders()
    });
  }

  acceptFriendRequest(fromUserId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept-request`, { fromUserId }, {
      headers: this.getAuthHeaders()
    });
  }

  getFriends(): Observable<Friend[]> {
    console.log('Getting friends with headers:', this.getAuthHeaders());
    return this.http.get<Friend[]>(`${this.apiUrl}/friends`, {
      headers: this.getAuthHeaders()
    });
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friend-requests`, {
      headers: this.getAuthHeaders()
    });
  }

  removeFriend(friendId: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.delete(`${this.apiUrl}/friends/${friendId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
