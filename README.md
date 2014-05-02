NFO Updater for XBMC movie collection
===

If you are in an area where there is no online access, or you just want your movie metadata bundled with each movie you can run this tool on your collection. 

It takes as a first argument the root of your movie collection and then runs through all the directory names, gets the .nfo file in each (which you can export via XBMC) and looks up each in the TMDB. If a result is found a poster and fanart is downloaded. The .nfo file is modified to point to these newly downloaded images.

Each movie must be in a seperate directory for this tool to work.

This too requires a valid nfo file in each movie directory. In order to get an updated nfo file for each movie, export library to seperate files in XBMC.

You will need an api-key from TMDB to run this tool.

Issues
  
  * Duplicate code, hardcoded values
  * No configuration

### Requires
    
    node.js (https://github.com/joyent/node.git)

### External dependencies

    * glob
    * xml2js
    * moviedb
    * color

### To install/update dependencies:

    npm install

### To run

    node app rootpath_of_your_movie_collection

