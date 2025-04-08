import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
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

  getFriends(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends`, {
      headers: this.getAuthHeaders()
    });
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friend-requests`, {
      headers: this.getAuthHeaders()
    });
  }
}
