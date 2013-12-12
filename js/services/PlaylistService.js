'use strict';

angular.module('audioVizApp')
  .service('PlaylistService', function ($q, Dancer, $analytics) {

    SC.initialize({
      client_id: 'cbeb4fe25866e35cb329fa4acc298531',
      debug: false
    });
    var playlist, sound;
    
    var load_playlist = function(id) {
      var deferred = $q.defer();
      SC.get('/playlists/'+id, function(set) {
        playlist = set;
        deferred.resolve(playlist);
      });
      return deferred.promise;
    };

    var play_song = function(track_index, options) {
      var deferred = $q.defer();
      var id = playlist.tracks[track_index].id;
      var title = playlist.tracks[track_index].title;

      options = options || {};
      options.autoPlay = true;
      options.useEQData = true;
      options.usePeakData = true;
      options.useWaveformData = true;
      options.whileplaying = function() {
        Dancer.update(sound);
        //console.log("update");
      };

      service.loading = true;
      SC.stream('/tracks/'+id, options, function(_sound) {
        sound = _sound;
        //console.log("LOADED", id);
        $analytics.eventTrack('PlayMusic', {  category: 'audio', label: title });
        //sound.play();
        service.loading = false;
        deferred.resolve(sound);
      });
      return deferred.promise;
    };

    var stop_current = function() {
      if (sound) sound.stop();
      sound = null;
    };

    var service = {
      load: load_playlist,
      playlist: function() { return playlist; },
      tracks: function() { return playlist.tracks; },
      play: play_song,
      stop: stop_current,
      sound: function() { return sound; },
      loading: false
    };

    return service;
  });