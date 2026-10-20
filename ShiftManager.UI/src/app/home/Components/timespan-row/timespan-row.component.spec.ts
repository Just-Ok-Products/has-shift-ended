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

  it('emette sempre la data di oggi, anche se value è datato ieri', () => {
    const now = new Date();
    component.value = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 7, 37);
    let emitted: Date | undefined;
    component.valueChange.subscribe(v => emitted = v);
    component.onTimeChange('08:02');
    expect(emitted).toEqual(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 2));
  });

  it('maschera la digitazione in HH:MM e emette solo a orario completo e valido', () => {
    const emitted: Date[] = [];
    component.valueChange.subscribe(v => emitted.push(v));
    const input = document.createElement('input');

    input.value = '143';
    component.onInput(input);
    expect(input.value).toBe('14:3');
    expect(emitted.length).toBe(0);

    input.value = '1430';
    component.onInput(input);
    expect(input.value).toBe('14:30');
    const now = new Date();
    expect(emitted).toEqual([new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30)]);

    input.value = '2560';
    component.onInput(input);
    expect(emitted.length).toBe(1);

    input.value = '9';
    component.onInput(input);
    expect(input.value).toBe('09');
  });
});
