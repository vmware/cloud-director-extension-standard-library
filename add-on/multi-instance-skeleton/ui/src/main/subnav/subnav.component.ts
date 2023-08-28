/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Component, Inject, OnDestroy } from "@angular/core";
import {EXTENSION_ASSET_URL} from '@vcd/sdk';

@Component({
    selector: "plugin-subnav",
    templateUrl: "./subnav.component.html",
    host: {'class': 'content-container'},
    styleUrls: ["subnav.component.scss"],
})
export class SubnavComponent implements OnDestroy {
    navItems: any[] = [
        { routerLink: "./status", iconShape: "help-info", labelKey: "subnav.menu.status" },
        { routerLink: "./about", iconShape: "helix", labelKey: "subnav.menu.about" }
    ];
    
    constructor(@Inject(EXTENSION_ASSET_URL) public assetUrl: string) {}

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }
}
