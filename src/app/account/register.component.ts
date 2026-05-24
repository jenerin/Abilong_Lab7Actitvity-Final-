import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 👈 Added ReactiveFormsModule
import { CommonModule } from '@angular/common'; // 👈 Added CommonModule
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { mustMatch } from '@app/_helpers';

@Component({
  standalone: true, // 👈 Enable standalone
  imports: [CommonModule, ReactiveFormsModule], // 👈 Import modules directly here
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  // ... rest of your code remains the same ...
}
