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
 * Helpers to interact with **{@link NX.controller.Bookmarking}** controller.
 *
 * @since 2.8
 */
Ext.define('NX.Bookmarks', {
  singleton: true,
  requires:[
    'NX.Bookmark'
  ],

  /**
   * Reference to the **{@link NX.controller.Bookmarking}** controller, set when it initializes.
   *
   * @private
   * @type {NX.controller.Bookmarking}
   */
  controller: undefined,

  /**
   * Install the controller reference.
   *
   * @public
   * @param {NX.controller.Bookmarking} controller
   */
  install: function (controller) {
    this.controller = controller;
  },

  /**
   * @see {@link NX.controller.Bookmarking#getBookmark}
   */
  getBookmark: function () {
    return this.controller.getBookmark();
  },

  /**
   * @see {@link NX.controller.Bookmarking#bookmark}
   */
  bookmark: function (bookmark, caller) {
    return this.controller.bookmark(bookmark, caller);
  },

  /**
   * @see {@link NX.controller.Bookmarking#navigateTo}
   */
  navigateTo: function (bookmark, caller) {
    return this.controller.navigateTo(bookmark, caller);
  },

  /**
   * @public
   * Creates a new bookmark.
   * @param [{String}] token bookmark token
   * @returns {NX.Bookmark} created bookmark
   */
  fromToken: function (token) {
    return Ext.create('NX.Bookmark', { token: token });
  },

  /**
   * @public
   * Creates a new bookmark from provided segments.
   * @param {String[]} segments bookmark segments
   * @returns {NX.Bookmark} created bookmark
   */
  fromSegments: function (segments) {
    if (!Ext.isDefined(segments)) {
      throw Ext.Error.raise('Bookmarks segments cannot be undefined');
    }
    if (!Ext.isArray(segments)) {
      segments = [segments];
    }
    return Ext.create('NX.Bookmark', { token: segments.join(':') });
  },

  /**
   * Encodes the value suitable to be used as a bookmark token.
   * (eliminate spaces and lower case)
   * @param value to be encoded
   * @returns {String} encoded value
   */
  encode: function (value) {
    if (!Ext.isString(value)) {
      throw Ext.Error.raise('Value to be encoded must be a String');
    }
    return value.replace(/\s/g, '');
  }

});