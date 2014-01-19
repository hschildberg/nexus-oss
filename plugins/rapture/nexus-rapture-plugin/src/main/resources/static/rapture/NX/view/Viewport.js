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
Ext.define('NX.view.Viewport', {
  extend: 'Ext.container.Viewport',

  // TODO: Keep the viewport simple have it delegate to another component w/fit layout so that we can
  // TODO: easily switch the entire UI (for startup/upgrade or licensing wizards)
  layout: 'border',

  defaults: {
    // HACK: Add border to make areas standout
    border: true
  },

  items: [
    {
      xtype: 'nx-header',
      region: 'north',
      collapsible: false
    },

    {
      xtype: 'nx-feature-menu',
      region: 'west',
      collapsible: true,
      collapsed: false,
      split: true
    },

    {
      xtype: 'nx-feature-content',
      region: 'center'
    },

    {
      xtype: 'nx-message-panel',
      region: 'east',
      collapsible: true,
      collapsed: true,
      split: true
    },

    {
      xtype: 'nx-dev-panel',
      region: 'south',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'n',

      // default to hidden, only show if debug enabled
      hidden: true
    }
  ],

  /**
   * @protected
   */
  initComponent: function() {
    this.callParent();

    // if debug enabled, show developer tools
    if (window.location.search === '?debug') {
      this.down('nx-dev-panel').show();
    }
  }
});