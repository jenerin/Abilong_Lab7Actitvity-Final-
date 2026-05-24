import { Component, OnInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for common template directives
import { ReactiveFormsModule } from '@angular/forms'; // Required if using forms

@Component({
  standalone: true, // <--- Add this
  imports: [CommonModule, ReactiveFormsModule], // <--- Add this to fix the "not a known property" errors
  templateUrl: './your-component.html'
})
export class YourComponent implements OnInit {
   // ... your existing logic

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
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.forgotPassword(this.f['email'].value)
      .pipe(first())
      .subscribe({
        next: () => this.alertService.success('Check your email.'),
        error: error => { this.alertService.error(error); this.loading = false; }
      });
  }
}
