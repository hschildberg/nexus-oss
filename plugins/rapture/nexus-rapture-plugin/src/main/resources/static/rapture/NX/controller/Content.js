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
Ext.define('NX.controller.Content', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'feature.Content'
  ],

  refs: [
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#Menu': {
          featureselected: me.onFeatureSelected
        }
      }
    });
  },

  /**
   * @private
   * Update content to selected feature view.
   * @param {NX.model.Feature} feature selected feature
   */
  onFeatureSelected: function (feature) {
    var me = this,
        content = me.getFeatureContent(),
        view = feature.get('view'),
        cmp;

    // create new view and replace any current view
    if (Ext.isString(view)) {
      cmp = me.getView(view).create({});
    }
    else {
      cmp = Ext.widget(view);
    }

    // remove the current contents
    content.removeAll();

    // update title and icon
    content.setTitle(feature.get('text'));
    content.setIconCls(NX.Icons.cls(feature.get('iconName'), 'x32'));

    // install new feature view
    content.add(cmp);

    me.logDebug('Content changed to: ' + feature.get('text') + ' (' + cmp.self.getName() + ')');
  }

});