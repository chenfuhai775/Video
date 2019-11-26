function Playback() {
    this._lxdPlayback = null;  //Playback.xml
    this.channels = new Array();
    //默认播放日期
    this.defaultPlayDate = null;
    this.player = [];
    this.m_wasmLoaded = 0;
    this.m_MaxChannelNumber = 4;
    this.videoDates = [];
}

Playback.prototype = {
    //主页面初始化函数
    initPage: function () {

        this.initProcess();
        this.initFullCalendar();
        this.initChannels();

        this.m_szStartTimeSet = []; /// 开始时间集合
        this.m_szEndTimeSet = [];   /// 结束时间集合
        this.m_szFileNameSet = [];  /// 文件名集合
        this.m_szFileSizeSet = [];  /// 文件大小集合

        getMenuList();//加载菜单列表等文本
        this._getDeviceInfo();
        ///this._getLogList(5,'lTypeAlarm');//获取报警记录
        var szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdPlayback = translator.getLanguageXmlDoc("Playback");
        translator.translatePage(this._lxdPlayback, document);

        g_oPlayback.syncMsg();
        setInterval("g_oPlayback.syncMsg()", 2000);
        setTimeout(g_oPlayback.initVideo(), 1);
    },
    initProcess: function () {

        $("#sliderBar").ionRangeSlider({
            min: 0,
            max: 86400,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return g_oPlayback.formatSeconds(val);
            },
            onChange: function (val) {
                console.info(val);
            }
        });

    },

    initICheck: function () {
        $('input').iCheck({
            checkboxClass: 'icheckbox_flat-red', //每个风格都对应一个，这个不能写错哈。
            radioClass: 'icheckbox_flat-red'
        });
        $('input').on('ifChecked', function (event) {
            g_oPlayback.channelChecked(event);
        });
        $('input').on('ifUnchecked', function (event) {
            g_oPlayback.channelUnChecked(event);
        });
    },

    initChannels: function () {
        var json = {}
        json.Cmd = 1501;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_VIDEO_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "POST",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    for (var i = 0; i < result.L.length; i++) {
                        var div = $(" <li style=\"float: left;width: 25%;\">\n" +
                            "                                <input value=" + result.L[i].C + " tabindex=" + result.L[i].C + " type=\"checkbox\" id=\"input-" + result.L[i].C + "\">\n" +
                            "                                <label for=\"input-" + result.L[i].C + "\"><span>通道" + result.L[i].C + "</span></label>\n" +
                            "                            </li>");

                        $("#ChnList").append(div);
                    }
                }
                g_oPlayback.initICheck();
            },
            error: function () {
                console.info("获取通道信息发生错误");
            }
        });
    },

    initFullCalendar: function () {
        let calendarEl = document.getElementById('calendar');
        let calendar;

        initThemeChooser({
            init: function (themeSystem) {
                calendar = new FullCalendar.Calendar(calendarEl, {
                    plugins: ['bootstrap', 'interaction', 'dayGrid', 'timeGrid', 'list'],
                    header: {
                        left: '',
                        center: 'title',
                        right: 'prev,next today'
                    },
                    themeSystem: themeSystem,
                    contentHeight: 320,
                    editable: false,
                    businessHours: true, // display business hours
                    navLinks: false, // can click day/week names to navigate views
                    selectable: true,
                    selectMirror: true,
                    eventColor: '#A78CF1',
                    select: function (arg) {
                        let currDate = arg.startStr;
                        if (g_oPlayback.defaultPlayDate != currDate && g_oPlayback.videoDates.includes(currDate)) {
                            g_oPlayback.defaultPlayDate = currDate;
                            g_oPlayback.clearTimeTick();
                            g_oPlayback.searchTimeTick();
                            $("#currTime").text(currDate);
                        }
                    },
                    eventClick: function (arg) {
                    },
                    eventRender: function (eventObj, $el) {
                    },
                    events: function (fetchInfo, successCallback, failureCallback) {
                        g_oPlayback.videoDates.length = 0;
                        var start = new Date(fetchInfo.start).Format('yyyy-MM');
                        var end = new Date(fetchInfo.end).Format('yyyy-MM');
                        var json = {}
                        json.Cmd = 7115;
                        json.Id = "123123123";
                        json.User = 12345678;
                        json.Def = "JSON_CMD_GET_PLAYBACK_DAY";
                        json.Month = "2019-11";
                        let jsonReqStr = JSON.stringify(json);
                        let events = [];
                        $.ajax({
                            type: "POST",
                            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
                            dataType: "json",
                            success: function (result) {
                                if (0 == result.Ack) {
                                    for (var i = 0; i < result.Day.length; i++) {
                                        var day = result.Day[i] + 1;
                                        var event = {};
                                        event.id = i;
                                        event.title = 'v';
                                        event.textColor = '#fff';
                                        event.className = 'myBlock';
                                        event.start = json.Month + "-" + day;         // will be parsed
                                        event.end = json.Month + "-" + day;
                                        event.borderColor = '#fff'
                                        events.push(event);
                                        g_oPlayback.videoDates.push(event.start);
                                    }
                                    //回调渲染日历
                                    successCallback(events);
                                }
                            },
                            error: function () {
                                console.info("获取录像信息发生错误");
                            }
                        });
                    },
                    // editable: true,
                    eventLimit: true, // allow "more" link when too many events
                });
                calendar.render();
            },
        });
    },

    initVideo: function () {
        this.wAvDecoder = new Worker("assets/jsVideo/AvDecoder.js");
        this.wAvDecoder.onmessage = function (evt) {
            var objData = evt.data;
            var chn = parseInt(objData.chn, 10);

            if ((null != g_oPlayback.player[chn]) && (undefined != g_oPlayback.player[chn])) {
                switch (objData.t) {
                    case kInitDecoderRsp:
                        g_oPlayback.player[chn].onInitDecoder(objData);
                        break;

                    case kVideoFrame:
                        g_oPlayback.player[chn].onVideoFrame(objData);
                        break;

                    case kAudioFrame:
                        g_oPlayback.player[chn].onAudioFrame(objData);
                        break;

                    case kDecoderStatusReq:
                        g_oPlayback.m_wasmLoaded = 1;
                        break;
                }
            }
        };

        for (var iChn = 1; iChn <= 4; iChn++) {
            this.player[iChn - 1] = new Player();
            if (this.player[iChn - 1]) {
                var canvas = document.getElementById('myCanvas' + iChn);
                this.player[iChn - 1].initPlayer(canvas, this.wAvDecoder);
            }
        }
    },

    searchTimeTick: function (event) {
        if (![null].includes(g_oPlayback.defaultPlayDate)) {
            let channels = [null, undefined].includes(event) ? g_oPlayback.channels : event.val();
            let json = {};
            json.Cmd = 7116;
            json.Id = "123123123";
            json.User = 12345678;
            json.Def = "JSON_CMD_GET_PLAYBACK_TIME_AXIS";
            json.Date = g_oPlayback.defaultPlayDate;
            for (let i = 0; i < channels.length; i++) {
                json.Ch = channels[i];
                let jsonReqStr = JSON.stringify(json);
                $.ajax({
                    type: "POST",
                    url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
                    dataType: "json",
                    success: function (result) {
                        if (0 == result.Ack) {
                            event = $("#input-" + channels[i]);
                            g_oPlayback.addTimescale(event, result.L);
                        }
                    },
                    error: function () {
                        console.info("获取获取当天回放时间轴失败");
                    }
                });
            }

        }
    },

    clearTimeTick: function () {
        $("#timescale").empty();
    },
    //快进
    fastForward: function (number) {
        let slider = $("#sliderBar").data("ionRangeSlider");
        if (1 == number) {
            slider.update({
                max: 86400,
                from: 0,
            });
        } else if (2 == number) {
            slider.update({
                max: 3600,
                from: 0,
            });
        } else {
            slider.update({
                max: 960,
                from: 0,
            });
        }
    },

    channelChecked: function (event) {
        let object = $(event.target);
        this.channels.push(object.val());
        g_oPlayback.changeChannels();
        this.searchTimeTick(object);
    },

    channelUnChecked: function (event) {
        var object = $(event.target);
        this.channels.splice(this.channels.indexOf(object.val()), 1);
        g_oPlayback.changeChannels();
        this.removeTimescale(object.val());
    },

    changeChannels: function (maxChannelNumber) {
        var m_maxChannelNumber = maxChannelNumber == null ? g_oPlayback.m_MaxChannelNumber : maxChannelNumber;
        $("input").not("input:checked").each(function () {
            if (g_oPlayback.channels.length < m_maxChannelNumber)
                $(this).iCheck('enable');
            else
                $(this).iCheck('disable');
        });
    },

    change: function ($input) {
        $("#CurrTime").text(g_oPlayback.formatSeconds($input.value));
    },

    _getDeviceInfo: function () {
        var szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdIndexPage = translator.getLanguageXmlDoc("IndexPage");
        translator.translatePage(this._lxdIndexPage, document);
        $("#btAway").attr("title", g_oCommon.getNodeValue("status0"));
        $("#btDisarm").attr("title", g_oCommon.getNodeValue("status1"));
        $("#btHome").attr("title", g_oCommon.getNodeValue("status2"));
        $("#btAlarmCancel").attr("title", g_oCommon.getNodeValue("status3"));
        $("#laZoomout").attr("title", g_oCommon.getNodeValue("laZoomout"));
        $("#laZoomin").attr("title", g_oCommon.getNodeValue("laZoomin"));
        $("#laFocusout").attr("title", g_oCommon.getNodeValue("laFocusout"));
        $("#laFocusin").attr("title", g_oCommon.getNodeValue("laFocusin"));
        $("#laIrisout").attr("title", g_oCommon.getNodeValue("laIrisout"));
        $("#laIrisin").attr("title", g_oCommon.getNodeValue("laIrisin"));
        $("#btnPlay").attr("title", g_oCommon.getNodeValue("btnPlay"));
        $("#btnCapture").attr("title", g_oCommon.getNodeValue("btnCapture"));
        $("#btnRecord").attr("title", g_oCommon.getNodeValue("btnRecord"));
        $("#btnEzoom").attr("title", g_oCommon.getNodeValue("btnEzoom"));
        $("#btnSound").attr("title", g_oCommon.getNodeValue("btnSound"));
        $("#btnIntercom").attr("title", g_oCommon.getNodeValue("btnIntercom"));
        $("#btnFullscreen").attr("title", g_oCommon.getNodeValue("btnFullscreen"));
        $("#btnOneScreen").attr("title", g_oCommon.getNodeValue("btnOneScreen"));
        $("#btnFourScreen").attr("title", g_oCommon.getNodeValue("btnFourScreen"));
        $("#btnNineScreen").attr("title", g_oCommon.getNodeValue("btnNineScreen"));
    },

    addTimescale: function (event, arrTimeSpace) {
        let channelText = event.parent().parent().find("label").text();
        let divBlock = $("<div class='timescaleBlock' id='Timescale" + event.val() + "' ><span style='float:left;line-height: 20px;font-size: 10px;color: #EC7063'>" + +"</span></div>");
        let leftLength = 0;
        for (let i = 0; i < arrTimeSpace.length; i++) {
            let div = $("<div class='noVideo'></div>");
            let startSecond = g_oPlayback.getTimeScale(arrTimeSpace[i].S);
            let endSecond = g_oPlayback.getTimeScale(arrTimeSpace[i].E);
            let marginLeft = (startSecond - leftLength) / 86400 * 100;
            let width = (endSecond - startSecond) / 86400 * 100;
            leftLength = endSecond;
            div.css({'float': 'left', 'margin-left': marginLeft + "%", 'width': width + '%'});
            divBlock.append(div);
        }
        $("#timescale").append(divBlock);
    },

    getTimeScale: function (date) {
        var arrDate = date.split(":");
        var H = parseInt(arrDate[0]);       //获取当前小时数(0-23)
        var M = parseInt(arrDate[1]);     //获取当前分钟数(0-59)
        var S = parseInt(arrDate[2]);     //获取当前秒数(0-59)
        return H * 3600 + M * 60 + S;
    },
    //移除通道录像
    removeTimescale: function (chnNum) {
        $("#Timescale" + chnNum).remove();
    },

    displayLastMsg: function () {
        if (!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active"))) {
            getLogList(5, 'lTypeAlarm');
        }
    },

    syncMsg: function () {
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/syncMsgInfo",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                var json = $.parseJSON(data);

                if (json.Ask == 0) {
                    var eventNum = json.EventNum;

                    if (!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
                        $("#alarmInfoNum").text(eventNum);
                }
            },
            timeOut: function (data) {
                alert("操作超时");
            }
        })
    },

    formatSeconds: function (value) {
        var result = '';
        var H = 0;// 分
        var M = 0;// 小时
        var S = 0;// 天
        H = parseInt(value / 3600);
        H = H > 9 ? H : "0" + H;
        M = parseInt((value % 3600) / 60);
        M = M > 9 ? M : "0" + M;
        S = parseInt(((value % 3600) % 60));
        S = S > 9 ? S : "0" + S;
        result = H + " : " + M + " : " + S;
        // return g_oPlayback.defaultPlayDate + " " + result;
        return result;
    },

    startRealPlay: function (iChn) {
        var that = this;
        if (0 == that.m_wasmLoaded) {
            console.log("wasm not load!");
            return;
        }
        console.log("StartRealPlay -------- +++ iChannelNum = %s\n", iChn);
        if (iChn > (g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum)) {
            return;
        }
        if (this.player[iChn - 1]) {
            var url = 'ws://' + g_oCommon.m_szHostName + ':8082/';
            this.player[iChn - 1].playInner(url, iChn - 1, 0);
        }
    },

    stopRealPlay: function (iChn) {
        if (null != this.player[iChn - 1]) {
            this.player[iChn - 1].stop();
        }
        console.log("StopRealPlay -------- +++ iChannelNum = %s\n", iChn);
    },

    realPlayAll: function (event) {
        if (![null].includes(g_oPlayback.defaultPlayDate)) {
            if ($(event).children(0).hasClass("icon-play")) {
                g_oPlayback.channels.forEach((item, index, array) => {
                    this.startRealPlay(item);
                });
                $(event).children(0).removeClass("icon-play");
                $(event).children(0).addClass("icon-stop");
                this.changeChannels(-1);
            } else {
                g_oPlayback.channels.forEach((item, index, array) => {
                    this.stopRealPlay(item);
                });
                $(event).children(0).removeClass("icon-stop");
                $(event).children(0).addClass("icon-play");
                this.changeChannels(10);
            }
        }
    },

    stopRealPlayAll: function () {
        if (![null].includes(g_oPlayback.defaultPlayDate)) {
            g_oPlayback.channels.forEach((item, index, array) => {
                this.stopRealPlay(item);
            });
        }
    }
}

var g_oPlayback = new Playback();