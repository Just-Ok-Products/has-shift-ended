/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MovementChipComponent } from './movement-chip.component';

describe('MovementChipComponent', () => {
  let component: MovementChipComponent;
  let fixture: ComponentFixture<MovementChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementChipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
