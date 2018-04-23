import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeditComponent } from './idedit.component';

describe('IdeditComponent', () => {
  let component: IdeditComponent;
  let fixture: ComponentFixture<IdeditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdeditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
