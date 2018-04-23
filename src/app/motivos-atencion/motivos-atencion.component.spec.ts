import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivosAtencionComponent } from './motivos-atencion.component';

describe('MotivosAtencionComponent', () => {
  let component: MotivosAtencionComponent;
  let fixture: ComponentFixture<MotivosAtencionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotivosAtencionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivosAtencionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
