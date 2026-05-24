import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

// 🚀 Dynamically uses the apiUrl from environment.prod.ts when building for production
const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;
  private refreshTokenTimeout?: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.accountSubject = new BehaviorSubject(this.getAccountFromStorage());
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }

  login(email: string, password: string): Observable<Account> {
    return this.http
      .post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(
        tap((account) => {
          this.accountSubject.next(account);
          this.saveAccountToStorage(account);
          this.startRefreshTokenTimer();
        }),
        first()
      );
  }

  logout(): void {
    this.http
      .post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
      .pipe(first())
      .subscribe();
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.removeAccountFromStorage();
    this.router.navigate(['/account/login']);
  }

  refreshToken(): Observable<Account> {
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap((account) => {
          this.accountSubject.next(account);
          this.saveAccountToStorage(account);
          this.startRefreshTokenTimer();
        }),
        first()
      );
  }

  register(account: Account): Observable<void> {
    return this.http.post<void>(`${baseUrl}/register`, account);
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${baseUrl}/verify-email`, { token });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${baseUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<void> {
    return this.http.post<void>(`${baseUrl}/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string): Observable<void> {
    return this.http.post<void>(`${baseUrl}/reset-password`, { token, password, confirmPassword });
  }

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(`${baseUrl}/`);
  }

  getById(id: string): Observable<Account> {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  create(account: Account): Observable<Account> {
    return this.http.post<Account>(`${baseUrl}`, account);
  }

  update(id: string, account: Account): Observable<Account> {
    return this.http.put<Account>(`${baseUrl}/${id}`, account);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }

  private startRefreshTokenTimer(): void {
    const timeout = 14 * 60 * 1000;
    this.ngZone.runOutsideAngular(() => {
      this.stopRefreshTokenTimer();
      this.refreshTokenTimeout = window.setTimeout(
        () => this.refreshToken().pipe(first()).subscribe(),
        timeout
      );
    });
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  private saveAccountToStorage(account: Account): void {
    localStorage.setItem('account', JSON.stringify(account));
  }

  private getAccountFromStorage(): Account | null {
    const account = localStorage.getItem('account');
    return account ? JSON.parse(account) : null;
  }

  private removeAccountFromStorage(): void {
    localStorage.removeItem('account');
  }
}
