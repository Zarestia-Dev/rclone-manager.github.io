import { Component, inject, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss'
})
export class ThemeToggle implements OnDestroy {
  private currentTheme: Theme = 'system';
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    // Load saved theme preference
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      this.currentTheme = saved;
    }
    this.applyTheme(this.currentTheme);
  }

  ngOnDestroy() {
    this.cleanupMediaQueryListener();
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;

    this.cleanupMediaQueryListener();

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // system - follow browser preference and listen for changes
      this.setupSystemThemeListener();
    }
  }

  private setupSystemThemeListener() {
    if (typeof window === 'undefined') return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const root = document.documentElement;

    // Set initial theme
    root.classList.remove(this.mediaQuery.matches ? 'light' : 'dark');
    root.classList.add(this.mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      root.classList.remove(e.matches ? 'light' : 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    if (typeof this.mediaQuery.addEventListener === 'function') {
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    } else if (typeof (this.mediaQuery as any).addListener === 'function') {
      (this.mediaQuery as any).addListener(this.mediaQueryListener);
    }
  }

  private cleanupMediaQueryListener() {
    if (this.mediaQuery && this.mediaQueryListener) {
      if (typeof this.mediaQuery.removeEventListener === 'function') {
        this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
      } else if (typeof (this.mediaQuery as any).removeListener === 'function') {
        (this.mediaQuery as any).removeListener(this.mediaQueryListener);
      }
    }
    this.mediaQuery = null;
    this.mediaQueryListener = null;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getThemeIcon(): string {
    switch (this.currentTheme) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'system': return 'brightness_auto';
      default: return 'brightness_auto';
    }
  }
}