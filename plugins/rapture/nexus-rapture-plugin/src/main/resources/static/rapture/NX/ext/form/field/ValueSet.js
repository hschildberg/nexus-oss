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
 * A form field that allows managing multiple values.
 */
Ext.define('NX.ext.form.field.ValueSet', {
  extend: 'Ext.form.FieldContainer',
  alias: 'widget.nx-valueset',
  requires: [
    'Ext.data.SequentialIdGenerator'
  ],
  mixins: {
    field: 'Ext.form.field.Field'
  },

  statics: {
    idGenerator: Ext.create('Ext.data.SequentialIdGenerator'),
    generateId: function () {
      return 'nx-valueset-valuefield-' + NX.ext.form.field.ValueSet.idGenerator.generate();
    }
  },

  /**
   * @cfg {Number} [minValues=0] Minimum number of selections allowed.
   */
  minValues: 0,

  /**
   * @cfg {Number} [maxValues=Number.MAX_VALUE] Maximum number of values allowed.
   */
  maxValues: Number.MAX_VALUE,

  /**
   * @cfg {String} [blankText="This field is required"] Default text displayed when the control contains no values.
   */
  blankText: 'This field is required',

  /**
   * @cfg {String} [minValuesText="Minimum {0} value(s) required"]
   * Validation message displayed when {@link #minValues} is not met.
   * The {0} token will be replaced by the value of {@link #minValues}.
   */
  minValuesText: 'Minimum {0} value(s) required',

  /**
   * @cfg {String} [maxValuesText="Maximum {0} value(s) allowed"]
   * Validation message displayed when {@link #maxValues} is not met
   * The {0} token will be replaced by the value of {@link #maxValues}.
   */
  maxValuesText: 'Maximum {0} values(s) allowed',

  /**
   * @cfg {Boolean} [allowBlank=true] `false` to require at least one value, `true` to allow no value.
   */
  allowBlank: true,

  /**
   * @cfg {Boolean} [sorted=false] `true` to sort values, `false` to use adding order
   */
  sorted: false,

  /**
   * @cfg {Ext.form.field.Field} [input=true] Field to be used to add values. If not defined an
   * {@link Ext.form.field.Text} will be used.
   */
  input: undefined,

  /**
   * @cfg {String} emptyText
   * The default text to place into an empty field.
   * @see Ext.form.field.Text#emptyText
   */
  emptyText: undefined,

  converter: {
    toValues: undefined,
    fromValues: undefined
  },

  /**
   * @cfg {String} [glyphAddButton="xf055@FontAwesome"]
   */
  glyphAddButton: 'xf055@FontAwesome' /* fa-plus-circle */,

  /**
   * @cfg {String} [glyphAddButton="xf056@FontAwesome"]
   */
  glyphDeleteButton: 'xf056@FontAwesome' /* fa-minus-circle */,

  /**
   * @private {Ext.data.Store} Stores managed values
   */
  store: undefined,

  /**
   * @override
   */
  initComponent: function () {
    var me = this,
        valueFieldId = NX.ext.form.field.ValueSet.generateId();

    if (!Ext.isDefined(me.input)) {
      me.input = {
        xtype: 'textfield'
      }
    }
    Ext.apply(me.input, {
      valueFieldId: valueFieldId,
      submitValue: false,
      isFormField: false,
      preventMark: true,
      flex: 1
    });
    if (me.emptyText) {
      me.input.emptyText = me.emptyText;
    }
    if (!me.converter) {
      me.converter = {};
    }
    if (!me.converter.toValues || !Ext.isFunction(me.converter.toValues)) {
      me.converter.toValues = function (values) {
        return values;
      }
    }
    if (!me.converter.fromValues || !Ext.isFunction(me.converter.fromValues)) {
      me.converter.fromValues = function (values) {
        return values;
      }
    }

    me.items = [
      {
        xtype: 'panel',
        layout: 'hbox',
        items: [
          me.input,
          {
            xtype: 'button',
            listeners: {
              click: me.addValue,
              scope: me
            },
            ui: 'plain',
            glyph: me.glyphAddButton
          }
        ]
      },
      me.values = {
        xtype: 'grid',
        hideHeaders: true,
        padding: '5 0 0 0',
        height: me.height ? undefined : 200,
        flex: me.height ? 1 : 0,
        //autoScroll: true,
        columns: [
          { text: 'Value', dataIndex: 'value', flex: 1 },
          {
            xtype: 'actioncolumn',
            width: 25,
            items: [
              {
                iconCls: NX.Icons.cls('permission-denied', 'x16'),
                tooltip: 'Delete',
                handler: function (grid, rowIndex) {
                  me.removeValue(rowIndex);
                }
              }
            ]
          }
        ],
        store: me.store = Ext.create('Ext.data.Store', {
          storeId: valueFieldId,
          fields: ['value'],
          idProperty: 'value',
          sorters: me.sorted ? { property: 'value', direction: 'ASC' } : undefined
        })
      }
    ];

    me.callParent(arguments);

    me.on('afterrender', function () {
      me.valueField = me.down('component[valueFieldId=' + valueFieldId + ']');
      me.mon(me.valueField, 'blur', function (input) {
        input.preventMark = false;
        input.clearInvalid();
      });
      me.mon(me.valueField, 'focus', function (input) {
        input.preventMark = false;
        input.validate();
      });
      Ext.create('Ext.util.KeyNav', me.valueField.el, {
        enter: me.addValue,
        scope: me
      })
    });
  },

  /**
   * @private
   * Add value form input field to set of values.
   */
  addValue: function () {
    var me = this,
        valueToAdd;

    if (!me.valueField.isValid()) {
      return;
    }

    valueToAdd = me.valueField.getValue();

    if (valueToAdd && me.store.find('value', valueToAdd) === -1) {
      me.store.add({ value: valueToAdd });
      me.valueField.setValue(undefined);
    }

    me.valueField.focus();

    me.syncValue();
  },

  /**
   * @private
   * Remove value form input field to set of values.
   * @param {Number} rowIndex of value to be deleted
   */
  removeValue: function (rowIndex) {
    var me = this;

    me.store.removeAt(rowIndex);
    me.syncValue();
  },

  getSubmitData: function () {
    var me = this,
        data = null,
        val;

    if (!me.disabled && me.submitValue && !me.isFileUpload()) {
      val = me.getSubmitValue();
      if (val !== null) {
        data = {};
        data[me.getName()] = val;
      }
    }
    return data;
  },

  getSubmitValue: function () {
    var me = this;

    return me.getValue();
  },

  isValid: function () {
    var me = this,
        disabled = me.disabled,
        validate = me.forceValidation || !disabled;

    return validate ? me.validateValue() : disabled;
  },

  validateValue: function () {
    var me = this,
        errors = me.getErrors(),
        isValid = Ext.isEmpty(errors);

    if (!me.preventMark) {
      if (isValid) {
        me.clearInvalid();
      }
      else {
        me.markInvalid(errors);
      }
    }

    return isValid;
  },

  markInvalid: function (errors) {
    var me = this,
        oldMsg = me.getActiveError();

    me.setActiveErrors(Ext.Array.from(errors));

    if (oldMsg !== me.getActiveError()) {
      me.updateLayout();
    }
  },

  getErrors: function () {
    var me = this,
        format = Ext.String.format,
        errors = [],
        numValues = me.store.getCount();

    if (!me.allowBlank && numValues < 1) {
      errors.push(me.blankText);
    }
    if (numValues < me.minValues) {
      errors.push(format(me.minValuesText, me.minValues));
    }
    if (numValues > me.maxValues) {
      errors.push(format(me.maxValuesText, me.maxValues));
    }
    return errors;
  },

  /**
   * Clear any invalid styles/messages.
   */
  clearInvalid: function () {
    // Clear the message and fire the 'valid' event
    var me = this,
        hadError = me.hasActiveError();
    me.unsetActiveError();
    if (hadError) {
      me.updateLayout();
    }
  },

  /**
   * @inheritdoc Ext.form.field.Field#setValue
   */
  setValue: function (value) {
    var me = this;

    me.loadValues(value);
    me.syncValue();
  },

  /**
   * @private
   * @returns {Array} store values as an array
   */
  getValues: function () {
    var me = this,
        values = [];

    me.store.each(function (model) {
      values.push(model.get('value'));
    });

    return values;
  },

  /**
   * @private
   * Loads values into the store.
   * @param value to be converted and loaded into store
   */
  loadValues: function (value) {
    var me = this,
        converted;

    me.store.removeAll();
    if (value) {
      converted = me.converter.toValues(value);
      Ext.each(converted, function (value) {
        me.store.add({ value: value });
      });
    }
  },

  /**
   * @private
   * Synchronizes the submit value with the current state of the store.
   */
  syncValue: function () {
    var me = this;
    me.mixins.field.setValue.call(me, me.converter.fromValues(me.getValues()));
  }

}, function () {

  this.borrow(Ext.form.field.Base, ['setError']);

});
