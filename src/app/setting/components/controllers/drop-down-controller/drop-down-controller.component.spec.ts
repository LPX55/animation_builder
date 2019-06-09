import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownControllerComponent } from './drop-down-controller.component';

describe('DropDownControllerComponent', () => {
  let component: DropDownControllerComponent;
  let fixture: ComponentFixture<DropDownControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropDownControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
