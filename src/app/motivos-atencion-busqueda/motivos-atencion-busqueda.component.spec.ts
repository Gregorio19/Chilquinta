import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivosAtencionBusquedaComponent } from './motivos-atencion-busqueda.component';

describe('MotivosAtencionBusquedaComponent', () => {
  let component: MotivosAtencionBusquedaComponent;
  let fixture: ComponentFixture<MotivosAtencionBusquedaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotivosAtencionBusquedaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivosAtencionBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
