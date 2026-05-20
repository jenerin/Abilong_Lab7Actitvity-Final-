import { AccountService } from '@app/_services';
import { catchError } from 'rxjs/operators';
import { of, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';

export function appInitializer(accountService: AccountService) {
  return () =>
    accountService.refreshToken().pipe(
      timeout(5000),
      catchError(() => of(null))
    );
}
