import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubnavComponent } from './subnav.component';
import { Role } from '@app/_models';
import { AuthGuard } from '@app/_helpers';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] },
    children: [
      { path: '', component: OverviewComponent },
      { path: 'accounts', loadChildren: () => import('./accounts/accounts.module').then((m) => m.AccountsModule) },
      { path: '', component: SubnavComponent, outlet: 'subnav' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
