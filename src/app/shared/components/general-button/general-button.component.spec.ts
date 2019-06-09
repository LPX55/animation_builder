import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralButtonComponent } from './general-button.component';

describe('GeneralButtonComponent', () => {
  let component: GeneralButtonComponent;
  let fixture: ComponentFixture<GeneralButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
