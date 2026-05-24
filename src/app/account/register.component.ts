import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { mustMatch } from '@app/_helpers';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    // Redirect home if already logged in
    if (this.accountService.accountValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        title: ['', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue]
      },
      {
        validators: mustMatch('password', 'confirmPassword')
      }
    );
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Reset alerts on submit
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.accountService
      .register(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Registration successful! You can now login.', {
            keepAfterRouteChange: true
          });
          this.router.navigate(['/account/login']);
        },
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
