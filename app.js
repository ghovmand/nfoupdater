var mdb = require('moviedb')('1ded49a87e948db6518db90621151d0d');
var fs = require('fs');
var path = require('path');
var dir = path.resolve(process.argv[2]);

fs.readdir(dir, function(err, list) {
  if(err)
    console.log(err);

  list.forEach(function(dirname) {

    mdb.searchMovie({query: dirname }, function(err, res) {
      if(err)
        console.log(err);

      if(res.results[0])
      {
        var movie_id = res.results[0].id;

        console.log('Processing: ' + dirname);

        mdb.movieInfo({id: movie_id}, function(err, res) {
          var imdb_id = movie_id;
          var title = res.title;
          var year = res.release_date;
          var rating = res.vote_average;
          var plot = res.overview;
          var cast = [];
          var director = '';
          var runtime = res.runtime;
          var genres = res.genres;
          var premiered = res.release_date;

          mdb.movieCredits({id: movie_id}, function(err, res) {
            cast = res.cast.slice(0, 3);
            director = res.crew[0]; // normally director on first position; todo check object instead 

            var XMLWriter = require('xml-writer');
            xw = new XMLWriter();
            xw.startDocument();
            xw.startElement('movie');
            xw.writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
            xw.writeAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
            xw.writeElement('id', '');
            xw.writeElement('title', title);
            xw.writeElement('year', year);
            xw.writeElement('rating', rating.toString());
            xw.writeElement('plot', plot);
            xw.writeElement('director', director != null ? director.name : '');
            for (var i = 0; i < cast.length; i++) {
              xw.startElement('actor');
              xw.writeElement('name', cast[i].name);
              xw.endElement();
            }
            xw.writeElement('runtime', runtime.toString());
            for (i = 0; i < genres.length; i++) {
              xw.writeElement('genre', genres[i].name);
            }
            xw.writeElement('premiered', premiered);
            xw.endElement();
            xw.endDocument();

            var fullPath = path.join(dir, dirname, 'movie.nfo');

            fs.writeFile(fullPath, xw.toString(), function(err) {
              if(err) {
                console.log(err);
              } else {
                console.log(fullPath + ' was saved!');
              }
            }); 
          });

          /*
          mdb.movieImages({id: movie_id}, function(err, res) {
          console.log(res);
          });
          */

        });
      }
    });
  });
});



