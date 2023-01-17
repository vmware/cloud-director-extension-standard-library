/**
 * Copyright 2023 VMware, Inc.
 * SPDX-License-Identifier: BSD-2-Clause
 */
import * as tsrde from "@vcd-ext/ts-rde";

@tsrde.DefinedEntityType
export class SkeletonDatabaseEntity {
  
  plainText: string;
  optionalNumber?: number

  /**
   * Only behaviors associated with instances of SkeletonDatabaseEntity will
   * receive this value encrypted in their execution context.
   * 
   * Note, such value can be POST and PUT but never GET via regular API calls. 
   */
  @tsrde.Secure
  @tsrde.Private
  encryptedText: string;

  /**
   * Defines a behavior "revealBehaviorExecutionContext" to SkeletonDatabaseEntity interface
   * of type built-in provider ONLY FaaS
   * @param executionJustificationText 
   */
  @tsrde.FaaS
  @tsrde.AccessControl("urn:vcloud:accessLevel:FullControl")
  RevealBehaviorExecutionContext(executionJustificationText?: string) {}
}
