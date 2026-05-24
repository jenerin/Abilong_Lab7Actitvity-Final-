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
    ReactiveFormsModule, 
    AccountRoutingModule,
    // Add standalone components here to the imports array:
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  declarations: [
    LayoutComponent // Keep only non-standalone components in declarations
  ]
})
export class AccountModule {}
