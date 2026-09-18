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
});
