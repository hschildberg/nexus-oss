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
 * @since 2.8
 */
Ext.define('NX.util.condition.Condition', {
  mixins: {
    observable: 'Ext.util.Observable',
    logAware: 'NX.LogAware'
  },

  statics: {
    idGenerator: Ext.create('Ext.data.SequentialIdGenerator', { prefix: 'condition-' })
  },

  /**
   * Generated id used by event bus.
   */
  id: undefined,

  /**
   * @private {Number} number of listeners listening to this condition
   */
  listenerCounter: 0,

  /**
   * @private {Boolean} true when this condition is bounded
   */
  bounded: false,

  /**
   * @private {Boolean} true when this condition is satisfied
   */
  satisfied: false,

  /**
   * @protected
   * Sets {@link #bounded} = true.
   * @returns itself
   */
  bind: function () {
    var me = this;

    if (!me.bounded) {
      me.setBounded(true);
    }

    return me;
  },

  /**
   * @protected
   * Clears all listeners of this condition and sets {@link #bounded} = false.
   * @returns itself
   */
  unbind: function () {
    var me = this;

    if (me.bounded) {
      me.clearListeners();
      Ext.app.EventBus.unlisten(me.id);
      me.setBounded(false);
    }

    return me;
  },

  constructor: function (config) {
    var me = this;

    me.id = NX.util.condition.Condition.idGenerator.generate();

    me.mixins.observable.constructor.call(me, config);

    me.addEvents(
        /**
         * @event satisfied
         * Fires when condition is satisfied.
         * @param {NX.util.condition.Condition} this
         */
        'satisfied',
        /**
         * @event unsatisfied
         * Fires when condition is not satisfied.
         * @param {NX.util.condition.Condition} this
         */
        'unsatisfied'
    );
  },

  /**
   * @protected
   * Sets {@link #bounded} = false and makes condition unsatisfied.
   * @param bounded
   */
  setBounded: function (bounded) {
    var me = this;
    if (Ext.isDefined(me.bounded)) {
      if (bounded !== me.bounded) {
        if (!bounded) {
          me.setSatisfied(false);
        }
        me.logDebug((bounded ? 'Bounded: ' : 'Unbounded: ') + me);
        me.bounded = bounded;
      }
    }
    else {
      me.bounded = bounded;
    }
  },

  /**
   * @public
   * @returns {boolean} true, if condition is satisfied
   */
  isSatisfied: function () {
    var me = this;
    return me.satisfied;
  },

  /**
   * @protected
   * Sets {@link #satisfied} = true and fires 'satisfied' / 'unsatisfied' if satisfied changed.
   * @param {boolean} satisfied if condition is satisfied
   */
  setSatisfied: function (satisfied) {
    var me = this;
    if (Ext.isDefined(me.satisfied)) {
      if (satisfied !== me.satisfied) {
        me.logDebug((satisfied ? 'Satisfied: ' : 'Unsatisfied: ') + me);
        me.satisfied = satisfied;
        me.fireEvent(satisfied ? 'satisfied' : 'unsatisfied', me);
      }
    }
    else {
      me.satisfied = satisfied;
    }
  },

  /**
   * @override
   * Additionally, {@link #bind}s when first listener added.
   */
  addListener: function (ename, fn, scope, options) {
    var me = this;
    me.mixins.observable.addListener.call(me, ename, fn, scope, options);
    me.listenerCounter++;
    if (me.listenerCounter === 1) {
      me.bind();
    }
    // re-fire event so new listener has the chance to do its job
    me.fireEvent(me.satisfied ? 'satisfied' : 'unsatisfied', me);
  },

  /**
   * @override
   * Additionally, {@link #unbind}s when no more listeners.
   */
  removeListener: function (ename, fn, scope) {
    var me = this;
    me.mixins.observable.removeListener.call(me, ename, fn, scope);
    me.listenerCounter--;
    if (me.listenerCounter === 0) {
      me.unbind();
    }
  }

  // comment the following lines to let debug messages flow
  , logDebug: function () {
  }

});