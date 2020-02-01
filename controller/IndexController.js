var express = require('express');
var router = express.Router();
var marked = require('marked');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/jmemo');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('SUCCESS CONNECT DB');
});

var JmemoModel = require('../model/JmemoModel.js');

/**
 * INDEX PAGE
 */
router.get('/', function (req, res, next) {
  var searchObj = {};
  searchObj['$or'] = [];
  var searchOr = searchObj["$or"];
  searchOr.push({
    category:{$in:['review']}
  });

  JmemoModel.find(searchObj).sort({favorite: -1, regdate: -1 }).exec(function (error, lists) {
    var result = [];
    lists.forEach(function (list) {
      const regDate = list.regdate;
      const year = String(regDate.getFullYear());
      const month = String(regDate.getMonth() + 1);
      const day = String(regDate.getDate());
      const date  = `${year}-${month}-${day}`;

      result.push(Object.assign(list, {date}));
    });
    res.render('index', {list: result});
  });
});
router.get('/:id', function (req, res, next) {
    var result = {};
    JmemoModel.findOne({_id: req.params.id},{note:1, title:1, category:1},function (error,view) {
      const viewNote = view && view.note || '';
      const viewTitle = view && view.title || '';
      const note = marked(viewNote, {sanitize: false});

      res.render('read', {note, title: viewTitle});
    });
});

module.exports = router;
