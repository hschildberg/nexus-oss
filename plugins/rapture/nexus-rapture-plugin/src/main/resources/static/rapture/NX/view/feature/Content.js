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
Ext.define('NX.view.feature.Content', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-feature-content',

  ui: 'feature-content',
  layout: 'fit',

  header: {
    xtype: 'toolbar',
    height: 50,
    items: [
      ' ',
      {
        xtype: 'image',
        itemId: 'icon',
        height: 32,
        width: 32
      },
      {
        xtype: 'label',
        itemId: 'title',
        style: {
          'color': '#000000',
          'font-size': '16px',
          'font-weight': 'bold'
        }
      },
      '-',
      {
        xtype: 'label',
        itemId: 'description',
        style: {
          'color': '#000000',
          'font-size': '12px'
        }
      },

      // HACK: Testing what tool-like buttons look like in custom header
      '->',
      { xtype: 'button', ui: 'plain', scale: 'medium', glyph: 'xf013@FontAwesome' /* fa-gear */},
      { xtype: 'button', ui: 'plain', scale: 'medium', glyph: 'xf059@FontAwesome' /* fa-question-circle */}
    ]
  },

  /**
   * Custom handling for title since we are using custom header component.
   *
   * @override
   * @param text
   */
  setTitle: function(text) {
    var me = this,
        label = me.down('label[itemId=title]');

    me.callParent(arguments);

    label.setText(text);
  },

  /**
   * Set description text.
   *
   * @public
   * @param text
   */
  setDescription: function(text) {
    var me = this,
        label = me.down('label[itemId=description]');

    label.setText(text);
  },

  /**
   * The currently set iconCls, so we can remove it when changed.
   *
   * @private
   */
  currentIconCls: undefined,

  /**
   * Custom handling for iconCls since we are using custom header component.
   *
   * @override
   * @param cls
   */
  setIconCls: function(cls) {
    var me = this,
        icon = me.down('image[itemId=icon]');

    me.callParent(arguments);

    if (me.currentIconCls) {
      icon.removeCls(me.currentIconCls);
    }
    icon.addCls(cls);
    me.currentIconCls = cls;
  }
});