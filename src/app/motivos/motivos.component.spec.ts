import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivosComponent } from './motivos.component';

describe('MotivosComponent', () => {
  let component: MotivosComponent;
  let fixture: ComponentFixture<MotivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
