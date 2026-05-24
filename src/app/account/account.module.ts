import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { VerifyEmailComponent } from './verify-email.component';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ResetPasswordComponent } from './reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule, // 👈 Fixes the 'formGroup' and 'ngClass' errors for LoginComponent
    AccountRoutingModule,
    
    // ✅ ONLY keep actual Standalone components here:
    RegisterComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  declarations: [
    // 🏛️ Classic components MUST be declared here:
    LayoutComponent,
    LoginComponent 
  ]
})
export class AccountModule { }
