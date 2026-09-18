import { Injectable } from '@angular/core';
import { Solution } from '../../trains/Models/TrenitaliaResponse';

/**
 * Stato condiviso (in memoria, per la sola sessione del browser) tra la ricerca treni su
 * /trains e il suggerimento "orario di uscita ideale" mostrato in home.
 * Nessuna persistenza: se l'utente non ha mai cercato treni, non c'è nulla da suggerire.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainSuggestionService {

  /** Minuti che l'utente indica per raggiungere la stazione (lo "scarto" della spec). */
  public marginMinutes: number = 15;

  private solutions: Solution[] = [];

  public setSolutions(solutions: Solution[]): void {
    this.solutions = solutions ?? [];
  }

  public hasSearched(): boolean {
    return this.solutions.length > 0;
  }

  /**
   * Tra i treni con partenza (al netto dello scarto) raggiungibile a partire da
   * hoursDueReachedAt, ritorna l'orario di uscita suggerito per quello con partenza più
   * tardiva (massimizza la permanenza a lavoro). Null se nessun treno soddisfa la condizione.
   */
  public getSuggestedDeparture(hoursDueReachedAt: Date): Date | null {
    const latest = this.latestReachableAfter(hoursDueReachedAt);
    return latest ? this.exitTimeFor(latest) : null;
  }

  /**
   * Treno raggiungibile più vicino nel tempo, senza considerare hoursDue: il primo la cui
   * partenza meno lo scarto è ancora nel futuro rispetto a `now`. Null se nessuno è raggiungibile.
   */
  public getReachableNow(now: Date = new Date()): Solution | null {
    const reachable = this.solutions
      .filter(s => this.exitTimeFor(s).getTime() >= now.getTime())
      .sort((a, b) => this.departureOf(a).getTime() - this.departureOf(b).getTime());
    return reachable[0] ?? null;
  }

  private latestReachableAfter(threshold: Date): Solution | null {
    const valid = this.solutions.filter(s => this.exitTimeFor(s).getTime() >= threshold.getTime());
    if (valid.length === 0) {
      return null;
    }
    return valid.reduce((latest, s) => this.departureOf(s) > this.departureOf(latest) ? s : latest);
  }

  private exitTimeFor(solution: Solution): Date {
    return new Date(this.departureOf(solution).getTime() - this.marginMinutes * 60000);
  }

  private departureOf(solution: Solution): Date {
    return new Date(solution.solution.departureTime);
  }
}
