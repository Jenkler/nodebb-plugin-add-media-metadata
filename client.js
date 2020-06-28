"use strict";

$(window).on('action:composer.loaded', function (event, data) {
  $('li[data-format="add_movie_source"]').hide();
  $('li[data-format="add_movie_review"]').hide();
  $('li[data-format="add_game_source"]').hide();
  $('li[data-format="add_game_review"]').hide();

  let categoryId = data.composerData.cid;
  let isMain = data.composerData.isMain;
  let postId = data.composerData.pid;
  let topicId = data.composerData.tid;
  let url = '/api/get-parent-category-names';
  let userId = data.composerData.uid;

  if(categoryId) {
    url += '?category_id=' + categoryId;
  } else if(topicId) {
    url += '?topic_id=' + topicId;
  } else if(postId) {
    url += '?post_id=' + postId;
  } else return;
  url += '&user_id=' + userId;

  $.ajax({
    success: function(names) {
      let isInMoviews = names.indexOf('Film') !== -1;
      let isInGames = names.indexOf('Spel') !== -1;
      let isReply = !isMain;
      if(isInMoviews && !isReply) {
        $('li[data-format="add_movie_source"]').show();
      } else if (isInMoviews && isReply) {
        $('li[data-format="add_movie_review"]').show();
      }
      if(isInGames && !isReply) {
        $('li[data-format="add_game_source"]').show();
      } else if (isInGames && isReply) {
        $('li[data-format="add_game_review"]').show();
      }
    },
    url: url,
	});

  let d = new Date();
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  let dateString = ye + '-' + mo + '-' + da;

  $('li[data-format="add_movie_review"]').on('click', function () {
    let textAreaContent =
      '|==========>\n**Count:** 1\n**First:** ' +
      dateString +
      '\n**Last:** ' +
      dateString +
      '\n**Rating:** 2\n\n**Comment:**\n\n<==========|';
    $('.write-container textarea').val(textAreaContent);
  });

  $('li[data-format="add_movie_source"]').on('click', function () {
    $('#add-movie-source-modal').modal({});
  });

  $('body').append(`
  <div class="modal fade" id="add-movie-source-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style="z-index: 99999;">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Imdb-ID</h5>
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
    let id = $('#movie_source_id').val();
    let isUrl = id.startsWith('http');
    if(isUrl) {
      let url = id;
      let nextIsId = false;
      for(let part of url.split('/')) {
        if(part === 'title') {
          nextIsId = true;
        } else if(nextIsId) {
          id = part;
          break;
        }
      }
    }
    let searchUrl =
      '/api/search?term=%3A%20Source%3A%20https%3A%2F%2Fwww.imdb.com%2Ftitle%2F' +
      id +
      '%2F&in=posts&matchWords=all&sortBy=relevance&sortDirection=desc&showAs=posts&_=1593174482873';
    $.ajax({
      success: function(result) {
        let posts = result.posts;
        if(posts.length > 0) {
          let post = posts[0];
          let slug = post.topic.slug;
          window.location.href = '/topic/' + slug;
        }
      },
      url: searchUrl,
		});

    $.ajax({
      success: function(result) {
        let fullTitle = '';
        let source = 'https://www.imdb.com/title/';
        if(result.Response === 'True') {
          fullTitle = result.Title + ' (' + result.Year + ')';
          source += id + '/';
        }
        let textAreaContent = '|==========>\n**Source:** ' + source + '\n<==========|';
        $('.title-container input').val(fullTitle);
        $('.write-container textarea').val(textAreaContent);
      },
      url: '/api/fetch-movie-source?id=' + id,
    });
  });

  $('li[data-format="add_game_source"]').on('click', function () {
    let source = '';
    let textAreaContent = '|==========>\n**Source:** ' + source + '\n<==========|';
    $('.write-container textarea').val(textAreaContent);
  });
  $('li[data-format="add_game_review"]').on('click', function () {
    let textAreaContent =
      '|==========>\n**Completed:** ' +
      dateString +
      '\n**Format:** \n**Rating:** 2\n\n**Comment:**\n\n<==========|';
    $('.write-container textarea').val(textAreaContent);
  });
});
