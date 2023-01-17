/**
 * Copyright 2023 VMware, Inc.
 * SPDX-License-Identifier: BSD-2-Clause
 */
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClarityModule } from "@clr/angular";
import { I18nModule, TranslationService } from "@vcd/i18n";
import { EXTENSION_ASSET_URL, VcdApiClient, VcdSdkModule } from "@vcd/sdk";
import { SkeletonComponent } from "./skeleton.component";
import { DemoRoutingModule } from "./skeleton.routes.module";

@NgModule({
    imports: [
        ClarityModule,
        CommonModule,
        VcdSdkModule,
        I18nModule.forChild(EXTENSION_ASSET_URL, false),
        FormsModule,
        ReactiveFormsModule,
        DemoRoutingModule,
    ],
    declarations: [
        SkeletonComponent,
    ],
    bootstrap: [SkeletonComponent],
    exports: [],
    providers: [
        VcdApiClient,
    ]
})
export class SkeletonModule {
    constructor(translationService: TranslationService) {
        translationService.registerTranslations();
    }
}
