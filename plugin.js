"use strict";

const categories = require.main.require('./src/categories');
const posts = require.main.require('./src/posts');
const request = require('request');
const routesHelpers = require.main.require('./src/routes/helpers');
const topics = require.main.require('./src/topics');

function apiFetchMoviewSources(req, res) {
  let url = 'http://www.omdbapi.com/?i=' + req.query.id + '&apikey=c6a5b10a';
  request(url, function (error, response, body) {
    res.json(JSON.parse(body));
  });
}
function apiGetParentCategoryNames(req, res) {
  let userId = 1;
  let categoryId;
  if(req.query.category_id) {
    categoryId = req.query.category_id;
    getParentCategoryNames(categoryId, function(names) {
      res.json(names);
    });
  } else if(req.query.topic_id) {
    getTopic(req.query.topic_id, userId, function(topic) {
      categoryId = topic.category.cid;
      getParentCategoryNames(categoryId, function(names) {
        res.json(names);
      });
    });
  } else if(req.query.post_id) {
    posts.getPostsByPids([req.query.post_id], userId, function(a, b, c) {
      let post = b[0];
      getTopic(post.tid, userId, function(topic) {
        categoryId = topic.category.cid;
        getParentCategoryNames(categoryId, function(names) {
          res.json(names);
        });
      });
    });
  } else {
    res.json({});
  }
}
function createPersonalTag(topicId, userId, suffix) {
  topics.createTags(['a-uex' + userId + '-' + suffix], topicId, Date.now());
}
function getParentCategoryNames(categoryId, callback) {
  let names = [];
  categories.getParents([categoryId], function(a, b, c) {
    let parentCategories = b;
    for(let category of parentCategories) {
      if(!category || !category.name) continue;
      names.push(category.name);
    }
    callback(names);
  });
}
function getTopic(topicId, userId, callback) {
  topics.getTopics([topicId], userId, function(req, res, next) {
    callback(res[0]);
  });
}

exports.actionPostEditSave = function(params) {
  getTopic(params.post.tid, params.post.uid, function (topic) {
    let isReview = params.post.content.match(/\|==========>[\s\S]*\*\*Comment:\*\*[\s\S]*<==========\|/);
    if(isReview) {
      getParentCategoryNames(topic.category.cid, function (names) {
        let isInMovieCategory = names.indexOf('Film') !== -1;
        let isInGameCategory = names.indexOf('Spel') !== -1;
        if(isInMovieCategory) {
          createPersonalTag(params.post.tid, params.post.uid, 'film');
        } else if(isInGameCategory) {
          createPersonalTag(params.post.tid, params.post.uid, 'spel');
        }
      });
    }
  });
};
exports.filterComposerFormatting = function(payload, callback) {
  payload.options.push({
    className: 'add-movie-source fa fa-video-camera',
    name: 'add_movie_source',
    title: 'Add movie source',
  });
  payload.options.push({
    className: 'add-movie-review fa fa-video-camera',
    name: 'add_movie_review',
    title: 'Add movie review',
  });
  payload.options.push({
    className: 'add-game-source fa fa-gamepad',
    name: 'add_game_source',
    title: 'Add game source',
  });
  payload.options.push({
    className: 'add-game-review fa fa-gamepad',
    name: 'add_game_review',
    title: 'Add game review',
  });
  callback(null, payload);
};
exports.staticAppLoad = function(data, callback) {
  console.log('Loading Jenkler Add Media Metadata plugin ' + require('./package.json').version);
  routesHelpers.setupPageRoute(data.router, '/fetch-movie-source', data.middleware, [], apiFetchMoviewSources);
  routesHelpers.setupPageRoute(data.router, '/get-parent-category-names', data.middleware, [], apiGetParentCategoryNames);
  callback();
};
