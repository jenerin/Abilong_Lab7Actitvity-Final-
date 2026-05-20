import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';

@Component({
  templateUrl: 'list.component.html'
})
export class ListComponent implements OnInit {
  accounts?: Account[];
  isRefreshing = false;

  constructor(private accountService: AccountService, private alertService: AlertService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.isRefreshing = true;
    this.accountService
      .getAll()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.isRefreshing = false;
        },
        error: () => {
          this.isRefreshing = false;
        }
      });
  }

  deleteAccount(id: string) {
    const account = this.accounts?.find((x) => x.id === id);
    if (!account) return;
    account.isDeleting = true;
    this.accountService
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.accounts = this.accounts?.filter((x) => x.id !== id);
      });
  }
}
