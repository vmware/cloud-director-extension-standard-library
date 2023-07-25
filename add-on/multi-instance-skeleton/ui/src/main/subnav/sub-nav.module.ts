/*
 * Copyright 2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { CommonModule } from "@angular/common";
import { Inject, NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClarityModule } from "@clr/angular";
import { I18nModule, TranslationService } from "@vcd/i18n";
import { API_ROOT_URL, AuthTokenHolderService, EXTENSION_ASSET_URL, EXTENSION_ROUTE, FLEX_APP_URL, SDK_MODE, SESSION_ORGANIZATION, SESSION_ORG_ID, SESSION_SCOPE, VcdApiClient, VcdSdkModule } from "@vcd/sdk";
import { ModalWizardExtensionPointService } from "../services/modal-wizard-ext-point.service";
import { AboutComponent } from "./about.component";
import { StatusComponent } from "./status.component";
import { SubnavComponent } from "./subnav.component";
import { Store } from "@ngrx/store";
import { ExtensionContainerGuard } from "../extension-container-guard";

const components = [AboutComponent, StatusComponent, SubnavComponent];

const ROUTES: Routes = [
    {
        path: "",
        component: SubnavComponent,
        canDeactivate: [ExtensionContainerGuard],
        children: [
            { path: "", redirectTo: "status", pathMatch: "full" },
            { path: "status", component: StatusComponent, canDeactivate: [ExtensionContainerGuard],},
            { path: "about", component: AboutComponent }
        ]
    }
];

@NgModule({
    imports: [
        ClarityModule,
        CommonModule,
        RouterModule.forChild(ROUTES),
        I18nModule.forChild(EXTENSION_ASSET_URL, true),
        VcdSdkModule.forRoot()
    ],
    declarations: [...components],
    exports: [...components],
    providers: [ModalWizardExtensionPointService],
    bootstrap: [SubnavComponent]
})
export class SubNavModule {
    constructor(
        appStore: Store<any>,
        @Inject(AuthTokenHolderService) token: AuthTokenHolderService,
        @Inject(API_ROOT_URL) API_ROOT_URL: string,
        @Inject(FLEX_APP_URL) FLEX_APP_URL: string,
        @Inject(SESSION_SCOPE) SESSION_SCOPE: string,
        @Inject(SESSION_ORGANIZATION) SESSION_ORGANIZATION: string,
        @Inject(SESSION_ORG_ID) SESSION_ORG_ID: string,
        @Inject(EXTENSION_ASSET_URL) EXTENSION_ASSET_URL: string,
        @Inject(EXTENSION_ROUTE) extensionRoute: string,
        @Inject(SDK_MODE) SDK_MODE: string,
        translationService: TranslationService,
        private client: VcdApiClient
    ) {
        translationService.registerTranslations();
    }
}
