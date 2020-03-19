function frameSetting() {
    this.canvas = null;
    this.isPlay = false;
    this.timeDown;
    this.timeLeft;
    this.timeRight;
    this.timeUp;
    this.startX;
    this.startY;
    this.dragging;
    this.x = 0;
    this.y = 0;
    this.l = 0;
    this.t = 0;
    this.isDown = false;
    this.L = [{R: [], N: [], V: 0}, {R: [], N: [], V: 0}, {R: [], N: [], V: 0}, {R: [], N: [], V: 0}, {
        R: [],
        N: [],
        V: 0
    }, {R: [], N: [], V: 0}, {R: [], N: [], V: 0}];
    this.colorParams = [{}, {}, {}, {}];
    this.colorIndex = 0;
    this.appCache = new appControllerCache();
}

frameSetting.prototype = {
    initPage: function () {
        let that = this;
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdSystem = translator.getLanguageXmlDoc("frameSetting");
        translator.translatePage(this._lxdSystem, document);
        that.initVideo();
        that.initSlider();
        that.initICheck();
        that.getColor();
        that.initLayDate();
        if (szLanguage === "en") selLanguage = "en_US";
        else if (szLanguage === "zh") selLanguage = "zh_CN";
    },
    initLayDate: function () {
        laydate.render({
            elem: '#startTime',
            type: 'time',
            format: 'HH:mm'
        });
        laydate.render({
            elem: '#endTime',
            type: 'time',
            format: 'HH:mm'
        });
        for (let i = 0; i < 4; i++) {
            laydate.render({
                elem: '#startWeekTime' + i,
                type: 'time',
                format: 'HH:mm'
            });
            laydate.render({
                elem: '#endWeekTime' + i,
                type: 'time',
                format: 'HH:mm'
            });
        }
    },
    initSlider: function () {
        let that = this;
        that.brightness = $("#brightness").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        $("#contrastRatio").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        $("#saturation").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        $("#acuity").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        $("#chroma").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        //灵敏度
        $("#sensitivity").ionRangeSlider({
            min: 0,
            max: 7,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });
        $("#gain").ionRangeSlider({
            min: 0,
            max: 100,
            step: 1,
            grid: true,
            hide_min_max: true,
            from: 0,
            skin: 'modern',
            prettify_enabled: true,
            prettify_separator: ",",
            prettify: function (val) {
                return val;
            },
            onChange: function (val) {
                return val;
            },
            onFinish: function (data) {
                return data;
            }
        });

    },
    initICheck: function () {
        let that = this;
        $('input').iCheck({
            checkboxClass: 'icheckbox_flat-blue', //每个风格都对应一个，这个不能写错哈。
            radioClass: 'icheckbox_flat-blue'
        });
        let width = $("#myCanvas1").width();
        let height = $("#myCanvas1").height();
        let top = $("#myCanvas1").offset().top;
        let left = $("#myCanvas1").offset().left;

        $('input').on('ifChecked', function (event) {
            let object = $(event.target);
            let index = parseInt(object.val());
            if (0 == index) {
                let title = $("#ChannelName").val();
                if (["", null, undefined].includes(title))
                    title = 'camera 01';
                let div = $("<span value='0' style='padding: 2px' id='titleName'>" + title + "</span>");
                div.css({
                    'border': '2px solid red',
                    'width': 'auto',
                    'color': 'red',
                    'left': left + 10,
                    'top': top + 10,
                    'position': 'absolute'
                });
                div.bind('mousedown', function (e) {
                    //获取x坐标和y坐标
                    that.x = e.clientX;
                    that.y = e.clientY;

                    //获取左部和顶部的偏移量
                    that.l = $(this).offset().left;//div.offsetLeft;
                    that.t = $(this).offset().top//div.offsetTop;
                    //开关打开
                    that.isDown = true;
                    //设置样式
                    $(this).css({
                        'cursor': 'move'
                    });
                });
                div.bind('mousemove', function (e) {
                    if (that.isDown == false) {
                        return;
                    }
                    //获取x和y
                    let nx = e.clientX;
                    let ny = e.clientY;
                    //计算移动后的左偏移量和顶部的偏移量
                    let nl = nx - (that.x - that.l);
                    let nt = ny - (that.y - that.t);

                    $(this).css({
                        'left': nl + 'px',
                        'top': nt + 'px'
                    });
                });
                div.bind('mouseup', function (e) {
                    //开关关闭
                    that.isDown = false;
                    $(this).css({
                        'cursor': 'default'
                    });
                });
                $("body").append(div);

            } else if (1 == index) {
                let div = $("<span value='1' style='padding: 2px' id='titleTime'>2020-01-01 12:00:00</span>");
                div.css({
                    'border': '2px solid red',
                    'width': 'auto',
                    'color': 'red',
                    'left': left + 10,
                    'top': top + 10,
                    'position': 'absolute'
                });
                div.bind('mousedown', function (e) {
                    //获取x坐标和y坐标
                    that.x = e.clientX;
                    that.y = e.clientY;

                    //获取左部和顶部的偏移量
                    that.l = $(this).offset().left;//div.offsetLeft;
                    that.t = $(this).offset().top//div.offsetTop;
                    //开关打开
                    that.isDown = true;
                    //设置样式
                    $(this).css({
                        'cursor': 'move'
                    });
                });
                div.bind('mousemove', function (e) {
                    if (that.isDown == false) {
                        return;
                    }
                    //获取x和y
                    let nx = e.clientX;
                    let ny = e.clientY;
                    //计算移动后的左偏移量和顶部的偏移量
                    let nl = nx - (that.x - that.l);
                    let nt = ny - (that.y - that.t);

                    $(this).css({
                        'left': nl + 'px',
                        'top': nt + 'px'
                    });
                });
                div.bind('mouseup', function (e) {
                    //开关关闭
                    that.isDown = false;
                    $(this).css({
                        'cursor': 'default'
                    });
                });
                $("body").append(div);
            } else if (2 == index) {
                that.drawDetection();
            }
        });
        $('input').on('ifUnchecked', function (event) {
            let object = $(event.target);
            let index = parseInt(object.val());
            if (0 == index) {
                $("#titleName").remove();
            } else if (1 == index) {
                $("#titleTime").remove();
            } else if (2 == index) {
                $('.minBlock').remove();
            }
        });
    },
    initVideo: function () {
        let canvas = document.getElementById('myCanvas1');
        this.appCache.create(canvas);
        let url = 'ws://' + g_oCommon.m_szHostName + ':8082/';
        let options = {
            u: url,
            c: 0,
            s: 1,
            p: null,
            d: null
        }
        this.appCache.appControllerArr[0].start(options);
    },
    ptzUp: function () {
        let that = this;
        if ($("#ddlChoice").val() === "0") {
            that.timeUp = setInterval(function () {
                let top = $("#titleName").css('top');
                let topInt = parseInt(top) - 2;
                $("#titleName").css({'top': topInt});
            }, 100);
        } else {
            that.timeUp = setInterval(function () {
                let top = $("#titleTime").css('top');
                let topInt = parseInt(top) - 2;
                $("#titleTime").css({'top': topInt});
            }, 100);
        }
    },
    ptzUpEnd: function () {
        let that = this;
        clearInterval(that.timeUp);
    },
    ptzLeft: function () {
        let that = this;
        if ($("#ddlChoice").val() === "0") {
            that.timeLeft = setInterval(function () {
                let left = $("#titleName").css('left');
                let leftInt = parseInt(left) - 2;
                $("#titleName").css({'left': leftInt});
            }, 100);
        } else {
            that.timeLeft = setInterval(function () {
                let left = $("#titleTime").css('left');
                let leftInt = parseInt(left) - 2;
                $("#titleTime").css({'left': leftInt});
            }, 100);
        }
    },
    ptzLeftEnd: function () {
        let that = this;
        clearInterval(that.timeLeft);
    },
    ptzRight: function () {
        let that = this;
        if ($("#ddlChoice").val() === "0") {
            that.timeRight = setInterval(function () {
                let left = $("#titleName").css('left');
                let leftInt = parseInt(left) + 2;
                $("#titleName").css({'left': leftInt});
            }, 100);
        } else {
            that.timeRight = setInterval(function () {
                let left = $("#titleTime").css('left');
                let leftInt = parseInt(left) + 2;
                $("#titleTime").css({'left': leftInt});
            }, 100);
        }
    },
    ptzRightEnd: function () {
        let that = this;
        clearInterval(that.timeRight);
    },
    ptzDown: function () {
        let that = this;
        that.timeDown = setInterval(function () {
            let top = $("#title").css('top');
            let topInt = parseInt(top) + 2;
            $("#title").css({'top': topInt});
        }, 100);

        if ($("#ddlChoice").val() === "0") {
            that.timeDown = setInterval(function () {
                let top = $("#titleName").css('top');
                let topInt = parseInt(top) + 2;
                $("#titleName").css({'top': topInt});
            }, 100);
        } else {
            that.timeDown = setInterval(function () {
                let top = $("#titleTime").css('top');
                let topInt = parseInt(top) + 2;
                $("#titleTime").css({'top': topInt});
            }, 100);
        }
    },
    ptzDownEnd: function () {
        let that = this;
        clearInterval(that.timeDown);
    },
    drawStart: function (e) {
        let that = this;
        //是否为左键点击
        if (e.which != 1)
            return false;
        //获取鼠标位置
        that.startX = e.pageX;
        that.startY = e.pageY;

        //鼠标点击时 在鼠标位置创建个div元素 然后设置其位置为鼠标当前位置
        // 在页面创建 box
        let active_box = document.createElement("div");
        active_box.id = "active_box";
        active_box.className = "drag-box";
        active_box.style.top = that.startY + 'px';
        active_box.style.left = that.startX + 'px';
        document.body.appendChild(active_box);
        //设置为开启拖拽
        that.dragging = true
    },
    drawMove: function (e) {
        let that = this;
        let ab = document.getElementById("active_box");
        if (["", undefined, null].includes(ab) || !that.dragging)
            return false;
        //往左上方拖动时
        if (e.pageX < that.startX && e.pageY < that.startY) {
            ab.style.top = e.pageY + 'px'
            ab.style.left = e.pageX + 'px'
            ab.style.width = that.startX - e.pageX + 'px';
            ab.style.height = that.startY - e.pageY + 'px';
        }
        //左下方拖动时
        if (e.pageX < that.startX && e.pageY > that.startY) {
            ab.style.top = that.startY + 'px';
            ab.style.left = e.pageX + 'px';
            ab.style.width = that.startX - e.pageX + 'px';
            ab.style.height = e.pageY - that.startY + 'px';
        }
        //右上方拖动时
        if (e.pageX > that.startX && e.pageY < that.startY) {
            ab.style.top = e.pageY + 'px';
            ab.style.left = that.startX + 'px';
            ab.style.width = e.pageX - that.startX + 'px';
            ab.style.height = that.startY - e.pageY + 'px';
        }
        //右下方拖动时
        if (e.pageX > that.startX && e.pageY > that.startY) {
            ab.style.top = that.startY + 'px';
            ab.style.left = that.startX + 'px';
            ab.style.width = e.pageX - that.startX + 'px';
            ab.style.height = e.pageY - that.startY + 'px';
        }
    },
    drawEnd: function (e) {
        let that = this;
        if (!that.dragging)
            return;
        //下面这个是遍历要想要被选取区域 选取的对象
        $('.minBlock').each(function (i, ctrl) {
            //判断是否被选取中 也就是判断两个元素是否相重叠
            if (that.isOverlap($('#active_box'), $(ctrl))) {
                if (!$(this).hasClass('select'))
                    $(this).addClass('select');
            }
        });
        //清除生成的选取区域div
        $('body').children('#active_box').remove();
        that.dragging = false;
    },
    drawClick: function (e) {
        if ($(e.target).hasClass('select'))
            $(e.target).removeClass('select');
        else
            $(e.target).addClass('select');
    },
    isOverlap: function (obj1, obj2) {
        let x1 = obj1.offset().left;
        let y1 = obj1.offset().top;
        let x2 = x1 + obj1.width();
        let y2 = y1 + obj1.height();
        let x3 = obj2.offset().left;
        let y3 = obj2.offset().top;
        let x4 = x3 + obj2.width();
        let y4 = y3 + obj2.height();
        return x3 < x2 && x4 > x1 && y1 < y4 && y2 > y3
    },
    clearDetection: function () {
        $(".minBlock").each(function () {
            $(this).removeClass('select');
        });
    },
    drawDetection: function () {
        let that = this;
        $("#title").remove();

        let top = $("#myCanvas1").offset().top;
        let left = $("#myCanvas1").offset().left;

        let minWidth = $("#myCanvas1").width() / 16;
        let minHeight = $("#myCanvas1").height() / 12;
        let divBlock = $("<div></div>");
        divBlock.css({
            'width': minWidth,
            'height': minHeight,
            'position': 'absolute',
            'float': 'left',
            'border': '1px solid red'
        });
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 16; j++) {
                let divTemp = divBlock.clone();
                divTemp.addClass('minBlock');
                divTemp.attr('id', j + "-" + i);
                let minLeft = left + minWidth * j;
                let minTop = top + minHeight * i;
                divTemp.css({
                    'left': minLeft,
                    'top': minTop
                });
                divTemp.bind('mousedown', function (e) {
                    that.drawStart(e);
                });
                divTemp.bind('mousemove', function (e) {
                    that.drawMove(e);
                });
                divTemp.bind('mouseup', function (e) {
                    that.drawEnd(e);
                });
                divTemp.bind('click', function (e) {
                    that.drawClick(e);
                });
                $("body").append(divTemp);
            }
        }
    },
    getOsd: function () {
        let json = {}
        json.Cmd = 7039;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_OSD";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    $("#disPlayName").val(result.Title);
                    if (result.TitleEnable) {
                        $("#titleName").css({
                            'left': (result.TitleX * $('myCanvas1').width()),
                            'top': (result.TitleY * $('myCanvas1').height()),
                        });
                    }
                    if (result.TimeEnable) {
                        $("#titleName").css({
                            'left': (result.TimeX * $('myCanvas1').width()),
                            'top': (result.TimeY * $('myCanvas1').height()),
                        });
                    }
                    $("#ddlTimeColor").val(result.TimeColor);
                }
            }
        })
    },
    setOsd: function () {
        let json = {}
        json.Cmd = 7040;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_OSD";

        let left = $("#myCanvas1").offset().left;
        let top = $("#myCanvas1").offset().top;
        let titleLeft = $("#titleName").offset().left;
        let titleTop = $("#titleName").offset().top;
        let timeLeft = $("#titleTime").offset().left;
        let timeTop = $("#titleTime").offset().top;

        if ($("#disPlayName").is(':checked')) {
            json.TitleEnable = true;
            json.Title = $("#disPlayName").val();
            json.TitleX = parseInt((titleLeft - left) / $("#myCanvas1").width() * 100);
            json.TitleY = parseInt((titleTop - top) / $("#myCanvas1").height() * 100);
        }
        if ($("#disPlayTime").is(':checked')) {
            json.TimeEnable = true;
            json.TimeX = parseInt((timeLeft - left) / $("#myCanvas1").width() * 100);
            json.TimeY = parseInt((timeTop - top) / $("#myCanvas1").height() * 100);
        }
        json.TimeColor = $("#ddlTimeColor").val();
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            dataType: "json",
            processData: !1,
            data: jsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", 0);
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('Success1'),
                        timeout: 1000
                    });
                }
            },
            complete: function (t) {
            }
        })
    },
    getDetection: function () {
        let that = this;
        let json = {}
        json.Cmd = 7043;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_MOTION_PARA";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    let slider = $("#sensitivity").data("ionRangeSlider");
                    slider.update({
                        from: result.S
                    });
                    $("#ddlIndication").val(result.T);
                    $("#ddlProcessMode").val(result.M);
                    $("#Detectioninterval").val(result.I);
                    $(".minBlock").removeClass('select');
                    result.L.forEach((item, index, array) => {
                        let bitValue = _checkIput_fomartIP(item);
                        for (let i = 0; i < bitValue.length; i++) {
                            $(i + "-" + index).addClass('select');
                        }
                    });
                    that.L = result.L;
                }
            }
        })
    },
    setDetection: function () {
        let that = this;
        let json = {}
        json.Cmd = 7044;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_MOTION_PARA";
        //移动侦测
        json.E = $('#laDetection').is(':checked') ? true : false;
        //灵敏度
        json.T = $("#sensitivity").ionRangeSlider()[0].value;
        //使能指示
        json.S = $('#ddlIndication').val();
        //处理方式
        json.M = $('#ddlProcessMode').val();
        //检测间隔(秒)
        json.I = $('#Detectioninterval').val();
        //日期
        json.L = that.L;

        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "GET",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('Success1'),
                        timeout: 1000
                    });
                }
            }
        })
    },
    getColor: function () {
        let that = this;
        let json = {}
        json.Cmd = 7045;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_TIMER_COLOR";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    $("#ddlTimeSlot").val(that.ChangeHourMinutestr(result.TimeSel));
                    $("#StartTime").val(that.ChangeHourMinutestr(result.startTime));
                    $("#EndTime").val(result.endTime);
                    if (result.Valid) {
                        $("#ddlEnable").val("1");
                        $("#ddlEnable option[value='1']").attr("selected", true);
                    } else {
                        $("#ddlEnable").val("0");
                        $("#ddlEnable option[value='0']").attr("selected", true);
                    }
                    $("#ddlChannel").val(result.ChnSel);

                    $("#brightness").data("ionRangeSlider").update({
                        from: result.Brightness
                    });
                    $("#contrastRatio").data("ionRangeSlider").update({
                        from: result.Contrast
                    });
                    //饱和度
                    $("#saturation").data("ionRangeSlider").update({
                        from: result.Saturation
                    });
                    //色度
                    $("#chroma").data("ionRangeSlider").update({
                        from: result.Hue
                    });
                    //锐度
                    $("#acuity").data("ionRangeSlider").update({
                        from: result.Sharp
                    });
                    //增益
                    $("#gain").data("ionRangeSlider").update({
                        from: result.Gain
                    });
                }
            }
        })
    },
    setColor: function () {
        let that = this;
        let json = {}
        json.Cmd = 7046;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_TIMER_COLOR";

        json.TimeSel = $("#ddlTimeSlot").val();
        json.Valid = false;
        if ($("#ddlEnable").val() == "1")
            json.Valid = true;
        json.ChnSel = $("#ddlChannel").val();
        json.StartTime = this.ChangeStrToMinutes($("#startTime").val());
        json.EndTime = this.ChangeStrToMinutes($("#endTime").val());
        //亮度
        json.Brightness = $("#brightness").ionRangeSlider()[0].value;
        //对比度
        json.Contrast = $("#contrastRatio").ionRangeSlider()[0].value;
        //饱和度
        json.Saturation = $("#saturation").ionRangeSlider()[0].value;
        //色度
        json.Hue = $("#chroma").ionRangeSlider()[0].value;
        //锐度
        json.Sharp = $("#acuity").ionRangeSlider()[0].value;
        //增益
        json.Gain = $("#gain").ionRangeSlider()[0].value;

        let jsonReqStr = JSON.stringify(json);

        $.ajax({
            type: "GET",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (result) {
                if (0 == result.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('Success1'),
                        timeout: 1000
                    });
                }
            }
        })
    },
    resetColor: function () {
        let that = this;
        for (let i = 0; i < that.colorParams.length; i++)
            that.colorParams[i] = {};
        AMUI.dialog.tip({
            tip: g_oCommon.getNodeValue('btnRest'),
            timeout: 1000
        });
    },
    saveTime: function () {
        let that = this;
        let week = parseInt($("#ddlWeek").val());
        that.L[week].R.length = 0;
        that.L[week].N.length = 0;
        let bitEnable = null;
        $(".weekTimeGroup").each(function (index) {
            let s = that.ChangeStrToMinutes($("#startWeekTime" + index).val());
            let e = that.ChangeStrToMinutes($("#endWeekTime" + index).val());
            that.L[week].R.push(s);
            that.L[week].N.push(e);
            bitEnable = bitEnable == null ? $("#ddlEnable" + index).val() : (bitEnable + $("#ddlEnable" + index).val());
            that.L[week].V = parseInt(bitEnable, 2);
        });
        AMUI.dialog.tip({
            tip: g_oCommon.getNodeValue('Success1'),
            timeout: 1000
        });
    },
    changeWeek: function (e) {
        let that = this;
        let index = parseInt($(e).val());
        for (let i = 0; i < 4; i++) {
            $("#startWeekTime" + i).val("00:00");
            $("#endWeekTime" + i).val("00:00");
            $("#ddlEnable" + i).val(1);
            $("#ddlEnable" + i + " option[value='1']").attr("selected", true);
        }
        for (let i = 0; i < that.L[index].R.length; i++) {
            $("#startWeekTime" + i).val(that.ChangeHourMinutestr(that.L[index].R[i]))
            $("#endWeekTime" + i).val(that.ChangeHourMinutestr(that.L[index].N[i]));
            let bitEnable = that.L[index].V.toString(2).padStart(4, "0");
            $("#ddlEnable" + i).val(bitEnable.substr(i, 1));
            $("#ddlEnable" + i + " option[value='" + bitEnable.substr(i, 1) + "']").attr("selected", true);
        }
    },
    changeTimeSlot: function () {
        let that = this;
        let index = parseInt($("#ddlTimeSlot").val());
        let currItem = that.colorParams[that.colorIndex];
        //切换时保存当前页面值
        currItem.ChnSel = $("#ddlChannel").val();
        currItem.Valid = $("#ddlEnable").val();

        currItem.StartTime = this.ChangeStrToMinutes($("#startTime").val());
        currItem.EndTime = this.ChangeStrToMinutes($("#endTime").val());
        //亮度
        currItem.Brightness = $("#brightness").ionRangeSlider()[0].value;
        //对比度
        currItem.Contrast = $("#contrastRatio").ionRangeSlider()[0].value;
        //饱和度
        currItem.Saturation = $("#saturation").ionRangeSlider()[0].value;
        //色度
        currItem.Hue = $("#chroma").ionRangeSlider()[0].value;
        //锐度
        currItem.Sharp = $("#acuity").ionRangeSlider()[0].value;
        //增益
        currItem.Gain = $("#gain").ionRangeSlider()[0].value;

        //取当前索引对象，赋值给页面
        let item = that.colorParams[index];
        let valid = ["", undefined, null].includes(item.Valid) ? "0" : item.Valid;
        let chnSel = ["", undefined, null].includes(item.ChnSel) ? "0" : item.ChnSel;

        $("#ddlEnable").val(valid);
        $("#ddlChannel").val(chnSel);

        $("#ddlEnable option[value='" + valid + "']").attr("selected", true);
        $("#ddlChannel option[value='" + chnSel + "']").attr("selected", true);

        if (["", undefined, null].includes(item.StartTime))
            $("#startTime").val("00:00");
        else
            $("#startTime").val(that.ChangeHourMinutestr(item.StartTime));

        if (["", undefined, null].includes(item.EndTime))
            $("#endTime").val("00:00");
        else
            $("#endTime").val(that.ChangeHourMinutestr(item.EndTime));

        //亮度
        $("#brightness").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Brightness) ? 0 : item.Brightness
        });
        //对比度
        $("#contrastRatio").ionRangeSlider()[0].value;
        $("#contrastRatio").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Contrast) ? 0 : item.Contrast
        });
        //饱和度
        $("#saturation").ionRangeSlider()[0].value;
        $("#saturation").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Saturation) ? 0 : item.Saturation
        });
        //色度
        $("#chroma").ionRangeSlider()[0].value;
        $("#chroma").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Hue) ? 0 : item.Hue
        });
        //锐度
        $("#acuity").ionRangeSlider()[0].value;
        $("#acuity").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Sharp) ? 0 : item.Sharp
        });
        //增益
        $("#gain").ionRangeSlider()[0].value;
        $("#gain").data("ionRangeSlider").update({
            from: ["", undefined, null].includes(item.Gain) ? 0 : item.Gain
        });
        that.colorIndex = index;
    },
    ChangeStrToMinutes: function (str) {
        var arrminutes = str.split(":");
        if (arrminutes.length == 2) {
            var minutes = parseInt(arrminutes[0]) * 60 + parseInt(arrminutes[1]);
            return minutes;
        } else {
            return 0;
        }
    },
    ChangeHourMinutestr: function (str) {
        if (str !== "0" && str !== "" && str !== null) {
            return ((Math.floor(str / 60)).toString().length < 2 ? "0" + (Math.floor(str / 60)).toString() :
                (Math.floor(str / 60)).toString()) + ":" + ((str % 60).toString().length < 2 ? "0" + (str % 60).toString() : (str % 60).toString());
        } else {
            return "";
        }
    }
}
let g_frameSetting = new frameSetting();