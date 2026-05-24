import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'; // Added RouterOutlet
import { AccountService } from '@app/_services';

@Component({
  selector: 'app-layout', // Best practice
  standalone: true,      // 👈 REQUIRED for standalone
  imports: [RouterOutlet], // 👈 REQUIRED for router-outlet in layout.component.html
  templateUrl: 'layout.component.html'
})
export class LayoutComponent {
  constructor(private router: Router, private accountService: AccountService) {
    if (this.accountService.accountValue) {
      this.router.navigate(['/']);
    }
  }
}
