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
Ext.define('NX.controller.dev.Permissions', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.util.Permissions'
  ],

  stores: [
    'Permission'
  ],
  models: [
    'Permission'
  ],
  views: [
    'dev.Permissions'
  ],

  refs: [
    {
      ref: 'grid',
      selector: 'nx-dev-permissions'
    }
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'permission-granted': {
        file: 'tick.png',
        variants: ['x16', 'x32']
      },
      'permission-denied': {
        file: 'cross.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      component: {
        'nx-dev-permissions': {
          beforeedit: me.beforeEdit,
          canceledit: me.cancelEdit,
          validateedit: me.update,
          selectionchange: me.onSelectionChange
        },
        'nx-dev-permissions button[action=add]': {
          click: me.add
        },
        'nx-dev-permissions button[action=delete]': {
          click: me.delete
        }
      }
    });
  },

  /**
   * @private
   */
  add: function () {
    var me = this,
        grid = me.getGrid(),
        editor = grid.getPlugin('editor'),
        model = me.getPermissionModel().create();

    editor.cancelEdit();
    grid.getStore().insert(0, model);
    editor.startEdit(model, 0);
  },

  /**
   * @private
   */
  delete: function () {
    var me = this,
        grid = me.getGrid(),
        editor = grid.getPlugin('editor');

    editor.cancelEdit();
    grid.getStore().remove(grid.getSelectionModel().getSelection());
  },

  /**
   * @private
   */
  beforeEdit: function (editor, context) {
    var idField = editor.editor.form.findField('id');

    if (context.record.get('id')) {
      idField.disable();
    }
    else {
      idField.enable();
    }
  },

  /**
   * @private
   */
  cancelEdit: function (editor, context) {
    if (!context.record.get('id')) {
      context.store.remove(context.record);
    }
  },

  /**
   * @private
   */
  update: function (editor, context) {
    var value = NX.util.Permissions.NONE;

    Ext.each(['CREATE', 'READ', 'UPDATE', 'DELETE'], function (perm) {
      if (context.newValues[perm.toLowerCase()] == true) {
        value += NX.util.Permissions[perm];
      }
    });

    context.record.set('value', value);
  },

  onSelectionChange: function (selectionModel, records) {
    var me = this,
        deleteButton = me.getGrid().down('button[action=delete]');

    deleteButton.setDisabled(!records.length);
  }

});