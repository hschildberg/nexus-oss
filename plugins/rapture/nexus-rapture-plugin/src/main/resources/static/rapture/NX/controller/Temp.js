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
Ext.define('NX.controller.Temp', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-feeds': {
        file: 'feed.png',
        variants: ['x16', 'x32']
      },
      'feature-components': {
        file: 'box.png',
        variants: ['x16', 'x32']
      },

      // staging
      'feature-staging': {
        file: 'database_green.png',
        variants: ['x16', 'x32']
      },
      'feature-staging-repositories': {
        file: 'database_green.png',
        variants: ['x16', 'x32']
      },
      'feature-staging-rules': {
        file: 'measure.png',
        variants: ['x16', 'x32']
      },
      'feature-staging-profiles': {
        file: 'palette.png',
        variants: ['x16', 'x32']
      },

      // repository
      'feature-repository': {
        file: 'database.png',
        variants: ['x16', 'x32']
      },
      'feature-repository-repositories': {
        file: 'database.png',
        variants: ['x16', 'x32']
      },
      'feature-repository-routing': {
        file: 'arrow_branch.png',
        variants: ['x16', 'x32']
      },
      'feature-repository-managed': {
        file: 'database_yellow.png',
        variants: ['x16', 'x32']
      },
      'feature-repository-trash': {
        file: 'bin.png',
        variants: ['x16', 'x32']
      },

      // procurement
      'feature-procurement': {
        file: 'database_blue.png',
        variants: ['x16', 'x32']
      },
      'feature-procurement-repositories': {
        file: 'database_blue.png',
        variants: ['x16', 'x32']
      },

      // system
      'feature-system-tasks': {
        file: 'time.png',
        variants: ['x16', 'x32']
      },
      'feature-system-pgp': {
        file: 'gnupg_keys.png',
        variants: ['x16', 'x32']
      },
      'feature-system-smartproxy': {
        file: 'servers_network.png',
        variants: ['x16', 'x32']
      },
      'feature-system-ssl': {
        file: 'ssl_certificates.png',
        variants: ['x16', 'x32']
      },

      // support
      'feature-support': {
        file: 'support.png',
        variants: ['x16', 'x32']
      },
      'feature-support-overview': {
        file: 'information.png',
        variants: ['x16', 'x32']
      },
      'feature-support-supportzip': {
        file: 'file_extension_zip.png',
        variants: ['x16', 'x32']
      },
      'feature-support-logging': {
        file: 'book.png',
        variants: ['x16', 'x32']
      },
      'feature-support-supporttools': {
        file: 'globe_place.png',
        variants: ['x16', 'x32']
      },
      'feature-support-analytics': {
        file: 'system_monitor.png',
        variants: ['x16', 'x32']
      },

      // security
      'feature-security-ldap': {
        file: 'book_addresses.png',
        variants: ['x16', 'x32']
      },
      'feature-security-atlassiancrowd': {
        file: 'crowd.png',
        variants: ['x16', 'x32']
      }
    });

    // HACK: Show some items only if user is logged in for testing
    var visibleIfLoggedIn = function () {
      return me.getApplication().getUserController().hasUser();
    };

    me.getApplication().getFeaturesController().registerFeature([
      {
        path: '/Repository',
        view: 'NX.view.feature.Group',
        weight: 50,
        visible: visibleIfLoggedIn
      },
      {
        path: '/Repository/Routing',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Staging',
        view: 'NX.view.feature.Group',
        weight: 60,
        visible: visibleIfLoggedIn
      },
      {
        path: '/Staging/Repositories',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Staging/Profiles',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Staging/Rules',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Procurement',
        view: 'NX.view.feature.Group',
        weight: 60,
        visible: visibleIfLoggedIn
      },
      {
        path: '/Procurement/Repositories',
        visible: visibleIfLoggedIn
      },

      {
        path: '/Security/LDAP',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Security/Atlassian Crowd',
        visible: visibleIfLoggedIn
      },
      {
        path: '/System/PGP',
        visible: visibleIfLoggedIn
      },
      {
        path: '/System/Tasks',
        visible: visibleIfLoggedIn
      },
      {
        path: '/System/Smart Proxy',
        visible: visibleIfLoggedIn
      },
      {
        path: '/System/SSL',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Support',
        view: 'NX.view.feature.Group',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Support/Overview',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Support/Logging',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Support/Support ZIP',
        visible: visibleIfLoggedIn
      },
      {
        path: '/Support/Analytics',
        visible: visibleIfLoggedIn
      },

      // browse mode
      {
        mode: 'browse',
        path: '/Feeds',
        description: 'System event feeds'
      },
      {
        mode: 'browse',
        path: '/Components',
        description: 'Browse components',
        authenticationRequired: false
      },
      {
        mode: 'browse',
        path: '/Repository',
        view: 'NX.view.feature.Group',
        authenticationRequired: false
      },
      {
        mode: 'browse',
        path: '/Repository/Standard',
        description: 'Browse standard repositories',
        iconName: 'feature-repository',
        weight: 10,
        authenticationRequired: false
      },
      {
        mode: 'browse',
        path: '/Repository/Staging',
        description: 'Browse staging repositories',
        iconName: 'feature-staging-repositories',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'browse',
        path: '/Repository/Procurement',
        description: 'Browse procurement repositories',
        iconName: 'feature-procurement-repositories',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'browse',
        path: '/Repository/Managed',
        description: 'Browse managed repositories',
        iconName: 'feature-repository-managed',
        visible: visibleIfLoggedIn,
        weight: 300
      },
      {
        mode: 'browse',
        path: '/Repository/Trash',
        description: 'Browse repository trash',
        iconName: 'feature-repository-trash',
        visible: visibleIfLoggedIn,
        weight: 500
      },

      // user mode
      {
        mode: 'user',
        path: '/Account',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'user',
        path: '/User Token',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'user',
        path: '/Notifications',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'user',
        path: '/Client Settings',
        view: 'NX.view.feature.Group',
        weight: 200,
        visible: visibleIfLoggedIn
      },
      {
        mode: 'user',
        path: '/Client Settings/Apache Maven',
        description: 'Settings for use with Apache Maven',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'user',
        path: '/Client Settings/Apache Ivy',
        description: 'Settings for use with Apache Ivy',
        visible: visibleIfLoggedIn
      }
    ]);
  }
});