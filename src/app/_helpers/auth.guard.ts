import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private accountService: AccountService) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const account = this.accountService.accountValue;

    // Check if user is logged in
    if (!account) {
      this.router.navigate(['/account/login']);
      return false;
    }

    if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
