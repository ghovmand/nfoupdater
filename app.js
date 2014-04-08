var mdb = require('moviedb')('apikey');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var xml = require('xml2js');
var http = require('http');

var dir = path.resolve(process.argv[2]);

var parser = new xml.Parser();
var builder = new xml.Builder();
var posterUrl = '';
var backDropUrl = '';

mdb.configuration(function(err, res) {
  posterUrl = res.images.base_url + res.images.poster_sizes[4];
  backDropUrl = res.images.base_url + res.images.backdrop_sizes[1];
});

function processImages(dir, callback) {
  fs.readdir(dir, function(err, dirs) {
    if(err) return callback(err);
    dirs.forEach(function(dirname) {
      var dirpath = path.join(dir, dirname);
      processDir(dirpath, callback);
    });
  });
}

function processDir(dirpath, callback) {
  glob(path.join(dirpath, '*.nfo'), function(err, file) {
    fs.readFile(file[0], 'utf8', function(err, data) {
      if(err) return callback(err);
      parser.parseString(data, function(err, result) {
        getTmdbId(result.movie.id[0], file[0], callback);
      });
    });
  });
}

function getTmdbId(imdbid, nfopath, callback) {
  mdb.find({id: imdbid, external_source: 'imdb_id'}, function(err, res) {
    var tmdbid = res.movie_results[0].id;
    processPosters(nfopath, tmdbid, callback);
  });  
}

function processPosters(nfopath, tmdbid, callback) {
  var dirpath = path.dirname(nfopath);
  glob(path.join(dirpath, '*-poster.jpg'), function(err, file) {
    if(file.length === 0) {
      getPosters(nfopath, tmdbid, function(imagedata) {
        fs.writeFile(path.join(dirpath, path.basename(nfopath, '.nfo') + '-poster.jpg'), imagedata, 'binary', function(err) {
          if (err) throw err;
        });
      });
    }
    processFanart(nfopath, tmdbid, callback);
  });
}

function processFanart(nfopath, tmdbid, callback) {
  console.log(nfopath);
  var dirpath = path.dirname(nfopath);
  glob(path.join(dirpath, '*-fanart.jpg'), function(err, file) {
    if(file.length === 0) {
      getFanart(nfopath, tmdbid, function(imagedata) { 
        fs.writeFile(path.join(dirpath, path.basename(nfopath, '.nfo') + '-fanart.jpg'), imagedata, 'binary', function(err){
          if (err) throw err;
        });
      });
    }
  });
}

function getPosters(nfopath, tmdbid, callback) {
  console.log(tmdbid);
  mdb.movieImages({ id: tmdbid }, function(err, res) {
    if(err) callback(err);
    http.get(posterUrl + res.posters[0].file_path, function(res){
      res.setEncoding('binary');
      var imagedata = '';
      res.on('data', function(chunk){
        imagedata += chunk;
      });
      res.on('end', function() {
        callback(imagedata);
      });
    });
  });
}

function getFanart(nfopath, tmdbid, callback) {
  mdb.movieImages({ id: tmdbid }, function(err, res) {
    if(err) callback(err);
    http.get(backDropUrl + res.backdrops[0].file_path, function(res){
      res.setEncoding('binary');
      var imagedata = '';
      res.on('data', function(chunk){
        imagedata += chunk;
      });
      res.on('end', function(){
        callback(imagedata);
     });
    });
  });
}

processImages(dir);
