/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Component, OnDestroy } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import {
    EntityActionExtensionComponent,
    EntityActionExtensionMenuEntry
} from "@vcd/sdk";
import { TranslationService } from "@vcd/i18n";

@Component({
    selector: 'vapp-restore-action-extension',
    templateUrl: './vapp.restore.action.component.html'
})
export class VappRestoreActionComponent extends EntityActionExtensionComponent implements OnDestroy {
    modalText = "";
    opened = false;

    private result: Subject<{ refreshRequested: boolean }>;

    constructor(private translationService: TranslationService) {
        super();
    }

    getMenuEntry(entityUrn: string): Observable<EntityActionExtensionMenuEntry> {
        return of({
            text: this.translationService.translate("vapp.action.restore"),
            children: [{
                urn: "urn:vmware:vcloud:vapp:restore2",
                text: "Restore VMs",
                busy: false,
                enabled: true
            },
            {
                urn: "urn:vmware:vcloud:vapp:restoreAll2",
                text: "Restore All VMs",
                busy: false,
                enabled: false
            },
            {
                urn: "urn:vmware:vcloud:vapp:viewSnaphots2",
                text: "View Restore Points",
                busy: false,
                enabled: true
            }]
        });
    }

    performAction(menuItemUrn: string, entityUrn: string): Observable<{ refreshRequested: boolean }> {
        this.modalText = `Entity: ${entityUrn}  Action: ${menuItemUrn}`;
        this.opened = true;
        this.result = new Subject<{ refreshRequested: boolean }>();

        console.log("[Showcase 2.0]", "Restore");

        return this.result.asObservable();
    }

    onClose() {
        this.opened = false;
        this.result.next({ refreshRequested: true });
        this.result.complete();
    }

    ngOnDestroy(): void {
        console.warn(`[Showcase 2.0]`, `${this.constructor.name} destroyed`);
    }
}
