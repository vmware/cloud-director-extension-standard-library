import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IpBindingsCreateWizardExtensionPointComponent } from './ip-bindings.create.wizard.action.component';
import { I18nModule } from "@vcd/i18n";
import { ClarityModule } from "@clr/angular";

describe('IpBindingsCreateWizardExtensionPointComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClarityModule,
        I18nModule.forChild(),
      ],
      declarations: [
        IpBindingsCreateWizardExtensionPointComponent
      ],
    }).compileComponents();
  });

  it('should create the IpBindingsCreateWizardExtensionPointComponent', () => {
    const fixture = TestBed.createComponent(IpBindingsCreateWizardExtensionPointComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
