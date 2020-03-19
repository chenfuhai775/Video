//Player request.
const kPlayVideoReq         = 0;
const kPauseVideoReq        = 1;
const kStopVideoReq         = 2;

//Player response.
const kPlayVideoRsp         = 0;
const kAudioInfo            = 1;
const kVideoInfo            = 2;
const kAudioData            = 3;
const kVideoData            = 4;
const kSendAudioData        = 5;

//Downloader request.
const kGetFileInfoReq       = 0;
const kDownloadFileReq      = 1;
const kCloseDownloaderReq   = 2;
const kReqAvStream          = 3;

//Downloader response.
const kGetFileInfoRsp       = 0;
const kFileData             = 1;
const kReqAvStreamRsp       = 2;
const kRecvAvData           = 3;

//Decoder request.
const kInitDecoderReq       = 0;
const kUninitDecoderReq     = 1;
const kOpenDecoderReq       = 2;
const kCloseDecoderReq      = 3;
const kFeedDataReq          = 4;
const kStartDecodingReq     = 5;
const kPauseDecodingReq     = 6;
const kDecoderStatusReq     = 7;

//Decoder response.
const kInitDecoderRsp       = 0;
const kUninitDecoderRsp     = 1;
const kOpenDecoderRsp       = 2;
const kCloseDecoderRsp      = 3;
const kVideoFrame           = 4;
const kAudioFrame           = 5;
const kStartDecodingRsp     = 6;
const kPauseDecodingRsp     = 7;
const kDecodeFinishedEvt    = 8;

function Logger(module) {
    this.module = module;
}

Logger.prototype.log = function (line) {
    console.log("[" + this.currentTimeStr() + "][" + this.module + "]" + line);
}

Logger.prototype.logError = function (line) {
    console.log("[" + this.currentTimeStr() + "][" + this.module + "][ER] " + line);
}

Logger.prototype.logInfo = function (line) {
    console.log("[" + this.currentTimeStr() + "][" + this.module + "][IF] " + line);
}

Logger.prototype.logDebug = function (line) {
    console.log("[" + this.currentTimeStr() + "][" + this.module + "][DT] " + line);
}

Logger.prototype.currentTimeStr = function () {
    let now = new Date(Date.now());
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let min = now.getMinutes();
    let sec = now.getSeconds();
    let ms = now.getMilliseconds();
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + ":" + ms;
}

