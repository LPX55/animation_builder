import { JsxInjectorService } from '../../../core/services/jsx-injector/jsx-injector.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mf-market-author',
  templateUrl: './market-author.component.html',
  styleUrls: ['./market-author.component.scss']
})
export class MarketAuthorComponent implements OnInit {

  @Input() color: string;
  @Input() authorName: string;
  @Input() authorDescription: string;
  @Input() authorIcon: string;
  @Input() authorImage: string;
  @Input() authorLinks: string;
  @Input() authorBtnText: string;

  constructor(private _jsxInjectorService: JsxInjectorService) { }

  ngOnInit(): void {

  }

  /**
* author button link
* @return {void}
*/
  authorLink(): void {
    this._jsxInjectorService.openUrlInBrowser(this.authorLinks, '');
  }

}
