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
/**
 * Controls content of unsupported browser panel.
 *
 * @since 2.8
 */
Ext.define('NX.controller.UnsupportedBrowser', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'UnsupportedBrowser'
  ],

  refs: [
    {
      ref: 'viewport',
      selector: 'viewport'
    },
    {
      ref: 'unsupportedBrowser',
      selector: 'nx-unsupported-browser'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'viewport': {
          afterrender: me.onLaunch
        },
        'nx-unsupported-browser button[action=lucky]': {
          click: me.whenUserIsFeelingLucky
        }
      }
    });
  },

  /**
   * @override
   * Show {@link NX.view.UnsupportedBrowser} view from {@link Ext.container.Viewport}.
   */
  onLaunch: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      me.logDebug('Showing unsupported browser view');
      viewport.add({ xtype: 'nx-unsupported-browser' });
    }
  },

  /**
   * @public
   * Removes {@link NX.view.UnsupportedBrowser} view from {@link Ext.container.Viewport}.
   */
  onDestroy: function () {
    var me = this,
        viewport = me.getViewport();

    if (viewport) {
      me.logDebug('Removing unsupported browser view');
      viewport.remove(me.getUnsupportedBrowser());
    }
  },

  whenUserIsFeelingLucky: function () {
    NX.State.setBrowserSupported(true);
  }

});