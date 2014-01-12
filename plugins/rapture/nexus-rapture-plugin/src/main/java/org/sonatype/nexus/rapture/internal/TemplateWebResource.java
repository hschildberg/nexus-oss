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

package org.sonatype.nexus.rapture.internal;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import javax.inject.Inject;

import org.sonatype.nexus.web.DelegatingWebResource;
import org.sonatype.nexus.web.WebResource;
import org.sonatype.nexus.web.WebResource.Prepareable;
import org.sonatype.sisu.goodies.common.ComponentSupport;
import org.sonatype.sisu.goodies.template.TemplateEngine;
import org.sonatype.sisu.goodies.template.TemplateParameters;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

// TODO: Move to common location (core or webresources plugin)

/**
 * Support for template-based {@link WebResource} implementations.
 *
 * @since 2.8
 */
public abstract class TemplateWebResource
    extends ComponentSupport
    implements WebResource, Prepareable
{
  private TemplateEngine templateEngine;

  @Inject
  public void setTemplateEngine(final TemplateEngine templateEngine) {
    this.templateEngine = checkNotNull(templateEngine);
  }

  protected TemplateEngine getTemplateEngine() {
    checkState(templateEngine != null);
    return templateEngine;
  }

  @Override
  public boolean isCacheable() {
    return false;
  }

  @Override
  public long getLastModified() {
    return System.currentTimeMillis();
  }

  @Override
  public long getSize() {
    throw new UnsupportedOperationException("Preparation required");
  }

  @Override
  public InputStream getInputStream() throws IOException {
    throw new UnsupportedOperationException("Preparation required");
  }

  @Override
  public WebResource prepare() throws IOException {
    return new DelegatingWebResource(this)
    {
      private final byte[] content = render();

      @Override
      public long getSize() {
        return content.length;
      }

      @Override
      public InputStream getInputStream() throws IOException {
        return new ByteArrayInputStream(content);
      }
    };
  }

  protected URL template(final String name) {
    URL template = getClass().getResource(name);
    checkState(template != null, "Missing template: %s", name);
    return template;
  }

  protected byte[] render(final String template, final TemplateParameters parameters) throws IOException {
    return getTemplateEngine().render(this, template(template), parameters).getBytes();
  }

  protected abstract byte[] render() throws IOException;
}
