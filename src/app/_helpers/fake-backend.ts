import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { Account, Role, AlertType } from '@app/_models';
import { AlertService } from '@app/_services';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor(private alertService: AlertService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // Wrap in delay to simulate server latency
    return of(null)
      .pipe(
        delay(500),
        mergeMap(() => this.handleRoute(url, method, body, headers, request, next))
      );
  }

  private handleRoute(
    url: string,
    method: string,
    body: any,
    headers: any,
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    if (url.match(/\/accounts\/authenticate$/) && method === 'POST') {
      return this.authenticate(body);
    } else if (url.match(/\/accounts\/register$/) && method === 'POST') {
      return this.register(body);
    } else if (url.match(/\/accounts\/verify-email$/) && method === 'POST') {
      return this.verifyEmail(body);
    } else if (url.match(/\/accounts\/forgot-password$/) && method === 'POST') {
      return this.forgotPassword(body);
    } else if (url.match(/\/accounts\/validate-reset-token$/) && method === 'POST') {
      return this.validateResetToken(body);
    } else if (url.match(/\/accounts\/reset-password$/) && method === 'POST') {
      return this.resetPassword(body);
    } else if (url.match(/\/accounts\/refresh-token$/) && method === 'POST') {
      return this.refreshToken();
    } else if (url.match(/\/accounts\/revoke-token$/) && method === 'POST') {
      return this.revokeToken(body);
    } else if (url.match(/\/accounts\/$/) && method === 'GET') {
      return this.getAll();
    } else if (url.match(/\/accounts\/\d+$/) && method === 'GET') {
      return this.getById(url);
    } else if (url.match(/\/accounts$/) && method === 'POST') {
      return this.create(body);
    } else if (url.match(/\/accounts\/\d+$/) && method === 'PUT') {
      return this.update(url, body);
    } else if (url.match(/\/accounts\/\d+$/) && method === 'DELETE') {
      return this.delete(url);
    }

    // Pass through any requests not handled above
    return next.handle(request);
  }

  private authenticate(body: any): Observable<any> {
    const { email, password } = body;
    const accounts = this.getAccounts();
    const account = accounts.find(
      (x: Account) => x.email === email && x.password === password && x.verified
    );

    if (!account) {
      return this.error('Email or password is incorrect');
    }

    return this.ok({
      ...account,
      jwtToken: 'fake-jwt-token'
    });
  }

  private register(body: any): Observable<any> {
    const { email, password, firstName, lastName, acceptTerms } = body;
    const accounts = this.getAccounts();

    if (accounts.find((x: Account) => x.email === email)) {
      return this.error('Email "' + email + '" is already registered');
    }

    const verificationToken = Math.random().toString(36).substr(2, 9);

    const account: Account = {
      id: (Math.max(0, ...accounts.map((x: Account) => parseInt(x.id || '0'))) + 1).toString(),
      email,
      password,
      firstName,
      lastName,
      acceptTerms,
      role: accounts.length === 0 ? Role.Admin : Role.User,
      created: new Date(),
      verificationToken,
      verified: new Date() // Auto-verify in fake backend
    };

    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));

    this.alertService.success(
      `Registration successful! You can now login.<br/><br/>
      <small>Fake backend: account auto-verified. Token was: <strong>${verificationToken}</strong></small>`
    );

    return this.ok();
  }

  private verifyEmail(body: any): Observable<any> {
    const { token } = body;
    const accounts = this.getAccounts();
    const account = accounts.find((x: Account) => x.verificationToken === token);

    if (!account) {
      return this.error('Verification failed');
    }

    account.verified = new Date();
    localStorage.setItem('accounts', JSON.stringify(accounts));

    return this.ok();
  }

  private forgotPassword(body: any): Observable<any> {
    const { email } = body;
    const accounts = this.getAccounts();
    const account = accounts.find((x: Account) => x.email === email);

    if (!account) {
      return this.ok();
    }

    account.resetToken = Math.random().toString(36).substr(2, 9);
    account.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    localStorage.setItem('accounts', JSON.stringify(accounts));

    this.alertService.info(`Please use the below token to reset your password
        <br /><br />
        Reset token: <strong>${account.resetToken}</strong>`);

    return this.ok();
  }

  private validateResetToken(body: any): Observable<any> {
    const { token } = body;
    const accounts = this.getAccounts();
    const account = accounts.find(
      (x: Account) =>
        x.resetToken === token &&
        x.resetTokenExpires &&
        x.resetTokenExpires > new Date()
    );

    if (!account) {
      return this.error('Invalid token');
    }

    return this.ok();
  }

  private resetPassword(body: any): Observable<any> {
    const { token, password } = body;
    const accounts = this.getAccounts();
    const account = accounts.find(
      (x: Account) =>
        x.resetToken === token &&
        x.resetTokenExpires &&
        x.resetTokenExpires > new Date()
    );

    if (!account) {
      return this.error('Invalid token');
    }

    account.password = password;
    account.passwordReset = new Date();
    account.resetToken = undefined;
    account.resetTokenExpires = undefined;
    localStorage.setItem('accounts', JSON.stringify(accounts));

    return this.ok();
  }

  private refreshToken(): Observable<any> {
    const account = this.getAccounts()[0];
    if (!account) {
      return this.ok();
    }

    return this.ok({
      ...account,
      jwtToken: 'fake-jwt-token'
    });
  }

  private revokeToken(body: any): Observable<any> {
    return this.ok();
  }

  private getAll(): Observable<any> {
    return this.ok(this.getAccounts());
  }

  private getById(url: string): Observable<any> {
    const id = url.split('/').pop();
    const accounts = this.getAccounts();
    const account = accounts.find((x: Account) => x.id === id);
    return this.ok(account);
  }

  private create(body: any): Observable<any> {
    const accounts = this.getAccounts();
    const existing = accounts.find((x: Account) => x.email === body.email);
    if (existing) {
      return this.error(`Email "${body.email}" is already registered`);
    }
    const account: Account = {
      ...body,
      id: (Math.max(0, ...accounts.map((x: Account) => parseInt(x.id || '0'))) + 1).toString(),
      verified: new Date() // Admin-created accounts are pre-verified
    };
    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    return this.ok(account);
  }

  private update(url: string, body: any): Observable<any> {
    const id = url.split('/').pop();
    const accounts = this.getAccounts();
    const account = accounts.find((x: Account) => x.id === id);

    if (!account) {
      return this.error('Account not found');
    }

    if (body.password) {
      delete body.password;
    }

    Object.assign(account, body);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    return this.ok(account);
  }

  private delete(url: string): Observable<any> {
    const id = url.split('/').pop();
    const accounts = this.getAccounts();
    const index = accounts.findIndex((x: Account) => x.id === id);

    if (index === -1) {
      return this.error('Account not found');
    }

    accounts.splice(index, 1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    return this.ok();
  }

  private ok(body?: any): Observable<any> {
    return of(new HttpResponse({ status: 200, body }));
  }

  private error(message: string): Observable<any> {
    return throwError(() => ({
      status: 400,
      error: { message }
    }));
  }

  private getAccounts(): Account[] {
    const accounts = localStorage.getItem('accounts');
    return accounts ? JSON.parse(accounts) : [];
  }
}

export const fakeBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
