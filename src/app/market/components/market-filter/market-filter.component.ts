import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarketDataService } from '../../services/market-data.service';

@Component({
  selector: 'mf-market-filter',
  templateUrl: './market-filter.component.html',
  styleUrls: ['./market-filter.component.scss']
})
export class MarketFilterComponent implements OnInit {

  /**
  * create view child for market pack filter
  */
  @ViewChild('packFilter') packFilter: any;

  constructor(private _markeDataService: MarketDataService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  }

  get currentFilterStatus(): string {
    return this._markeDataService.filterToRoute;
  }

  /**
  * change market filter and set slide down animation
  *
  * @param {string} newRoute - this is route filter
  * @return {void}
  */
  filterPacksByRoutes(newRoute: string, event): void {
    if (this._markeDataService.filterToRoute !== newRoute) {
      this._markeDataService.sideUpDownAnimation = 'slideDownList';
    }
    this._markeDataService.filterToRoute = newRoute;
  }
}
