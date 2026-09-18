import { TestBed } from '@angular/core/testing';
import { TrainSuggestionService } from './train-suggestion.service';
import { Solution } from '../../trains/Models/TrenitaliaResponse';

function d(hours: number, minutes: number): Date {
  return new Date(2024, 0, 1, hours, minutes, 0, 0);
}

function solutionAt(departureTime: Date, id: string = 's'): Solution {
  return { solution: { id, departureTime } } as unknown as Solution;
}

describe('Service: TrainSuggestion', () => {
  let service: TrainSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrainSuggestionService]
    });
    service = TestBed.inject(TrainSuggestionService);
    service.marginMinutes = 15;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSuggestedDeparture', () => {
    it('nessun treno disponibile -> null', () => {
      service.setSolutions([]);
      expect(service.getSuggestedDeparture(d(17, 0))).toBeNull();
    });

    it('un solo treno esattamente al limite -> quello', () => {
      // treno alle 17:15, scarto 15 min -> uscita alle 17:00, esattamente = soglia
      service.setSolutions([solutionAt(d(17, 15))]);
      expect(service.getSuggestedDeparture(d(17, 0))).toEqual(d(17, 0));
    });

    it('nessun treno raggiunge la soglia -> null', () => {
      // treno alle 17:10, scarto 15 min -> uscita alle 16:55, prima della soglia 17:00
      service.setSolutions([solutionAt(d(17, 10))]);
      expect(service.getSuggestedDeparture(d(17, 0))).toBeNull();
    });

    it('più treni disponibili -> il più tardivo tra quelli validi', () => {
      const early = solutionAt(d(17, 15), 'early');   // uscita 17:00, valido
      const late = solutionAt(d(18, 0), 'late');       // uscita 17:45, valido, più tardivo
      const tooSoon = solutionAt(d(17, 5), 'tooSoon');  // uscita 16:50, non valido
      service.setSolutions([early, late, tooSoon]);
      expect(service.getSuggestedDeparture(d(17, 0))).toEqual(d(17, 45));
    });
  });

  describe('getReachableNow', () => {
    it('lista vuota -> null', () => {
      service.setSolutions([]);
      expect(service.getReachableNow(d(17, 0))).toBeNull();
    });

    it('con risultati -> il treno raggiungibile con partenza più vicina', () => {
      const soon = solutionAt(d(17, 20), 'soon');   // uscita 17:05, raggiungibile
      const later = solutionAt(d(18, 0), 'later');   // uscita 17:45, raggiungibile ma più tardi
      const past = solutionAt(d(17, 10), 'past');    // uscita 16:55, non più raggiungibile
      service.setSolutions([past, later, soon]);
      expect(service.getReachableNow(d(17, 0))).toEqual(soon);
    });
  });

  describe('hasSearched', () => {
    it('false prima di ogni ricerca, true dopo setSolutions con risultati', () => {
      expect(service.hasSearched()).toBeFalse();
      service.setSolutions([solutionAt(d(17, 0))]);
      expect(service.hasSearched()).toBeTrue();
    });
  });
});
