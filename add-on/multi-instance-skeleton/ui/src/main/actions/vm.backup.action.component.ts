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
    selector: 'vm-backup-action-extension',
    templateUrl: './vm.backup.action.component.html'
})
export class VmBackupActionComponent extends EntityActionExtensionComponent implements OnDestroy {
    modalText = "";
    opened = false;

    private result: Subject<{ refreshRequested: boolean }>;

    constructor(private translationService: TranslationService) {
        super();
    }

    getMenuEntry(entityUrn: string): Observable<EntityActionExtensionMenuEntry> {
        return of({
            text: this.translationService.translate("vm.action.backup"),
            children: [{
                urn: "vmware:vcloud:vm-action:backup2",
                text: "Backup",
                busy: false,
                enabled: true
            },
            {
                urn: "urn:vmware:vcloud:vm:deleteBackup2",
                text: "Delete Backups",
                busy: false,
                enabled: false
            }]
        });
    }

    performAction(menuItemUrn: string, entityUrn: string): Observable<{ refreshRequested: boolean }> {
        this.modalText = `Entity: ${entityUrn}  Action: ${menuItemUrn}`;
        this.opened = true;
        this.result = new Subject<{ refreshRequested: boolean }>();

        console.log("[Showcase 2.0]", "Backup");

        return this.result.asObservable();
    }

    onClose() {
        this.opened = false;
        this.result.next({ refreshRequested: true });
        this.result.complete();
    }

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }
}
