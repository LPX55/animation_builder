import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingMessageBoxComponent } from './missing-message-box.component';

describe('MissingMessageBoxComponent', () => {
  let component: MissingMessageBoxComponent;
  let fixture: ComponentFixture<MissingMessageBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissingMessageBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingMessageBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
