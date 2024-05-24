export class TrenitaliaPayload{
  departureLocationId: number = 830003026 // Udine
  arrivalLocationId: number = 830002831 // Codroipo
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
}