import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePackComponent } from './template-pack.component';

describe('TemplatePackComponent', () => {
  let component: TemplatePackComponent;
  let fixture: ComponentFixture<TemplatePackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplatePackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatePackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
