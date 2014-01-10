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
package org.sonatype.nexus.analytics.internal;

import javax.inject.Named;

import org.sonatype.nexus.web.internal.SecurityFilter;

import com.google.inject.AbstractModule;
import com.google.inject.servlet.ServletModule;

/**
 * Analytics guice module.
 *
 * @since 2.8
 */
@Named
public class AnalyticsModule
  extends AbstractModule
{
  @Override
  protected void configure()
  {
    install(new ServletModule() {
      @Override
      protected void configureServlets() {
        // collection needs security filters applied first
        filter("/*").through(SecurityFilter.class);

        // then capture rest api requests
        filter("/service/local/*").through(RestRequestCollector.class);
        filter("/service/siesta/*").through(RestRequestCollector.class);

        // capture internal/metrics requests
        filter("/internal/*").through(RestRequestCollector.class);
      }
    });
  }
}
