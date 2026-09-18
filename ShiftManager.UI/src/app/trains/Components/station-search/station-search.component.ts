import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HttpRequestsService } from '../../Services/httprequests.service';

export interface Station {
  id: number;
  name: string;
}

@Component({
  selector: 'app-station-search',
  templateUrl: './station-search.component.html',
  styleUrls: ['./station-search.component.css']
})
export class StationSearchComponent implements OnDestroy {

  @Input() label: string = 'Stazione';
  @Input() query: string = '';
  @Output() stationSelected = new EventEmitter<Station>();

  public results: Station[] = [];

  private search$ = new Subject<string>();

  constructor(private httprequests: HttpRequestsService) {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(name => name.trim().length < 2
        ? Promise.resolve([] as Station[])
        : this.httprequests.apiGet<Station>(`api/trains/stations?name=${encodeURIComponent(name)}`)
            .then(response => response.result ? response.body : [])
      )
    ).subscribe(results => this.results = results);
  }

  public onInput(value: string) {
    this.query = value;
    this.search$.next(value);
  }

  public select(station: Station) {
    this.query = station.name;
    this.results = [];
    this.stationSelected.emit(station);
  }

  ngOnDestroy() {
    this.search$.complete();
  }
}
