function Playback() {
    this._lxdPlayback = null;  //Playback.xml
    //默认播放日期(yyyy-MM-dd)
    this.defaultPlayDate = new Date().Format("yyyy-MM-dd");
    //当前播放时间(yyyy-MM-dd hh:mm:ss)
    this.defaultPlayTime = new Date().Format("00:00:00");
    this.player = [];
    this.audioPlayer = null;
    this.m_MaxChannelNumber = 4;
    this.videoDates = [];
    this.timeClock = null;
    this.appCache = new appControllerCache();
}

Playback.prototype = {
    closeAll: function () {
        this.player.forEach((item, index, array) => {
            item.stop();
        })
    },
    //主页面初始化函数
    initPage: function () {
        this.initProcess();
        this.initFullCalendar();
        this.initChannels();
        this.reSetTickTime();
        this.initAudio();
        getMenuList();//加载菜单列表等文本
        this._getDeviceInfo();
        ///this._getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
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
                g_oPlayback.defaultPlayTime = g_oPlayback.formatSeconds(val.from);
                g_oPlayback.reSetTickTime();
            },
            onFinish: function (data) { //拖动结束回调
                g_oPlayback.defaultPlayTime = g_oPlayback.formatSeconds(data.from);
                g_oPlayback.startRealPlay();
            }
        });
    },

    initICheck: function () {
        $('input').iCheck({
            checkboxClass: 'icheckbox_flat-blue', //每个风格都对应一个，这个不能写错哈。
            radioClass: 'icheckbox_flat-blue'
        });
        $('input').on('ifChecked', function (event) {
            g_oPlayback.channelChecked(event);
        });
        $('input').on('ifUnchecked', function (event) {
            g_oPlayback.channelUnChecked(event);
        });
    },

    initChannels: function () {
        let json = {}
        json.Cmd = 1501;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_VIDEO_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    for (let i = 0; i < result.L.length; i++) {
                        let div = "<li style='width: 50%;float: left;'>";
                        div += "     <input value=" + (parseInt(result.L[i].C) + 1) + " tabindex=" + (parseInt(result.L[i].C) + 1) + " type=\"checkbox\" id=\"input-" + (parseInt(result.L[i].C) + 1) + "\">\n";

                        div += "    <img src='assets/img/sub_stream.png' id='Stream" + (parseInt(result.L[i].C) + 1) + "Img' onclick='g_oPlayback.switchStream(" + (parseInt(result.L[i].C) + 1) + ")'/>";
                        div += "    <img src='assets/img/Camera_1.png' id='Camera" + (parseInt(result.L[i].C) + 1) + "Img' onclick='g_oPlayback.switchPlayStatus(" + (parseInt(result.L[i].C) + 1) + ")'/>";
                        //div += "<span style='cursor:pointer;color:#000000;-moz-user-select:none;' id='Selected" + (parseInt(result.L[i].C) + 1) + "color'  onClick='g_oIndexPage.SetFontColor(" + (parseInt(result.L[i].C) + 1) + ")' onDblClick='g_oIndexPage.StartRealPlay(" + (parseInt(result.L[i].C) + 1) + ")' onselectstart='return false;'>&nbsp;Camera" + (parseInt(result.L[i].C) + 1) + "</span>";
                        div += "     <label for=\"input-" + (parseInt(result.L[i].C) + 1) + "\"><span>Camera" + (parseInt(result.L[i].C) + 1) + "</span></label>\n";
                        div += "</li>";
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
                    // eventColor: '#A78CF1',
                    // eventColor: '#3F66C4',
                    eventColor: '#D7DCDE',

                    select: function (arg) {
                        calendar.getEvents().forEach(function (item) {
                            if (new Date(arg.start).Format("yyyy-MM-dd") == new Date(item.start).Format("yyyy-MM-dd"))
                                item.setProp("backgroundColor", "#3498DB");
                            else
                                item.setProp("backgroundColor", "#D7DCDE");
                        });
                        let currDate = arg.startStr;
                        if (g_oPlayback.defaultPlayDate != currDate && g_oPlayback.videoDates.includes(currDate)) {
                            g_oPlayback.defaultPlayDate = arg.startStr;
                            g_oPlayback.reDrawTimeTick();
                        }
                    },
                    eventClick: function (arg) {
                        calendar.getEvents().forEach(function (item) {
                            if (new Date(arg.event.start).Format("yyyy-MM-dd") == new Date(item.start).Format("yyyy-MM-dd"))
                                item.setProp("backgroundColor", "#3498DB");
                            else
                                item.setProp("backgroundColor", "#D7DCDE");
                        });
                        g_oPlayback.defaultPlayDate = new Date(arg.event.start).Format("yyyy-MM-dd");
                        g_oPlayback.reDrawTimeTick();
                    },
                    eventRender: function (eventObj, $el) {
                    },
                    events: function (fetchInfo, successCallback, failureCallback) {
                        g_oPlayback.videoDates.length = 0;
                        let currDate = calendar == null ? new Date() : new Date(calendar.view.title);
                        let start = new Date(fetchInfo.start);
                        let end = new Date(fetchInfo.end);

                        let tempDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
                        let tempYear = tempDate.getFullYear();
                        let tempMonth = tempDate.getMonth();
                        if (![null, undefined].includes(calendar)) {
                            if (start < calendar.state.currentDate && end > calendar.state.currentDate) {
                                let prevDate = new Date(tempYear, tempMonth - 1, 1);
                                let prevYear = prevDate.getFullYear();
                                let prevMonth = prevDate.getMonth();
                                currDate = new Date(prevYear, prevMonth);
                            } else {
                                let nextDate = new Date(tempYear, tempMonth + 1, 1);
                                let nextYear = nextDate.getFullYear();
                                let nextMonth = nextDate.getMonth();
                                currDate = new Date(nextYear, nextMonth);
                            }
                        }

                        let json = {}
                        json.Cmd = 7115;
                        json.Id = "123123123";
                        json.User = 12345678;
                        json.Def = "JSON_CMD_GET_PLAYBACK_DAY";
                        json.Month = currDate.getFullYear() + "-" + (currDate.getMonth() + 1);
                        let jsonReqStr = JSON.stringify(json);
                        $.ajax({
                            type: "get",
                            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
                            dataType: "json",
                            success: function (result) {
                                if (0 == result.Ack) {
                                    let events = [];
                                    for (let i = 0; i < result.Day.length; i++) {
                                        let day = result.Day[i];
                                        let event = {};
                                        event.id = i;
                                        event.title = 'v';
                                        event.textColor = '#fff';
                                        event.className = 'myBlock';
                                        event.start = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + (day > 9 ? day : "0" + day);         // will be parsed
                                        event.end = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + (day > 9 ? day : "0" + day);

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
                    loading: function (sign) {
                    },
                    // editable: true,
                    eventLimit: true, // allow "more" link when too many events
                });
                calendar.render();
            },
        });
    },

    btOpenVoice: function (event) {
        if ($(event).children(0).hasClass("icon-Intercom-off")) {
            $(event).children(0).removeClass("icon-Intercom-off");
            $(event).children(0).addClass("icon-Intercom-on");
            if (null != this.audioPlayer) {
                this.audioPlayer.start();
            }
        } else {
            $(event).children(0).removeClass("icon-Intercom-on");
            $(event).children(0).addClass("icon-Intercom-off");
            if (null != this.audioPlayer) {
                this.audioPlayer.stop();
            }
        }
    },

    initVideo: function () {
        let that = this;
        for (let iChn = 1; iChn <= 4; iChn++) {
            let canvas = document.getElementById('myCanvas' + iChn);
            that.appCache.create(canvas);
        }
    },

    initAudio: function () {
        this.audioPlayer = new audioPlayer();
    },

    searchTimeTick: function (event) {
        if (![null].includes(g_oPlayback.defaultPlayDate)) {
            let json = {};
            json.Cmd = 7116;
            json.Id = "123123123";
            json.User = 12345678;
            json.Def = "JSON_CMD_GET_PLAYBACK_TIME_AXIS";
            json.Date = g_oPlayback.defaultPlayDate;
            g_oPlayback.appCache.appControllerArr.forEach((item, index, array) => {
                if (item.checked) {
                    json.Ch = item.channelNumber;
                    let jsonReqStr = JSON.stringify(json);
                    $.ajax({
                        type: "get",
                        url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
                        dataType: "json",
                        success: function (result) {
                            if (0 == result.Ack) {
                                event = $("#input-" + (item.channelNumber + 1));
                                g_oPlayback.addTimescale(event, result.L);
                            }
                        },
                        error: function () {
                            console.info("获取获取当天回放时间轴失败");
                        }
                    });
                }
            });
        }
    },
    //设置当前播放时间点
    reSetTickTime: function () {
        let newDateTime = new Date(this.defaultPlayDate + " " + this.defaultPlayTime).Format("yyyy-MM-dd hh:mm:ss");
        $("#currTime").text(newDateTime);
    },
    //重绘录像刻度表
    reDrawTimeTick: function () {
        g_oPlayback.clearTimeTick();
        g_oPlayback.searchTimeTick();
        g_oPlayback.reSetTickTime();
    },
    //清空录像刻度表
    clearTimeTick: function () {
        $("#timescale").empty();
    },
    //快进x1 x2 x3
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
        let channelNumber = parseInt(object.val());
        let channelObj = g_oPlayback.appCache.appControllerArr.find(x => x.checked == false);
        channelObj.checked = true;
        channelObj.channelNumber = channelNumber - 1;
        this.searchTimeTick(object);
        this.changeChannels(4);
    },

    channelUnChecked: function (event) {
        let object = $(event.target);
        let channelNumber = parseInt(object.val());
        let channelObj = g_oPlayback.appCache.appControllerArr.find(x => x.channelNumber == channelNumber - 1);
        if (null != channelObj) {
            channelObj.checked = false;
            channelObj.channelNumber = 0;
        }
        this.removeTimescale(object.val());
        this.changeChannels(4);
    },
    //更改主子码流状态
    switchStream: function (chn) {
        let channelObj = g_oPlayback.appCache.appControllerArr.find(x => x.channelNumber == chn - 1);
        if (null != channelObj) {
            channelObj.stream = channelObj.stream == 0 ? 1 : 0;
            if (channelObj.stream == 0)
                $("#Stream" + chn + "Img").attr("src", "assets/img/main_stream.png").attr("title", parent.translator.translateNode(this._lxdIndexPage, "mainStream"));
            else
                $("#Stream" + chn + "Img").attr("src", "assets/img/sub_stream.png").attr("title", parent.translator.translateNode(this._lxdIndexPage, "subStream"));
        }
    },
    //更改播放状态
    switchPlayStatus: function (chn) {
        let that = this;
        let channelObj = g_oPlayback.appCache.appControllerArr.find(x => x.channelNumber == chn - 1);
        if (null != channelObj)
            channelObj.isRunning ? that.StopRealPlayAll(chn) : that.StartRealPlay(chn);
    },
    //更新channel状态
    changeChannels: function (maxChannelNumber) {
        let m_maxChannelNumber = maxChannelNumber == null ? g_oPlayback.m_MaxChannelNumber : maxChannelNumber;
        let checkTotal = g_oPlayback.appCache.appControllerArr.filter(x => x.checked === true).length;
        if (maxChannelNumber == 10) {
            $("input").each(function () {
                $(this).iCheck('enable');
            });
        } else if (maxChannelNumber == -1) {
            $("input").each(function () {
                $(this).iCheck('disable');
            });
        } else {
            $("input").not("input:checked").each(function () {
                if (checkTotal < m_maxChannelNumber)
                    $(this).iCheck('enable');
                else
                    $(this).iCheck('disable');
            });
        }
    },

    _getDeviceInfo: function () {
        let szLanguage = $.cookie("language");
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
        let arrDate = date.split(":");
        let H = parseInt(arrDate[0]);       //获取当前小时数(0-23)
        let M = parseInt(arrDate[1]);     //获取当前分钟数(0-59)
        let S = parseInt(arrDate[2]);     //获取当前秒数(0-59)
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
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getStatusInfo",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                let json = $.parseJSON(data);

                if (json.Ask == 0) {
                    let eventNum = json.EventNum;

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
        let result = '';
        let H = 0;// 分
        let M = 0;// 小时
        let S = 0;// 天
        H = parseInt(value / 3600);
        H = H > 9 ? H : "0" + H;
        M = parseInt((value % 3600) / 60);
        M = M > 9 ? M : "0" + M;
        S = parseInt(((value % 3600) % 60));
        S = S > 9 ? S : "0" + S;
        result = H + ":" + M + ":" + S;
        // return g_oPlayback.defaultPlayDate + " " + result;
        return result;
    },
    //全部开始播放
    RealPlayAll: function () {
        let that = this;
        if (that.m_bAllPlay) {
            let runCount = that.appCache.appControllerArr.filter(x => x.isRunning).length;
            if (runCount > 0) {
                that.StopRealPlayAll();
                that.m_bAllPlay = false;
                $("#btnPlay").children(0).removeClass("icon-stop");
                $("#btnPlay").children(0).addClass("icon-play");
                that.changeChannels(10);
            }
        } else {
            let palyCount = that.appCache.appControllerArr.filter(x => x.checked).length;
            if (palyCount > 0) {
                that.StartRealPlay();
                that.m_bAllPlay = true;
                $("#btnPlay").children(0).removeClass("icon-play");
                $("#btnPlay").children(0).addClass("icon-stop");
                that.changeChannels(-1);
            }
        }
    },
    //单个开启视频
    StartRealPlay: function (chn) {
        let that = this;
        let runCount = that.appCache.appControllerArr.filter(x => x.isRunning).length;
        that.appCache.appControllerArr.forEach((item, index, array) => {
            if (![null, undefined, ""].includes(chn)) {
                if ((index + 1) != chn) {
                    return true;
                }
            }
            if (!item.isRunning && ![null].includes(g_oPlayback.defaultPlayDate)) {
            // if (!item.isRunning && item.checked) {
                let newDateTime = new Date(this.defaultPlayDate + " " + this.defaultPlayTime).Format("yyyy-MM-dd-hh-mm-ss");
                setTimeout(function () {
                    let url = 'ws://' + g_oCommon.m_szHostName + ':8082/';
                    let options = null;
                    if ([null, undefined, ""].includes(item.options)) {
                        options = {
                            u: url,
                            c: item.channelNumber,
                            s: item.stream,
                            // p: null,
                            // d: null
                            p: 1, //playType 0-直播，1-录像
                            d: newDateTime
                        }
                    }
                    item.start(options);
                    $("#Camera" + (index + 1) + "Img").attr("src", "assets/img/Camera_2.png");
                    item.isRunning = true;
                }, 100);
            }
        });
        let slider = $("#sliderBar").data("ionRangeSlider");
        if (runCount == 0) {
            if (null == this.timeClock) {
                //时间定时器
                this.timeClock = setInterval(function () {
                    slider.update({
                        from: slider.old_from + 1
                    });
                    g_oPlayback.defaultPlayTime = g_oPlayback.formatSeconds(slider.old_from);
                    g_oPlayback.reSetTickTime();
                }, 1000);
            }
        }
    },
    //全部停止播放
    StopRealPlayAll: function (chn) {
        let that = this;
        that.appCache.appControllerArr.forEach((item, index, array) => {
            if (![null, undefined, ""].includes(chn)) {
                if ((index + 1) != chn) {
                    return true;
                }
            }
            if (item.isRunning) {
                setTimeout(function () {
                    let url = 'ws://' + g_oCommon.m_szHostName + ':8082/';
                    let options = {
                        u: url,
                        c: 0,
                        s: 1,
                        p: null,
                        d: null
                    }
                    item.stop();
                    $("#Camera" + (index + 1) + "Img").attr("src", "assets/img/Camera_1.png");
                }, 100)
                item.isRunning = false;
            }
        });
        let runCount = that.appCache.appControllerArr.filter(x => x.isRunning).length;
        if (runCount == 0 && null != that.timeClock) {
            clearInterval(that.timeClock);
            this.timeClock = null;
        }
    },

}

let g_oPlayback = new Playback();