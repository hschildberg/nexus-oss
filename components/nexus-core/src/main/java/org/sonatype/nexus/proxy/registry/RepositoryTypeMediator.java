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

package org.sonatype.nexus.proxy.registry;

import javax.inject.Named;

import org.eclipse.sisu.BeanEntry;
import org.eclipse.sisu.Mediator;

/**
 * Manages {@link RepositoryTypeDescriptor} registrations via Sisu component mediation.
 * 
 * @since 2.8
 */
@Named
public class RepositoryTypeMediator
    implements Mediator<Named, RepositoryTypeDescriptor, RepositoryTypeRegistry>
{
  public void add(final BeanEntry<Named, RepositoryTypeDescriptor> entry, final RepositoryTypeRegistry registry) {
    registry.registerRepositoryTypeDescriptors(entry.getValue());
  }

  public void remove(final BeanEntry<Named, RepositoryTypeDescriptor> entry, final RepositoryTypeRegistry registry) {
    registry.unregisterRepositoryTypeDescriptors(entry.getValue());
  }
}
