/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable } from "rxjs";

@Component({
    selector: "application",
    templateUrl: "./application.component.html",
    host: {'class': 'content-container'}
})
export class ApplicationComponent implements OnInit, OnDestroy {
    username: Observable<string>;
    tenant: Observable<string>;

    constructor() {}

    ngOnInit(): void {}

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }
}
