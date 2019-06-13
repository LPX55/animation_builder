import { MarketPackDetailComponent } from './components/market-pack-detail/market-pack-detail.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { MarketListComponent } from './components/market-list/market-list.component';

const routes: Routes = [
  { path: '', component: MarketListComponent },
  { path: ':category', component: MarketListComponent },
  { path: 'market-detail/:id', component: MarketListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule { }
