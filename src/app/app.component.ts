import { Component, ChangeDetectorRef, OnInit } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
  account?: Account | null;
  readonly Role = Role;

  constructor(
    private accountService: AccountService,
    private cdr: ChangeDetectorRef // 🚀 FIXED: Inject ChangeDetectorRef to force UI refreshes
  ) {}

  ngOnInit() {
    // 🚀 FIXED: Subscribing within ngOnInit handles component initialization cycles much better
    this.accountService.account.subscribe((x) => {
      this.account = x;
      
      // Force Angular to look for template changes (*ngIf="!account" toggles)
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.accountService.logout();
    this.cdr.detectChanges();
  }
}
