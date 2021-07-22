<h1>Add Media Metadata</h1>
<form>
  <p>If you want to create your own database of games, movies or other media</p><br />
  <p>
    <label for="API key">API key</label>
    <input type="text" data-field="add-media-metadata:apikey" title="API key" class="form-control" placeholder="API key"><br />
  </p>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
  require(['admin/settings'], function(Settings) {
    Settings.prepare();
  });
</script>
