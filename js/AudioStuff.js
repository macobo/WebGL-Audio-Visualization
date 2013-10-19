// from https://github.com/arirusso/d3-audio-spectrum

function Audio(context, sampleRate) {
  this.context = context;
  this.sampleRate = sampleRate || 44100;
  this.playing = false;
  this.bufferSize = 2048;
}

Audio.prototype.connect = function() {
  this.gain = this.context.createGainNode();
  this.source.connect(this.gain);
};

Audio.prototype.connectProcessor = function(processor) {
  this.gain.connect(processor);
  processor.connect(this.context.destination);
};

Audio.prototype.setVolume = function(value) {
  this.gain.gain.value = value;
};

Audio.prototype.stop = function() {
  this.source.stop();
  this.playing = false;
};

Audio.prototype.play = function(callback) {
  var source = this.source;
  var audio = this;
  this.source.load(function() {
    audio.connect();
    //source.play();
    //audio.playing = true;
    if (callback) callback();
  });
};

Audio.prototype.routeAudio = function(event) {
  var input = {
    l: event.inputBuffer.getChannelData(0),
    r: event.inputBuffer.getChannelData(1)
  };
  var output = {
    l: event.outputBuffer.getChannelData(0),
    r: event.outputBuffer.getChannelData(1)
  };

  for (var i = 0; i < this.bufferSize; ++i) {
    output.l[i] = input.l[i];
    output.r[i] = input.r[i];
    this.mono[i] = (input.l[i] + input.r[i]) / 2;
  }
};



// This is where the audio is analyzed
function SpectrumAnalyzer(audio) {
  this.audio = audio;
  this.analysis = this.audio.context.createJavaScriptNode(this.audio.bufferSize);
  this.curve = 8;
  this.intensity = 50;
  this.setResolution(1);
}

SpectrumAnalyzer.prototype.setResolution = function(n) {
  this.resolution = this.linLog(this.audio.bufferSize / n);
  this.reset();
};

SpectrumAnalyzer.prototype.setCurve = function(n) {
  this.curve = n;
  this.reset();
};

SpectrumAnalyzer.prototype.reset = function() {
  this.data = [];
  this.delta = [];
  var fftSize = this.resolution;
  this.audio.mono = new Float32Array(fftSize);
  this.fft = new FFT(fftSize, this.audio.sampleRate);
  var analyzer = this;
  this.analysis.onaudioprocess = function(event) {
    analyzer.audioReceived(event);
  };
};

SpectrumAnalyzer.prototype.linLog = function(n) {
  return Math.pow( 2, Math.round( Math.log( n ) / Math.log( 2 ) ) );
};

SpectrumAnalyzer.prototype.length = function() {
  return this.fft.spectrum.length/2;
};

SpectrumAnalyzer.prototype.play = function(callback) {
  var analyzer = this;
  this.audio.play(function() {
    analyzer.audio.connectProcessor(analyzer.analysis);
    if (callback) callback();
  });
};

SpectrumAnalyzer.prototype.getInitialData = function() {
  var data = [];
  for (var i = 0; i < this.length(); i++) {
    data.push(1);
  }
  return data;
};

SpectrumAnalyzer.prototype.withCurve = function(callback) {
  var segmentLength = this.length() / this.curve;
  var segmentCounter = 0;
  var segment = 0;
  var counter = 0;
  var index = 0;
  while (index <= this.length() - 1) {
    callback(index, counter);
    index += (segment * this.curve) + 1;
    counter += 1;
    segmentCounter += 1;
    if (segmentCounter > segmentLength - 1) {
      segment += 1;
      segmentCounter = 0;
    }
  }
};

SpectrumAnalyzer.prototype.populateData = function(index, counter) {
  amplitude = this.fft.spectrum[index] * (this.intensity * 200);
  this.delta[counter] = amplitude - this.data[counter];
  this.data[counter] = amplitude;
};

SpectrumAnalyzer.prototype.audioReceived = function(event) {
  var analyzer = this;
  this.audio.routeAudio(event);
  this.fft.forward(this.audio.mono);
  this.withCurve(function(index, counter) {
    analyzer.populateData(index, counter);
  });
};



function InputAudioSource(context) {
  this.context = context;
}

InputAudioSource.prototype.load = function(callback) {
  navigator.webkitGetUserMedia( {audio:true}, this.streamCallback(callback) );
};

InputAudioSource.prototype.play = function() {};

InputAudioSource.prototype.stop = function() {
  this.disconnect();
};

InputAudioSource.prototype.streamCallback = function(callback) {
  var source = this;
  return function(stream) {
    console.log(source, stream);
    source.source = source.context.createMediaStreamSource(stream);
    callback();
  };
};

InputAudioSource.prototype.connect = function(connector) {
  this.source.connect(connector);
};

InputAudioSource.prototype.disconnect = function() {
  this.source.disconnect();
};