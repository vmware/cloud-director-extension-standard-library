/*
 * Copyright 2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClarityModule } from "@clr/angular";
import { I18nModule, TranslationService } from "@vcd/i18n";
import { EXTENSION_ASSET_URL, VcdSdkModule } from "@vcd/sdk";
import { SimpleComponent } from "./simple.component";

const components = [SimpleComponent];

const ROUTES: Routes = [
    {
        path: "",
        component: SimpleComponent
    }
];

@NgModule({
    imports: [
        ClarityModule,
        CommonModule,
        RouterModule.forChild(ROUTES),
        I18nModule.forChild(EXTENSION_ASSET_URL, true),
        VcdSdkModule.forRoot(),
    ],
    declarations: [...components],
    exports: [...components],
    providers: []
})
export class SimpleNavModule {
    constructor(translationService: TranslationService) {
        translationService.registerTranslations();
    }
}
