import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainsComponent } from './trains.component';
import { HttpRequestsService } from './Services/httprequests.service';
import { TrainCardComponent } from './Components/train-card/train-card.component';
import { StationSearchComponent } from './Components/station-search/station-search.component';

import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  declarations: [TrainsComponent, TrainCardComponent, StationSearchComponent],
  providers: [HttpRequestsService]
})
export class TrainsModule { }
