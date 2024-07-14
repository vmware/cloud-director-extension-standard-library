import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VappRestoreActionComponent } from './vapp.restore.action.component';
import { I18nModule } from "@vcd/i18n";
import { ClarityModule } from "@clr/angular";

describe('VappRestoreActionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClarityModule,
        I18nModule.forChild(),
      ],
      declarations: [
        VappRestoreActionComponent
      ],
    }).compileComponents();
  });

  it('should create the VappRestoreActionComponent', () => {
    const fixture = TestBed.createComponent(VappRestoreActionComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
