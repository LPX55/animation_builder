import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPackDetailComponent } from './market-pack-detail.component';

describe('MarketPackDetailComponent', () => {
  let component: MarketPackDetailComponent;
  let fixture: ComponentFixture<MarketPackDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketPackDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketPackDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
