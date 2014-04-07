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

var processFanart = function() {

  fs.readdir(dir, function(err, list) {
    list.forEach(function(dirname) {
      var basepath = path.join(dir, dirname);

      glob(path.join(basepath, '*.nfo'), function(err, file) {

        if(file.length === 0)
          return; // make an nfo file, do from scratch

        fs.readFile(file[0], 'utf8', function(err, data) {

          parser.parseString(data, function(err, result) {
            if(!result) return;

            var basepath = path.join(dir, dirname);
            glob(path.join(basepath, '*fanart.jpg'), function(err, filep) {

              if(!err)
              {
                if(filep.length === 0) {
                  // get image from tmdb
                  // module

                  mdb.find({id: result.movie.id[0], external_source: 'imdb_id'}, function(err, res) {
                    if(res) {
                      mdb.movieImages({ id: res.movie_results[0].id }, function(err, res) {
                        console.info(dirname + ": fanart not found, getting fresh");

                        if(err)
                          console.log(err);
                        
                        if(!res.backdrops) { console.log('ERROR No backdrops for: ' + result.movie.title); return; }
                        if(res.backdrops.length === 0) { console.log('ERROR No backdrops for: ' + result.movie.title); return; }

                        http.get(posterUrl + res.backdrops[0].file_path, function(res){
                          res.setEncoding('binary');

                          var imagedata = '';
                          res.on('data', function(chunk){
                            imagedata += chunk;
                          });

                          res.on('end', function(){
                            fs.writeFile(path.join(basepath, path.basename(file[0], '.nfo') + '-fanart.jpg'), imagedata, 'binary', function(err){
                              if (err) throw err;
                            });
                          });
                        });
                      });
                    } else {
                      console.error('Not found: ' + result.movie.title);
                    }
                  });
                }
              }
            });    
          });    
        });
      });
    });
  });
};

var processPosters = function() {

  fs.readdir(dir, function(err, list) {
    list.forEach(function(dirname) {
      var basepath = path.join(dir, dirname);

      glob(path.join(basepath, '*.nfo'), function(err, file) {

        if(file.length === 0)
          return; // make an nfo file, do from scratch

        fs.readFile(file[0], 'utf8', function(err, data) {

          parser.parseString(data, function(err, result) {
            if(!result) return;

            var basepath = path.join(dir, dirname);
            glob(path.join(basepath, '*poster.jpg'), function(err, filep) {

              if(!err)
              {
                if(filep.length === 0) {
                  mdb.find({id: result.movie.id[0], external_source: 'imdb_id'}, function(err, res) {
                    if(res) {
                      mdb.movieImages({ id: res.movie_results[0].id }, function(err, res) {
                        console.info(dirname + ": poster not found, getting fresh");

                        if(!res.posters) { console.log('ERROR No posters for: ' + result.movie.title); return; }
                        if(res.posters.length === 0) { console.log('ERROR No posters for: ' + result.movie.title); return; }

                        if(err)
                          console.log(err);
                        http.get(posterUrl + res.posters[0].file_path, function(res){
                          res.setEncoding('binary');

                          var imagedata = '';
                          res.on('data', function(chunk){
                            imagedata += chunk;
                          });

                          res.on('end', function(){
                            fs.writeFile(path.join(basepath, path.basename(file[0], '.nfo') + '-poster.jpg'), imagedata, 'binary', function(err){
                              if (err) throw err;
                            });
                          });
                        });
                      });
                    } else {
                      console.error('Not found: ' + result.movie.title);
                    }
                  });
                }
              }
            });    
          });    
        });
      });
    });
  });
};

processPosters();
processFanart();

/*
fs.readdir(dir, function(err, list) {
if(err)
console.log(err);

list.forEach(function(dirname) {

var basepath = path.join(dir, dirname);

glob(path.join(basepath, '*.nfo'), function(err, file) {

if(file.length === 0)
return; // make an nfo file, do from scratch

fs.readFile(file[0], 'utf8', function(err, data) {

parser.parseString(data, function(err, result) {

// get the tmdb from the nfo id field
mdb.find({id: result.movie.id[0], external_source: 'imdb_id'}, function(err, res) {
if(err)
console.log(err);

if(res.movie_results[0])
{
var movie_id = res.movie_results[0].id;

console.log('Processing: ' + dirname);

mdb.movieInfo({id: movie_id}, function(err, res) {

mdb.movieImages({id: movie_id}, function(err, res) {

// if not found get thumb for movie
glob(path.join(basepath, '*poster.jpg'), function(err, filep) {
if(!err)
{
if(filep.length === 0) {
// get image from tmdb
mdb.movieImages({id: movie_id}, function(err, res) {
console.info("poster not found, getting fresh");

// module
http.get(posterUrl + res.posters[0].file_path, function(res){
res.setEncoding('binary');

var imagedata = '';
res.on('data', function(chunk){
imagedata += chunk;
});

res.on('end', function(){
fs.writeFile(path.join(basepath, path.basename(file[0], '.nfo') + '-poster.jpg'), imagedata, 'binary', function(err){
if (err) throw err;
console.log('File saved.');
filep.push(path.join(basepath, path.basename(file[0], '.nfo') + '-poster.jpg'));
delete result.movie.thumb;
console.log(filep);
result.movie.thumb =  { '_' : './' + path.basename(filep[0]), '$' : { aspect : 'poster', preview : './' + path.basename(filep[0]) } };
});
});
});
});
}

delete result.movie.thumb;
console.log(filep);
result.movie.thumb =  { '_' : './' + path.basename(filep[0]), '$' : { aspect : 'poster', preview : './' + path.basename(filep[0]) } };

glob(path.join(basepath, '*fanart.jpg'), function(err, filef) {
if(!err)
{
if(filef.length === 0) 
{
// get image from tmdb
mdb.movieImages({id: movie_id}, function(err, res) {
console.info("fanart not found, getting fresh");

// module
http.get(backDropUrl + res.backdrops[0].file_path, function(res){
res.setEncoding('binary');

var imagedata = '';
res.on('data', function(chunk){
imagedata += chunk;
});

res.on('end', function(){
fs.writeFile(path.join(basepath, path.basename(file[0], '.nfo') + '-fanart.jpg'), imagedata, 'binary', function(err){
if (err) throw err;
console.log('File saved.');
filep.push(path.join(basepath, path.basename(file[0], '.nfo') + '-fanart.jpg'));
});
});
});
});
}

delete result.movie.fanart;
result.movie.fanart = {};
result.movie.fanart.thumb = { '_' : './' + path.basename(filef[0]), '$' : { preview : './' + path.basename(filef[0]) } };

xmlResult = builder.buildObject(result);

fs.writeFile(file[0], xmlResult, function (err) {
if(err)
console.log('ERROR writing to: ' + file[0]);
                            else
console.log('Saved: ' + file[0]);
});
}
});
}
});
});
});
}
});
});
});
});
});
});
*/
