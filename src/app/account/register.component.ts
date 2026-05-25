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

        // Reset alerts on submit
        this.alertService.clear();

        // Stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.cdr?.detectChanges();

        // Capture the typed email string dynamically for the banner message
        const userEmail = this.f['email'].value;

        // Construct a clean payload explicitly passing required fields to the backend 
        const registerPayload = {
            title: this.f['title'].value,
            firstName: this.f['firstName'].value,
            lastName: this.f['lastName'].value,
            email: userEmail,
            password: this.f['password'].value,
            confirmPassword: this.f['confirmPassword'].value,
            acceptTerms: this.f['acceptTerms'].value 
        };

        this.accountService.register(registerPayload)
            .pipe(first())
            .subscribe({
                next: () => {
                    // 🚀 Displays the dynamic alert message with the exact email used
                    this.alertService.success(`Verification link sent to ${userEmail}. Please check your inbox!`, { keepAfterRouteChange: true });
                    
                    // 🚀 Redirects directly and absolutely to the login view page
                    this.router.navigate(['/account/login'])
                        .then(() => {
                            this.submitting = false;
                            this.cdr?.detectChanges();
                        });
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                    this.cdr?.detectChanges();
                }
            });
    }
}
