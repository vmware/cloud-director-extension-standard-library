/*
 * Copyright 2022 VMware, Inc. All rights reserved. VMware Confidential
 */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { take } from "rxjs/operators";

@Injectable({ providedIn: "root"})
export class ExtensionContainerGuard implements CanDeactivate<any> {
    constructor() {}

    canDeactivate(
        component: any,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot): Promise<boolean>  | boolean {
            console.warn("[Showcase 3.0]", "ExtensionContainerGuard called");
        return true;
    }
}