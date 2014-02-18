/**
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

package org.sonatype.nexus.coreui

import com.softwarementors.extjs.djn.config.annotations.DirectAction
import com.softwarementors.extjs.djn.config.annotations.DirectMethod
import org.apache.shiro.authz.annotation.RequiresAuthentication
import org.apache.shiro.authz.annotation.RequiresPermissions
import org.sonatype.nexus.extdirect.DirectComponent
import org.sonatype.nexus.extdirect.DirectComponentSupport
import org.sonatype.security.SecuritySystem
import org.sonatype.security.usermanagement.DefaultUser
import org.sonatype.security.usermanagement.UserSearchCriteria

import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

/**
 * User {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = 'coreui_User')
class UserComponent
extends DirectComponentSupport
{
  @Inject
  SecuritySystem securitySystem

  def asUserXO = {
    new UserXO(
        id: it.userId,
        realm: it.source,
        firstName: it.firstName,
        lastName: it.lastName,
        email: it.emailAddress,
        status: it.status
    )
  }

  /**
   * Retrieve a list of available users.
   */
  @DirectMethod
  @RequiresPermissions('security:users:read')
  List<UserXO> read() {
    securitySystem.searchUsers(new UserSearchCriteria(source: 'default')).collect(asUserXO)
  }

  /**
   * @param userXO to be created
   * @return created user
   */
  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('security:users:create')
  UserXO create(final UserXO userXO) {
    asUserXO(securitySystem.addUser(new DefaultUser(
        userId: userXO.id,
        source: 'default',
        firstName: userXO.firstName,
        lastName: userXO.lastName,
        emailAddress: userXO.email,
        status: userXO.status
    ), userXO.password))
  }

  /**
   * @param userXO to be updated
   * @return updated user
   */
  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('security:users:create')
  UserXO update(final UserXO userXO) {
    asUserXO(securitySystem.updateUser(securitySystem.getUser(userXO.id).with {
      firstName = userXO.firstName
      lastName = userXO.lastName
      emailAddress = userXO.email
      status = userXO.status

      return it
    }))
  }

  /**
   * Deletes a user.
   * @param id of user to be deleted
   * @param realm of user to be deleted
   */
  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('security:users:delete')
  void delete(final String id, final String realm) {
    // TODO check that user to be deleted is not the current user or user marked with anonymous
    securitySystem.deleteUser(id, realm)
  }

}
