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
 * Task master/detail controller.
 *
 * @since 2.8
 */
Ext.define('NX.coreui.controller.Tasks', {
  extend: 'NX.controller.MasterDetail',

  list: 'nx-coreui-task-list',

  stores: [
    'Task',
    'TaskType'
  ],
  views: [
    'task.Feature',
    'task.List'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-task-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-task-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-system-tasks': {
      file: 'time.png',
      variants: ['x16', 'x32']
    },
    'task-default': {
      file: 'time.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/System/Tasks',
    view: { xtype: 'nx-coreui-task-feature' },
    visible: function () {
      return NX.Permissions.check('nexus:tasks', 'read');
    }
  },
  permission: 'nexus:tasks',

  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      controller: {
        '#Refresh': {
          refresh: me.loadTaskType
        }
      },
      component: {
        'nx-coreui-task-list': {
          beforerender: me.loadTaskType
        }
      },
      store: {
        '#TaskType': {
          load: me.onTaskTypeLoad,
          datachanged: me.onTaskTypeLoad
        }
      }
    });
  },

  getDescription: function (model) {
    return model.get('name') + ' (' + model.get('typeName') + ')';
  },

  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Type': model.get('typeName'),
        'Status': model.get('statusDescription'),
        'Next Run': NX.util.DateFormat.timestamp(model.get('nextRun')),
        'Last Run': NX.util.DateFormat.timestamp(model.get('lastRun')),
        'Last Result': model.get('lastRunResult')
      });
    }
  },

  loadTaskType: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.getTaskTypeStore().load();
    }
  },

  onTaskTypeLoad: function () {
    var me = this;

    me.reselect();
    me.enableNewButton();
  },

  /**
   * @override
   * Enable only when there are task types.
   */
  shouldEnableNewButton: function () {
    var me = this;
    return me.getTaskTypeStore().getCount() > 0 && me.callParent()
  },

  /**
   * @override
   * Delete task.
   * @param model task to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_Task.delete(model.getId(), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'Task deleted: ' + description, type: 'success'
        });
      }
    });
  }

});