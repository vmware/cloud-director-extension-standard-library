import { Component, OnDestroy } from "@angular/core";
import { WizardExtensionWithContextComponent } from "@vcd/sdk";

@Component({
    selector: 'ip-bindings-create-extension',
    templateUrl: './ip-bindings.create.wizard.action.component.html'
})
export class IpBindingsCreateWizardExtensionPointComponent extends WizardExtensionWithContextComponent<any, any, any> implements OnDestroy {
    id: string;
    
    constructor() {
        super();
    }

    onContext(context: string): void {
        this.id = context;
    }
    
    performAction(payload: string, returnValue: string, error: any) {
        console.log("[IP Bindings Create Wizard Extension Point]", payload, returnValue, error);
    }

    ngOnDestroy() {
        console.warn("[Showcase 3.0]", `${this.constructor.name} destroyed`);
    }
}