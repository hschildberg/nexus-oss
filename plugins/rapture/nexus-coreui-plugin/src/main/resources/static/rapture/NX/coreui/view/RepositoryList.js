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
Ext.define('NX.coreui.view.RepositoryList', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-repository-list',

  store: 'Repository',

  columns: [
    {
      xtype: 'iconcolumn',
      width: 36,
      iconVariant: 'x16',
      iconName: function () {
        return 'feature-repositories';
      }
    },
    {header: 'Name', dataIndex: 'name', flex: 1},
    {header: 'Type', dataIndex: 'type', flex: 1},
    {header: 'Format', dataIndex: 'format', flex: 1}
  ],

  tbar: [
    { xtype: 'button', text: 'New', glyph: 'xf055@FontAwesome' /* fa-plus-circle */, action: 'new', disabled: true },
    { xtype: 'button', text: 'Delete', glyph: 'xf056@FontAwesome' /* fa-minus-circle */, action: 'delete', disabled: true }
  ],

  refreshable: true
});
