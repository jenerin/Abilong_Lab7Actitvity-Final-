import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';
import { mustMatch } from '@app/_helpers';

@Component({
  templateUrl: 'update.component.html'
})
export class UpdateComponent implements OnInit {
  account?: Account | null;
  form!: FormGroup;
  loading = false;
  submitted = false;
  deleting = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {
    this.account = this.accountService.accountValue;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: [this.account?.title, Validators.required],
      firstName: [this.account?.firstName, Validators.required],
      lastName: [this.account?.lastName, Validators.required],
      email: [this.account?.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: mustMatch('password', 'confirmPassword') });

    if (this.form.value.password === '') {
      delete this.form.value.password;
      delete this.form.value.confirmPassword;
    }
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
      .update(this.account?.id || '', this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Profile updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['..'], { relativeTo: this.route });
        },
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete your account?')) {
      this.deleting = true;
      this.accountService
        .delete(this.account?.id || '')
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Account deleted successfully');
            this.accountService.logout();
          },
          error: (error: any) => {
            this.alertService.error(error);
            this.deleting = false;
          }
        });
    }
  }
}
