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
 * Task list.
 *
 * @since 2.8
 */
Ext.define('NX.coreui.view.task.List', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-coreui-task-list',

  store: 'Task',

  columns: [
    {
      xtype: 'iconcolumn',
      width: 36,
      iconVariant: 'x16',
      iconName: function () {
        return 'task-default';
      }
    },
    { header: 'Name', dataIndex: 'name' },
    { header: 'Type', dataIndex: 'typeName', flex: 1 },
    { header: 'Status', dataIndex: 'statusDescription' },
    { header: 'Schedule', dataIndex: 'schedule' },
    { header: 'Next Run', dataIndex: 'nextRun', xtype: 'timestampcolumn', flex: 1 },
    { header: 'Last Run', dataIndex: 'lastRun', xtype: 'timestampcolumn', flex: 1 },
    { header: 'Last Result', dataIndex: 'lastRunResult' }
  ],

  tbar: [
    { xtype: 'button', text: 'New', glyph: 'xf055@FontAwesome' /* fa-plus-circle */, action: 'new', disabled: true },
    { xtype: 'button', text: 'Delete', glyph: 'xf056@FontAwesome' /* fa-minus-circle */, action: 'delete', disabled: true },
    { xtype: 'button', text: 'Run', glyph: 'xf04b@FontAwesome' /* fa-play */, action: 'run', disabled: true },
    { xtype: 'button', text: 'Stop', glyph: 'xf04d@FontAwesome' /* fa-stop */, action: 'stop', disabled: true }
  ],

  plugins: ['gridfilterbox']
});
