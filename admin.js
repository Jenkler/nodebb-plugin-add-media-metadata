'use strict';

define('admin/add-media-metadata', ['settings'], function(Settings) {
  let ACP = {};
  ACP.init = function() {
    Settings.load('add-media-metadata', $('.add-media-metadata-settings'));
    $('#save').on('click', function() {
      Settings.save('add-media-metadata', $('.add-media-metadata-settings'), function() {
        app.alert({
          alert_id: 'add-media-metadata-saved',
          message: 'Updated Add Media Metadata settings',
          timeout: 2000,
          title: 'Settings Saved',
          type: 'success'
        });
      });
    });
  };
  return ACP;
});
