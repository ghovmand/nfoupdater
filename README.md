NFO Updater for XBMC movie collection
===

If you are in an area where there is no online access, or you just want your movie metadata bundled with each movie you can run this tool on your collection. 

It takes as a first argument the root of your movie collection and then runs through all the directory names, gets the .nfo file in each (which you can export via XBMC) and looks up each in the TMDB. If a result is found a poster and fanart is downloaded. The .nfo file is modified to point to these newly downloaded images.

You will need an api-key from TMDB to run this tool.

Issues
  
  * Needs some restructring to make it more modular.
  * Duplicate code, hardcoded values
  * No configuration

### Requires
    
    node.js (https://github.com/joyent/node.git)

### To install/update dependencies:

    npm update

### To run

    node app rootpath_of_your_movie_collection

