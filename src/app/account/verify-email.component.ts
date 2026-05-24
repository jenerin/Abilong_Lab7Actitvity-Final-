import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
  standalone: true, // This line is missing in the files causing your error!
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html'
})

export class VerifyEmailComponent implements OnInit {
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    if (this.accountService.accountValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.error = 'Verification token is missing. Please use the link from your email.';
      this.loading = false;
      return;
    }

    this.accountService
      .verifyEmail(token)
      .pipe(first())
      .subscribe({
        next: () => {
          this.loading = false;
          this.alertService.success('Verification successful, you can now login', {
            keepAfterRouteChange: true
          });
          this.router.navigate(['/account/login']);
        },
        error: (error: any) => {
          this.error = error;
          this.loading = false;
        }
      });
  }
}
