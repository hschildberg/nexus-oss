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

package org.sonatype.nexus.coreui;

import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.extdirect.DirectComponent;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.nexus.proxy.NoSuchRepositoryException;
import org.sonatype.nexus.proxy.ResourceStoreRequest;
import org.sonatype.nexus.proxy.item.RepositoryItemUid;
import org.sonatype.nexus.proxy.registry.RepositoryRegistry;
import org.sonatype.nexus.proxy.repository.GroupRepository;
import org.sonatype.nexus.proxy.repository.HostedRepository;
import org.sonatype.nexus.proxy.repository.ProxyRepository;
import org.sonatype.nexus.proxy.repository.RemoteStatus;
import org.sonatype.nexus.proxy.repository.Repository;
import org.sonatype.nexus.proxy.repository.ShadowRepository;
import org.sonatype.nexus.rest.RepositoryURLBuilder;

import com.director.core.annotation.DirectAction;
import com.director.core.annotation.DirectMethod;
import com.google.common.base.Function;
import com.google.common.collect.Lists;

/**
 * Repository {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = "repository.Repository")
public class RepositoryComponent
    extends DirectComponentSupport
{

  private final RepositoryRegistry repositoryRegistry;

  private final RepositoryURLBuilder repositoryURLBuilder;

  @Inject
  public RepositoryComponent(final RepositoryRegistry repositoryRegistry,
                             final RepositoryURLBuilder repositoryURLBuilder)
  {
    this.repositoryRegistry = repositoryRegistry;
    this.repositoryURLBuilder = repositoryURLBuilder;
  }

  /**
   * Retrieve a list of available repositories info.
   */
  @DirectMethod
  public List<RepositoryXO> read() {
    return Lists.transform(repositoryRegistry.getRepositories(), new Function<Repository, RepositoryXO>()
    {
      @Override
      public RepositoryXO apply(final Repository input) {
        RepositoryXO info = new RepositoryXO();
        info.id = input.getId();
        info.name = input.getName();
        info.type = getRepositoryType(input);
        info.format = input.getProviderHint();
        info.localStatus = input.getLocalStatus().toString();
        info.url = repositoryURLBuilder.getExposedRepositoryContentUrl(input);

        ProxyRepository proxyRepository = input.adaptToFacet(ProxyRepository.class);
        if (proxyRepository != null) {
          RemoteStatus remoteStatus = proxyRepository.getRemoteStatus(
              new ResourceStoreRequest(RepositoryItemUid.PATH_ROOT), false
          );

          info.proxyMode = proxyRepository.getProxyMode().toString();
          info.remoteStatus = remoteStatus.toString();
          info.remoteStatusReason = remoteStatus.getReason();
        }

        return info;
      }
    });
  }

  @DirectMethod
  public void delete(final String id) throws NoSuchRepositoryException {
    repositoryRegistry.removeRepository(id);
  }

  private String getRepositoryType(final Repository repository) {
    if (repository.getRepositoryKind().isFacetAvailable(ProxyRepository.class)) {
      return "Proxy";
    }
    else if (repository.getRepositoryKind().isFacetAvailable(HostedRepository.class)) {
      return "Hosted";
    }
    else if (repository.getRepositoryKind().isFacetAvailable(ShadowRepository.class)) {
      return "Virtual";
    }
    else if (repository.getRepositoryKind().isFacetAvailable(GroupRepository.class)) {
      return "Group";
    }
    return null;
  }

}
