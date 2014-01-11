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
Ext.define('NX.view.Info', {
  extend: 'Ext.Component',
  alias: 'widget.nx-info',

  tpl: Ext.create('Ext.XTemplate', [
    '<div class="nx-info">',
    '<table>',
    '<tpl for=".">',
    '<tr class="nx-info-entry">',
    '<td class="nx-info-entry-name">{name}</td>',
    '<td class="nx-info-entry-value">{value}</td>',
    '</tr>',
    '</tpl>',
    '</tr>',
    '</table>',
    '</div>'
  ]),

  showInfo: function (info) {
    var entries = [];
    Ext.Object.each(info, function (key, value) {
      if (!Ext.isEmpty(value)) {
        entries.push(
            {
              name: key,
              value: value
            }
        )
      }
    });
    this.tpl.overwrite(this.getEl(), entries);
    this.up('panel').doComponentLayout();
  }

});
