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
/*global NX, Ext, Nexus*/

/**
 * Capability Settings FieldSet.
 *
 * @since 2.7
 */
Ext.define('NX.coreui.view.capability.SettingsFieldSet', {
  extend: 'Ext.form.FieldSet',
  alias: 'widget.nx-capability-settings-fieldset',

  requires: [
    'NX.coreui.view.capability.factory.CheckboxFactory',
    'NX.coreui.view.capability.factory.ComboFactory',
    'NX.coreui.view.capability.factory.DateFieldFactory',
    'NX.coreui.view.capability.factory.NumberFieldFactory',
    'NX.coreui.view.capability.factory.TextAreaFactory',
    'NX.coreui.view.capability.factory.TextFieldFactory'
  ],

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    Ext.apply(me, {
      autoHeight: false,
      autoScroll: true,
      collapsed: false,
      labelWidth: 120,
      labelSeparator: '',
      items: []
    });

    me.callParent(arguments);

    me.factories = Ext.create('Ext.util.MixedCollection');

    me.addFactory(NX.coreui.view.capability.factory.CheckboxFactory);
    me.addFactory(NX.coreui.view.capability.factory.ComboFactory);
    me.addFactory(NX.coreui.view.capability.factory.DateFieldFactory);
    me.addFactory(NX.coreui.view.capability.factory.NumberFieldFactory);
    me.addFactory(NX.coreui.view.capability.factory.TextAreaFactory);
    me.addFactory(NX.coreui.view.capability.factory.TextFieldFactory);
  },

  /**
   * @property
   */
  capabilityType: undefined,

  /**
   * @private
   */
  factories: undefined,

  /**
   * Renders fields for a capability type.
   * @param capabilityTypeModel capability type to rendered
   */
  setCapabilityType: function (capabilityTypeModel) {
    var me = this,
        item;

    me.capabilityType = capabilityTypeModel;

    me.removeAll();

    if (me.capabilityType) {
      me.add({
        xtype: 'checkbox',
        fieldLabel: 'Enabled',
        helpText: 'This flag determines if the capability is currently enabled. To disable this capability for a period of time, de-select this checkbox.',
        name: 'enabled',
        allowBlank: false,
        checked: true,
        editable: true
      });

      if (me.capabilityType.get('formFields')) {
        Ext.each(me.capabilityType.get('formFields'), function (formField) {
          var factory = me.factories.get(formField.type);
          if (!factory) {
            factory = me.factories.get('string');
          }
          if (factory) {
            item = Ext.apply(factory.create(formField), {
              requiresPermission: true,
              name: 'property.' + formField.id,
              factory: factory
            });
            if (item.xtype === 'combo' && item.store) {
              item.store.on('load', function () {
                if (item.store) {
                  item.setValue(item.getValue());
                }
              }, me, {single: true});
            }
            me.add(item);
          }
        });
      }
    }
  },

  /**
   * Exports form as a capability.
   * @param form to be exported
   * @returns {Object} capability
   */
  exportCapability: function (form) {
    var me = this,
        values = form.getFieldValues(),
        value,
        capability = {
          typeId: me.capabilityType.get('id'),
          enabled: values.enabled,
          properties: []
        };

    if (me.capabilityType && me.capabilityType.get('formFields')) {
      Ext.each(me.capabilityType.get('formFields'), function (formField) {
        value = values['property.' + formField.id];
        if (Ext.isDefined(value)) {
          capability.properties[capability.properties.length] = {
            key: formField.id,
            value: String(value)
          };
        }
      });
    }

    return capability;
  },

  /**
   * Imports capability into a form.
   * @param form to set values into
   * @param {NX.model.Capability} capabilityModel to import
   * @param {NX.model.CapabilityType} capabilityTypeModel
   */
  importCapability: function (form, capabilityModel, capabilityTypeModel) {
    var me = this,
        data = Ext.apply({}, {enabled: capabilityModel.data.enabled});

    me.setCapabilityType(capabilityTypeModel);

    if (me.capabilityType && me.capabilityType.get('formFields')) {
      Ext.each(me.capabilityType.get('formFields'), function (formField) {
        data['property.' + formField.id] = '';
      });
    }

    if (capabilityModel.data.properties) {
      Ext.each(capabilityModel.data.properties, function (property) {
        data['property.' + property.key] = property.value;
      });
    }

    form.setValues(data);
  },

  markInvalid: function (form, errors) {
    var remainingMessages = [],
        key, marked, field;

    if (Ext.isDefined(errors)) {
      for (key in errors) {
        if (errors.hasOwnProperty(key)) {
          marked = false;
          if (form) {
            field = form.findField('property.' + key);
            if (!field) {
              field = form.findField(key);
            }
            if (field) {
              marked = true;
              field.markInvalid(errors[key]);
            }
          }
          if (!marked) {
            remainingMessages.push(errors[key]);
          }
        }
      }
    }

    if (remainingMessages.length > 0) {
      return remainingMessages.join('\n');
    }

    return undefined;
  },

  /**
   * @private
   */
  addFactory: function (factory) {
    var me = this;

    Ext.each(factory.supports, function (supported) {
      me.factories.add(supported, factory);
    });
  }

});