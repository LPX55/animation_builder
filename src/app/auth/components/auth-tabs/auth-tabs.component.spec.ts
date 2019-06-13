import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthTabsComponent } from './auth-tabs.component';

describe('AuthTabsComponent', () => {
  let component: AuthTabsComponent;
  let fixture: ComponentFixture<AuthTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
