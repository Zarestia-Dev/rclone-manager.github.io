import { Component, OnInit, OnDestroy } from '@angular/core';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Home } from './pages/home/home';
import { Downloads } from './pages/downloads/downloads';
import { Docs } from './pages/docs/docs';
import { Faq } from './pages/faq/faq';
import { TabService, AppTab } from './services/tab.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [Navbar, Footer, Home, Downloads, Docs, Faq],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'RClone Manager';
  loaded = true;
  currentTab: AppTab = 'general';
  private sub?: Subscription;

  constructor(private tabService: TabService) {}

  ngOnInit() {
    // subscribe to tab changes
    this.sub = this.tabService.currentTab$.subscribe(t => {
      this.currentTab = t;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
