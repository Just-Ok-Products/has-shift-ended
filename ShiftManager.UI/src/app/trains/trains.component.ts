import { Component, OnInit } from '@angular/core';
import { HttpRequestsService } from './Services/httprequests.service';
import { TrenitaliaPayload } from './Models/TrenitaliaPayload';
import { TrenitaliaResponse } from './Models/TrenitaliaResponse';

@Component({
  selector: 'app-trains',
  templateUrl: './trains.component.html',
  styleUrls: ['./trains.component.css']
})
export class TrainsComponent implements OnInit {

  private httpRequestUrl = 'https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions'
  public isLoading = false;

  public dataFromTrenitalia: TrenitaliaResponse | undefined

  constructor(
    private httprequests: HttpRequestsService
  ) { }

  async ngOnInit() {
    let body = new TrenitaliaPayload()
    body.criteria.limit = 25
    console.log(body)
    this.isLoading = true;
    const response = await this.httprequests.apiPost<TrenitaliaResponse>(this.httpRequestUrl, body)
    this.isLoading = false
    console.log(response.result)
    if (!response.result) {
      return;
    }
    console.log('Response', response.body)
    this.dataFromTrenitalia = response.body[0]
  }

}
