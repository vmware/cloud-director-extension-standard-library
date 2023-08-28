import { Component, OnDestroy } from "@angular/core";
import { WizardExtensionState, WizardExtensionWithValidationComponent } from "@vcd/sdk";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";

@Component({
    selector: 'org-create-extension',
    templateUrl: './org.create.wizard.action.component.html'
})
export class OrgCreateWizardExtensionPointComponent extends WizardExtensionWithValidationComponent<any, any, any> implements OnDestroy {
    form: FormGroup;
    
    private stateSubject = new BehaviorSubject<{
        isValid: boolean
    }>(null);
    private stateObs = this.stateSubject.asObservable();
    
    constructor(
        private fb: FormBuilder,
    ) {
        super();

        this.form = this.fb.group({
            "example": new FormControl(null, Validators.required)
        });
        this.stateSubject.next({
            isValid: this.form.valid
        });
        this.setState();
    }

    ngOnDestroy() {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }

    performAction(payload: string, returnValue: string, error: any) {
        console.log("[Org Create Wizard Extension Point]", payload, returnValue, error);
    }

    setState() {
        this.form.statusChanges.subscribe(() => {
            this.stateSubject.next({
                isValid: this.form.valid
            });
        });
    }

    getState(): Observable<WizardExtensionState> {
        return this.stateObs;
    }
}