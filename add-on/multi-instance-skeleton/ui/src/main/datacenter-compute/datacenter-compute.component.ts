/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import {
    EntityContextExtensionInterface
} from "../common/entity-context-extension.interface";

@Component({
    selector: "datacenter-compute",
    templateUrl: "./datacenter-compute.component.html",
    host: {'class': 'content-container'}
})
export class DatacenterComputeComponent implements EntityContextExtensionInterface, OnInit, OnDestroy {
    username: Observable<string>;
    tenant: Observable<string>;

    contextEntityId: string = "";

    contextUrn(entityId: string) {
        this.contextEntityId = entityId;
    }

    constructor() {}

    ngOnInit(): void {}

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }
}
