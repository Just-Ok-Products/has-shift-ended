import { Component, Input, OnInit } from '@angular/core';
import { Solution } from '../../Models/TrenitaliaResponse';

@Component({
  selector: 'app-train-card',
  templateUrl: './train-card.component.html',
  styleUrls: ['./train-card.component.css']
})
export class TrainCardComponent implements OnInit {

  @Input() solution: Solution | undefined

  constructor() { }

  ngOnInit() {
  }

}
