var instagram = require('instagram-node-lib');
var keys = require('../config.js');
instagram.set('client_id', keys.INSTAGRAM_ID);
instagram.set('client_secret', keys.INSTAGRAM_SECRET);

module.exports = {

  getInstaData : function(latitude, longitude, distance, callback){
    instagram.media.search({lat: latitude, lng: longitude, distance: distance, 
      complete: function(data){
        callback(data);
      },error: function(errorMessage, errorObject, caller){
        console.log(errorMessage);
      }
    });
  },

  sortInstaData: function(photos, coords){
        var origin = coords[0];
        var destination = coords[coords.length -1];

        // Sort photos based on longitude and direction of travel
        if (origin.lng > destination.lng){
          photos.sort(function(a, b){
            return b[0].location.longitude - a[0].location.longitude;
          });
        } else {
          photos.sort(function(a, b){
            return a[0].location.longitude - b[0].location.longitude;
          });
        }

        return photos;
  },

  // this gets called first, with 'sendResponse' as the callback.
  // call to instagram for each coordinate set and return to client
  obtainInstaData : function(coords, callback){
    var results = [];
    var lat, lng, dist = 300; // dist unit: m, max: 5000m --- distance around lat+lng to look for photos

    // parse instagram data object
    var photoParser =  function(data){
      var photoArray = [];
      for(var i = 0; i < data.length; i++){
        photoArray.push({
          link: data[i].link,
          url: data[i].images.low_resolution.url,
          location: data[i].location
        });
      }
      results.push(photoArray);

      // check if all api calls have been processed, sort, return to client
      if (results.length === coords.length){
        results = this.sortInstaData(results, coords);
        callback(results);
      }
    };

    // for each coordinate, get an array of photo objects
    for (var i = 0; i < coords.length; i++){
      lat = coords[i].lat;
      lng = coords[i].lng;
      this.getInstaData(lat, lng, dist, photoParser.bind(this));
    }

  }

};
