import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfEjeComponent } from './conf-eje.component';

describe('ConfEjeComponent', () => {
  let component: ConfEjeComponent;
  let fixture: ComponentFixture<ConfEjeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfEjeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfEjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
