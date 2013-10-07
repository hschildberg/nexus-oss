Ext.define('NX.example.controller.Users', {
  extend: 'Ext.app.Controller',

  stores: [
    'Users'
  ],
  models: [
    'User'
  ],
  views: [
    'List',
    'Edit'
  ],

  init: function () {
    this.control({
      'featurebrowser': {
        beforerender: function (featureBrowser) {
          featureBrowser.add(this.getListView())
        }
      },
      'userlist': {
        itemdblclick: this.editUser
      },
      'useredit button[action=save]': {
        click: this.updateUser
      }
    });
  },

  editUser: function (grid, record) {
    var view = Ext.widget('useredit');
    view.down('form').loadRecord(record);
  },

  updateUser: function (button) {
    var win = button.up('window'),
        form = win.down('form'),
        record = form.getRecord(),
        values = form.getValues();

    record.set(values);
    win.close();
  }
});