import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { mustMatch } from '@app/_helpers';

@Component({ templateUrl: 'register.component.html', standalone: false })
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    submitting = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validator: mustMatch('password', 'confirmPassword')
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.cdr?.detectChanges();

        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.cdr?.detectChanges();

        // Capture the user email to construct our success message banner dynamically
        const userEmail = this.f['email'].value;

        // FIXED: Added acceptTerms explicitly to fulfill backend requirement
        const registerPayload = {
            title: this.f['title'].value,
            firstName: this.f['firstName'].value,
            lastName: this.f['lastName'].value,
            email: userEmail,
            password: this.f['password'].value,
            confirmPassword: this.f['confirmPassword'].value,
            acceptTerms: this.f['acceptTerms'].value // Sending the true/false value to the backend
        };

        this.accountService.register(registerPayload)
            .pipe(first())
            .subscribe({
                next: () => {
                    // 🚀 FIXED: Dynamic success banner targeting the user's explicit email address
                    this.alertService.success(`Verification link sent to ${userEmail}. Please check your inbox!`, { keepAfterRouteChange: true });
                    
                    // 🚀 FIXED: Absolute route navigation to instantly redirect the page view to login
                    this.router.navigate(['/account/login']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                    this.cdr?.detectChanges();
                }
            });
    }
}
