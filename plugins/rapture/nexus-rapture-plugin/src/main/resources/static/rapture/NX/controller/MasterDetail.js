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
Ext.define('NX.controller.MasterDetail', {
  extend: 'Ext.app.Controller',
  requires: [
    // many impls use this
    'NX.view.info.Panel',
    'NX.view.info.Entry'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'masterdetail.Panel',
    'masterdetail.Tabs'
  ],

  permission: undefined,

  onSelection: Ext.emptyFn,

  getDescription: Ext.emptyFn,

  /**
   * @cfg {Function} optional function to be called on delete
   */
  deleteModel: undefined,

  init: function () {
    var me = this,
        componentListener = {};

    componentListener[me.list] = {
      afterrender: me.onAfterRender,
      selectionchange: me.onSelectionChange,
      selection: me.onSelection
    };
    componentListener[me.list + ' button[action=new]'] = {
      afterrender: me.bindNewButton
    };
    componentListener[me.list + ' ^ nx-masterdetail-panel nx-masterdetail-tabs > tabpanel'] = {
      tabchange: me.bookmark
    };

    // bind to a delete button if delete function defined
    if (me.deleteModel) {
      componentListener[me.list + ' button[action=delete]'] = {
        afterrender: me.bindDeleteButton,
        click: me.onDelete
      };
    }

    me.listen({
      component: componentListener,
      controller: {
        '#Bookmarking': {
          navigate: me.navigateTo
        },
        '#Refresh': {
          refresh: me.onRefresh
        }
      }
    });

    if (me.icons) {
      me.getApplication().getIconController().addIcons(me.icons);
    }
    if (me.features) {
      me.getApplication().getFeaturesController().registerFeature(me.features);
    }
  },

  loadStore: function () {
    var me = this,
        list = me.getList();

    if (list) {
      list.getStore().load();
    }
  },

  loadStoreAndSelect: function (modelId) {
    var me = this;

    if (modelId) {
      me.bookmarkAt(modelId)
    }

    me.loadStore();
  },

  onStoreLoad: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.navigateTo(NX.Bookmarks.getBookmark());
    }
  },

  reselect: function () {
    var me = this,
        list = me.getList(),
        selected;

    if (list) {
      selected = list.getSelectionModel().getSelection();
      if (selected.length) {
        me.onModelChanged(selected[0]);
      }
    }
  },

  onRefresh: function () {
    var me = this,
        list = me.getList(),
        contentPanel;

    if (list) {
      contentPanel = list.up('nx-feature-content');
      if (contentPanel && contentPanel.title) {
        NX.Messages.add({ text: contentPanel.title + ' refreshed', type: 'default'});
      }
      me.loadStore();
    }
  },

  onAfterRender: function () {
    var me = this,
        list = me.getList();

    list.mon(list.getStore(), 'load', me.onStoreLoad, me);
    me.loadStore();
  },

  onSelectionChange: function (selectionModel, selected) {
    var me = this;

    me.onModelChanged(selected[0]);
    me.bookmark();
  },

  onModelChanged: function (model) {
    var me = this,
        list = me.getList(),
        tabs = list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs');

    if (model) {
      tabs.show();
      list.getView().focusRow(model);
      tabs.setDescription(me.getDescription(model));
    }
    else {
      tabs.hide();
      tabs.setDescription('Empty selection');
    }

    me.getList().fireEvent('selection', me.getList(), model);
  },

  /**
   * Bookmark current selected model / selected tab.
   */
  bookmark: function () {
    var me = this,
        selected = me.getList().getSelectionModel().getSelection(),
        modelId;

    if (selected.length) {
      modelId = selected[0].getId();
    }
    me.bookmarkAt(modelId)
  },

  /**
   * Bookmark specified model / selected tab.
   */
  bookmarkAt: function (modelId) {
    var me = this,
        list = me.getList(),
        tabs = list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs'),
        bookmark = NX.Bookmarks.fromToken(NX.Bookmarks.getBookmark().getSegment(0)),
        segments = [],
        idBookmark, selectedTabBookmark;

    if (modelId) {
      idBookmark = modelId;
      if (NX.Bookmarks.encode(idBookmark) != idBookmark) {
        idBookmark = NX.Bookmarks.encode(idBookmark);
      }
      segments.push(idBookmark);
      selectedTabBookmark = tabs.getBookmarkOfSelectedTab();
      if (selectedTabBookmark) {
        segments.push(selectedTabBookmark);
      }
      bookmark.appendSegments(segments);
    }
    NX.Bookmarks.bookmark(bookmark, me);
  },

  /**
   * @public
   * @param {NX.Bookmark} bookmark to navigate to
   */
  navigateTo: function (bookmark) {
    var me = this,
        list = me.getList(),
        store, modelId, tabBookmark, model, tabs;

    if (list && bookmark) {
      modelId = bookmark.getSegment(1);
      tabBookmark = bookmark.getSegment(2);
      if (modelId) {
        me.logDebug('Navigate to: ' + modelId + (tabBookmark ? ":" + tabBookmark : ''));
        store = list.getStore();
        model = store.getById(modelId);
        // lets try to see if we can find the record by encoded value
        // TODO review this as it can be a performance penalty
        // Maybe we should ass a marker that the bookmark was encoded and only search in that case
        if (!model) {
          model = store.getAt(store.findBy(function (model) {
            return NX.Bookmarks.encode(model.getId()) === modelId;
          }));
        }
        if (model) {
          list.getSelectionModel().select(model, false, true);
          list.getView().focusRow(model);
          me.onModelChanged(model);
        }
        if (tabBookmark) {
          list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs').setActiveTabByBookmark(tabBookmark);
        }
      }
      else {
        list.getSelectionModel().deselectAll();
      }
    }
  },

  onDelete: function () {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection(),
        description;

    if (Ext.isDefined(selection) && selection.length > 0) {
      description = me.getDescription(selection[0]);
      NX.Dialogs.askConfirmation('Confirm deletion?', description, function () {
        me.deleteModel(selection[0])
      }, {scope: me});
    }
  },

  /**
   * @returns {Ext.data.Model} selected model if there is a selection, undefined otherwise
   */
  selectedModel: function () {
    var me = this,
        list = me.getList(),
        selection, model;

    if (list) {
      selection = list.getSelectionModel().getSelection();
      if (selection.length) {
        model = selection[0];
      }
    }
    return model;
  },

  /**
   * @protected
   * Enable 'New' when user has 'create' permission.
   */
  bindNewButton: function (button) {
    var me = this;
    button.mon(
        NX.Conditions.isPermitted(me.permission, 'create'),
        {
          satisfied: button.enable,
          unsatisfied: button.disable,
          scope: button
        }
    );
  },

  /**
   * @protected
   * Enable 'Delete' when user has 'delete' permission.
   */
  bindDeleteButton: function (button) {
    var me = this;
    button.mon(
        NX.Conditions.and(
            NX.Conditions.isPermitted(me.permission, 'delete'),
            NX.Conditions.gridHasSelection(me.list)
        ),
        {
          satisfied: button.enable,
          unsatisfied: button.disable,
          scope: button
        }
    );
  }

});