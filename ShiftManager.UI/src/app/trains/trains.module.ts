import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainsComponent } from './trains.component';
import { HttpRequestsService } from './Services/httprequests.service';
import { TrainCardComponent } from './Components/train-card/train-card.component';
import { StationSearchComponent } from './Components/station-search/station-search.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [TrainsComponent, TrainCardComponent, StationSearchComponent],
  providers: [HttpRequestsService],
  exports: [TrainsComponent]
})
export class TrainsModule { }
