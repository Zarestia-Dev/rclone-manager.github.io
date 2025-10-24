import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTab = 'general' | 'downloads' | 'docs' | 'faq';

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private currentTab = new BehaviorSubject<AppTab>('general' as AppTab);
  public currentTab$ = this.currentTab.asObservable();

  setTab(tab: AppTab) {
    this.currentTab.next(tab);
  }

  getCurrentTab(): AppTab {
    return this.currentTab.getValue();
  }
}
