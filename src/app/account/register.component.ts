import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for common template directives
import { ReactiveFormsModule } from '@angular/forms'; // Required if using forms

@Component({
  standalone: true, // <--- Add this
  imports: [CommonModule, ReactiveFormsModule], // <--- Add this to fix the "not a known property" errors
  templateUrl: './your-component.html'
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
    }, { validators: mustMatch('password', 'confirmPassword') });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.register(this.form.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Registration successful!', { keepAfterRouteChange: true });
          this.router.navigate(['/account/login']);
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }
}
