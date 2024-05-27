import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainsComponent } from './trains.component';
import { HttpRequestsService } from './Services/httprequests.service';
import { TrainCardComponent } from './Components/train-card/train-card.component';

import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  declarations: [TrainsComponent, TrainCardComponent],
  providers: [HttpRequestsService]
})
export class TrainsModule { }
