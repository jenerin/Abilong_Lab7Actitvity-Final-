import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Added
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Added ReactiveFormsModule
import { Router } from '@angular/router';
import { first } from 'rxjs/operators'; // This fixes the 'Cannot find name first' error

import { AccountService, AlertService } from '@app/_services';
import { mustMatch } from '@app/_helpers';

@Component({
  standalone: true, // Added
  imports: [CommonModule, ReactiveFormsModule], // Added imports for the template
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

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

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
        // Changed 'error' to 'error: any' to satisfy the strict TS7006 error
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
