import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedFolderComponent } from './added-folder.component';

describe('AddedFolderComponent', () => {
  let component: AddedFolderComponent;
  let fixture: ComponentFixture<AddedFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddedFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddedFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
