import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status) && this.accountService.accountValue) {
          this.accountService.logout();
        }

        // Extract a human-readable message from the error response
        let message: string;
        if (error.error?.message) {
          message = error.error.message;
        } else if (error.error?.errors?.length) {
          message = error.error.errors[0];
        } else if (typeof error.error === 'string') {
          message = error.error;
        } else {
          message = error.statusText || 'An error occurred';
        }

        return throwError(() => message);
      })
    );
  }
}
