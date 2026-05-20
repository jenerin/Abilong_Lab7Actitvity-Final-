import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account, Role } from '@app/_models';
import { mustMatch } from '@app/_helpers';

@Component({
  templateUrl: 'add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  isAddMode = true;
  roles = Object.values(Role);
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.isAddMode = !id;

    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: mustMatch('password', 'confirmPassword') });

    if (!this.isAddMode) {
      this.accountService
        .getById(id)
        .pipe(first())
        .subscribe((account) => {
          this.form.patchValue(account);
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();
          this.form.get('confirmPassword')?.clearValidators();
          this.form.get('confirmPassword')?.updateValueAndValidity();
        });
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    if (this.isAddMode) {
      this.createAccount();
    } else {
      this.updateAccount();
    }
  }

  private createAccount() {
    this.accountService
      .create(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account added successfully', { keepAfterRouteChange: true });
          this.router.navigate(['..'], { relativeTo: this.route });
        },
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  private updateAccount() {
    this.accountService
      .update(this.route.snapshot.params['id'], this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Account updated successfully', { keepAfterRouteChange: true });
          this.router.navigate(['..'], { relativeTo: this.route });
        },
        error: (error: any) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
