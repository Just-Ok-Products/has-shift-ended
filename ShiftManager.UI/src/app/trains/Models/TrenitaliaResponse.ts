export interface TrenitaliaResponse {

  searchId: string,
  cartId: string,
  highlightedMessages: [],
  solutions: Solution[],
  minimumPrices: []
}

export interface Solution {
  solution: {
    _type: string,
    id: string,
    origin: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    duration: string,
    status: string,
    trains: {
            description: string,
            trainCategory: string,
            acronym: string,
            denomination: string,
            name: string,
            logoId: string,
            urban: boolean
      }[],
      price: {
        amount: number,
        currency: string,
        originalAmount: number,
        indicative: boolean
      },
      discounts: [],
      nodes: {
              id: string,
              origin: string,
              destination: string,
              departureTime: Date,
              arrivalTime: Date,
              salable: boolean,
              train: {
                  description: string,
                  trainCategory: string,
                  acronym: string,
                  denomination: string,
                  name: string,
                  logoId: string,
                  urban: boolean
              }
          }[],
      additionalPrice: number
  },
  grids: [],
  customizes: [],
  stopList: [],
  messages: {
          imageId: string,
          message: string,
          status: string
      }[],
  availabilities: [],
  nextDaySolution: boolean,
  tooltip: {
      nodeServices: [],
      loyaltyPoints: number,
      regionalLoyaltyPoints: number
  },
  canShowSeatMap: boolean,
  notAllOfferGroupStandard: boolean,
  silenceArea: boolean,
  fastPurchase: boolean,
  canShowGrid: boolean,
  co2Emission: any
}

