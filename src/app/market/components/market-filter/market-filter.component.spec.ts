import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketFilterComponent } from './market-filter.component';

describe('MarketFilterComponent', () => {
  let component: MarketFilterComponent;
  let fixture: ComponentFixture<MarketFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
