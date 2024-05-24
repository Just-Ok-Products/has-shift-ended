import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//#region Material imports
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTableModule } from '@angular/material/table'
import { MatSelectModule } from '@angular/material/select'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
//#endregion


//#region Components
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { TimespanRowComponent } from './home/Components/timespan-row/timespan-row.component';
import { SnackbarService } from './snackbar.service';
import { MonthlyPlanningComponent } from './monthly-planning/monthly-planning.component';
import { TrainsModule } from './trains/trains.module';
//#endregion

@NgModule({
  declarations: [		
      AppComponent,
      HomeComponent,
      TimespanRowComponent,
      MonthlyPlanningComponent
   ],
  imports: [
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    AppRoutingModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    TrainsModule
  ],
  providers: [
    SnackbarService,
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
