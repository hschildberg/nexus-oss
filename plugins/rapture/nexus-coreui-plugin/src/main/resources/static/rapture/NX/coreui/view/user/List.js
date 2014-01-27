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
Ext.define('NX.coreui.view.user.List', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-user-list',

  store: 'User',

  columns: [
    {
      xtype: 'iconcolumn',
      width: 36,
      iconVariant: 'x16',
      iconName: function () {
        return 'user';
      }
    },
    {header: 'User Id', dataIndex: 'id'},
    {header: 'Realm', dataIndex: 'realm'},
    {header: 'First name', dataIndex: 'firstName'},
    {header: 'Last name', dataIndex: 'lastName', width: 300},
    {header: 'Email', dataIndex: 'email', width: 250},
    {header: 'Status', dataIndex: 'status'}
  ],

  tbar: [
    { xtype: 'button', text: 'New', action: 'new', disabled: true },
    { xtype: 'button', text: 'Delete', action: 'delete', disabled: true }
  ],

  refreshable: true
});
