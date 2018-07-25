import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DerivarSerieComponent } from './derivar-serie.component';

describe('DerivarSerieComponent', () => {
  let component: DerivarSerieComponent;
  let fixture: ComponentFixture<DerivarSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DerivarSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DerivarSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
