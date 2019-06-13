import { TestBed, inject } from '@angular/core/testing';

import { MarketDataService } from './market-data.service';

describe('MarketDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarketDataService]
    });
  });

  it('should be created', inject([MarketDataService], (service: MarketDataService) => {
    expect(service).toBeTruthy();
  }));
});
