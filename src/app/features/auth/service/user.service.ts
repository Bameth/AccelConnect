import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface User {
  id: number;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        console.log('👤 Current user loaded:', user);
        this.currentUserSubject.next(user);
      })
    );
  }

  updateCurrentUser(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, user).pipe(
      tap((updatedUser) => {
        console.log('✅ User updated:', updatedUser);
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`);
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
