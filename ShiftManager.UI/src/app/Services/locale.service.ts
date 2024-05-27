import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {

  constructor() { }

  public getBrowserLocale(): string {
    return navigator.language || 'en-US';
  }

}
