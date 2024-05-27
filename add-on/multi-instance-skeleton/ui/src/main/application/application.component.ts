/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Inject } from "@angular/core";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { API_ROOT_URL } from "@vcd/sdk";
import { Observable } from "rxjs";

@Component({
    selector: "application",
    templateUrl: "./application.component.html",
    host: {'class': 'content-container'}
})
export class ApplicationComponent implements OnInit, OnDestroy {
    username: Observable<string>;
    tenant: Observable<string>;
    testInjectionToken: string;

    constructor(
        @Inject(API_ROOT_URL) API_ROOT_URL: string,
    ) {
        this.testInjectionToken = API_ROOT_URL;
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        console.warn("[Showcase 3.0]", `${this.constructor.name} destroyed`);
    }
}
