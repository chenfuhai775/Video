var valueTmp=0;
var source;
var ffmpeg;
var video;
var socket;

var shouldAttemptReconnect;
var reconnectTimeoutId;
var reconnectInterval;
var firstConectFlag = 0;

if( 'function' === typeof importScripts)
{
	importScripts('libffmpeg.js');
}

function IsSupported() {
	return true;
};

function onOpen() {

};

function onClose() {
	if (shouldAttemptReconnect) {
		clearTimeout(reconnectTimeoutId);
		reconnectTimeoutId = setTimeout(function(){
			this.start();	
		}.bind(this), reconnectInterval*1000);
	}
};

function onMessage(ev) {
	var isFirstChunk = !this.established;
	this.established = true;

	if (this.destination) {
		var buff = new Uint8Array(ev.data);
		
		if(firstConectFlag == 0)
		{
			firstConectFlag  = 1;
			ffmpeg.InitDecoder();
		}
		
		ffmpeg.DecoderNal(0, buff, buff.length);
	}
};

function netStart(url) {
	socket = new WebSocket(url, null);
	socket.binaryType = 'arraybuffer';
	socket.onmessage = onMessage.bind(this);
	socket.onopen = onOpen.bind(this);
	socket.onerror = onClose.bind(this);
	socket.onclose = onClose.bind(this);
};

function calculate(){
  var url = 'ws://'+"192.168.1.185"+':8082/';
  var options;
  shouldAttemptReconnect = 1;
  reconnectInterval = 10;

  ////if(IsSupported()) {
		/// creat wasm
	 ffmpeg = {   
		avcodec_register_all:           Module["cwrap"]('avcodec_register_all', 'number'),
		avcodec_find_decoder:           Module["cwrap"]('avcodec_find_decoder', 'number', ['number']),
		avcodec_alloc_context3:         Module["cwrap"]('avcodec_alloc_context3', 'number', ['number']),
		avcodec_open2:                  Module["cwrap"]('avcodec_open2', 'number', ['number', 'number', 'number']),
		av_free:                        Module["cwrap"]('av_free', 'number', ['number']),
		av_frame_alloc:                 Module["cwrap"]('av_frame_alloc', 'number'),
		avcodec_close:                  Module["cwrap"]('avcodec_close', 'number', ['number']),
		InitDecoder:					Module["cwrap"]('InitDecoder', 'number'),
		InitDecoderH264:				Module["cwrap"]('InitDecoderH264', 'number', ['number']),
		InitDecoderH265:				Module["cwrap"]('InitDecoderH265', 'number', ['number']),
		UninitDecoder:					Module["cwrap"]('UninitDecoder', 'number', ['number']),
		DecoderNal:                  	Module["cwrap"]('DecoderNal', 'number', ['number', 'array', 'number']),
		avcodec_get_image_width_js:		Module["cwrap"]('avcodec_get_image_width_js', 'number', ['number']),
		avcodec_get_image_height_js:	Module["cwrap"]('avcodec_get_image_height_js', 'number', ['number']),
		GetYuvData:                  	Module["cwrap"]('GetYuvData', 'number', ['number', 'array', 'number']),
		AV_CODEC_ID_H264: 28,
		AV_CODEC_ID_H265: 174, // 0x48323635,
		
		_chroma_mono: 0,
		_chroma_420: 1,
		_chroma_422: 2,
		_chroma_444: 3,
	};
 /// }
  //netStart();
  //var YuvBuff = new Uint8Array(buffSize);
  //for(;;)
 // {
//	  if(firstConectFlag == 1)
//	  {
//		  var width = ffmpeg.avcodec_get_image_width_js(0);
//		  var height = ffmpeg.avcodec_get_image_height_js(0);
//		  ffmpeg.GetYuvData(0, this.YuvBuff, YuvBuff.length);
//		  postMessage(ret); 
//	  }
 // }
}

addEventListener('message', function(e){
    console.log(e.data);
	console.log("works--------------messge");
	calculate();
});
