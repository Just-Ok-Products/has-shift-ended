import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

//#region Components
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { TimespanRowComponent } from './home/Components/timespan-row/timespan-row.component';
import { DayHeroComponent } from './home/Components/day-hero/day-hero.component';
import { DaySceneComponent } from './home/Components/day-scene/day-scene.component';
import { TrainsModule } from './trains/trains.module';
import { LocaleService } from './Services/locale.service';
//#endregion

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TimespanRowComponent,
    DayHeroComponent,
    DaySceneComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    TrainsModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    DatePipe,
    {
      provide: LOCALE_ID,
      useFactory: (localeService: LocaleService) => localeService.getBrowserLocale(),
      deps: [LocaleService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
