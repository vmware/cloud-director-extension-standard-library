/*
 * Copyright 2018 VMware, Inc. All rights reserved. VMware Confidential
 */
import {Component, Inject} from "@angular/core";
import {EXTENSION_ASSET_URL} from '@vcd/sdk';

@Component({
    selector: "vcd-plugin-status",
    template: `
        <div>
            <h1>{{"subnav.status.content" | translate:today}}</h1>
            <p>{{ date | date }}</p>
        </div>

    `
})
export class StatusComponent {
    today: String = new Date().toLocaleString();
    date: Date = new Date();
    
    constructor(@Inject(EXTENSION_ASSET_URL) public assetUrl: string) {}
}
