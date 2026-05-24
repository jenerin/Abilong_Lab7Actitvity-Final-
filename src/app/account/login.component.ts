import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// ... other imports

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // ... properties ...

  onSubmit() {
    this.loading = true;
    this.accountService.login(this.f['email'].value, this.f['password'].value)
        .pipe(first())
        .subscribe({
            next: () => { /* ... */ },
           // Replace your existing error block with this specific structure:
error: (error: any) => {
    console.error("Login failed:", error);
    this.loading = false;
}
        });
  }
}
