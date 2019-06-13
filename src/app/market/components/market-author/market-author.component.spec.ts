import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketAuthorComponent } from './market-author.component';

describe('MarketAuthorComponent', () => {
  let component: MarketAuthorComponent;
  let fixture: ComponentFixture<MarketAuthorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
