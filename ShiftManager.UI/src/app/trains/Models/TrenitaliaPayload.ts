// Default: Udine -> Codroipo, usati finché l'utente non sceglie altre stazioni dall'autocomplete.
export const DEFAULT_DEPARTURE_LOCATION_ID = 830003026;
export const DEFAULT_ARRIVAL_LOCATION_ID = 830002831;

export class TrenitaliaPayload{
  departureLocationId: number
  arrivalLocationId: number
  departureTime: Date = new Date()
  adults: number = 1
  children: number = 0
  criteria = {
      frecceOnly: false,
      regionalOnly: false,
      intercityOnly: false,
      noChanges: false,
      order: "DEPARTURE_DATE",
      offset: 0,
      limit: 10
  }
  advancedSearchRequest = {
      bestFare: false,
      bikeFilter: false
  }

  constructor(
    departureLocationId: number = DEFAULT_DEPARTURE_LOCATION_ID,
    arrivalLocationId: number = DEFAULT_ARRIVAL_LOCATION_ID
  ) {
    this.departureLocationId = departureLocationId;
    this.arrivalLocationId = arrivalLocationId;
  }
}