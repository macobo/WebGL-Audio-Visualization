WebGL-Audio-Visualization
=========================

The demo can be accessed via: http://macobo.github.io/WebGL-Audio-Visualization/. Make sure you have WebGL and flash (for audio) enabled.

## Introduction

This project is a collection of audio visualization animations made as a project for the course [Computer Graphics at University of Tartu](https://courses.cs.ut.ee/2013/cg/Main/Projects). 

## References

### Libraries used

* [Three.js](threejs.org) - javascript library that makes using [WebGL](http://en.wikipedia.org/wiki/WebGL) much easier.
* [Soundcloud SDK](http://developers.soundcloud.com/docs/api/sdks) and [Soundmanager 2](http://developers.soundcloud.com/docs/api/sdks) - used to stream audio from a souncloud playlist to your browser.
* [Angular.js](angularjs.com) - web library used, mainly used for structuring the application and for [ngAnimate](http://augus.github.io/ngAnimate/).
* [DSP.js](https://github.com/corbanbrook/dsp.js/) - for fast-fourier transform used for audio analysis and beat detection.
* [Sparks.js](https://github.com/zz85/sparks.js) - used for particle animations.
* [Grunt (development server, SASS compiler)](http://gruntjs.com/), [Bower (dependency management)](http://bower.io/)

### Other

* [Diamond-Square algorithm](http://gameprogrammer.com/fractal.html#diamond) - used for the plane demo.
* [Dancer.js kick detection](https://github.com/jsantell/dancer.js/blob/master/src/kick.js) - the idea for beat detection was taken from here.
* [Three.js boilerplate](http://jeromeetienne.github.io/threejsboilerplatebuilder/) - used for setting up the repo, mostly removed.
