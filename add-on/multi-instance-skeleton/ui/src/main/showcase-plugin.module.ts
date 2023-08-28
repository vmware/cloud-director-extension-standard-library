/*
 * Copyright 2020-2023 VMware, Inc. All rights reserved. VMware Confidential
 */

import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, Inject, NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpHeaders } from "@angular/common/http";
import { ClarityModule } from "@clr/angular";
import { Store } from "@ngrx/store";
import { I18nModule, TranslationService } from "@vcd/i18n";
import {
    PluginModule,
    VcdSdkModule,
    VcdApiClient,
    Query,
    API_ROOT_URL,
    AuthTokenHolderService,
    ExtensionNavRegistration,
    EXTENSION_ASSET_URL,
    EXTENSION_ROUTE,
    FLEX_APP_URL,
    SDK_MODE,
    SESSION_ORGANIZATION,
    SESSION_ORG_ID,
    SESSION_SCOPE
} from "@vcd/sdk";
import { VmBackupActionComponent } from "./actions/vm.backup.action.component";
import { VappRestoreActionComponent } from "./actions/vapp.restore.action.component";
import { DatacenterContainerComponent } from "./datacenter-overview/datacenter.container.component";
import { ApplicationComponent } from './application/application.component';
import { DatacenterComputeComponent } from './datacenter-compute/datacenter-compute.component';
import { DatacenterNetworkComponent } from './datacenter-network/datacenter-network.component';
import { DatacenterStorageComponent } from './datacenter-storage/datacenter-storage.component';
import { VappCreateWizardExtensionPointComponent } from './create-vapp/vapp.create.wizard.action.component';
import { VmCreateWizardExtensionPointComponent } from './create-vm/vm.create.wizard.action.component';
import { OrgCreateWizardExtensionPointComponent } from './create-org/org.create.wizard.action.component';
import { ModalWizardExtensionPointService } from "./services/modal-wizard-ext-point.service";
// Exports
export { SubnavComponent } from "./subnav/subnav.component";
export { VappRestoreActionComponent, VmBackupActionComponent } from "./actions";
export { DatacenterContainerComponent } from './datacenter-overview/datacenter.container.component';
export { ApplicationComponent } from './application/application.component';
export { DatacenterComputeComponent } from './datacenter-compute/datacenter-compute.component';
export { DatacenterNetworkComponent } from './datacenter-network/datacenter-network.component';
export { DatacenterStorageComponent } from './datacenter-storage/datacenter-storage.component';
export { VmCreateWizardExtensionPointComponent } from './create-vm';
export {
    VappCreateWizardExtensionPointComponent,
} from './create-vapp';
export {
    OrgCreateWizardExtensionPointComponent
} from './create-org';

export * from './subnav/sub-nav.module';
export * from './simple/simple-nav.module';

const components = [
    DatacenterContainerComponent,
    VappRestoreActionComponent,
    VmBackupActionComponent,
    ApplicationComponent,
    DatacenterComputeComponent,
    DatacenterNetworkComponent,
    DatacenterStorageComponent,
    VappCreateWizardExtensionPointComponent,
    VmCreateWizardExtensionPointComponent,
    OrgCreateWizardExtensionPointComponent,
]

@NgModule({
    imports: [
        ClarityModule,
        CommonModule,
        I18nModule.forChild(EXTENSION_ASSET_URL, true),
        ReactiveFormsModule,
        VcdSdkModule.forRoot(),
    ],
    declarations: [
        ...components
    ],
    exports: [],
    providers: [ModalWizardExtensionPointService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShowcasePluginModule extends PluginModule {
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
        private client: VcdApiClient) {

        super(appStore);

        translationService.registerTranslations();

        this.registerExtension(<ExtensionNavRegistration>{
            path: extensionRoute,
            icon: "page",
            nameCode: "nav.label.registered.extension",
            descriptionCode: "nav.description.registered.extension"
        });
    }
}
