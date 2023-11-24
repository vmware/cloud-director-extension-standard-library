import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationComponent } from './application.component';
import { I18nModule } from "@vcd/i18n";
import { ClarityModule } from "@clr/angular";

describe('ApplicationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClarityModule,
        I18nModule.forChild(),
      ],
      declarations: [
        ApplicationComponent
      ],
      providers: [
        { provide: "API_ROOT_URL", useValue: "https://localhost" },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.testInjectionToken).toEqual("https://localhost");
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(ApplicationComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Application Extensibility Works!');
  });
});
