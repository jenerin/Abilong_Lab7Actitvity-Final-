import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngClass
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Required for forms
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';

@Component({
  standalone: true, // MUST be true
  imports: [CommonModule, ReactiveFormsModule], // REQUIRED for template directives
  templateUrl: 'forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnInit {
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
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.forgotPassword(this.f['email'].value)
      .pipe(first())
      .subscribe({
        next: () => this.alertService.success('Please check your email.'),
        error: (error: any) => { this.alertService.error(error); this.loading = false; }
      });
  }
}
