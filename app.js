var mdb = require('moviedb')('1ded49a87e948db6518db90621151d0d');
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
    if(file.length > 0) {
      fs.readFile(file[0], 'utf8', function(err, data) {
        if(err) return callback(err);
        parser.parseString(data, function(err, result) {
          if(!result) { console.log('ERROR Parse error: ' + dirpath); return; } // build correct nfo file
          getTmdbId(result.movie.id[0], file[0], callback);
        });
      });
    }
  });
}

function getTmdbId(imdbid, nfopath, callback) {
    // todo if not found ==} search title
  mdb.find({id: imdbid, external_source: 'imdb_id'}, function(err, res) {
    if(!res) { console.log('ERROR No tmdbid id for: ' + nfopath); return; }
    var tmdbid = res.movie_results[0].id;
    getImageMetaData(tmdbid, function(imageData) {
      processPosters(nfopath, tmdbid, imageData, callback);
    });
  });  
}

function processPosters(nfopath, tmdbid, imageData, callback) {
  var dirpath = path.dirname(nfopath);
  glob(path.join(dirpath, '*-poster.jpg'), function(err, file) {
    if(file.length === 0) {
      getPosters(nfopath, tmdbid, imageData, function(image) {
        fs.writeFile(path.join(dirpath, path.basename(nfopath, '.nfo') + '-poster.jpg'), image, 'binary', function(err) {
          if (err) throw err;
          // processPosters(nfopath, tmdbid, imageData, callback);
        });
      });
    }
    writeThumbNfo(nfopath, path.join(dirpath, path.basename(nfopath, '.nfo') + '-poster.jpg'), function() {
      processFanart(nfopath, tmdbid, imageData, callback);
    });
  });
}

function processFanart(nfopath, tmdbid, imageData, callback) {
  var dirpath = path.dirname(nfopath);
  glob(path.join(dirpath, '*-fanart.jpg'), function(err, file) {
    if(file.length === 0) {
      getFanart(nfopath, tmdbid, imageData, function(image) { 
        fs.writeFile(path.join(dirpath, path.basename(nfopath, '.nfo') + '-fanart.jpg'), image, 'binary', function(err){
          if (err) throw err;
          // processFanart(nfopath, tmdbid, imageData, callback);
        });
      });
    }
    writeFanartNfo(nfopath, path.join(dirpath, path.basename(nfopath, '.nfo') + '-fanart.jpg'), callback);
  });
}

function writeThumbNfo(nfopath, filename, callback) {
  fs.readFile(nfopath, 'utf8', function(err, data) {
    if(!err)
    {
      parser.parseString(data, function(err, result) {
        if(result)
        {
          delete result.movie.thumb;
          result.movie.thumb =  { '_' : './' + path.basename(filename), '$' : { aspect : 'poster', preview : './' + path.basename(filename) } };
          xmlResult = builder.buildObject(result);

          fs.writeFile(nfopath, xmlResult, function (err) {
            if(err)
              console.log('ERROR writing to: ' + nfopath);
          });
        }
      });
      callback();
    }
  });
}

function writeFanartNfo(nfopath, filename, callback) {
  fs.readFile(nfopath, 'utf8', function(err, data) {
    if(!err)
    {
      parser.parseString(data, function(err, result) {
        if(result)
        {
          delete result.movie.fanart;
          result.movie.fanart = {};
          result.movie.fanart.thumb = { '_' : './' + path.basename(filename), '$' : { preview : './' + path.basename(filename) } };

          xmlResult = builder.buildObject(result);

          fs.writeFile(nfopath, xmlResult, function (err) {
            if(err)
              console.log('ERROR writing to: ' + nfopath);
          });
        }
      });
    }
  });
}

function getImageMetaData(tmdbid, callback) {
  mdb.movieImages({ id: tmdbid }, function(err, res) {
    if(err) callback(err);
    if(!res) { console.log('ERROR No images found for: ' + tmdbid); return; }
    if(res.backdrops.length === 0) { console.log('ERROR No backdrops found for: ' + tmdbid); }
    if(res.posters.length === 0) { console.log('ERROR No posters found for: ' + tmdbid); return; }
    callback(res);
  });
}

function getPosters(nfopath, tmdbid, imageData, callback) {
  if(imageData.posters.length === 0) {
    console.log('ERROR No posters for: ' + nfopath); 
    return;
  }
  
  var poster = null;

  for (var i = 0, l = imageData.posters.length; i < l; i ++) {
    if(imageData.posters[i].iso_639_1 === 'en') {
      poster = imageData.posters[i];
      break;
    }
  }

  if(poster === null) {
    console.log('ERROR No english poster found, getting first');
    poster = imageData.posters[0];
  }

  http.get(posterUrl + poster.file_path, function(res){
    if(!res) {
      console.log('ERROR No image found for: ' + nfopath);
      return;
    }
    res.setEncoding('binary');
    var image = '';
    res.on('data', function(chunk){
      image += chunk;
    });
    res.on('end', function() {
      callback(image);
    });
  });
}

function getFanart(nfopath, tmdbid, imageData, callback) {
  if(imageData.backdrops.length === 0) {
    console.log('ERROR No fanart for: ' + nfopath); 
    return;
  }

  http.get(backDropUrl + imageData.backdrops[0].file_path, function(res){
    if(!res) {
      console.log('ERROR No image found for: ' + nfopath);
      return;
    }
    res.setEncoding('binary');
    var image = '';
    res.on('data', function(chunk){
      image += chunk;
    });
    res.on('end', function(){
      callback(image);
    });
  });
}

processImages(dir);
