import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 Must be here
// ... other imports

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 👈 Must be here
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  // ... rest of your code ...
  ngOnInit(): void {
    // Ensure this method is present and exactly like this
    this.form = this.formBuilder.group({
       // ... your controls
    }, { validators: mustMatch('password', 'confirmPassword') });
  }
}
