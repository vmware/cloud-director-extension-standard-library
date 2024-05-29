import { Component, OnDestroy } from "@angular/core";
import { WizardExtensionComponent } from "@vcd/sdk";
import { ModalWizardExtensionPointService } from "../services/modal-wizard-ext-point.service";

@Component({
    selector: 'vapp-create-extension',
    templateUrl: './vapp.create.wizard.action.component.html'
})
export class VappCreateWizardExtensionPointComponent extends WizardExtensionComponent<any, any, any> implements OnDestroy {
    constructor(private modalWizardExtensionPointService: ModalWizardExtensionPointService) {
        super();

        this.modalWizardExtensionPointService.inVappContext();
    }
    
    performAction(payload: string, returnValue: string, error: any) {
        console.log("[vApp Create Wizard Extension Point]", payload, returnValue, error);
        this.modalWizardExtensionPointService.storeData<string[]>([payload, returnValue]);
    }

    ngOnDestroy() {
        this.modalWizardExtensionPointService.exitVappContext();
        console.warn("[Showcase 3.0]", `${this.constructor.name} destroyed`);
    }
}