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
Ext.define('NX.coreui.controller.Users', {
  extend: 'NX.controller.MasterDetail',

  list: 'nx-coreui-user-list',

  models: [
    'User'
  ],
  stores: [
    'User'
  ],
  views: [
    'user.Add',
    'user.Feature',
    'user.List',
    'user.Settings'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-user-list'
    },
    {
      ref: 'settings',
      selector: 'nx-coreui-user-feature nx-coreui-user-settings'
    }
  ],
  icons: {
    'feature-security-users': {
      file: 'group.png',
      variants: ['x16', 'x32']
    },
    'user-default': {
      file: 'user.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Security/Users',
    view: { xtype: 'nx-coreui-user-feature' },
    visible: function () {
      return NX.Permissions.check('security:users', 'read');
    }
  },
  permission: 'security:users',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      component: {
        'nx-coreui-user-list button[action=new]': {
          click: me.showAddWindow
        },
        'nx-coreui-user-add button[action=add]': {
          click: me.create
        },
        'nx-coreui-user-settings button[action=save]': {
          click: me.update
        }
      }
    });
  },

  /**
   * @override
   */
  getDescription: function (model) {
    return model.get('firstName') + ' ' + model.get('lastName');
  },

  /**
   * @override
   */
  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getSettings().loadRecord(model);
    }
  },

  /**
   * @private
   */
  showAddWindow: function () {
    Ext.widget('nx-coreui-user-add');
  },

  /**
   * @private
   * Creates a new user.
   */
  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form');

    form.submit({
      waitMsg: 'Creating user...',
      success: function (form, action) {
        win.close();
        NX.Messages.add({
          text: 'User created: ' + me.getDescription(me.getUserModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStoreAndSelect(action.result.data.id);
      }
    });
  },

  /**
   * @private
   * Updates a user.
   */
  update: function (button) {
    var me = this,
        form = button.up('form');

    form.submit({
      waitMsg: 'Updating user...',
      success: function (form, action) {
        NX.Messages.add({
          text: 'User updated: ' + me.getDescription(me.getUserModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStore();
      }
    });
  },

  /**
   * @private
   * @override
   * Deletes a user.
   * @param model user to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_User.delete(model.getId(), model.get('realm'), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'User deleted: ' + description, type: 'success'
        });
      }
    });
  }

});