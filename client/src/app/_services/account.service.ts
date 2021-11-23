import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | undefined>(undefined);

  public currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(model: any): Observable<void> {
    const postObservable: Observable<User> = this.http.post<User>(
      this.baseUrl + 'account/login',
      model
    );

    const resultObservable: Observable<void> = postObservable.pipe(
      map((response: User): void => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );

    return resultObservable;
  }

  addTwoNumbers(a: number, b: number): number {
    return a + b;
  }

  register(model: any): Observable<void> {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(undefined);
  }
}
