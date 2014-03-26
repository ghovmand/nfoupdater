NFO Updater for your movie collection
==========

If you are in an area where there is no online access, or you just want your movie metadata bundled with each movie you can run this tool on your collection.
It takes as a first argument the root of your movie collection and then runs through all the directory names and looks up each in the TMDB. If a result is found a movie.nfo file will be written to and stored in the same directory as the movie.
You will need an api-key from TMDB.

Issues
  
  * Still very rudimentary. 
  * Needs some error checking. 
  * Object traversal to get more info. 
  * The nfo file generated is still very basic.

### Requires
    
    node.js (https://github.com/joyent/node.git)

### To install/update dependencies:

    node update

### To run

    node app rootpath_of_your_movie_collection


