import { Component, Input, OnChanges } from '@angular/core';
import { DayStatus } from '../../services/day-calculator.service';

type ScenePose = 'idle' | 'pecking' | 'sitting' | 'wings';

const POSE_BY_STATUS: Record<'empty' | 'working' | 'onBreak' | 'done', ScenePose> = {
  empty: 'idle',
  working: 'pecking',
  onBreak: 'sitting',
  done: 'wings'
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Scena low poly: lago all'orizzonte, gallina sulla riva. Il sole codifica il progresso
 * quantitativo (tocca l'acqua a progress=1), la gallina lo stato qualitativo, la ciotola
 * il buono pasto. Nessun requestAnimationFrame: solo transizioni CSS su [data-anim].
 */
@Component({
  selector: 'app-day-scene',
  templateUrl: './day-scene.component.html',
  styleUrls: ['./day-scene.component.css']
})
export class DaySceneComponent implements OnChanges {

  @Input() progress = 0;
  @Input() overtimeMinutes = 0;
  @Input() status: DayStatus = 'empty';
  @Input() mealVoucherEarned = false;

  // Lo stato "incoherent" non ha una rappresentazione dedicata: l'intera scena (sole,
  // posa, ciotola) resta congelata all'ultimo valore valido, il messaggio è nell'hero.
  private lastVisibleStatus: 'empty' | 'working' | 'onBreak' | 'done' = 'empty';
  private lastVisibleProgress = 0;
  private lastVisibleOvertime = 0;
  private lastVisibleMealVoucherEarned = false;

  ngOnChanges(): void {
    if (this.status !== 'incoherent') {
      this.lastVisibleStatus = this.status;
      this.lastVisibleProgress = this.progress;
      this.lastVisibleOvertime = this.overtimeMinutes;
      this.lastVisibleMealVoucherEarned = this.mealVoucherEarned;
    }
  }

  public get pc(): number {
    return clamp01(this.lastVisibleProgress);
  }

  public get ov(): number {
    return clamp01(this.lastVisibleOvertime / 120);
  }

  public get earned(): boolean {
    return this.lastVisibleMealVoucherEarned;
  }

  public get sunX(): number {
    return 230 + 70 * this.pc;
  }

  public get sunY(): number {
    return 44 + 108 * this.pc + 48 * this.ov;
  }

  public get sunTransform(): string {
    return `translate(${this.sunX},${this.sunY})`;
  }

  public get reflectionTransform(): string {
    return `translate(${this.sunX},171) scale(1,${this.pc})`;
  }

  public get reflectionOpacity(): number {
    return (0.25 + 0.75 * this.pc) * (1 - 0.85 * this.ov);
  }

  public get duskOpacity(): number {
    return Math.pow(this.pc, 0.8);
  }

  public get nightOpacity(): number {
    return this.ov;
  }

  public get waterNightOpacity(): number {
    return 0.85 * this.ov;
  }

  public get starsOpacity(): number {
    return this.ov;
  }

  public isHenVisible(pose: ScenePose): boolean {
    return POSE_BY_STATUS[this.lastVisibleStatus] === pose;
  }
}
