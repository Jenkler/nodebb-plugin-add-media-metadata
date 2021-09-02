'use strict';

$(window).on('action:composer.loaded', function (event, data) {
  let date = new Date().toISOString().split('T')[0];
  let url = '/api/get-media-category';

  $('li[data-format="add_movie_source"]').hide();
  $('li[data-format="add_movie_review"]').hide();
  $('li[data-format="add_game_source"]').hide();
  $('li[data-format="add_game_review"]').hide();

  if(data.composerData.cid) {
    url += '?category_id=' + data.composerData.cid;
  } else if(data.composerData.tid) {
    url += '?topic_id=' + data.composerData.tid;
  } else if(data.composerData.pid) {
    url += '?post_id=' + data.composerData.pid;
  } else return;

  $.ajax({
    success: function(names) {
      if(names.indexOf('Film') !== -1 && data.composerData.isMain) {
        $('li[data-format="add_movie_source"]').show();
      } else if (names.indexOf('Film') !== -1 && !data.composerData.isMain) {
        $('li[data-format="add_movie_review"]').show();
      } else if(names.indexOf('Spel') !== -1 && data.composerData.isMain) {
        $('li[data-format="add_game_source"]').show();
      } else if (names.indexOf('Spel') !== -1 && !data.composerData.isMain) {
        $('li[data-format="add_game_review"]').show();
      }
    },
    url: url,
  });

  $('li[data-format="add_movie_review"]').on('click', function () {
    let body =
      '|==========>\n**Count:** 1\n**First:** ' +
      date +
      '\n**Last:** ' +
      date +
      '\n**Rating:** 2\n\n**Comment:**\n\n<==========|';
    $('.write-container textarea').val(body);
  });

  $('li[data-format="add_movie_source"]').on('click', function () {
    $('#add-movie-source-modal').modal({});
  });

  $('body').append(`
  <div class="modal fade" id="add-movie-source-modal" tabindex="-1" role="dialog" aria-labelledby="imdbid" aria-hidden="true" style="z-index: 99999;">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="imdbid">Imdb-ID (tt0000000) or Imdb-url</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <input type="text" id="movie_source_id"/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal" id="movie_source_ok_button">OK</button>
        </div>
      </div>
    </div>
  </div>`);

  $('#movie_source_ok_button').on('click', function() {
    let id = $('#movie_source_id').val().match(/tt[0-9]{4,20}/i);
    if(id === null) location.reload();
    $.ajax({
      success: function(result) {
        let posts = result.posts;
        if(posts.length > 0) window.location.href = '/topic/' + posts[0].topic.slug;
      },
      url: '/api/search?term=%3A%20Source%3A%20https%3A%2F%2Fwww.imdb.com%2Ftitle%2F' + id +
      '%2F&in=posts&matchWords=all&sortBy=relevance&sortDirection=desc&showAs=posts&_=1593174482873',
    });

    $.ajax({
      success: function(result) {
        let title = '';
        let source = 'https://www.imdb.com/title/';
        if(result.Response === 'True') {
          title = result.Title + ' (' + result.Year + ')';
          source += id + '/';
        }
        let body = '|==========>\n**Source:** ' + source + '\n<==========|';
        $('.title-container input').val(title);
        $('.write-container textarea').val(body);
      },
      url: '/api/get-media-source?id=' + id,
    });
    $('#movie_source_id').val('');
  });

  $('li[data-format="add_game_source"]').on('click', function () {
    let source = '';
    let body = '|==========>\n**Source:** ' + source + '\n<==========|';
    $('.write-container textarea').val(body);
  });
  $('li[data-format="add_game_review"]').on('click', function () {
    let body =
      '|==========>\n**Completed:** ' +
      date +
      '\n**Format:** \n**Rating:** 2\n\n**Comment:**\n\n<==========|';
    $('.write-container textarea').val(body);
  });
});
