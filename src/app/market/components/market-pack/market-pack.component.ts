import { MarketDataService } from '../../services/market-data.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mf-market-pack',
  templateUrl: './market-pack.component.html',
  styleUrls: ['./market-pack.component.scss']
})
export class MarketPackComponent implements OnInit {

  @Input() category: string;
  @Input() title: string;
  @Input() type: string;
  @Input() price: string;
  @Input() thumbnailUrl: string;
  @Input() details: string;
  @Input() id: number;
  @Input() toggleState = false;


  constructor(private _marketDataService: MarketDataService) {
  }

  ngOnInit(): void {
  }

}
