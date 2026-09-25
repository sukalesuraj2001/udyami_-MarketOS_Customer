import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/welcome/welcome.page').then((m) => m.WelcomePage),
    title: 'Welcome · Jyovix Marketing',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
    title: 'Sign in · Jyovix Marketing',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then((m) => m.RegisterPage),
    title: 'Create account · Jyovix Marketing',
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
        title: 'Dashboard · Jyovix Marketing',
      },
      {
        path: 'brand-brief',
        loadComponent: () => import('./features/brand-brief/brand-brief.page').then((m) => m.BrandBriefPage),
        title: 'Brand brief · Jyovix Marketing',
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.page').then((m) => m.CalendarPage),
        title: 'Calendar · Jyovix Marketing',
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/approvals/approvals.page').then((m) => m.ApprovalsPage),
        title: 'Approvals · Jyovix Marketing',
      },
      {
        path: 'campaigns',
        loadComponent: () => import('./features/campaigns/campaigns.page').then((m) => m.CampaignsPage),
        title: 'Campaigns · Jyovix Marketing',
      },
      {
        path: 'incidents',
        loadComponent: () => import('./features/incidents/incidents.page').then((m) => m.IncidentsPage),
        title: 'Incidents · Jyovix Marketing',
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage),
        title: 'Reports · Jyovix Marketing',
      },
      {
        path: 'storage',
        loadComponent: () => import('./features/storage/storage.page').then((m) => m.StoragePage),
        title: 'Storage · Jyovix Marketing',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
        title: 'Profile · Jyovix Marketing',
      },
      {
        path: 'profile-details',
        loadComponent: () => import('./features/profile-details/profile-details.page').then((m) => m.ProfileDetailsPage),
        title: 'Profile details · Jyovix Marketing',
      },
      {
        path: 'profile-edit',
        loadComponent: () => import('./features/profile-edit/profile-edit.page').then((m) => m.ProfileEditPage),
        title: 'Edit profile · Jyovix Marketing',
      },
      {
        path: 'membership',
        loadComponent: () => import('./features/membership/membership.page').then((m) => m.MembershipPage),
        title: 'Membership · Jyovix Marketing',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage),
        title: 'Settings · Jyovix Marketing',
      },
      {
        path: 'help-support',
        loadComponent: () => import('./features/help-support/help-support.page').then((m) => m.HelpSupportPage),
        title: 'Help & support · Jyovix Marketing',
      },
    ],
  },
  {
    path: 'dashboard',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'brand-brief',
    redirectTo: 'tabs/brand-brief',
    pathMatch: 'full',
  },
  {
    path: 'calendar',
    redirectTo: 'tabs/calendar',
    pathMatch: 'full',
  },
  {
    path: 'approvals',
    redirectTo: 'tabs/approvals',
    pathMatch: 'full',
  },
  {
    path: 'campaigns',
    redirectTo: 'tabs/campaigns',
    pathMatch: 'full',
  },
  {
    path: 'incidents',
    redirectTo: 'tabs/incidents',
    pathMatch: 'full',
  },
  {
    path: 'reports',
    redirectTo: 'tabs/reports',
    pathMatch: 'full',
  },
  {
    path: 'help-support',
    redirectTo: 'tabs/help-support',
    pathMatch: 'full',
  },
  {
    path: 'membership',
    redirectTo: 'tabs/membership',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    redirectTo: 'tabs/settings',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'tabs/dashboard' },
];
