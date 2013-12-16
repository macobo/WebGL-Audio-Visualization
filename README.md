WebGL-Audio-Visualization
=========================

The demo can be accessed via: http://macobo.github.io/WebGL-Audio-Visualization/. Make sure you have WebGL and flash (for audio) enabled.

## Introduction

This project is a collection of audio visualization animations made as a project for the course [Computer Graphics at University of Tartu](https://courses.cs.ut.ee/2013/cg/Main/Projects). 

## Animations

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
