import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketCarouselComponent } from './market-carousel.component';

describe('MarketCarouselComponent', () => {
  let component: MarketCarouselComponent;
  let fixture: ComponentFixture<MarketCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
