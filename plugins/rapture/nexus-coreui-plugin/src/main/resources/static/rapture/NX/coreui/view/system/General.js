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
Ext.define('NX.coreui.view.system.General', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-coreui-system-general',

  layout: {
    type: 'vbox',
    align: 'stretch',
    pack: 'start'
  },

  maxWidth: 1024,

  style: {
    margin: '20px'
  },

  defaults: {
    style: {
      margin: '0px 0px 20px 0px'
    }
  },

  items: [
    {
      xtype: 'form',
      api: {
        load: 'NX.direct.coreui_SystemGeneral.read',
        update: 'NX.direct.coreui_SystemGeneral.update'
      },
      items: [
        {
          xtype: 'label',
          html: '<p>Set the base URL for the server.</p>'
        },
        {
          xtype: 'textfield',
          name: 'baseUrl',
          fieldLabel: 'Base URL',
          width: 500,
          emptyText: NX.util.Url.baseUrl
        },
        {
          xtype: 'checkbox',
          name: 'forceBaseUrl',
          boxLabel: 'Force base URL'
        },
        {
          xtype: 'label',
          html: '<p>Version updates.</p>'
        },
        {
          xtype: 'checkbox',
          name: 'checkForUpdates',
          boxLabel: 'Check for new version updates'
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', formBind: true, ui: 'primary',
          handler: function (button) {
            button.up('form').getForm().doAction('directupdate', {
              success: function () {
                NX.Messages.add({ text: 'General system settings updated', type: 'success' });
                button.up('form').load();
              }
            });
          }
        },
        { text: 'Discard',
          handler: function (button) {
            button.up('form').load();
          }
        }
      ],

      listeners: {
        beforerender: function (form) {
          form.load();
        }
      }
    }
  ]

});