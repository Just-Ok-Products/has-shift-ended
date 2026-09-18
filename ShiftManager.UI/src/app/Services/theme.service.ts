import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public current: Theme = 'dark';

  constructor() {
    this.current = this.readStoredTheme() ?? 'dark';
    this.apply();
  }

  public toggle(): void {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    this.apply();
  }

  private apply(): void {
    document.documentElement.dataset['theme'] = this.current;
    try {
      localStorage.setItem(STORAGE_KEY, this.current);
    } catch {
      // localStorage può lanciare in modalità di navigazione restrittive: preferenza persa, non fatale.
    }
  }

  private readStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }
}
