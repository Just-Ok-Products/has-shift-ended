import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DaySceneComponent } from './day-scene.component';

describe('DaySceneComponent', () => {
  let component: DaySceneComponent;
  let fixture: ComponentFixture<DaySceneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [DaySceneComponent] });
    fixture = TestBed.createComponent(DaySceneComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ngOnChanges non scatta assegnando le proprietà direttamente nei test (serve un binding
  // di template): lo invochiamo a mano dopo ogni modifica, come farebbe Angular in runtime.

  it('pc segue il progresso e satura a 1 oltre il 100%', () => {
    component.progress = 0.5;
    component.ngOnChanges();
    expect(component.pc).toBeCloseTo(0.5);

    component.progress = 1.4;
    component.ngOnChanges();
    expect(component.pc).toBe(1);
  });

  it('ov satura a 1 dopo 120 minuti di straordinario', () => {
    component.progress = 1;
    component.overtimeMinutes = 60;
    component.ngOnChanges();
    expect(component.ov).toBeCloseTo(0.5);

    component.overtimeMinutes = 300;
    component.ngOnChanges();
    expect(component.ov).toBe(1);
  });

  it('mostra la posa corretta per stato', () => {
    component.status = 'working';
    component.ngOnChanges();
    expect(component.isHenVisible('pecking')).toBeTrue();
    expect(component.isHenVisible('idle')).toBeFalse();
  });

  it('in stato incoherent la scena resta congelata all\'ultimo stato valido', () => {
    component.status = 'working';
    component.progress = 0.5;
    component.mealVoucherEarned = true;
    component.ngOnChanges();

    component.status = 'incoherent';
    component.progress = 0; // dati intermedi non affidabili mentre si corregge una timbratura
    component.mealVoucherEarned = false;
    component.ngOnChanges();

    expect(component.pc).toBeCloseTo(0.5);
    expect(component.isHenVisible('pecking')).toBeTrue();
    expect(component.earned).toBeTrue();
  });
});
