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
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: error => {
          this.loading = false;
        }
      });
  }
}
