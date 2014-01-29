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

package org.sonatype.nexus.extdirect.internal;

import java.io.File;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.configuration.application.ApplicationConfiguration;
import org.sonatype.nexus.plugin.support.FileWebResource;
import org.sonatype.nexus.web.WebResource;
import org.sonatype.nexus.web.WebResourceBundle;

import com.google.common.collect.ImmutableList;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.sonatype.nexus.web.WebResource.JAVASCRIPT;

/**
 * Ext.Direct web-resources.
 *
 * @since 2.8
 */
@Named
@Singleton
public class ExtDirectWebResources
    implements WebResourceBundle
{
  private final ApplicationConfiguration applicationConfiguration;

  @Inject
  public ExtDirectWebResources(final ApplicationConfiguration applicationConfiguration) {
    this.applicationConfiguration = checkNotNull(applicationConfiguration);
  }

  private WebResource create(final String fileName, final String path) {
    File file = new File(applicationConfiguration.getTemporaryDirectory(), fileName);
    return new FileWebResource(file, path, JAVASCRIPT, true);
  }

  // FIXME: Would like to replace the generation here instead of relying on file which could be changed, etc
  // FIXME: Also we need a bit more control over the generation of this content so we can set the baseUrl etc

  @Override
  public List<WebResource> getResources() {
    return ImmutableList.of(
        create("extdirect/api-min.js", "/static/rapture/extdirect-prod.js"),
        create("extdirect/api-debug.js", "/static/rapture/extdirect-debug.js")
    );
  }
}
