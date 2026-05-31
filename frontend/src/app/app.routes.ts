import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthComponent } from './pages/auth/auth.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';
import { ProjectsComponent } from './pages/projects/projects.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'signup', component: AuthComponent, data: { mode: 'signup' } },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
