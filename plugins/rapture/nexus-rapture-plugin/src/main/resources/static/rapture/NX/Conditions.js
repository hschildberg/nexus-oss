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
 * Access point for available {NX.util.condition.Condition}s.
 *
 * @since 2.8
 */
Ext.define('NX.Conditions', {
  singleton: true,
  requires: [
    'NX.util.condition.Conjunction',
    'NX.util.condition.GridHasSelection',
    'NX.util.condition.IsPermitted',
    'NX.util.condition.StoreHasRecords'
  ],

  /**
   * @param {String} name permission name
   * @param {String} right permission right
   * @returns {NX.util.condition.IsPermitted}
   */
  isPermitted: function (name, right) {
    return Ext.create('NX.util.condition.IsPermitted', { name: name, right: right });
  },

  /**
   * @param {String} store id of store that should have records
   * @returns {NX.util.condition.StoreHasRecords}
   */
  storeHasRecords: function (store) {
    return Ext.create('NX.util.condition.StoreHasRecords', { store: store });
  },

  /**
   * @param {String} grid a grid selector as specified by (@link Ext.ComponentQuery#query}
   * @param {Function} [fn] to be called when grid has a selection to perform additional checks on teh passed in model
   * @returns {NX.util.condition.GridHasSelection}
   */
  gridHasSelection: function (grid, fn, fnScope) {
    return Ext.create('NX.util.condition.GridHasSelection', { grid: grid, fn: fn });
  },

  /**
   * Takes as parameter {NX.util.condition.Condition}s to be AND-ed.
   * @returns {NX.util.condition.Conjunction}
   */
  and: function () {
    return Ext.create('NX.util.condition.Conjunction', { conditions: Array.prototype.slice.call(arguments) });
  }

});