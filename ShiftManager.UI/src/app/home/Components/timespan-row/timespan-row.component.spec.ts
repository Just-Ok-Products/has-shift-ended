import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimespanRowComponent } from './timespan-row.component';

describe('TimespanRowComponent', () => {
  let component: TimespanRowComponent;
  let fixture: ComponentFixture<TimespanRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimespanRowComponent]
    });
    fixture = TestBed.createComponent(TimespanRowComponent);
    component = fixture.componentInstance;
    component.value = new Date(2024, 0, 1, 9, 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preserva anno/mese/giorno cambiando solo ora e minuti (fix del bug su getDay)', () => {
    let emitted: Date | undefined;
    component.valueChange.subscribe(v => emitted = v);
    component.onTimeChange('14:30');
    expect(emitted).toEqual(new Date(2024, 0, 1, 14, 30));
  });
});
