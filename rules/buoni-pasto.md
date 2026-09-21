# I buoni pasto
Quando i requisiti per ottenere un buono pasto sono raggiunti il popup che mostrerà il totale delle ore lavorative svolte deve indicare anche il raggiungimento del buono pasto.

Per ottenere un buono pasto devono essere soddisfatti tutti questi requisiti:
- Totale di 3 ore e mezza lavorative nella prima fascia mattutina.
- Mezz'ora di pausa pranzo minimo.
- Totale di 2 ore lavorative nella seconda fascia pomeridiana.
- Totale di 7 ore lavorative giornaliere.

## Checklist durante la giornata
La checklist dei 4 requisiti si ricalcola ad ogni timbratura inserita, anche a giornata incompleta:
- ogni requisito non ancora determinabile parte da "no" (✘) di default;
- la fascia mattutina viene però segnata come raggiunta (✔) non appena il lavorato fatto finora
  (prima che venga individuata una pausa pranzo valida) raggiunge le 3h30, anche se la pausa
  pranzo e la fascia pomeridiana non sono ancora state fatte;
- pausa pranzo e fascia pomeridiana restano "no" finché non viene individuata una pausa pranzo
  valida (durata e finestra corrette): solo da quel momento la fascia mattutina si "blocca" al
  lavorato precedente la pausa, e la fascia pomeridiana viene valutata sul lavorato successivo.