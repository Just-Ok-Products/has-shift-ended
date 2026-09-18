import { Component } from '@angular/core';
import { HttpRequestsService } from './Services/httprequests.service';
import { TrenitaliaPayload, DEFAULT_DEPARTURE_LOCATION_ID } from './Models/TrenitaliaPayload';
import { TrenitaliaResponse, Solution } from './Models/TrenitaliaResponse';
import { Station } from './Components/station-search/station-search.component';
import { TrainSuggestionService } from '../shared/services/train-suggestion.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-trains',
  templateUrl: './trains.component.html',
  styleUrls: ['./trains.component.css']
})
export class TrainsComponent {

  private solutionsUrl = `${environment.apiBaseUrl}/api/trains/solutions`;
  public isLoading = false;

  public dataFromTrenitalia: TrenitaliaResponse | undefined;

  public departureLocationId: number = DEFAULT_DEPARTURE_LOCATION_ID;
  public arrivalLocationId: number | null = null;

  public reachableNow: Solution | null = null;
  public showReachableNow = false;

  constructor(
    private httprequests: HttpRequestsService,
    public trainSuggestionService: TrainSuggestionService
  ) { }

  public onDepartureSelected(station: Station) {
    this.departureLocationId = station.id;
  }

  public onArrivalSelected(station: Station) {
    this.arrivalLocationId = station.id;
  }

  // Nessuna ricerca automatica al caricamento: solo su richiesta esplicita dell'utente,
  // e solo quando ha scelto una stazione di arrivo (quella di partenza ha un default visibile).
  public async search() {
    if (!this.arrivalLocationId) {
      return;
    }
    const body = new TrenitaliaPayload(this.departureLocationId, this.arrivalLocationId);
    body.criteria.limit = 25;
    this.isLoading = true;
    this.showReachableNow = false;
    this.reachableNow = null;
    const response = await this.httprequests.apiPost<TrenitaliaResponse>(this.solutionsUrl, body);
    this.isLoading = false;
    if (!response.result) {
      return;
    }
    this.dataFromTrenitalia = response.body[0];
    this.trainSuggestionService.setSolutions(this.dataFromTrenitalia?.solutions ?? []);
  }

  public toggleReachableNow() {
    this.showReachableNow = !this.showReachableNow;
    this.reachableNow = this.showReachableNow ? this.trainSuggestionService.getReachableNow() : null;
  }

  public isReachableNow(solution: Solution): boolean {
    return this.showReachableNow && this.reachableNow?.solution?.id === solution.solution?.id;
  }

}
