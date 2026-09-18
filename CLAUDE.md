# Scopo
Stai sviluppando un applicazione per calcolare il saldo di tempo giornaliero passato a lavoro. Le timbrature indicano i vari ingressi ed uscite. Il calcolo delle varie timbrature dà un totale orario che indica quanto si è lavorato in quella giornata.

## Features già presenti
- l'inserimento manuale delle timbrature con il calcolo totale delle ore e minuti lavorativi fatti.
- la modifica delle ore minime richieste nella giornata

## Features mancanti
- il calcolo del conseguimento del buono pasto in base alle timbrature
- la visualizzazione dei treni disponibili per il ritorno a casa con segnalazione di possibili ritardi
- CI/CD automatica senza fare deploy manuali

# Architettura
Il programma mira ad essere principalmente se non totalmente frontend utilizzando angular. La pagina web è esposta da github pages utilizzando il branch gh-pages.

In caso si ritrovi necessario verrà utilizzato un backend in dotnet.

## Sicurezza
Si tratta di un applicazione che non immagazzina i dati utente e non ci sono login. La pagina web viene utilizzata per quel momento ed alla chiusura tutto viene cancellato.