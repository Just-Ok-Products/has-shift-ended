import { Component, Input } from '@angular/core';
import { Solution } from '../../Models/TrenitaliaResponse';

@Component({
  selector: 'app-train-card',
  templateUrl: './train-card.component.html',
  styleUrls: ['./train-card.component.css']
})
export class TrainCardComponent {

  @Input() solution: Solution | undefined;
  /** true quando questo treno è quello evidenziato dal pulsante "raggiungibile ora" (Parte G). */
  @Input() highlighted = false;

  // ponytail: euristica sui campi status/messages così come modellati oggi in TrenitaliaResponse.
  // Verificato con una chiamata reale a POST /website/ticket/solutions: per ricerche di
  // biglietti (anche a orario imminente) `status` vale SALEABLE/NOT_SALEABLE (idoneità
  // all'acquisto) e i `messages` sono note informative sulle regole di vendita, non ritardi
  // reali del treno. lefrecce.it non espone dati di ritardo in tempo reale su questo endpoint:
  // il badge resta pronto a mostrarsi se in futuro questi campi porteranno un'indicazione di
  // ritardo (es. status "DELAYED" o testo "ritardo di N min" in un messaggio).
  public get delayMinutes(): number | null {
    const texts = [
      this.solution?.solution?.status,
      ...(this.solution?.messages ?? []).map(m => `${m?.status ?? ''} ${m?.message ?? ''}`)
    ].filter((t): t is string => !!t);

    for (const text of texts) {
      if (!/delay|ritard/i.test(text)) {
        continue;
      }
      const match = text.match(/(\d+)\s*min/i);
      if (match) {
        return parseInt(match[1], 10);
      }
      return 0;
    }
    return null;
  }

}
