import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home/home.component';

import { AccountService } from './_services';

import { fakeBackendProvider } from './_helpers';
import { appInitializer } from './_helpers';
import { JwtInterceptor } from './_helpers';
import { ErrorInterceptor } from './_helpers';

import { environment } from '@environments/environment';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        // only register fake backend when flag is enabled
        ...(environment.useFakeBackend ? [fakeBackendProvider] : [])
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }