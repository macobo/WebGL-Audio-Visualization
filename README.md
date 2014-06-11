WebGL-Audio-Visualization
=========================

The demo can be accessed via: http://macobo.github.io/WebGL-Audio-Visualization/. Make sure you have WebGL and flash (for audio) enabled.

## Introduction

This project is a collection of audio visualization animations made as a project for the course [Computer Graphics at University of Tartu](https://courses.cs.ut.ee/2013/cg/Main/Projects). 

We also have a poster available: [PDF](http://macobo.github.io/WebGL-Audio-Visualization/doc/poster.pdf)

## Results

In the project we implemented 4 different animations, with 2 more being a reparametrization of one of them.

### [Torus](http://macobo.github.io/WebGL-Audio-Visualization/#/torus)

[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/torus1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/torus1l.png)

This was our first attempt. Using the audio spectrum, the torus changes size (width and height) based on the values of frequencies in the spectrum's high and low ends.

### Sphere Spectrum

We created a sphere whose vertices are being pushed away from the center according to the different frequencies in the spectrum. We though this will create a geometry that is very much in touch with the music.

The sphere also rotates based on the value of the average of spectrum frequencies. This caused the sphere to rotate faster if the music is more intense.

Additionally there is a directionaly light source that rotates around the camera-facing side of the sphere according to the average in the low spectrum. This was intented to follow drum-beats or other changes in the low frequencies of the music.

#### [Angels](http://macobo.github.io/WebGL-Audio-Visualization/#/angels)
[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/angels1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/angels1.png) [![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/angels2_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/angels2.png)

Here the modified vertices of the sphere form visually two pairs of wings of butterflies/angels.

#### [Hedgehog](http://macobo.github.io/WebGL-Audio-Visualization/#/hedgehog)
[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/hedgehog1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/hedgehog1.png) [![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/hedgehog2_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/hedgehog2.png)

We chose the shifted vertices so that they would form distinct peaks from the sphere. This kind of resembles an hedgehog, a shuriken or a caltrop.

#### [Lotus](http://macobo.github.io/WebGL-Audio-Visualization/#/lotus)
[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/lotus1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/lotus1.png)  [![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/lotus2_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/lotus2.png)

When we shift every vertex in the sphere according to some frequencies of the spectrum, then we get a flower blossom / popcorn like thingy.

### [Terrain](http://macobo.github.io/WebGL-Audio-Visualization/#/terrain)
[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/terrain1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/terrain1.png)

A terrain growing and changing according to the current volume of the music. Also introduced first rudementary beat detection and has user-modifyable parameters that control the beat detection and smoothness and size of the terrain.

### [Particles](http://macobo.github.io/WebGL-Audio-Visualization/#/particles)
[![](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/particles1_th.png)](http://macobo.github.io/WebGL-Audio-Visualization/doc/img/particles1l.png)

A particle animation demonstrating the beat detection system. New particles appear and shoot out according to the current tempo of the song playing, with many more particles appearing on new beats.

## Main complications

### Beat detection

Beat detection sadly isn't very easy to do, especially in real-time. One way to discover beats is to look at each at the sound frequency spectrum (the output of fast-fourier transform) and compare it to previous and future frames, looking whether it is peaking or not. The problem with doing that in real-time is that we don't have access to the future sound yet and have to resort to other crude heuristics.

Our current solution is to use a decaying threshold. Each frame, the maximum value of the frequency spectrum is found (aka the maximal amplitude). That is compared to a threshold. 

If the value is larger than the threshold, then set the value to be the new threshold, if not, multiply the current threshold by a factor a little bit smaller than 1 (e.g. 0.98), making sure the treshold wouldn't fall below a certain limit. The limit is neccessary because otherwise it will start classifying noise or simply quiet music as beats.

### Three.js fragmentation

The three.js library is still under heavy development. Sadly, this means that many of the libraries developed for three.js need heavy modifications to work on the latest version. We ran into this issue twice - once when updating the version given by three.js boilerplate and another time when experimenting with particle engines.

## References

### Libraries used

* [Three.js](threejs.org) - javascript library that makes using [WebGL](http://en.wikipedia.org/wiki/WebGL) much easier.
* [Soundcloud SDK](http://developers.soundcloud.com/docs/api/sdks) and [Soundmanager 2](http://developers.soundcloud.com/docs/api/sdks) - used to stream audio from a souncloud playlist to your browser.
* [Angular.js](http://angularjs.com) - web library used, mainly used for structuring the application and for [ngAnimate](http://augus.github.io/ngAnimate/).
* [DSP.js](https://github.com/corbanbrook/dsp.js/) - for fast-fourier transform used for audio analysis and beat detection.
* [Sparks.js](https://github.com/zz85/sparks.js) - used for particle animations.
* [Grunt](http://gruntjs.com/) - development server with live reload, SASS compiler.
* [Bower](http://bower.io/) - javascript dependency management.

### Other

* [Diamond-Square algorithm](http://gameprogrammer.com/fractal.html#diamond) - used for the plane demo.
* [Dancer.js kick detection](https://github.com/jsantell/dancer.js/blob/master/src/kick.js) - the idea for beat detection was taken from here.
* [Three.js boilerplate](http://jeromeetienne.github.io/threejsboilerplatebuilder/) - used for setting up the repo, mostly removed.
* [Github pages](http://pages.github.com/) - automatic publishing of this repo.
