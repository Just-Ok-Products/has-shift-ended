import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('con una timbratura di ieri e una di oggi calcola solo i minuti dell\'orario, non 24h in più', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 8, 19, 8, 5));
      const component = TestBed.createComponent(HomeComponent).componentInstance;
      component.intervals = [new Date(2026, 8, 18, 7, 37), new Date(2026, 8, 19, 8, 2)];
      component.onHoursDueChange(8);
      expect(component.dayState.workedMinutes).toBe(25);
      expect(component.intervals[0]).toEqual(new Date(2026, 8, 19, 7, 37));
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
