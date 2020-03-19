class scene {
    constructor() {
        this.areaList = [];
        this.deviceList = [];
        this.state = ["laSystemWithdrawal", "laSystemStayBehind", "laOutgoingDefense"];
        this.panelIndex = 0;
        this.tempData = [{
            "Cmd": 1310,
            "Id": "123123123",
            "User": 12345678,
            "Def": "JSON_SCENE_ITEM_LIST_TIMER",
            "Ack": 0,
            "B": 0,
            "K": 0,
            "N": "名称",
            "L": [{
                "M": 0,
                "T": "15:00",
                "W": "0001000",
                "D": 1,
                "L": [
                    {
                        "A": 1
                    }
                ]
            }]
        }, {
            "Cmd": 1311,
            "Id": "123123123",
            "User": 12345678,
            "Def": "JSON_SCENE_ITEM_LIST_TRIGGER",
            "Ack": 0,
            "B": 0,
            "K": 1,
            "N": "名称",
            "L": [
                {
                    "M": 0,
                    "Y": 6,
                    "D": 1,
                    "I": "",
                    "O": ""
                }
            ]
        }, {
            "Cmd": 1312,
            "Id": "123123123",
            "User": 12345678,
            "Def": "JSON_SCENE_ITEM_LIST_MANUAL",
            "B": 0,
            "K": 2,
            "N": "名称",
            "L": [
                {
                    "M": 0,
                    "Y": 0,
                    "D": 1,
                    "W": "0101000",
                    "T": "16:00",
                    "L": [
                        {
                            "A": 1
                        }
                    ]
                },
                {
                    "M": 1,
                    "Y": 0,
                    "W": "0101000",
                    "D": 1,
                    "I": ""
                }
            ]
        }]
    }

    //主页面初始化函数
    initPage() {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdArea = translator.getLanguageXmlDoc("Scene");
        translator.translatePage(this._lxdArea, document);
        this.initlayDate();
        this.getArea();
        this.getScene();
        // this.getList();
        this.getDevice();
        g_oArea.syncMsg();
        setInterval("g_oArea.syncMsg()", 2000);
    }

    initlayDate() {
        laydate.render({
            elem: '#switchTime',
            type: 'time',
            format: 'HH:mm'
        });
        laydate.render({
            elem: '#mainetanceTime',
            type: 'time',
            format: 'HH:mm'
        });
    }

    getArea() {
        let json = {}
        json.Cmd = 1101;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_AREA_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    g_oScene.areaList = data.L;
                }
            },
            timeOut: function (data) {
                alert("请求数据超时");
            }
        })
    }

    getDevice() {
        let json = {}
        json.Cmd = 1201;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_DEV_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    g_oScene.deviceList = data.L;
                }
            },
            timeOut: function (data) {
                alert("请求数据超时");
            }
        })
    }

    getScene() {
        let that = this;
        let json = {}
        json.Cmd = 1301;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_SCENE_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    data.L = [{
                        "N": "laTimer",
                        "B": 0,
                        "K": 0,
                        "E": false
                    }];
                    data.L.forEach((item, index, array) => {
                        let div = $(" <li onclick='getList(" + data.K + ")'><a><span>" + g_oCommon.getNodeValue(item.N) + "</span></a></li>");
                        $("#ZoneScene").append(div);
                    });
                    $("#ZoneScene").children(0).addClass("am-active");
                    this.getList(data.L[0].K);
                }
            },
            error: function (xhr, textStatus, errorThrown) {

                let data = [{
                    "N": "laTimer",
                    "B": 0,
                    "K": 0,
                    "E": false
                }, {
                    "N": "laTrigger",
                    "B": 0,
                    "K": 1,
                    "E": false
                }, {
                    "N": "laManual",
                    "B": 0,
                    "K": 2,
                    "E": false
                }];
                data.forEach((item, index, array) => {
                    let div = $("<li onclick='g_oScene.getList(" + item.K + ",this)'><a href=\"javascript: void(0)\">" + g_oCommon.getNodeValue(item.N) + "</a></li>")
                    $("#ZoneScene").append(div);
                });
                $("#ZoneScene").children().eq(0).addClass("am-active");
                g_oScene.getList(data[0].K);
            }
        });
    }

    getOutHtml(type, context) {
        let htmlContext = "";
        if (0 == type || 2 == type) {
            htmlContext += "<table class=\"am-table am-table-bordered am-table-striped am-table-hover table-main\">";
            htmlContext += "<thead>";
            htmlContext += "<tr>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laIndex") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laArea") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laExecTime") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laRepeat") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laOpt") + "</th>";
            htmlContext += "</tr>";
            htmlContext += "</thead>";
            htmlContext += "<tbody>";
            htmlContext += context;
            htmlContext += "</tbody>";
            htmlContext += "</table>";
        } else if (1 == type) {
            htmlContext += "<table class=\"am-table am-table-bordered am-table-striped am-table-hover table-main\">";
            htmlContext += "<thead>";
            htmlContext += "<tr>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laIndex") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laDelay") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laSmart") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laSubSmart") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laSwitch") + "</th>";
            htmlContext += "<th>" + g_oCommon.getNodeValue("laOpt") + "</th>";
            htmlContext += "</tr>";
            htmlContext += "</thead>";
            htmlContext += "<tbody>";
            htmlContext += context;
            htmlContext += "</tbody>";
            htmlContext += "</table>";
        } else if (3 == type) {

        }

        return htmlContext;
    }

    getList(K, event) {
        this.panelIndex = K;
        $(event).siblings().each(function () {
            $(this).removeClass("am-active");
        });
        $(event).addClass("am-active");
        if (0 == K || 2 == K) {
            $("#btnAddMonitor").show();
            $("#btnAddTrigger").hide();
            $("#btnAddSwitch").show();
        } else {
            $("#btnAddMonitor").hide();
            $("#btnAddTrigger").show();
            $("#btnAddSwitch").hide();
        }

        let htmlContext = "";
        let data = g_oScene.tempData[K];
        data.L.forEach((item, index, array) => {
            htmlContext = "";
            if (0 == data.K || 2 == data.K) {
                let areaNames = [];
                item.L.forEach((temp, index, array) => {
                    let objectArea = g_oScene.areaList.find(x => x.A = temp.A);
                    if (null != objectArea)
                        areaNames.push(objectArea.N);
                });
                let week = [];
                let laMonday = item.W.substr(0, 1);
                let laTuesday = item.W.substr(1, 1);
                let laWednesday = item.W.substr(2, 1);
                let laThursday = item.W.substr(3, 1);
                let laFriday = item.W.substr(4, 1);
                let laSaturday = item.W.substr(5, 1);
                let laSunday = item.W.substr(6, 1);

                if (laMonday == 1)
                    week.push(g_oCommon.getNodeValue("laMonday"));
                if (laTuesday == 1)
                    week.push(g_oCommon.getNodeValue("laTuesday"));
                if (laWednesday == 1)
                    week.push(g_oCommon.getNodeValue("laWednesday"));
                if (laThursday == 1)
                    week.push(g_oCommon.getNodeValue("laThursday"));
                if (laFriday == 1)
                    week.push(g_oCommon.getNodeValue("laFriday"));
                if (laSaturday == 1)
                    week.push(g_oCommon.getNodeValue("laSaturday"));
                if (laSunday == 1)
                    week.push(g_oCommon.getNodeValue("laSunday"));

                htmlContext += "<tr>\n" +
                    "<td>" + index + 1 + "</td>\n" +
                    "<td><a href=\"#\">" + areaNames + "</a></td>\n" +
                    "<td>" + item.T + "</td>\n" +
                    "<td>" + week + "</td>\n" +
                    "<td>\n" +
                    "    <div class=\"am-btn-toolbar\">\n" +
                    "        <div class=\"am-btn-group\">\n" +
                    "            <button class=\"am-btn am-btn-default am-btn-sm am-text-secondary am-round\"\n" +
                    "                    onclick=\"g_oScene.editTimer()\"><span\n" +
                    "                    class=\"am-icon-pencil-square-o\"></span> " + g_oCommon.getNodeValue("laEdit") + "\n" +
                    "            </button>\n" +
                    "            <button class=\"am-btn am-btn-default am-btn-sm am-text-danger am-round\"\n" +
                    "                    onclick=\"g_oScene.delTimer()\"><span\n" +
                    "                    class=\"am-icon-trash-o\"></span> " + g_oCommon.getNodeValue("laDel") + "\n" +
                    "            </button>\n" +
                    "        </div>\n" +
                    "    </div>\n" +
                    "</td>\n" +
                    "</tr>"
            } else if (1 == data.K) {
                let devObject = g_oScene.deviceList.find(x => x.I == item.O);
                let devSubObject = g_oScene.deviceList.find(x => x.I == item.O);
                let channels = parseInt(item.D, 2).toString(10);
                let channelArray = [];
                for (let i = 0; i < channels.length; i++) {
                    if ("1" == channels.substr(i, 1))
                        channelArray.push(g_oCommon.getNodeValue("laSwitch") + (i + 1));
                }

                htmlContext += "<tr>\n" +
                    "<td>" + index + 1 + "</td>\n" +
                    "<td>" + item.Y + "</td>\n" +
                    "<td>" + ([null, undefined].includes(devObject) ? "" : devObject.N) + "</td>\n" +
                    "<td>" + ([null, undefined].includes(devSubObject) ? "" : devSubObject.N) + "</td>\n" +
                    "    <td>" + channelArray + "</td>\n" +
                    "    <td>\n" +
                    "        <div class=\"am-btn-toolbar\">\n" +
                    "            <div class=\"am-btn-group\">\n" +
                    "                <button class=\"am-btn am-btn-default am-btn-sm am-text-secondary am-round\"\n" +
                    "                        onclick=\"g_oScene.editTimer()\"><span\n" +
                    "                        class=\"am-icon-pencil-square-o\"></span> 编辑\n" +
                    "                </button>\n" +
                    "                <button class=\"am-btn am-btn-default am-btn-sm am-text-danger am-round\"\n" +
                    "                        onclick=\"g_oScene.delTimer()\"><span\n" +
                    "                        class=\"am-icon-trash-o\"></span> 删除\n" +
                    "                </button>\n" +
                    "            </div>\n" +
                    "        </div>\n" +
                    "    </td>\n" +
                    "</tr>"
            } else if (2 == data.K) {
            }
            $("#Context").empty();
            $("#Context").append(g_oScene.getOutHtml(data.K, htmlContext));
        });

        // let that = this;
        // let json = {};
        // //0-定时场景,1-触发器场景,2-手工场景
        // json.Cmd = 0 == K ? 1310 : (1 == K ? 1311 : 1312);
        // json.Id = "123123123";
        // json.User = 12345678;
        // json.Def = 0 == K ? "JSON_SCENE_ITEM_LIST_TIMER" : (1 == K ? "JSON_SCENE_ITEM_LIST_TRIGGER" : "JSON_SCENE_ITEM_LIST_MANUAL");
        // json.B = 0
        // let jsonReqStr = JSON.stringify(json);
        // $.ajax({
        //     type: "get",
        //     url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
        //     dataType: "json",
        //     async: !0,
        //     timeout: 15e3,
        //     beforeSend: function (xhr) {
        //     },
        //     success: function (data) {
        //         if (0 == data.Ack) {
        //             g_oScene.tempData.L.forEach((item, index, array) => {
        //                 if (0 == data.K) {
        //                     let areaNames = [];
        //                     item.L.forEach((temp, index, array) => {
        //                         let objectArea = g_oScene.areaList.find(x => x.A = temp.A);
        //                         if (null != objectArea)
        //                             areaNames.push(objectArea.N);
        //                     });
        //                     let week = [];
        //                     let laMonday = item.W.substr(0, 1);
        //                     let laTuesday = item.W.substr(1, 1);
        //                     let laWednesday = item.W.substr(2, 1);
        //                     let laThursday = item.W.substr(3, 1);
        //                     let laFriday = item.W.substr(4, 1);
        //                     let laSaturday = item.W.substr(5, 1);
        //                     let laSunday = item.W.substr(6, 1);
        //
        //                     if (laMonday == 1)
        //                         week.push(g_oCommon.getNodeValue("laMonday"));
        //                     if (laTuesday == 1)
        //                         week.push(g_oCommon.getNodeValue("laTuesday"));
        //                     if (laWednesday == 1)
        //                         week.push(g_oCommon.getNodeValue("laWednesday"));
        //                     if (laThursday == 1)
        //                         week.push(g_oCommon.getNodeValue("laThursday"));
        //                     if (laFriday == 1)
        //                         week.push(g_oCommon.getNodeValue("laFriday"));
        //                     if (laSaturday == 1)
        //                         week.push(g_oCommon.getNodeValue("laSaturday"));
        //                     if (laSunday == 1)
        //                         week.push(g_oCommon.getNodeValue("laSunday"));
        //
        //                     let htmlContext = "<tr>\n" +
        //                         "    <td>1</td>\n" +
        //                         "    <td><a href=\"#\">switch 0</a></td>\n" +
        //                         "    <td></td>\n" +
        //                         "    <td></td>\n" +
        //                         "    <td>\n" +
        //                         "        <div class=\"am-btn-toolbar\">\n" +
        //                         "            <div class=\"am-btn-group\">\n" +
        //                         "                <button class=\"am-btn am-btn-default am-btn-sm am-text-secondary am-round\"\n" +
        //                         "                        onclick=\"g_oScene.editTimer()\"><span\n" +
        //                         "                        class=\"am-icon-pencil-square-o\"></span> 编辑\n" +
        //                         "                </button>\n" +
        //                         "                <button class=\"am-btn am-btn-default am-btn-sm am-text-danger am-round\"\n" +
        //                         "                        onclick=\"g_oScene.delTimer()\"><span\n" +
        //                         "                        class=\"am-icon-trash-o\"></span> 删除\n" +
        //                         "                </button>\n" +
        //                         "            </div>\n" +
        //                         "        </div>\n" +
        //                         "    </td>\n" +
        //                         "</tr>"
        //                     g_oScene.getOutHtml(0, htmlContext);
        //                 } else if (1 == data.K) {
        //
        //                 } else if (2 == data.K) {
        //                 }
        //             });
        //
        //             $("#Context").append(htmlContext);
        //         }
        //     },
        //     error: function (xhr, textStatus, errorThrown) {
        //     }
        // });
    }

    initText(index) {
        //0-定时器，1-触发器，2-手动器
        if (0 == this.panelIndex) {
            $("#group1").show();
            $("#group2").hide();
            $("#group3").show();
            $("#group4").show();
        } else {
            $("#group1").hide();
            $("#group2").show();
            $("#group3").show();
            $("#group4").hide();
        }
        this.initArea();
        this.changeState();
        if (![null, undefined].includes(index)) {
            let editData = this.tempData[index];

            $("#mainetanceTime").val(editData.T);
            $("#stateSel").val(editData.D);

            let areas = [];
            editData.L.forEach((item, index, array) => {
                areas.push(item.A);
            });
            $("#AreaSel").val(areas);
            let laMonday = editData.W.substr(0, 1);
            let laTuesday = editData.W.substr(1, 1);
            let laWednesday = editData.W.substr(2, 1);
            let laThursday = editData.W.substr(3, 1);
            let laFriday = editData.W.substr(4, 1);
            let laSaturday = editData.W.substr(5, 1);
            let laSunday = editData.W.substr(6, 1);

            if (laMonday == 1)
                $("#chSunday").attr("checked", true);
            if (laTuesday == 1)
                $("#chTuesday").attr("checked", true);
            if (laWednesday == 1)
                $("#chWednesday").attr("checked", true);
            if (laThursday == 1)
                $("#chThursday").attr("checked", true);
            if (laFriday == 1)
                $("#chFriday").attr("checked", true);
            if (laSaturday == 1)
                $("#chSaturday").attr("checked", true);
            if (laSunday == 1)
                $("#chSunday").attr("checked", true);
        }
    }

    initSwitchText(index) {
        if (0 == this.panelIndex) {
            $("#switchGroup1").show();
            $("#switchGroup2").hide();
            $("#switchGroup3").show();
            $("#switchGroup4").show();
            $("#switchGroup5").show();
        } else {
            $("#switchGroup1").hide();
            $("#switchGroup2").show();
            $("#switchGroup3").hide();
            $("#switchGroup4").show();
            $("#switchGroup5").show();
        }
        this.initSwitchDevice();
        if (![null, undefined].includes(index)) {
            let editData = this.tempData[index];
            //场景类型[0-定时，1-触发器,2-手动器]
            editData.K = 0;
            //场景类型[0为区域定时布撤防，1为子设备定时操作]
            editData.M = 0;
            editData.O = $("#laSmart").val();

            let laMonday = editData.W.substr(0, 1);
            let laTuesday = editData.W.substr(1, 1);
            let laWednesday = editData.W.substr(2, 1);
            let laThursday = editData.W.substr(3, 1);
            let laFriday = editData.W.substr(4, 1);
            let laSaturday = editData.W.substr(5, 1);
            let laSunday = editData.W.substr(6, 1);

            if (laMonday == 1)
                $("#saveSwitchInfo .chSunday").attr("checked", true);
            if (laTuesday == 1)
                $("#saveSwitchInfo .chTuesday").attr("checked", true);
            if (laWednesday == 1)
                $("#saveSwitchInfo .chWednesday").attr("checked", true);
            if (laThursday == 1)
                $("#saveSwitchInfo .chThursday").attr("checked", true);
            if (laFriday == 1)
                $("#saveSwitchInfo .chFriday").attr("checked", true);
            if (laSaturday == 1)
                $("#saveSwitchInfo .chSaturday").attr("checked", true);
            if (laSunday == 1)
                $("#saveSwitchInfo .chSunday").attr("checked", true);
            editData.D = 4;
            let channels = parseInt(editData.D).toString(2);
            channels = this.pad(channels, editData.v);
            for (let i = i; i < channels.length; i++) {
                if ("1" == channels.substr(i, 1))
                    $("#timerSwitch" + i).attr("checked", true);
            }
        }
    }

    pad(num, n) {
        var len = num.toString().length;
        while (len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }

    editTimer(index) {
        this.initText(index);
        $('#saveTimerInfo').modal({
            relatedTarget: this,
            width: 720,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                g_oScene.saveTimer(index);
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    editTrigger(index) {
        this.initSwitchText(index);
        $('#saveTriggerInfo').modal({
            relatedTarget: this,
            width: 720,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                g_oScene.saveTriggerSwitch(index);
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    editSwitch(index) {
        this.initSwitchText(index);
        $('#saveSwitchInfo').modal({
            relatedTarget: this,
            width: 720,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                g_oScene.saveTimerSwitch(index);
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    saveTimer(index) {
        let JsonData = [null, undefined].includes(index) ? {} : this.tempData[index];
        JsonData.Cmd = 1320;
        JsonData.Id = 123123123;
        JsonData.User = 12345678;
        JsonData.Def = "JSON_SCENE_ITEM_ADD_TIMER";
        if ([null, undefined].includes(index))
            JsonData.B = 0;
        //场景类型[0-定时，1-触发器,2-手动器]
        JsonData.K = 0;
        //名称
        JsonData.N = $("#timerName").val();
        JsonData.L = [];

        let subItem = {};
        //场景类型[0为区域定时布撤防，1为子设备定时操作]
        subItem.M = 0;
        subItem.T = $("#mainetanceTime").val();
        subItem.D = $("#stateSel").val();
        let areas = [];
        let areaSelected = $("#AreaSel").val();
        if (!["", undefined, null].includes(areaSelected)) {
            $("#AreaSel").val().forEach((item, index, array) => {
                let area = {};
                area.A = item;
                areas.push(area);
            });
        }
        subItem.L = areas;
        let Week = [];
        if ($("#chSunday").prop("checked")) Week[0] = 1;
        else Week[0] = 0;
        if ($("#chMonday").prop("checked")) Week[1] = 1;
        else Week[1] = 0;
        if ($("#chTuesday").prop("checked")) Week[2] = 1;
        else Week[2] = 0;
        if ($("#chWednesday").prop("checked")) Week[3] = 1;
        else Week[3] = 0;
        if ($("#chThursday").prop("checked")) Week[4] = 1;
        else Week[4] = 0;
        if ($("#chFriday").prop("checked")) Week[5] = 1;
        else Week[5] = 0;
        if ($("#chSaturday").prop("checked")) Week[6] = 1;
        else Week[6] = 0;
        subItem.W = Week.toString().replaceAll(',', '');
        JsonData.L.push(subItem);
        let jsonStr = JSON.stringify(JsonData);
        $.ajax({
            type: "GET",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonStr) + "&",
            dataType: "json",
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: index ? g_oCommon.getNodeValue('EditOk') : g_oCommon.getNodeValue('AddOk'),
                        timeout: 1000
                    });
                } else {
                    AMUI.dialog.tip({
                        tip: index ? g_oCommon.getNodeValue('EditFailed') : g_oCommon.getNodeValue('AddFailed'),
                        timeout: 1000
                    });
                }
            },
            complete: function (t) {
            }
        });
    }

    saveTriggerSwitch(index) {
        let editData = [null, undefined].includes(index) ? {} : this.tempData[index];
        editData.Y = $("#triggerDelay").val();
        //场景类型[0-定时，1-触发器,2-手动器]
        editData.K = 1;
        //场景类型[0为区域定时布撤防，1为子设备定时操作]
        editData.M = 0;
        //主设备
        editData.O = $("#laSmart").val();
        //关联设备
        let deviceObject = this.deviceList.find(x => x.I === editData.O);
        deviceObject.v = 16;
        let channels = "";
        for (let i = 0; i < deviceObject.v; i++) {
            if ($("#timerSwitch" + i).prop("checked")) channels += "1";
            else channels += "0";
        }
        editData.D = parseInt(channels, 2).toString(10);

        if ([null, undefined].includes(index))
            this.tempData.push(editData);
        console.info(editData);
    }

    saveTimerSwitch(index) {
        let JsonData = [null, undefined].includes(index) ? {} : this.tempData[index];
        JsonData.Cmd = 1320;
        JsonData.Id = 123123123;
        JsonData.User = 12345678;
        JsonData.Def = "JSON_SCENE_ITEM_ADD_TIMER";
        if ([null, undefined].includes(index))
            JsonData.B = 0;
        //场景类型[0-定时，1-触发器,2-手动器]
        JsonData.K = 0;
        //名称
        JsonData.N = $("#timerName").val();
        JsonData.L = [];

        let subItem = {};
        //场景类型[0为区域定时布撤防，1为子设备定时操作]
        subItem.M = 0;

        subItem.O = $("#laSmart").val();

        let deviceObject = this.deviceList.find(x => x.I === subItem.O);
        if (![undefined, null, ""].includes(deviceObject)) {
            deviceObject.v = 16;
            let channels = "";
            for (let i = 0; i < deviceObject.v; i++) {
                if ($("#timerSwitch" + i).prop("checked")) channels += "1";
                else channels += "0";
            }
            subItem.D = parseInt(channels, 2).toString(10);
        }

        let Week = [];
        if ($("#saveSwitchInfo .chSunday").prop("checked")) Week[0] = 1;
        else Week[0] = 0;
        if ($("#saveSwitchInfo .chMonday").prop("checked")) Week[1] = 1;
        else Week[1] = 0;
        if ($("#saveSwitchInfo .chTuesday").prop("checked")) Week[2] = 1;
        else Week[2] = 0;
        if ($("#saveSwitchInfo .chWednesday").prop("checked")) Week[3] = 1;
        else Week[3] = 0;
        if ($("#saveSwitchInfo .chThursday").prop("checked")) Week[4] = 1;
        else Week[4] = 0;
        if ($("#saveSwitchInfo .chFriday").prop("checked")) Week[5] = 1;
        else Week[5] = 0;
        if ($("#saveSwitchInfo .chSaturday").prop("checked")) Week[6] = 1;
        else Week[6] = 0;
        subItem.W = Week.toString().replaceAll(',', '');
        JsonData.L.push(subItem);
        let jsonStr = JSON.stringify(JsonData);


    }

    //填充添加时智能设备联动区域下拉框添加一个空值
    initArea() {
        $("#AreaSel").empty();
        this.areaList.forEach((item, index, array) => {
            let oOption = document.createElement("option");
            document.getElementById("AreaSel").options.add(oOption);
            oOption.value = item.A;
            oOption.innerText = item.N;
        });
    }

    initSwitchDevice() {
        $("#laSmart").empty();
        this.deviceList.filter((x) => {
            return x.T === 0
        }).forEach((item, index, array) => {
            let oOption = document.createElement("option");
            document.getElementById("laSmart").options.add(oOption);
            oOption.value = item.I;
            oOption.innerText = item.N;
        });
    }

    switchChange(event) {
        let deviceID = $(event).val();
        let deviceObject = this.deviceList.find(x => x.I === deviceID);
        deviceObject.v = 16;
        $("#timerSwitch").empty();
        for (let i = 0; i < deviceObject.v; i++) {
            let div = $("<label class=\"am-checkbox-inline\"><input id='timerSwitch" + i + "'  type='checkbox' name='Switch' ><span>" + g_oCommon.getNodeValue("laSwitch") + (i + 1) + "</span></label>");
            $("#timerSwitch").append(div);
        }
    }

    triggerChange(event) {
        let deviceID = $(event).val();
        let deviceObject = this.deviceList.find(x => x.I === deviceID);
        deviceObject.v = 16;
        $("#timerSwitch").empty();
        for (let i = 0; i < deviceObject.v; i++) {
            let div = $("<label class=\"am-checkbox-inline\"><input id='timerSwitch" + i + "'  type='checkbox' name='Switch' ><span>" + g_oCommon.getNodeValue("laSwitch") + (i + 1) + "</span></label>");
            $("#triggerSwitch").append(div);
        }
    }

    changeState() {
        $("#stateSel").empty();
        this.state.forEach((item, index, array) => {
            let oOption = document.createElement("option");
            document.getElementById("stateSel").options.add(oOption);
            oOption.value = index;
            oOption.innerText = g_oCommon.getNodeValue(item);
        });
    }
}

g_oScene = new scene();