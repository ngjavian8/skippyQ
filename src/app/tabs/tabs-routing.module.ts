import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'new-loan',
        loadChildren: () => import('../new-loan/new-loan.module').then(m => m.NewLoanPageModule)
      },
      {
        path: 'loans',
        loadChildren: () => import('../loans/loans.module').then(m => m.LoansPageModule)
      },
      {
        path: 'manage',
        loadChildren: () => import('../manage/manage.module').then(m => m.ManagePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/new-loan',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}