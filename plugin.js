"use strict";

const categories = require.main.require('./src/categories');
const got = require('got');
const meta = require.main.require('./src/meta');
const posts = require.main.require('./src/posts');
const routesHelpers = require.main.require('./src/routes/helpers');
const topics = require.main.require('./src/topics');

const apiGetMediaCategory = async (req, res) => {
  let category_id = 0;
  let names = [];
  if(req.query.category_id) {
    category_id = req.query.category_id;
  } else if(req.query.topic_id) {
    let topic = await topics.getTopics([req.query.topic_id], 1);
    category_id = topic[0].cid;
  } else if(req.query.post_id) {
    let post = await posts.getPostsByPids([req.query.post_id], 1);
    let topic = await topics.getTopics([post[0].tid], 1);
    category_id = topic[0].cid;
  }
  for(let category of await categories.getParents([category_id])) {
    if(!category || !category.name) continue;
    names.push(category.name);
  }
  res.json(names);
}
const apiGetMediaSource = async (req, res) => {
  const item = await got('http://www.omdbapi.com/?i=' + req.query.id + '&apikey=' + meta.config['add-media-metadata:apikey'], {responseType: 'json'});
  res.json(item.body)
}
const renderAdmin = async (req, res) => {
  res.render('admin/add-media-metadata', {});
}

exports.actionPostEditSave = async (data) => {
  if(data.post.content.match(/\|==========>[\s\S]*\*\*Comment:\*\*[\s\S]*<==========\|/)) {
    let names = [];
    let topic = await topics.getTopics([data.post.tid], data.post.uid);
    for(let category of await categories.getParents([topic[0].cid])) {
      if(!category || !category.name) continue;
      names.push(category.name);
    }
    if(names.indexOf('Film') !== -1) {
      topics.createTags(['a-uex' + data.post.uid + '-film'], data.post.tid, Date.now());
    } else if(names.indexOf('Spel') !== -1) {
      topics.createTags(['a-uex' + data.post.uid + '-spel'], data.post.tid, Date.now());
    }
  }
};
exports.filterAdminHeaderBuild = async (data) => {
  data.plugins.push({
    icon: 'fa-link',
    name: 'Add Media Metadata',
    route: '/add-media-metadata'
  });
  return data;
};
exports.filterComposerFormatting = async (data) => {
  data.options.push({
    className: 'add-movie-source fa fa-video-camera',
    name: 'add_movie_source',
    title: 'Add movie source'
  },
  {
    className: 'add-movie-review fa fa-video-camera',
    name: 'add_movie_review',
    title: 'Add movie review'
  },
  {
    className: 'add-game-source fa fa-gamepad',
    name: 'add_game_source',
    title: 'Add game source'
  },
  {
    className: 'add-game-review fa fa-gamepad',
    name: 'add_game_review',
    title: 'Add game review'
  });
  return data;
};
exports.staticAppLoad = async (data) => {
  console.log('Loading Jenkler Add Media Metadata plugin ' + require('./package.json').version);
  data.router.get('/admin/add-media-metadata', data.middleware.admin.buildHeader, renderAdmin);
  data.router.get('/api/admin/add-media-metadata', renderAdmin);
  routesHelpers.setupPageRoute(data.router, '/get-media-source', data.middleware, [], apiGetMediaSource);
  routesHelpers.setupPageRoute(data.router, '/get-media-category', data.middleware, [], apiGetMediaCategory);
};
