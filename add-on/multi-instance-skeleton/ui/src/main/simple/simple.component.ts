/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { EXTENSION_ASSET_URL, VcdApiClient, Query  } from '@vcd/sdk';
import { Observable } from "rxjs";

/**
 * Simple showcase component.
 */
@Component({
    selector: "plugin-simple",
    templateUrl: "./simple.component.html",
    styles: [`
        .simple-content {
            padding: 2rem;
        }`
    ]
})
export class SimpleComponent implements OnInit, OnDestroy {
    username: Observable<string>;
    tenant: Observable<string>;

    constructor(@Inject(EXTENSION_ASSET_URL) public assetUrl: string, private client: VcdApiClient) {}

    ngOnInit(): void {
        this.tenant = this.client.organization;
        this.username = this.client.username
        
        this.client.query(Query.Builder.ofType("organization").links(false)).subscribe(results => {
            console.log(results);
        });
    }

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }
}
