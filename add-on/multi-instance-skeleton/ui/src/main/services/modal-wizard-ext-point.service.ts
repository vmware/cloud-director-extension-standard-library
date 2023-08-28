import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ModalWizardExtensionPointService {
    inVappContextSubject = new BehaviorSubject<boolean>(false);
    inVappContextObs = this.inVappContextSubject.asObservable();

    constructor() {
        console.log("[ModalWizardExtensionPointService] Init!");
    }

    public inVappContext() {
        console.log("[ModalWizardExtensionPointService] Enter vApp Context!");
        this.inVappContextSubject.next(true);
    }

    public exitVappContext() {
        console.log("[ModalWizardExtensionPointService] Exit vApp Context!");

        this.inVappContextSubject.next(false);
    }

    public storeData<T>(data: T) {
        // Store your data
        console.log("Data stored!");
    }
}