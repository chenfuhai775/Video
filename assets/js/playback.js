function Playback() {
    this._lxdPlayback = null;  //Playback.xml
    this.channels = new Array();
    //默认播放日期
    this.defaultPlayDate = null;
    this.player = [];
    this.m_wasmLoaded = 0;
}

Playback.prototype = {
    //主页面初始化函数
    initPage: function () {
        // g_oPlayback.defaultPlayDate = $.fullCalendar.formatDate(new Date(), "yyyy-MM-dd");
        $.fn.RangeSlider = function (cfg) {
            this.sliderCfg = {
                min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,
                max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
                step: cfg && Number(cfg.step) ? cfg.step : 1,
                callback: cfg && cfg.callback ? cfg.callback : null
            };
            var $input = $(this);
            var min = this.sliderCfg.min;
            var max = this.sliderCfg.max;
            var step = this.sliderCfg.step;
            var callback = this.sliderCfg.callback;

            $input.attr('min', min)
                .attr('max', max)
                .attr('step', step);

            $input.bind("input", function (e) {
                $input.attr('value', this.value);
                $input.css('background-size', this.value * 100.0 / max + '% 100%');
                if ($.isFunction(callback)) {
                    callback(this);
                }
            });
        };

        $('#slider').RangeSlider({min: 0, max: 86400, step: 1, callback: g_oPlayback.change});
        var Dates = ['2018-11-21', '2019-11-21', '2019-11-22'];
        var calendar = $('#calendar').fullCalendar({
            header: {
                left: 'prev,next',
                center: 'title',
                right: ''
            },
            height: 200,
            width: 300,
            selectable: true,
            dayClick: function (date, allDay, jsEvent, view) {
                var currDate = $.fullCalendar.formatDate(date, "yyyy-MM-dd");
                if (g_oPlayback.defaultPlayDate != currDate && Dates.includes(currDate)) {
                    g_oPlayback.defaultPlayDate = currDate;
                    $("#CurrTime").text(g_oPlayback.formatSeconds(0));
                    if (![null].includes(g_oPlayback.channels) && g_oPlayback.channels.length > 0) {
                        g_oPlayback.channels.forEach((item, index, array) => {
                            g_oPlayback.StartRealPlay(item);
                        });
                    }
                }
            },
            events: function (start, end, timezone, callback) {
                Dates.forEach((item, index, array) => {
                    var currDate = new Date(item);
                    if (start <= currDate && currDate <= end) {
                        $($(".fc-day[data-date='" + $.fullCalendar.formatDate(currDate, "yyyy-MM-dd") + "']")[0]).css("background-color", "#FCF8E3");
                    }
                });
            }
        });
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
        this.initDate();
        this.InitChnList(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum);
        this.searchRecordFile(0);

        g_oPlayback.syncMsg();
        setInterval("g_oPlayback.syncMsg()", 2000);
        setTimeout(g_oPlayback.initVideo(), 1);
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

    change: function ($input) {
        $("#CurrTime").text(g_oPlayback.formatSeconds($input.value));
    },

    changeProgress: function (object) {
        console.info("播放到：" + g_oPlayback.formatSeconds(object.value));
    },

    channelChecked: function (event) {
        console.info(event);
        var object = $(event.target);
        if (this.channels.length == 4) {
            alert("最多选择四个通道");
        } else {
            this.channels.push(object.val());
            if (![null].includes(g_oPlayback.defaultPlayDate)) {
                var TimeArr = ['08:00:00', '12:00:00', '13:00:00', '15:00:00', '16:00:05', '18:05:08'];
                // var TimeArr = ['08:00:00', '12:00:00'];
                g_oPlayback.AddTimescale(object, TimeArr);
                g_oPlayback.StartRealPlay(object.val());
                console.info("播放" + g_oPlayback.defaultPlayDate + object.value + "号通道视频!");
            }
        }
    },

    channelUnChecked: function (event) {
        var object = $(event.target);
        if (![null].includes(g_oPlayback.defaultPlayDate)) {
            g_oPlayback.RemoveTimescale(object.val());
            g_oPlayback.StopRealPlay(object.val());
            console.info("关闭" + g_oPlayback.defaultPlayDate + object.val() + "号通道视频!");
        }
        this.channels.splice(this.channels.indexOf(object.value), 1);
    },

    AddTimescale: function (object, arrTimeSpace) {
        var channelText = object.parent().parent().find("label").text();
        var divBlock = $("<div class='timescaleBlock' id='Timescale" + object.val() + "' ><span style='float:left;line-height: 20px;font-size: 10px;color: #EC7063'>" + channelText + "</span></div>");
        var leftLength = 0;
        for (var i = 0; i < arrTimeSpace.length / 2; i++) {
            var div = $("<div class='noVideo'></div>");
            var startSecond = g_oPlayback.getTimeScale(arrTimeSpace[2 * i]);
            var endSecond = g_oPlayback.getTimeScale(arrTimeSpace[2 * i + 1]);
            var marginLeft = (startSecond - leftLength) / 86400 * 100;
            var width = (endSecond - startSecond) / 86400 * 100;
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
    RemoveTimescale: function (chnNum) {
        $("#Timescale" + chnNum).remove();
    },
    //获取通道列表
    InitChnList: function (chnNum) {
        var chnNo;
        for (var i = 0; i < chnNum; i++) {
            var szChannelName = "";
            chnNo = i + 1;
            if (szChannelName == "") {
                if (i < 9) {
                    szChannelName = "Camera 0" + chnNo;
                } else {
                    szChannelName = "Camera " + chnNo;
                }
            }
            var oOption = document.createElement("option");
            document.getElementById("ChnSel").options.add(oOption);
            oOption.value = chnNo;
            oOption.innerText = szChannelName;

        }
    },
    //初始化日期控件
    initDate: function () {
        var time = new Date();
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var newMonth = month > 9 ? month : "0" + month;  //月
        var day = time.getDate();
        var newDay = day > 9 ? day : "0" + day;  //日
        $("#my-startDate").val(year + "-" + newMonth + "-" + newDay);
        var selLanguage = "";
        var szLanguage = $.cookie("language");
        if (szLanguage === "en") selLanguage = "en_US";
        else if (szLanguage === "zh") selLanguage = "zh_CN";

        $('#my-start').datepicker({
            //locale:  'en_US',默认是中文
            locale: selLanguage,
            format: 'yyyy-mm-dd'
        });

        $('#my-start').datepicker().on('changeDate.datepicker.amui', function (event) {
            $('#my-startDate').val($('#my-start').data('date'));
        });
    },
    //搜索录像文件 iType 2:Start 1:next
    searchRecordFile: function (offSet) {
        var that = this;
        var chnNo = $("#ChnSel").val();
        var iType = $("#iTypeSel").val();
        var startDate = $("#my-startDate").val();
        var jsonCmd = {};

        if ((0 == offSet) || (undefined == offSet))
            that.m_iRcvNum = 0;

        jsonCmd.Cmd = 7117;
        jsonCmd.Id = "web";
        jsonCmd.User = 123;
        jsonCmd.Def = "JSON_CMD_GET_PLAYBACK_FILE_LIST";
        jsonCmd.Ch = chnNo;
        jsonCmd.Date = startDate;
        jsonCmd.Offset = offSet;
        var jsonStr = JSON.stringify(jsonCmd);

        $.ajax({
            type: "GET",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                var jsonRcv = $.parseJSON(data);
                console.log("searchRecordFile data = %s \n", data);

                for (var i = 0; i < jsonRcv.L.length; i++) {
                    var szStartTime = jsonRcv.L[i].S;
                    var szStopTime = jsonRcv.L[i].E;
                    var szFileName = jsonRcv.L[i].N;
                    var szFileSize = jsonRcv.L[i].B;
                    if ((undefined == szStartTime) || (undefined == szStopTime) || (undefined == szFileName) || (undefined == szFileSize))
                        continue;

                    that.m_szStartTimeSet.push(szStartTime);
                    that.m_szEndTimeSet.push(szStopTime);
                    that.m_szFileNameSet.push(szFileName);
                    that.m_szFileSizeSet.push(szFileSize);
                }

                that.m_iRcvNum = that.m_iRcvNum + jsonRcv.L.length;

                if (jsonRcv.L.length >= 10) {
                    that.searchRecordFile(that.m_iRcvNum);
                } else {
                    console.log("fileLoad ================");
                    that.fileLoad();
                }

            },
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.status === 403) {
                    that.m_iRcvNum = 0;
                    alert("failed");
                } else {
                    that.m_iRcvNum = 0;
                    alert("failed");
                }
            }
        });
    },
    //获取录像列表
    fileLoad: function () {
        var that = this;
        var nums = 8; //每页出现的数量
        var pages = Math.ceil(that.m_iRcvNum / nums); //得到总页数
        var laFirstPage = translator.translateNode(that._lxdPlayback, "laFirstPage");
        var laLastPage = translator.translateNode(that._lxdPlayback, "laLastPage");
        var laRecordTime = translator.translateNode(that._lxdPlayback, "laRecordTime");
        var laFileSize = translator.translateNode(that._lxdPlayback, "laFileSize");

        var thisDate = function (curr) {
            var list = '',
                last = curr * nums - 1;
            last = last >= that.m_iRcvNum ? (that.m_iRcvNum - 1) : last;
            for (var i = (curr * nums - nums); i <= last; i++) {
                var szStartTime = that.m_szStartTimeSet[i];
                var szStopTime = that.m_szEndTimeSet[i];
                var szFileName = that.m_szFileNameSet[i];
                var szFileSize = that.m_szFileSizeSet[i];
                var SzUrl = szFileName;

                var dateBegin = new Date("2019/01/01 " + szStartTime);//将-转化为/
                var dateEnd = new Date("2019/01/01 " + szStopTime);//将-转化为/
                console.log("dateBegin = %s, dateEnd = %s", "2019/01/01 " + szStartTime, "2019/01/01 " + szStopTime);
                console.log("dateBegin = %s, dateEnd = %s", dateBegin, dateEnd);
                var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
                var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
                var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
                var hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
                //计算相差分钟数
                var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
                var minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
                //计算相差秒数
                var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
                var seconds = Math.round(leave3 / 1000)
                var TimeLength = minutes + "‘" + seconds + "“";

                list += "<div class='am-u-sm-12 am-u-md-6 am-u-lg-3'>";
                list += "	<div class='tpl-table-images-content'>";
                list += "		<div class='tpl-table-images-content-i-time'><span>" + szStartTime + "</span><span class='am-fr'>" + TimeLength + "</span></div>";
                list += "			<a href='javascript:void(0);' onclick='g_oPlayback.videoPlay(\"" + SzUrl + "\",\"" + szStartTime + "\")' class='tpl-table-images-content-i'><img src='assets/img/a1.png'></a>";
                list += "		<div class='tpl-table-images-content-i-time'><span>" + szFileSize + "</span><a href='" + SzUrl + "'><span class='am-icon-download am-fr'></span></a></div>";
                list += "	</div>";
                list += "</div>";
            }
            return list;
        };
        //返回的是一个page示例，拥有实例方法
        var $page = $("#page").page({
            pages: pages, //页数
            curr: 1, //当前页
            theme: 'default', //主题
            groups: 5, //连续显示分页数
            prev: '<', //若不显示，设置false即可
            next: '>', //若不显示，设置false即可
            //first: "首页",
            first: laFirstPage,
            //last: "尾页", //false则不显示
            last: laLastPage,
            before: function (context, next) { //加载前触发，如果没有执行next()则中断加载
                console.log('开始加载...');
                context.time = (new Date()).getTime(); //只是演示，并没有什么卵用，可以保存一些数据到上下文中
                next();
            },
            render: function (context, $element, index) { //渲染[context：对this的引用，$element：当前元素，index：当前索引]
                //逻辑处理
                if (index == 'last') { //虽然上面设置了last的文字为尾页，但是经过render处理，结果变为最后一页
                    //$element.find('a').html('最后一页');
                    $element.find('a').html(laLastPage);
                    return $element; //如果有返回值则使用返回值渲染
                }
                return false; //没有返回值则按默认处理
            },
            after: function (context, next) { //加载完成后触发
                var time = (new Date()).getTime(); //没有什么卵用的演示
                console.log('分页组件加载完毕，耗时：' + (time - context.time) + 'ms');
                next();
            },
            /*
             * 触发分页后的回调，如果首次加载时后端已处理好分页数据则需要在after中判断终止或在jump中判断first是否为假
             */
            jump: function (context, first) {
                console.log('当前第：' + context.option.curr + "页");
                $("#content").html(thisDate(context.option.curr));
            }
        });
    },

    videoPlay: function (url, time) {
        document.getElementById('videoTitle').innerHTML = time;
        var modalContentHtml = ""
        modalContentHtml += "<video src='" + url + "' controls autoplay width='100%' style='outline:none;'></video>";
        document.getElementById('modalContent').innerHTML = modalContentHtml;
        $('#videoPlay').modal({
            relatedTarget: this,
            width: 640,
            height: 400,
        });
        $('#videoPlay').find('.am-close-spin').on('click', function () {
            document.getElementById('modalContent').innerHTML = "";
        });

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
        return g_oPlayback.defaultPlayDate + " " + result;
    },

    StartRealPlay: function (iChn) {
        var that = this;
        if (0 == that.m_wasmLoaded) {
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

    StopRealPlay: function (iChn) {
        if (null != this.player[iChn - 1]) {
            this.player[iChn - 1].stop();
        }
        console.log("StopRealPlay -------- +++ iChannelNum = %s\n", iChn);
    }
}

var g_oPlayback = new Playback();