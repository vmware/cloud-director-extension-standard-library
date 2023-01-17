/**
 * Copyright 2023 VMware, Inc.
 * SPDX-License-Identifier: BSD-2-Clause
 */
import * as tsrde from "@vcd-ext/ts-rde";

/**
 * Implements revealBehaviorExecutionContext" from SkeletonDatabaseEntity interface
 * @param vcdContext 
 */

export default async function (vcdContext: tsrde.VcdContext<any, any>): Promise<void> {
    console.log("*** revealBehaviorExecutionContext() ***")
    /**
     * Use with caution. Printing this information in logs will also print 
     * the encrypted fields and access tokens.
     */
    console.log(`entityId=${vcdContext.entityId}`)
    console.log(`hostname=${vcdContext.hostname}`)
    console.log(`port=${vcdContext.port}`)
    console.log(`actAsToken=${vcdContext.actAsToken}`)
    console.log(`entity=${JSON.stringify(vcdContext.entity || {}, null, 2)}`)
    console.log(`arguments=${JSON.stringify(vcdContext.arguments || {}, null, 2)}`)
}