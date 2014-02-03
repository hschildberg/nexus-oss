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

package org.sonatype.nexus.apachehttpclient;

import org.sonatype.nexus.configuration.application.ApplicationConfiguration;
import org.sonatype.nexus.proxy.storage.remote.RemoteStorageContext;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.protocol.HttpContext;

/**
 * Component for creating pre-configured Apache HttpClient4x instances in Nexus.
 *
 * @author cstamas
 * @since 2.2
 */
public interface Hc4Provider
{
  /**
   * HTTP context key of (usually proxy) repository on who's behalf request is made. To be used with
   * {@link HttpClient#execute(HttpUriRequest, HttpContext)} method of {@link HttpClient} instance got from this
   * provider. Example code snippet:
   *
   * <pre>
   * final HttpGet httpRequest = new HttpGet( proxyRepository.getRemoteUrl() );
   * final BasicHttpContext httpContext = new BasicHttpContext();
   * httpContext.setAttribute( HTTP_CTX_KEY_REPOSITORY, proxyRepository );
   * final HttpResponse httpResponse = httpClient.execute( httpRequest, httpContext );
   * </pre>
   *
   * @since 2.4
   */
  String HTTP_CTX_KEY_REPOSITORY = Hc4Provider.class.getName() + ".repository";

  /**
   * Returns a new pre-configured instance of Apache HttpClient4x. This call will assemble a new instance of client
   * per every invocation. Created instances should be kept only during request execution, and should not be kept for
   * reuse over longer time span. Rather keep reference to this component and re-create client when needed. On Nexus
   * configuration changes, the client needs reconfiguration too, hence if you keep a reference to the created
   * client, you might end up with stale and non-working client (for example, global HTTP Proxy got changed between
   * your invocation of this method and when you want to perform HTTP request. Your instance would still try to talk to
   * HTTP proxy set in time when you created the instance). For resource optimization's sake, HttpClient instance
   * returned by this method  <em>does not support Keep-Alive</em> (unless configuration needs it).
   * If you need explicit control over connection reuse, or must have one a client
   * that reuse connections at any cause, use method {@link #createHttpClient(boolean)} instead.
   *
   * @return HttpClient4x pre-configured instance, that uses global {@link RemoteStorageContext} to be configured
   * (see {@link ApplicationConfiguration#getGlobalRemoteStorageContext()}).
   */
  HttpClient createHttpClient();

  /**
   * Returns a new pre-configured instance of Apache HttpClient4x. This call will assemble a new instance of client
   * per every invocation. Created instances should be kept only during request execution, and should not be kept for
   * reuse over longer time span. Rather keep reference to this component and re-create client when needed. On Nexus
   * configuration changes, the client needs reconfiguration too, hence if you keep a reference to the created
   * client, you might end up with stale and non-working client (for example, global HTTP Proxy got changed between
   * your invocation of this method and when you want to perform HTTP request. Your instance would still try to talk to
   * HTTP proxy set in time when you created the instance). The instance returned by this method will support
   * connection reuse if asked to. Keep in mind, that stale connection detection is not reliable (without traffic)
   * and that Nexus uses shared connection pool, so even getting connection manager from the returned
   * instance and shutting it down will not help (nor should be attempted!).
   *
   * @param reuseConnections if {@code true} the returned HTTP client will reuse connections (and hence, support
   *                         HTTP features as Keep Alive, etc).
   * @return HttpClient4x pre-configured instance, that uses global {@link RemoteStorageContext} to be configured
   * (see {@link ApplicationConfiguration#getGlobalRemoteStorageContext()}).
   */
  HttpClient createHttpClient(boolean reuseConnections);

  /**
   * Advanced. Primarily to be used by subsystem that wants full control over the HTTP Client, it only uses the
   * "factory"-like features of this provider. In short: it wants to have pre-configured instance adjusted to passed
   * in {@link RemoteStorageContext}, namely with authentication and HTTP proxy configuration set. So far, that
   * subsystem is Nexus Proxy repositories. The created {@link HttpClient} will use the shared
   * {@link ClientConnectionManager} managed by this component, so instances created with this method must not be
   * managed or shutdown!
   *
   * @param context to source connection parameters from.
   * @return HttpClient4x pre-configured instance, that uses passed {@link RemoteStorageContext} to be configured.
   */
  HttpClient createHttpClient(RemoteStorageContext context);
}
