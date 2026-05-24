import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { mustMatch } from '@app/_helpers';

enum TokenStatus {
  Validating,
  Valid,
  Invalid
}

@Component({
  standalone: true, // This line is missing in the files causing your error!
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  TokenStatus = TokenStatus;
  tokenStatus = TokenStatus.Validating;
  form!: FormGroup;
  loading = false;
  submitted = false;
  token: string = '';

  constructor(
    private formBuilder: FormBuilder,
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
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.token) {
      this.tokenStatus = TokenStatus.Invalid;
      return;
    }

    this.accountService
      .validateResetToken(this.token)
      .pipe(first())
      .subscribe({
        next: () => {
          this.tokenStatus = TokenStatus.Valid;
          this.form = this.formBuilder.group(
            {
              password: ['', [Validators.required, Validators.minLength(6)]],
              confirmPassword: ['', Validators.required]
            },
            {
              validators: mustMatch('password', 'confirmPassword')
            }
          );
        },
        error: () => {
          this.tokenStatus = TokenStatus.Invalid;
        }
      });
  }

  get f() {
    return this.form?.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService
      .resetPassword(this.token, this.f['password'].value, this.f['confirmPassword'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Password reset successful, you can now login', {
            keepAfterRouteChange: true
          });
          this.router.navigate(['../login'], { relativeTo: this.route });
        },
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
