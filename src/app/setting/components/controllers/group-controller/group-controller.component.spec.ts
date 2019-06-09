import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupControllerComponent } from './group-controller.component';

describe('GroupControllerComponent', () => {
  let component: GroupControllerComponent;
  let fixture: ComponentFixture<GroupControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
