import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPackComponent } from './market-pack.component';

describe('MarketPackComponent', () => {
  let component: MarketPackComponent;
  let fixture: ComponentFixture<MarketPackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketPackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketPackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
