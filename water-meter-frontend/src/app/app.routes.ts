import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { MeterDetailsComponent } from '../pages/meter-details/meter-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'meter-details/:MID', component: MeterDetailsComponent },
];
