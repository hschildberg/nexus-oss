/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.extdirect;

import javax.inject.Named;

import org.sonatype.nexus.plugin.PluginIdentity;

import org.eclipse.sisu.EagerSingleton;

/**
 * Ext.Direct plugin.
 *
 * @since 2.8
 */
@Named
@EagerSingleton
public class ExtDirectPlugin
    extends PluginIdentity
{
  /**
   * Prefix for ID-like things.
   */
  public static final String ID_PREFIX = "extdirect";

  /**
   * Expected groupId for plugin artifact.
   */
  public static final String GROUP_ID = "org.sonatype.nexus.plugins";

  /**
   * Expected artifactId for plugin artifact.
   */
  public static final String ARTIFACT_ID = "nexus-" + ID_PREFIX + "-plugin";

  public ExtDirectPlugin() throws Exception {
    super(GROUP_ID, ARTIFACT_ID);
  }
}
