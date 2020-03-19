function NetworkSetting() {
    this._lxdNetworkSetting = null;  //NetworkSetting.xml
}

NetworkSetting.prototype = {
    //主页面初始化函数
    initPage: function () {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdNetworkSetting = translator.getLanguageXmlDoc("NetworkSetting");
        translator.translatePage(this._lxdNetworkSetting, document);
        this.getNetBasicInfo();
        this.getWifiInfo();
        this.getF4gInfo();
        this.getCmsInfo();
        this.getSiaInfo();
        this.getEmailInfo();
        this.getWifiSta();
        g_oNetworkSetting.syncMsg();
        setInterval("g_oNetworkSetting.syncMsg()", 2000);
    },

    getNetBasicInfo: function () {
        let that = this;
        let jsonReq = {};
        jsonReq.Cmd = 7001;
        jsonReq.Id = "web";
        jsonReq.User = 123;
        jsonReq.Def = "JSON_CMD_GET_NETWORK";
        let jsonReqStr = JSON.stringify(jsonReq);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    let bDhcpEnable = data.Dhcp;
                    let strDhcpAddr = data.DhcpIp;
                    let strIpAddr = data.Ip;
                    let strNetMask = data.SubNetMask;
                    let strGateway = data.Gateway;
                    let strMac = data.Mac;
                    let strDns1 = data.Dns1;
                    let strDns2 = data.Dns2;
                    if (0 == bDhcpEnable) {
                        $("#IsUseDHCP").prop("checked", !1);
                        $("#laDhcpIpAddr").hide();
                    } else {
                        $("#IsUseDHCP").prop("checked", !0);
                        $("#laDhcpIpAddr").html(strDhcpAddr);
                    }
                    $("#ipAddress").val(strIpAddr);
                    $("#subnetMask").val(strNetMask);
                    $("#DefaultGateway").val(strGateway);
                    $("#MacAddress").val(strMac);
                    $("#PrimaryDNS").val(strDns1);
                    $("#DNSServer2IP").val(strDns2);
                    if ("0.0.0.0" == $("#PrimaryDNS").val())
                        $("#PrimaryDNS").val("");
                    if ("0.0.0.0" == $("#DNSServer2IP").val())
                        $("#DNSServer2IP").val("");
                    that.checkIsDHCP();
                }
            },
            error: function (e) {
            }
        })
    },

    setNetBasicInfo: function () {
        var that = this;
        $(".formtips").html("");
        if (("" === $("#PrimaryDNS").val() || CheckDIPadd($("#PrimaryDNS").val(), "DNSServerIPtips", "jsFirstDNS")) && ("" === $("#DNSServer2IP").val() || CheckDIPadd($("#DNSServer2IP").val(), "DNSServer2IPtips", "jsSecondDNS"))) {

            if (!$("#IsUseDHCP").prop("checked")) {
                if ("0.0.0.0" == $("#ipAddress").val()) return $("#ServerIPtips").html(g_oCommon.getNodeValue("DIPAddInvalidTips")),
                    void 0;
                if ("0.0.0.0" == $("#subnetMask").val()) return $("#ServerMaskIPtips").html(g_oCommon.getNodeValue("MaskAddInvalidTips")),
                    void 0;
                if (!CheckDIPadd($("#ipAddress").val(), "ServerIPtips", "laDeviceIpAdd")) return;
                if (!CheckMaskIP($("#subnetMask").val(), "ServerMaskIPtips", "jsMaskAdd")) return;
                if ("" != $("#DefaultGateway").val()) {
                    if ("0.0.0.0" == $("#DefaultGateway").val()) return $("#ServerGateWayIPtips").html(g_oCommon.getNodeValue("DIPAddInvalidTips")),
                        void 0;
                    if (!CheckDIPadd($("#DefaultGateway").val(), "ServerGateWayIPtips", "jsGateAdd")) return
                }
            }
            var json = {};
            json.Cmd = 7002;
            json.Id = "web";
            json.User = 123;
            json.Def = "JSON_DEV_SET_NETWORK";
            json.DhcpIp = "";

            if ($("#IsUseDHCP").prop("checked"))
                json.Dhcp = true;
            else
                json.Dhcp = false;

            json.Ip = $("#ipAddress").val();
            json.SubNetMask = $("#subnetMask").val();
            json.Gateway = $("#DefaultGateway").val();
            json.Mac = $("#MacAddress").val();
            json.Dns1 = $("#PrimaryDNS").val();
            json.Dns2 = $("#DNSServer2IP").val();

            let jsonStr = JSON.stringify(json);
            $.ajax({
                type: "PUT",
                url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
                timeout: 15e3,
                async: !1,
                processData: !1,
                data: jsonStr,
                dataType: "json",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("If-Modified-Since", 0);
                    xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
                },
                success: function (data) {
                    if (0 == data.Ack) {
                        /* AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('Success2'),
                            timeout:1000
                        }); */
                        AMUI.dialog.loading({
                            title: g_oCommon.getNodeValue('Success2'),
                        });
                        //关闭loading窗口
                        //$('#my-modal-loading').modal(close);
                    }
                },
                complete: function (t) {
                }
            })
        }
    },

    checkIsDHCP: function () {
        $("#IsUseDHCP").prop("checked") ? ($("#ipAddress").prop("disabled", !0), $("#subnetMask").prop("disabled", !0), $("#DefaultGateway").prop("disabled", !0), $("#PrimaryDNS").prop("disabled", !0), $("#DNSServer2IP").prop("disabled", !0)) : ($("#ipAddress").prop("disabled", !1), $("#subnetMask").prop("disabled", !1), $("#DefaultGateway").prop("disabled", !1), ($("#PrimaryDNS").prop("disabled", !1), $("#DNSServer2IP").prop("disabled", !1)))
    },

    //获取WiFi信息
    getWifiInfo: function () {
        let jsonReq = {};
        jsonReq.Cmd = 7017;
        jsonReq.Id = "123123123";
        jsonReq.User = 12345678;
        jsonReq.Def = "JSON_CMD_GET_WIFI_AP";

        let jsonReqStr = JSON.stringify(jsonReq);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    var jsonApAddr = data.ApAddr;
                    var jsonApWpaSel = data.ApWpaSel;
                    var jsonApMac = data.ApMac;
                    var jsonApSsid = data.ApSsid;
                    var jsonApPwd = data.ApPwd;
                    var jsonApChannleSel = data.ApChannleSel;
                    var jsonApAreaSel = data.ApAreaSel;

                    $("#wifiApAddr").val(jsonApAddr);
                    $("#wifiApWpaSel").val(jsonApWpaSel);
                    $("#wifiApMac").val(jsonApMac);
                    $("#wifiApSsid").val(jsonApSsid);
                    $("#wifiApPwd").val(jsonApPwd);
                    $("#wifiApChannleSel").val(jsonApChannleSel);
                    $("#wifiApAreaSel").val(jsonApAreaSel);
                }
            },
            error: function (e) {
            }
        })
    },
    //保存wifi信息
    setWifiInfo: function () {
        let json = {};
        json.Cmd = 7018;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_WIFI_AP";

        json.ApAddr = $("#wifiApAddr").val();
        json.ApWpaSel = $("#wifiApWpaSel").val();
        json.ApMac = $("#wifiApMac").val();
        json.ApSsid = $("#wifiApSsid").val();
        json.ApPwd = $("#wifiApPwd").val();
        json.ApChannleSel = $("#wifiApChannleSel").val();
        json.ApAreaSel = $("#wifiApAreaSel").val();

        let jsonStr = JSON.stringify(json);

        $.ajax({
            type: "put",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            data: jsonStr,
            dataType: "json",
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
    //4G设置
    getF4gInfo: function () {
        let json = {};
		json.Cmd = 7019;
        json.Id = "123123123";
        json.User = 12345678;
		json.Def = "JSON_CMD_GET_MOBILE_NET";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    var jsonEnable = data.Enable;
                    var jsonUserName = data.UserName;
                    var jsonPassword = data.Password;
                    var jsonApn = data.Apn;
                    var jsonDialCode = data.DialCode;

                    if (0 == jsonEnable) {
                        $("#F4gEnable").prop("checked", !1);
                    } else {
                        $("#F4gEnable").prop("checked", !0);
                    }

                    $("#f4GUserName").val(jsonUserName);
                    $("#f4GPassword").val(jsonPassword);
                    $("#f4GApn").val(jsonApn);
                    $("#f4GDialCode").val(jsonDialCode);
                }
            },
            error: function (e) {

            }
        })
    },

    setF4gInfo: function () {
        let json = {};
        json.Cmd = 7020;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_MOBILE_NET";
        if ($("#F4gEnable").prop("checked"))
            json.Enable = true;
        else
            json.Enable = false;
        json.UserName = $("#f4GUserName").val();
        json.Password = $("#f4GPassword").val();
        json.Apn = $("#f4GApn").val();
        json.DialCode = $("#f4GDialCode").val();
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            data: jsonStr,
            dataType: "json",
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
    //CMS平台设置
    getCmsInfo: function () {
        let json = {};
		json.Cmd = 7003;
		json.Id = "123123123";
		json.User = 12345678;
		json.Def = "JSON_CMD_GET_PLATFORM";

        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    var jsonAuthEn = data.AutoAuth;
                    var jsonEnabled = data.Enable;
                    var jsonServerAddr1 = data.MainDomain;
                    var jsonServerPort1 = data.MainPort;
                    var jsonServerAddr2 = data.SubDomain;
                    var jsonServerPort2 = data.SubPort;
                    var jsonUserName = data.RegId;
                    var jsonPassword = data.RegPwd;
                    var jsonBeat = data.HeartBeat;
                    var jsonConnectMode = data.ConnectMode;

                    if (0 == jsonAuthEn) {
                        $("#cmsAuthEn").prop("checked", !1);
                    } else {
                        $("#cmsAuthEn").prop("checked", !0);
                    }

                    if (0 == jsonEnabled) {
                        $("#cmsEnabled").prop("checked", !1);
                    } else {
                        $("#cmsEnabled").prop("checked", !0);
                    }

                    $("#cms1ServerAddr").val(jsonServerAddr1);
                    $("#cms1ServerPort").val(jsonServerPort1);
                    $("#cms2ServerAddr").val(jsonServerAddr2);
                    $("#cms2ServerPort").val(jsonServerPort2);
                    $("#cmsUserName").val(jsonUserName);
                    $("#cmsPassword").val(jsonPassword);
                    $("#cmsBeat").val(jsonBeat);
                }
            },
            error: function (e) {
            }
        })
    },

    setCmsInfo: function () {
        let json = {};
        json.Cmd = 7004;
		json.Id = "123123123";
		json.User = 12345678;
        json.Def = "JSON_CMD_SET_PLATFORM";

        if ($("#cmsAuthEn").prop("checked"))
            json.AutoAuth = true;
        else
            json.AutoAuth = false;

        if ($("#cmsEnabled").prop("checked"))
            json.Enable = true;
        else
            json.Enable = false;
        json.MainDomain = $("#cms1ServerAddr").val();
        json.MainPort = parseInt($("#cms1ServerPort").val(), 10);
        json.SubDomain = $("#cms2ServerAddr").val();
        json.SubPort = parseInt($("#cms2ServerPort").val(), 10);
        json.RegId = $("#cmsUserName").val();
        json.RegPwd = $("#cmsPassword").val();
        json.HeartBeat = parseInt($("#cmsBeat").val(), 10);
        json.ConnectMode = 30;
        let jsonStr = JSON.stringify(json);

        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            data: jsonStr,
            dataType: "json",
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
    //SIA设置
    getSiaInfo: function () {
        let json = {};
		json.Cmd = 7011;
		json.Id = "123123123";
		json.User = 12345678;
		json.Def = "JSON_CMD_GET_SIA";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    let jsonEnabled = data.Enable;
                    let jsonServerAddr = data.Domain;
                    let jsonServerPort = data.Port;
                    let jsonUser = data.Account;
                    let jsonPwd = data.Pwd;
                    let jsonBeat = data.Beat;

                    if (0 == jsonEnabled) {
                        $("#siaEnabled").prop("checked", !1);
                    } else {
                        $("#siaEnabled").prop("checked", !0);
                    }

                    $("#siaServerAddr").val(jsonServerAddr);
                    $("#siaServerPort").val(jsonServerPort);
                    $("#siaUser").val(jsonUser);
                    $("#siaBeat").val(jsonBeat);
                }
            },
            error: function (e) {
            }
        })
    },

    setSiaInfo: function () {
        let json = {};
        json.Cmd = 7012;
		json.Id = "123123123";
		json.User = 12345678;
        json.Def = "JSON_CMD_SET_SIA";
        if ($("#siaEnabled").prop("checked"))
            json.Enable = true;
        else
            json.Enable = false;

        json.Domain = $("#siaServerAddr").val();
        json.Port = parseInt($("#siaServerPort").val(), 10);
        json.Account = $("#siaUser").val();
        json.Pwd = "123456";
        json.Beat = parseInt($("#siaBeat").val(), 10);

        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            dataType: "json",
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
    //邮件设置
    getEmailInfo: function () {
        let jsonReq = {};
        jsonReq.Cmd = 7007;
        jsonReq.Id = "web";
        jsonReq.User = 123;
        jsonReq.Def = "JSON_CMD_GET_EMAIL";

        let jsonReqStr = JSON.stringify(jsonReq);

        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    let jsonEnable = data.Enable;
                    let jsonSsl = data.SSL;
                    let jsonSmtpServer = data.Domain;
                    let jsonSmtpPort = data.Port;
                    let jsonUserName = data.SenderAccount;
                    let jsonPassword = data.SenderPwd;
                    let jsonReceiver = data.RecvicerAccount;

                    if (0 == jsonSsl) {
                        $("#chSsl").prop("checked", !1);
                    } else {
                        $("#chSsl").prop("checked", !0);
                    }

                    $("#SMTPServerAddress").val(jsonSmtpServer);
                    $("#SMTPPort").val(jsonSmtpPort);
                    $("#EmailUserName").val(jsonUserName);
                    $("#Password").val(jsonPassword);
                    $("#ReceiverName").val(jsonReceiver);
                }
            },

            error: function (e) {

            }
        })
    },

    setEmailInfo: function () {
        var json = {};

        json.Cmd = 7008;
        json.Id = "web";
        json.User = 123;
        json.Def = "JSON_DEV_SET_EMAIL";
        json.Enable = true;

        if ($("#chSsl").prop("checked"))
            json.SSL = true;
        else
            json.SSL = false;

        json.Domain = $("#SMTPServerAddress").val();
        json.Port = parseInt($("#SMTPPort").val(), 10);
        json.SenderAccount = $("#EmailUserName").val();
        json.SenderPwd = $("#Password").val();
        json.RecvicerAccount = $("#ReceiverName").val();
        var jsonStr = JSON.stringify(json);
        $.ajax({
            type: "put",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            dataType: "json",
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

    getWifiSta: function () {
        let json = {};
        json.Cmd = 7035;
        json.Id = "web";
        json.User = 123;
        json.Def = "JSON_CMD_GET_WIFI_STA";
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "put",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            dataType: "json",
            data: jsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", 0);
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    $('#wifiEnable').val(data.Enable);
                    $("#Wpa").val(data.Wpa);
                    $("#laWifiStaSsid").val(data.Ssid);
                    $("#laWifePwd").val(data.Key);
                }
            },
            complete: function (t) {
            }
        })
    },

    setWifiSta: function () {
        let json = {};
        json.Cmd = 7036;
        json.Id = "web";
        json.User = 123;
        json.Def = "JSON_CMD_SET_WIFI_STA";
        json.Enable = $("#wifiEnable") == "1" ? true : false;
        json.Wap = $("#ddlWap").val();
        json.Ssid = $("#laWifiStaSsid").val();
        json.Key = $("#laWifePwd").val();

        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "put",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            dataType: "json",
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
    }
}

var g_oNetworkSetting = new NetworkSetting();