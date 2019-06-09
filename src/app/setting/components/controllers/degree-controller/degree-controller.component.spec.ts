import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DegreeControllerComponent } from './degree-controller.component';

describe('DegreeControllerComponent', () => {
  let component: DegreeControllerComponent;
  let fixture: ComponentFixture<DegreeControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DegreeControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DegreeControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
