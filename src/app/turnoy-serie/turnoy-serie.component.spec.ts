import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnoySerieComponent } from './turnoy-serie.component';

describe('TurnoySerieComponent', () => {
  let component: TurnoySerieComponent;
  let fixture: ComponentFixture<TurnoySerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnoySerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnoySerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
