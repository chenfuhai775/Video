class Device {
    constructor() {
        this.chnNUm = null;
        this.areaList = null;
        this.deviceList = null;
        this.devTypeTable = new Array("RAY_SENSOR", "MOV_SENSOR", "GAS_SENSOR", "REMOTE_CTL", "EMERGENCY_BUTTOM", "FIRE_SENSOR", "DOOR_SENSOR", "WARTER_SENSOR", "CO_SENSOR", "WLS_WARMING", "KEY_BOARD", "IAS_DEV", "SWITCH", "LOCK", "LIGHT", "COLOR_LED", "TEMP", "CURTAIN", "IR_DEVICE", "PLUG");
        this.szDevTypeTable = new Array(0, 45, 46, 47, 48, 48, 50, 51, 58, 56, 53, 69, 38, 54, 11, 19, 21, 33, 29, 43, 66);
        this.alarmDevTypeTable = new Array("RAY_SENSOR", "MOV_SENSOR", "GAS_SENSOR", "FIRE_SENSOR", "DOOR_SENSOR", "WARTER_SENSOR", "CO_SENSOR", "IAS_DEV");
        this.ctltypeTable = new Array("Wls", "Wired");
        // 0为,1为Zigbee,2为Wifi,3为Fsk,4为保留,5为总线ABUS,6为有线,7为保留,8为单总线SBUS,9为外置开关GPIO,10为内置开关INIO
    }

    initPage() {
        this.getMenuList();
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdDevice = translator.getLanguageXmlDoc("Device");
        translator.translatePage(this._lxdDevice, document);
        this.getChannelNumber();
        this.getZoneAreaList();
        this.getDeviceList();
    }

    //计算通道数量
    getChannelNumber() {
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
            success: function (data) {
                if (0 == data.Ack) {
                    g_oDevice.chnNUm = data.L.length;
                }
            }
        });
    }

    //获取区域列表
    getZoneAreaList() {
        let that = this;
        let json = {}
        json.Cmd = 1101;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_AREA_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "post",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    $("#ZoneArea").empty();
                    $("#DeviceList").empty();
                    g_oDevice.areaList = data.L;
                    g_oDevice.areaList.forEach((item, index, array) => {
                        let area = $("<li id='" + item.A + "'><a  href='#tab" + item.A + "'>" + item.N + "</a></li>");
                        $("#ZoneArea").append(area);
                        let DevList = "";
                        DevList += "<div id='tab" + item.A + "' class='am-tab-panel am-fade am-in'>";
                        DevList += "<table class='am-table am-table-bordered am-table-striped am-table-hover table-main'>";
                        DevList += "            <thead>";
                        DevList += "                <tr>";
                        DevList += "                    <th>" + g_oCommon.getNodeValue('laIndex') + "</th>";
                        DevList += "                    <th>" + g_oCommon.getNodeValue('laDevName') + "</th>";
                        DevList += "                    <th>" + g_oCommon.getNodeValue('laDevType') + "</th>";
                        DevList += "                    <th>" + g_oCommon.getNodeValue('laDevID') + "</th>";
                        DevList += "                    <th>" + g_oCommon.getNodeValue('laCtrl') + "</th>";
                        DevList += "                </tr>";
                        DevList += "            </thead>";
                        DevList += "            <tbody id='tb" + item.A + "'>";
                        DevList += "          </tbody>";
                        DevList += "</table>";
                        DevList += "</div>";
                        $("#DeviceList").append(DevList);
                    });
                    $("#ZoneArea").children().eq(0).addClass("am-active");
                    $("#DeviceList").children().eq(0).addClass("am-active");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
            }
        });
    }

    //获取设备列表
    getDeviceList() {
        let that = this;
        let json = {};
        json.Cmd = 1201;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_DEV_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "post",
            dataType: "json",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    g_oDevice.deviceList = data.L;
                    let devName, devID, areaNo, devNo;
                    //把设备列表数据存放到devListContent，后面会用到该数据
                    data.L.forEach((item, index, array) => {
                        areaNo = item.A;
                        devID = item.I;
                        devName = item.N;
                        let devType = g_oCommon.getNodeValue(that.convertDevTypeToStr(item.T));
                        let devType1 = item.T;
                        let TableList = document.getElementById("tb" + areaNo).innerHTML;
                        TableList += " <tr>";
                        TableList += "     <td></td>";
                        TableList += "     <td><a href='#'>" + devName + "</a></td>";
                        TableList += "     <td>" + devType + "</td>";
                        TableList += "     <td>" + devID + "</td>";
                        TableList += "     <td>";
                        TableList += "		<div class='am-btn-toolbar'>";
                        TableList += "			<div class='am-btn-group'>";
                        TableList += "     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary am-round' onclick='g_oDevice.devEditInit(\"" + devID + "\")'><span class='am-icon-pencil-square-o'></span> " + g_oCommon.getNodeValue('btnEdit') + "</button>";
                        TableList += "     			<button class='am-btn am-btn-default am-btn-sm am-text-danger am-round' onclick='g_oDevice.delOneDev(\"" + devID + "\")'><span class='am-icon-trash-o'></span> " + g_oCommon.getNodeValue('btnDel') + "</button>";
                        TableList += "     		</div>";
                        TableList += "       </div>";
                        TableList += "     </td>";
                        TableList += " </tr>";
                        document.getElementById("tb" + areaNo).innerHTML = TableList;
                        //自动给table添加序号
                        let oTable = document.getElementById("tb" + areaNo);
                        for (let i = 0; i < oTable.rows.length; i++) {
                            oTable.rows[i].cells[0].innerHTML = (i + 1);
                        }
                    });
                }
            }
        })
    }

    initText(edit) {
        $("#bodyContent").find("legend").text(g_oCommon.getNodeValue('laCommMode'));
        $("#laCommMode").text(g_oCommon.getNodeValue('laCommMode'));
        $("#laAreaSel1").text(g_oCommon.getNodeValue('laAreaSel1'));
        $("#laDevType").text(g_oCommon.getNodeValue('laDevType'));
        $("#laDevName").text(g_oCommon.getNodeValue('laDevName'));
        $("#laWls").text(g_oCommon.getNodeValue('laWls'));
        $("#laCancel").text(g_oCommon.getNodeValue('laCancel'));
        $("#laSave").text(g_oCommon.getNodeValue('laSave'));
        $("#laDevEnable").text(g_oCommon.getNodeValue('laEnable'));
        $("#panelTitle").empty();
        if (!edit)
            $("#panelTitle").append(g_oCommon.getNodeValue('laDevAddNew'));
        else
            $("#panelTitle").append(g_oCommon.getNodeValue('laDevEditNew'));

        this.initDevTye();
        this.initCtlType();
        this.initArea();
    }

    deviceAddManual() {
        this.initText();
        $('#devAddNew').modal({
            relatedTarget: this,
            width: 700,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                g_oDevice.saveDevice();
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    devEditInit(devID) {
        this.initText(true);
        let device = this.deviceList.find(x => x.I == devID);
        $('#ctlTypeSel').val(device.W);
        $('#devEnableSel').val(device.E);
        $('#AreaSel').val(device.A);
        $('#devTypeSel').val(this.convertDevTypeToStr(device.T));
        $('#DevName').val(device.N);
        $('#DevID').val(device.I);
        $('#devAddNew').modal({
            relatedTarget: this,
            width: 700,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                g_oDevice.saveDevice(true);
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    convertDevTypeFromStr(strDevType) {
        let szDevType = 0;
        let index = 0;

        for (index = 0; index < this.devTypeTable.length; index++) {
            if (this.devTypeTable[index] == strDevType) {
                szDevType = this.szDevTypeTable[index];
                break;
            }
        }

        return szDevType;
    }

    convertDevTypeToStr(devType) {
        let strDevType = 0;
        let index = 0;

        for (index = 0; index < this.szDevTypeTable.length; index++) {
            if (this.szDevTypeTable[index] == devType) {
                strDevType = this.devTypeTable[index];
                break;
            }
        }

        return strDevType;
    }

    saveDevice(edit) {
        let that = this;
        if ($('#DevName').val() == "" || $.trim($('#DevName').val()).length == 0) {
            AMUI.dialog.tip({
                tip: g_oCommon.getNodeValue('DevNameErr'),
                timeout: 2000
            });
            document.getElementById('DevName').focus();
            return false;
        } else if ($('#DevID').val() == "" || $.trim($('#DevID').val()).length == 0) {
            AMUI.dialog.tip({
                tip: g_oCommon.getNodeValue('DevIdErr'),
                timeout: 2000
            });
            document.getElementById('DevID').focus();
            return false;
        }
        let json = {}
        json.Cmd = edit ? 1204 : 1202;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = edit ? "JSON_DEV_EDIT" : "JSON_DEV_ADD";
        json.A = parseInt($('#AreaSel').val(), 10);
        json.E = parseInt($('#devEnableSel').val(), 10);
        json.I = $('#DevID').val();
        json.N = $('#DevName').val();
        json.W = $('#ctlTypeSel').val();
        json.T = this.convertDevTypeFromStr($('#devTypeSel').val());
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "GET",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonStr) + "&",
            dataType: "json",
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: edit ? g_oCommon.getNodeValue('EditOk') : g_oCommon.getNodeValue('AddOk'),
                        timeout: 1000
                    });
                } else if (-1 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('DevExist'),
                        timeout: 1000
                    });
                } else if (-2 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('DevFull'),
                        timeout: 1000
                    });
                } else if (-3 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('DevTypeErr'),
                        timeout: 1000
                    });
                } else {
                    AMUI.dialog.tip({
                        tip: edit ? g_oCommon.getNodeValue('EditFailed') : g_oCommon.getNodeValue('AddFailed'),
                        timeout: 1000
                    });
                }
                that.getZoneAreaList();
                that.getDeviceList();
            }
        });
    }

    devSingleStudy() {
        let that = this;
        let json = {}
        json.Cmd = 1208;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_DEV_SEARCH_O";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            success: function (data) {
                if (0 == data.Ack) {
                    that.initText();
                    $('#ctlTypeSel').val(data.W);
                    $('#devTypeSel').val(that.convertDevTypeToStr(data.T));
                    $('#devEnableSel').val(1);
                    $('#DevID').val(data.I);
                    $('#devAddNew').modal({
                        relatedTarget: that,
                        width: 700,
                        closeOnConfirm: false,
                        closeOnCancel: false,
                        onConfirm: function (e) {
                            g_oDevice.saveDevice();
                        },
                        onCancel: function (e) {
                            that.close();
                        }
                    });
                } else {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('searchFail'),
                        timeout: 2000
                    });
                }
            }
        });
    }

    //初始化设备类型下拉列表
    initDevTye() {
        $("#devTypeSel").empty();
        for (let index = 0; index < this.devTypeTable.length; index++) {
            let oOption = document.createElement("option");
            document.getElementById("devTypeSel").options.add(oOption);
            oOption.value = this.devTypeTable[index];
            oOption.innerText = g_oCommon.getNodeValue(this.devTypeTable[index]);
        }
    }

    //初始化通讯方式下拉列表
    initCtlType(value) {
        $("#ctlTypeSel").empty();
        for (let index = 0; index < this.ctltypeTable.length; index++) {
            let oOption = document.createElement("option");
            document.getElementById("ctlTypeSel").options.add(oOption);
            if (0 == index) oOption.value = 0;
            else if (1 == index) oOption.value = 8;
            oOption.innerText = g_oCommon.getNodeValue(this.ctltypeTable[index]);
            if (this.ctltypeTable[index] == value) oOption.selected = true;
        }
    }

    //填充添加时智能设备联动区域下拉框添加一个空值
    initArea() {
        let initVale = null;
        $("#AreaSel").empty();
        this.areaList.forEach((item, index, array) => {
            let oOption = document.createElement("option");
            document.getElementById("AreaSel").options.add(oOption);
            oOption.value = item.A;
            oOption.innerText = item.N;
            if (null == initVale) {
                initVale = item.A;
            }
        });

        if (null != initVale)
            $("#AreaSel").val(initVale);
        let areaId = $("#ZoneArea li.am-active").eq(0).attr("id");
        $("#AreaSel").val(areaId);
    }

    //删除设备
    delOneDev(devID) {
        let that = this;
        let json = {};
        json.Cmd = 1203;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_DEV_DEL";
        json.I = devID;
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "post",
            dataType: "json",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('DelOk'),
                        timeout: 1000
                    });
                    //重新加载设备列表
                    that.getZoneAreaList();
                    that.getDeviceList();
                }
            }
        });
    }

    //加载公共XML文本（页面标题、菜单）
    getMenuList() {
        autoLeftNav();
        $(window).resize(function () {
            autoLeftNav();
        });
        g_oCommon.m_szUserPwdValue = $.cookie("userInfo" + g_oCommon.m_lHttpPort);
        if (g_oCommon.m_szUserPwdValue === null) {
            window.location.href = "login.html";
            return;
        }
        $("#UserName").text($.cookie("userName"));
        getCurrentTime();
        setInterval(getCurrentTime, 1000);
        var szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._PublicXml = translator.getLanguageXmlDoc("Public");
        translator.translatePage(this._PublicXml, document);
        document.title = translator.translateNode(this._PublicXml, "LogoText");
    }

    syncMsg() {
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getStatusInfo",
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
    }
}

let g_oDevice = new Device();