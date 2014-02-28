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
Ext.define('NX.coreui.controller.MavenUpload', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.coreui.store.RepositoryOfType'
  ],

  views: [
    'upload.MavenUpload',
    'upload.MavenUploadArtifact'
  ],

  counter: 0,

  artifactPanelXType: 'nx-coreui-upload-maven-artifact',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-upload-maven': {
        file: 'upload.png',
        variants: ['x16', 'x32']
      }
    });

    me.getApplication().getFeaturesController().registerFeature({
      mode: 'browse',
      path: '/Upload/Maven',
      description: 'Upload artifacts to Maven Hosted Repositories',
      view: { xtype: 'nx-coreui-upload-maven' },
      visible: function () {
        return NX.Permissions.check('nexus:artifact', 'create');
      }
    });

    me.listen({
      component: {
        'nx-coreui-upload-maven form': {
          afterrender: me.refreshAddButton
        },
        'nx-coreui-upload-maven button[action=upload]': {
          click: me.upload
        },
        'nx-coreui-upload-maven button[action=discard]': {
          click: me.discard
        },
        'nx-coreui-upload-maven button[action=add]': {
          click: me.addArtifact
        },
        'nx-coreui-upload-maven-artifact button[action=delete]': {
          click: me.removeArtifact
        },
        'nx-coreui-upload-maven-artifact fileuploadfield': {
          change: me.onFileSelected
        }
      }
    });
  },

  /**
   * @private
   */
  upload: function (button) {
    var me = this,
        form = button.up('form');

    form.submit({
      waitMsg: 'Uploading your artifacts...',
      success: function () {
        NX.Messages.add({ text: 'Artifacts uploaded', type: 'success' });
        me.discardForm(form);
      }
    });
  },

  /**
   * @private
   */
  discard: function (button) {
    var me = this;
    me.discardForm(button.up('form'));
  },

  /**
   * @private
   */
  discardForm: function (form) {
    var me = this,
        artifactPanel;

    me.counter = 0;
    form.getForm().reset();
    artifactPanel = form.down(me.artifactPanelXType);
    while (artifactPanel) {
      form.remove(artifactPanel);
      artifactPanel = form.down(me.artifactPanelXType);
    }
    me.refreshAddButton(form);
  },

  /**
   * @private
   */
  addArtifact: function (button) {
    var me = this,
        form = button.up('form'),
        name = 'a.' + me.counter++;

    form.add({ xtype: me.artifactPanelXType, name: name });

    // HACK: avoid 'Access Denied' in IE which does not like the fact that we are programmatic clicking the button
    if (!Ext.isIE) {
      form.down('field[name=' + name + ']').fileInputEl.dom.click();
    }

    me.refreshAddButton(form);
  },

  /**
   * @private
   */
  removeArtifact: function (button) {
    var me = this,
        form = button.up('form');

    form.remove(button.up(me.artifactPanelXType));
    me.refreshAddButton(form);
  },

  /**
   * @private
   */
  refreshAddButton: function (form) {
    var me = this,
        addButton = form.down('button[action=add]');

    if (addButton) {
      form.remove(addButton);
    }
    form.add({
      xtype: 'button',
      action: 'add',
      text: form.down(me.artifactPanelXType) ? 'Add another artifact' : 'Add an artifact',
      margin: '5 0 10 0',
      glyph: 'xf016@FontAwesome' /* fa-file-o */
    });
  },

  /**
   * @private
   */
  onFileSelected: function (button, fileName) {
    var me = this,
        form = button.up('form'),
        artifactPanel = button.up(me.artifactPanelXType),
        coordinates = me.guessCoordinates(fileName);

    artifactPanel.classifier.setValue(coordinates.classifier);
    artifactPanel.extension.setValue(coordinates.extension);

    if (coordinates.extension === 'pom') {
      //form.down('#group').setValue(coordinates.group);
      form.down('#artifact').setValue(coordinates.artifact);
      form.down('#version').setValue(coordinates.version);
      form.down('#packaging').setValue(coordinates.packaging);
    }
  },

  guessCoordinates: function (fileName) {
    var g = '', a = '', v = '', c = '', p = '', e = '';

    // match extension to guess the packaging
    var extensionIndex = fileName.lastIndexOf('.');
    if (extensionIndex > 0) {
      p = fileName.substring(extensionIndex + 1);
      e = fileName.substring(extensionIndex + 1);
      fileName = fileName.substring(0, extensionIndex);

      if (e === 'asc') {
        var primaryExtensionIndex = fileName.substring(0, extensionIndex).lastIndexOf('.');
        var primaryExtension = '';
        if (primaryExtensionIndex >= 0) {
          primaryExtension = fileName.substring(primaryExtensionIndex + 1);
        }

        if (/^[a-z]*$/.test(primaryExtension)) {
          e = primaryExtension + '.' + e;
          fileName = fileName.substring(0, primaryExtensionIndex);
        }
      }
    }

    // match the path to guess the group
    if (fileName.indexOf('\\') >= 0) {
      fileName = fileName.replace(/\\/g, '\/');
    }
    var slashIndex = fileName.lastIndexOf('/');
    if (slashIndex) {
      g = fileName.substring(0, slashIndex);

      fileName = fileName.substring(slashIndex + 1);
    }

    // separate the artifact name and version
    var versionIndex = fileName.search(/\-[\d]/);
    if (versionIndex === -1) {
      versionIndex = fileName.search(/-LATEST-/i);
      if (versionIndex === -1) {
        versionIndex = fileName.search(/-CURRENT-/i);
      }
    }
    if (versionIndex >= 0) {
      a = fileName.substring(0, versionIndex).toLowerCase();

      // guess the version
      fileName = fileName.substring(versionIndex + 1);
      var classifierIndex = fileName.lastIndexOf('-');
      if (classifierIndex >= 0) {
        var classifier = fileName.substring(classifierIndex + 1);
        if (classifier && !(/^SNAPSHOT$/i.test(classifier) || /^\d/.test(classifier)
            || /^LATEST$/i.test(classifier)
            || /^CURRENT$/i.test(classifier))) {
          c = classifier;
          fileName = fileName.substring(0, classifierIndex);
          // dont guess packaging when there is a classifier
          p = '';
          extensionIndex = c.indexOf('.');
          if (extensionIndex >= 0) {
            e = c.substring(extensionIndex + 1) + '.' + e;
            c = c.substring(0, extensionIndex);
          }
        }
      }
      v = fileName;

      if (g) {
        // if group ends with version and artifact name, strip those parts
        // (useful if uploading from a local maven repo)
        var i = g.search(new RegExp('\/' + v + '$'));
        if (i > -1) {
          g = g.substring(0, i);
        }
        i = g.search(new RegExp('\/' + a + '$'));
        if (i > -1) {
          g = g.substring(0, i);
        }

        // strip extra path parts, leave only com.* or org.* or net.* or the
        // last element
        i = g.lastIndexOf('/com/');
        if (i === -1) {
          i = g.lastIndexOf('/org/');
          if (i === -1) {
            i = g.lastIndexOf('/net/');
            if (i === -1) {
              i = g.lastIndexOf('/');
            }
          }
        }
        g = g.substring(i + 1).replace(/\//g, '.').toLowerCase();
      }
    }
    else {
      g = '';
    }

    return { group: g, artifact: a, version: v, packaging: p, extension: e, classifier: c };
  }

});