import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
    title: 'Sign in · MarketOS',
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
        title: 'Dashboard · MarketOS',
      },
      {
        path: 'brand-brief',
        loadComponent: () => import('./features/brand-brief/brand-brief.page').then((m) => m.BrandBriefPage),
        title: 'Brand brief · MarketOS',
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.page').then((m) => m.CalendarPage),
        title: 'Calendar · MarketOS',
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/approvals/approvals.page').then((m) => m.ApprovalsPage),
        title: 'Approvals · MarketOS',
      },
      {
        path: 'campaigns',
        loadComponent: () => import('./features/campaigns/campaigns.page').then((m) => m.CampaignsPage),
        title: 'Campaigns · MarketOS',
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/leads.page').then((m) => m.LeadsPage),
        title: 'Leads · MarketOS',
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage),
        title: 'Reports · MarketOS',
      },
      {
        path: 'storage',
        loadComponent: () => import('./features/storage/storage.page').then((m) => m.StoragePage),
        title: 'Storage · MarketOS',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
        title: 'Profile · MarketOS',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPage),
        title: 'Settings · MarketOS',
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
    path: 'leads',
    redirectTo: 'tabs/leads',
    pathMatch: 'full',
  },
  {
    path: 'reports',
    redirectTo: 'tabs/reports',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    redirectTo: 'tabs/settings',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'tabs/dashboard' },
];
