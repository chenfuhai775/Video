function Common() {
    this.m_szHostName = location.hostname,
    this.m_szHostNameOriginal = location.hostname,
    this.m_lHttpPort = "80",
    this.m_lHttp = location.protocol + "//",
    this.m_lRtspPort = "554",
    this.m_szHttpPort = "80",
    this.m_szManagePort = "8000",
    this.m_szUserPwdValue = "",
    this.m_bDigest = !0,
    this.m_szPluginUNamePWD = "",
    "" != location.port ? this.m_lHttpPort = location.port: "https://" == this.m_lHttp && (this.m_lHttpPort = "443"),
    -1 != this.m_szHostName.indexOf("[") && (this.m_szHostNameOriginal = this.m_szHostName.substring(1, this.m_szHostName.length - 1)),
    this._isIPv6Add(this.m_szHostNameOriginal) && (this.m_szHostName = "[" + this.m_szHostNameOriginal + "]"),
    this.m_szExit = "",
    this.m_oXmlDoc = null,
    this.m_oDigXmlDoc = null,
    this.m_oZeroXmlDoc = null,
    this.m_PreviewOCX = null,
    this.m_bIsIE = !(null == /(msie\s|trident.*rv:)([\w.]+)/.exec(navigator.userAgent.toLowerCase())),
    this.m_iChannelId = [];
    for (var t = 0; 256 > t; t++) this.m_iChannelId[t] = -1;
    this.m_iAnalogChannelNum = 0,
    this.m_iDigitalChannelNum = 16,
    this.m_iZeroChanNum = 0,
    this.m_iTalkNum = 0,
    this.m_bTalk = 0,
    this._m_iTalkingNO = 0,
    this._m_szaudioCompressionType = "G.711ulaw",
    this.m_bPPPoEStatus = !1,
    this.m_bSupportShttpPlay = !1,
    this.m_bSupportShttpPlayback = !1,
    this.m_bSupportShttpsPlay = !1,
    this.m_bSupportShttpsPlayback = !1,
    this.m_iIpChanBase = 1,
    this.m_bSupportTransCode = !1,
    this.m_bSupportPatrols = !1,
    this.m_bSupportShttpPlaybackTransCode = !1,
    this.m_bSupportShttpsPlaybackTransCode = !1,
    this.m_bSupportStreamSecret = !1,
    this.m_bSupportReversPlayback = !0,
    this.m_szCopyRight = "NpbWNoydm5gbm2mliBBbGwIFJlc6naHRzbCBUTHRkLRGlnaXRhZVwqlIaWt7aX9sb5d5IENvLiwggUVkLg==",
	this.m_MsgInfoIndex = 0
}

function webSession() {
    this._bSupportSession = "object" == typeof sessionStorage,
    this._bSupportSession || document.documentElement.addBehavior("#default#userdata")
}

$.ajaxSetup({
    timeout: 3e4,
    beforeSend: function(t) {
        t.setRequestHeader("If-Modified-Since", "0")
    },
    statusCode: {
        401 : function() {}
    }
}),


Common.prototype = {
	
    changAuthInfo: function(t) {
        this.m_szUserPwdValue = t,
        this.m_szPluginUNamePWD = this.m_bDigest ? Base64.encode(":" + Base64.decode(t)) : t
    },
    _parseXml: function(t) {
        if (xmlDoc = null, window.ActiveXObject) {
            var e = new ActiveXObject("Microsoft.XMLDOM");
            e.async = !1,
            e.load(t),
            xmlDoc = e
        } else if (document.implementation && document.implementation.createDocument) {
            var n = new window.XMLHttpRequest;
            n.open("get", t, !1),
            n.send(null),
            xmlDoc = n.responseXML
        } else xmlDoc = null;
        return xmlDoc
    },
    addTitle: function(t) {
        t.each(function() {
            var t = $(this).find("label").eq(0).text() ? $(this).find("label").eq(0).text() : $(this).val(),
            e = $(this).width();
            if (e > 0) {
                var n = $("#dvStringLenTest", window.parent.document);
                n.html(t).css("font-weight", "bolder");
                var a = n.width();
                a >= e ? $(this).attr("title", t) : $(this).attr("title", ""),
                n.html("").attr("style", "")
            }
        })
    },
    _compareVersion: function(t) {
        var e = this._parseXml("xml/version.xml?version=" + ("undefined" != typeof global_config ? global_config.web_version: window.parent.global_config.web_version)),
        n = this.m_PreviewOCX.GetFileVersion(t, "FileVersion"),
        a = $(e).find(t).eq(0).text();
        if ("hpr.dll" == t) var i = ".";
        else var i = ",";
        for (var s = n.split(i), o = a.split(i), r = 0; 4 > r; r++) {
            if (parseInt(s[r]) > parseInt(o[r])) return - 1;
            if (parseInt(s[r]) < parseInt(o[r])) return 1
        }
        return 0
    },
    _getInternalRTSPPort: function() {
        var t = this;
		console.log("_getInternalRTSPPort ----- \n");
        $.ajax({
            type: "GET",
            timeout: 15e3,
            async: !1,
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getRtspPort",
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				var json = $.parseJSON(data);
                    t.m_lRtspPort =  json.RtspPort;
                    t.m_szHttpPort = json.HttpPort;
                    t.m_szManagePort = json.ManagePort;
                }
        })
    },
    _isIPv6Add: function(t) {
        return /:/.test(t) && 8 > t.match(/:/g).length && /::/.test(t) ? 1 == t.match(/::/g).length && /^::$|^(::)?([\da-f]{1,4}(:|::))*[\da-f]{1,4}(:|::)?$/i.test(t) : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(t)
    },
    getPPPOEStatus: function() {
        var t = this;
        $.ajax({
            type: "get",
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getPppoeStatus",
            timeout: 15e3,
            async: !1,
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				var json = $.parseJSON(data);
				
				if(0 == json.Status)
					t.m_bPPPoEStatus = !1;
				else
					t.m_bPPPoEStatus = !0;
            }
        })
    },
    getCapbilities: function() {
        var t = this;
        $.ajax({
            type: "get",
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getCapbilities",
            timeout: 15e3,
            async: !1,
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
                t.m_bSupportTransCode = !1;
                t.m_bSupportPatrols = !1;
                t.m_bSupportStreamSecret = !1;
                t.m_bSupportReversPlayback = !1;
            }
        })
    },
    isSupportShttp: function() {
        var t = this;
        $.ajax({
            type: "get",
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getCapbilities",
            timeout: 15e3,
            async: !1,
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				t.m_bSupportShttpPlay = !1;
				t.m_bSupportShttpPlayback = !1;
				t.m_bSupportShttpsPlay = !1;
				t.m_bSupportShttpsPlayback = !1;
				t.m_bSupportShttpPlaybackTransCode = !1;
				t.m_bSupportShttpsPlaybackTransCode = !1;
				t.m_iIpChanBase = !1;
            }
        })
    },
    unloadPage: function(t, e) {
        try {
            g_oCommon.m_PreviewOCX.StopRealPlayAll(),
            g_oCommon.m_PreviewOCX.HWP_StopVoiceTalk()
        } catch(n) {}
        if ($.cookie("page", t + "%" + e), 1 == e) $("#main_plugin").empty();
        else if (2 == e) {
            for (var a = 0; 64 > a; a++) g_oPlaybackInstance.m_DownWindow[a] && g_oPlaybackInstance.m_DownWindow[a].open && !g_oPlaybackInstance.m_DownWindow[a].closed && g_oPlaybackInstance.m_DownWindow[a].close();
            g_oPlaybackInstance.m_PictureDownWindow && g_oPlaybackInstance.m_PictureDownWindow.open && !g_oPlaybackInstance.m_PictureDownWindow.closed && g_oPlaybackInstance.m_PictureDownWindow.close(),
            $("#main_plugin").empty(),
            $("#playbackbar").empty()
        } else 3 == e || $("#main_plugin").empty()
    },
    xmlToStr: function(t) {
        var e = "";
        try {
            var n = new XMLSerializer;
            e = n.serializeToString(t)
        } catch(a) {
            try {
                e = t.xml
            } catch(a) {
                return ""
            }
        }
        return - 1 == e.indexOf("<?xml") && (e = "<?xml version='1.0' encoding='utf-8'?>" + e),
        e
    },
    parseXmlFromStr: function(t) {
        if (null == t || "" == t) return null;
        t = t.replace(/&(?!lt;|amp;|gt;|apos;|quot;)/g, "&amp;");
        var e = new this.createxmlDoc;
        if ("Netscape" == navigator.appName || "Opera" == navigator.appName) {
            var n = new DOMParser;
            e = n.parseFromString(t, "text/xml")
        } else e.loadXML(t);
        return e
    },
    checkPlugin: function(t, e, n, a) {
        var i = this,
        s = i.getNodeValue("laNotWin32Plugin");
        if (i.m_bIsIE) {
            $("#main_plugin").html("<object classid='CLSID:08F06FB4-2656-4AFB-98C8-F9A25AFCD769' codebase='' standby='Waiting...' id='PreviewActiveX' width='100%' height='640' name='ocx' align='center' ><param name='wndtype' value='" + n + "'><param name='playmode' value='" + a + "'></object>");
            var o = $("#PreviewActiveX")[0];
            if (null == o || null == o.object) return "Win32" == navigator.platform || "Windows" == navigator.platform ? $("#main_plugin").html("<label name='laPlugin' onclick='window.open(\"webvideo.exe\",\"_self\")' class='plugin-Link' onMouseOver='this.className =\"plugin-LinkSel\"' onMouseOut='this.className =\"plugin-Link\"'>" + e + "<label>") : "Mac68K" == navigator.platform || "MacPPC" == navigator.platform || "Macintosh" == navigator.platform ? $("#main_plugin").html("<label name='laPlugin' onclick='' class='plugin-Link' style='cursor:default; text-decoration:none;'>" + s + "<label>") : $("#main_plugin").html("<label name='laPlugin' onclick='' class='plugin-Link' style='cursor:default; text-decoration:none;'>" + s + "<label>"),
            !1
        } else {
            for (var r = !1,
            l = navigator.mimeTypes.length,
            d = 0; l > d; d++) if ("application/WebH264Play" == navigator.mimeTypes[d].type.toLowerCase()) {
                r = !0,
                "0" == t ? ($("#main_plugin").html("<embed type='application/hwp-webvideo-plugin' id='PreviewActiveX' width='1' height='1' name='PreviewActiveX' align='center' wndtype='" + n + "' playmode='" + a + "'>"), setTimeout(function() {
                    $("#PreviewActiveX").css("height", "0px")
                },
                10)) : "1" == t ? $("#main_plugin").html("<embed type='application/hwp-webvideo-plugin' id='PreviewActiveX' width='352' height='288' name='PreviewActiveX' align='center' wndtype='" + n + "' playmode='" + a + "'>") : $("#main_plugin").html("<embed type='application/hwp-webvideo-plugin' id='PreviewActiveX' width='100%' height='100%' name='PreviewActiveX' align='center' wndtype='" + n + "' playmode='" + a + "'>"),
                $("#PreviewActiveX").css("width", "99.99%");
                break
            }
			///else
				///console.log("navigator.mimeTypes[d].type.toLowerCase() = %s \n", navigator.mimeTypes[d].type.toLowerCase());
			
            if (!r) return "Win32" == navigator.platform ? $("#main_plugin").html("<label name='laPlugin' onclick='window.open(\"webvideo.exe\",\"_self\")' class='plugin-Link' onMouseOver='this.className =\"plugin-LinkSel\"' onMouseOut='this.className =\"plugin-Link\"'>" + e + "<label>") : "Mac68K" == navigator.platform || "MacPPC" == navigator.platform || "Macintosh" == navigator.platform ? $("#main_plugin").html("<label name='laNotWin32Plugin' onclick='' class='plugin-Link' style='cursor:default; text-decoration:none;'>" + s + "<label>") : $("#main_plugin").html("<label name='laNotWin32Plugin' onclick='' class='plugin-Link' style='cursor:default; text-decoration:none;'>" + s + "<label>"),
            !1
        }
		console.log("checkPlugin -- return !0 \n");
        return !0
    },
    compareFileVersion: function() {
       /// var t = $("#PreviewActiveX")[0];
       /// if (null == t) return !1;
       /// var e = this._parseXml("xml/version.xml?version=" + ("undefined" != typeof global_config ? global_config.web_version: window.parent.global_config.web_version)),
       /// n = this.xmlToStr(e),
       /// a = !1;
       /// try {
       ///     return a = !t.HWP_CheckPluginUpdate(n)
       /// } catch(i) {
       ///     if ("Netscape" != navigator.appName) {
        ///        if (1 == this._compareVersion("WebVideoActiveX.ocx")) return !1
        ///    } else if (1 == this._compareVersion("npWebVideoPlugin.dll")) return !1;
        ///    return 1 == this._compareVersion("PlayCtrl.dll") ? !1 : 1 == this._compareVersion("StreamTransClient.dll") ? !1 : 1 == this._compareVersion("NetStream.dll") ? !1 : 1 == this._compareVersion("SystemTransform.dll") ? !1 : !0
      ///  }
	  return !0;
    },
    getXMLHttpRequest: function() {
        var t = null;
        return window.XMLHttpRequest ? t = new XMLHttpRequest: window.ActiveXObject && (t = new ActiveXObject("Microsoft.XMLHTTP")),
        t
    },
    createxmlDoc: function() {
        for (var t, e = ["MSXML2.DOMDocument", "MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "Microsoft.XmlDom"], n = 0; e.length > n; n++) try {
            t = new ActiveXObject(e[n]);
            break
        } catch(a) {
            t = document.implementation.createDocument("", "", null);
            break
        }
        return t.async = "false",
        t
    },
    goAway: function() {
        Warning = confirm(ContentFrame.window.g_oCommon.m_szExit),
        Warning && ($.cookie("page", null), g_oWebSession.removeItem("userInfo"), window.location.href = "login.asp")
    },
    browseFilePath: function(t, e, n) {
        if ((void 0 === n || null === n) && (n = ""), null != this.m_PreviewOCX) {
            var a = this.m_PreviewOCX.HWP_OpenFileBrowser(e, n);
            if ("" == a || null == a) return;
            if (1 == e) {
                if (a.length > 100) return alert(this.getNodeValue("tipsTooLong")),
                void 0
            } else if (a.length > 130) return alert(this.getNodeValue("tipsTooLong")),
            void 0;
            $("#" + t).val(a)
        }
    },
    createCalendar: function(t) {
        var e = "";
        "zh" == parent.translator.szCurLanguage ? e = "zh-cn": ($.each(parent.translator.languages,
        function() {
            this.value === parent.translator.szCurLanguage && (e = this.value)
        }), "" === e && (e = "en")),
        0 == t ? WdatePicker({
            startDate: "%y-%M-%d %h:%m:%s",
            dateFmt: "yyyy-MM-dd HH:mm:ss",
            alwaysUseStartDate: !1,
            minDate: "1970-01-01 00:00:00",
            maxDate: "2037-12-31 23:59:59",
            readOnly: !0,
            lang: e,
            isShowClear: !1,
            isShowToday: !1
        }) : 1 == t ? WdatePicker({
            startDate: "%y-%M-%d %h:%m:%s",
            dateFmt: "yyyy-MM-ddTHH:mm:ss",
            alwaysUseStartDate: !1,
            minDate: "1970-01-01 00:00:00",
            maxDate: "2037-12-31 23:59:59",
            readOnly: !0,
            lang: e,
            isShowClear: !1,
            isShowToday: !1
        }) : WdatePicker({
            startDate: "%y-%M-%d",
            dateFmt: "yyyy-MM-dd",
            alwaysUseStartDate: !0,
            minDate: "1970-01-01 00:00:00",
            maxDate: "2037-12-31 23:59:59",
            readOnly: !0,
            lang: e,
            isShowClear: !1,
            isShowToday: !1
        })
    },
    getNodeValue: function(t) {
        if (parent != this) var e = parent.translator;
        else var e = translator;
        return null !== e.s_lastLanguageXmlDoc ? e.translateNodeByLastLxd(t) : void 0
    },
    dayAdd: function(t, e) {
        var n = new Date(Date.parse(t.replace(/\-/g, "/"))),
        a = new Date(n.getTime() + 1e3 * 60 * 60 * 24 * e);
        return a.Format("yyyy-MM-dd hh:mm:ss");
    },
    getLesionPort: function() {
        var t = this;
        t.getPPPOEStatus(),
        t.m_bPPPoEStatus ? t._getInternalRTSPPort() : $.ajax({
            type: "get",
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getLesionPort",
            timeout: 15e3,
            async: !1,
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
                var jsonPort = $.parseJSON(data);
                a = "554",
                i = "80";
	
				if(jsonPort.statusCode == 1)
				{
					a = jsonPort.VideoLesionPort;
					i = jsonPort.HttpLesionPort;
					t.m_lRtspPort = a;
					t.m_szHttpPort = i;
				
				}
			
            },
			
            error: function() {
                t._getInternalRTSPPort()
            }
        })
    },
    getAnalogChannelInfo: function() {
        var t = this;
        $.ajax({
            type: "GET",
            timeout: 15e3,
            async: !1,
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/GetAnalogChannelInfo",
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				t.m_oXmlDoc = data;
				var json = $.parseJSON(data);
                if(json.statusCode == 1)
				{
					t.m_iAnalogChannelNum = json.ChannelNum;
					for (var n = 0; t.m_iAnalogChannelNum > n; n++) 
						t.m_iChannelId[n] = json.chn[n].id;
				}
            }
        })
    },
    getDigChannelInfo: function() {
        var t = this;
        $.ajax({
            type: "GET",
            timeout: 15e3,
            async: !1,
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/GetDigChannelInfo",
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				var json = $.parseJSON(data);
                t.m_oDigXmlDoc = data;
				console.log("getDigChannelInfo -- %s \n",data);
				if(json.statusCode == 1)
				{
					t.m_iDigitalChannelNum = json.ChannelNum;
					for (var a = 0; t.m_iDigitalChannelNum > a; a++) {
						t.m_iChannelId[t.m_iAnalogChannelNum + a] = json.chn[a].id;
					}
				}
            }
        })
    },
    updateTips: function() {
        var t = $.cookie("updateTips"),
        e = "";
        "true" === t && ("Win32" === navigator.platform ? (e = this.getNodeValue("jsUpdatePlugin"), confirm(e) ? window.parent.global_config.plugin_need ? window.open("../WebVideoPlay.exe", "_self") :  window.open("http://www.meiantech.com/download/WebVideoPlay.exe", "_self") : $.cookie("updateTips", "false")) : (e = this.getNodeValue("jsUpdateNotWin32"), setTimeout(function() {
            alert(e)
        },
        20), $.cookie("updateTips", "false")))
    },
    getTalkNum: function() {
        var t = this;
        $.ajax({
            type: "get",
            timeout: 15e3,
            async: !1,
            url: t.m_lHttp + t.m_szHostName + ":" + t.m_lHttpPort + "/system/getTalkNum",
            username: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[0],
            password: g_oWebSession.getUNamePWD(g_oCommon.m_szUserPwdValue)[1],
            success: function(data) {
				var json = $.parseJSON(data);
                t.m_iTalkNum = json.TwoWayAudioChannel;
				if((t.m_iTalkNum > 0)&&(undefined != json.audioCompressionType))
					t._m_szaudioCompressionType = json.audioCompressionType;
            },
            error: function() {
                t.m_iTalkNum = 0
            }
        })
    },
    talk: function(t) {
        if (0 != this.m_iTalkNum) if (this.m_PreviewOCX = $("#PreviewActiveX")[0], 0 === this.m_bTalk) if (1 >= this.m_iTalkNum) {
            var s = this.m_PreviewOCX.HWP_StartVoiceTalk();
            if (0 != s) {
                var o = g_oCommon.m_PreviewOCX.HWP_GetLastError();
                return 403 === o ? alert(this.getNodeValue("jsNoOperationRight")) : alert(this.getNodeValue("VoiceTalkFailed")),
                void 0
            }
            $("#voiceTalk").attr("src", "images/public/ICON/speak_sound_normal.png"),
            $("#voiceTalk").attr("title", this.getNodeValue("StopvoiceTalk")),
            this.m_bTalk = 1
        } else this.m_iTalkNum > 2 ? $("#trTalkNum").show() : $("#trTalkNum").hide(),
        $("#EditVoiceTalk").css("right", "2px"),
        $("#EditVoiceTalk").css("top", $(t).offset().top - $("#EditPatrolPreset").height() + 5),
        $("#EditVoiceTalk").modal(),
        this._m_iTalkingNO = 0;
        else $("#voiceTalk").attr("src", "images/public/ICON/speak_normal.png"),
        $("#voiceTalk").attr("title", this.getNodeValue("voiceTalk")),
        this.m_PreviewOCX.HWP_StopVoiceTalk(),
        this.m_bTalk = 0
    },
    selectAllFile: function(t) {
        if (!$("#Num" + t).prop("checked")) return this._m_iTalkingNO = 0,
        void 0;
        for (var e = 1; 4 > e; e++) e == t ? $("#Num" + e).prop("checked", !0) : $("#Num" + e).prop("checked", !1);
        this._m_iTalkingNO = t
    },
    onVoiceTalkDlgOk: function() {
        if (0 == this._m_iTalkingNO) return alert(this.getNodeValue("ChooseTalkChan")),
        void 0;
        var t = $("#PreviewActiveX")[0];
		var s = t.HWP_StartVoiceTalk();
        if (0 == s) $("#voiceTalk").attr("src", "images/public/ICON/speak_sound_normal.png"),
        $("#voiceTalk").attr("title", this.getNodeValue("StopvoiceTalk")),
        this.m_bTalk = 1;
        else {
            var o = g_oCommon.m_PreviewOCX.HWP_GetLastError();
            403 === o ? alert(this.getNodeValue("jsNoOperationRight")) : alert(this.getNodeValue("VoiceTalkFailed"))
        }
        $.modal.impl.close()
    },
    getTreeTable: function() {
        var t = $("#content_left").html();
        t += "<table cellspacing='0' cellpadding='0' style='width:200px; height:100%; border-collapse:collapse; border:1px solid #9b9b9b;'><tr style='width:200px;height:8px;'><td style='width:8px;height:8px;'></td><td style='width:184px;height:8px;'></td><td style='width:8px;height:8px;'></td></tr><tr style='width:200px;height:30px;'><td style='width:8px;height:30px;'></td><td style='width:184px;height:30px;'><div id='Device' class='ellipsis'>&nbsp; <img src='images/public/ICON/DVR.png' /> <span id='DeviceName' style='-moz-user-select:none;' onselectstart='return false;'></span></div></td><td style='width:8px;height:30px; '></td></tr><tr style='width:200px;height:auto;'><td style='width:8px;height:auto; '></td><td valign='top' style='width:184px;height:auto;background:#dbdbdb;_height: expression((documentElement.clientHeight - 100) + \"px\");'><div id='sub_menu'></div></td><td style='width:8px;height:auto;'></td></tr><tr style='width:200px;height:8px;'><td style='width:8px;height:8px; '></td><td style='width:184px;height:8px;'></td><td style='width:8px;height:8px;'></td></tr></table>",
        $("#content_left").html(t)
    },
    changeJaFont: function() {
        $(document.body).append('<style>*{font-family:"Meiryo", "Arial", "sans-serif";}</style>')
    },
    CheckPasswordComplexity: function(t, e) {
        var n = 0;
        return t.match(/[a-z]/g) && n++,
        t.match(/[A-Z]/g) && (n += n ? 2 : 1),
        t.match(/[0-9]/g) && n++,
        t.match(/[^a-zA-Z0-9]/g) && (n += n ? 2 : 1),
        (8 > t.length || t === e || t === e.split("").reverse().join("")) && (n = 0),
        n && n--,
        n = n > 3 ? 3 : n
    }
};
var g_oCommon = new Common,
Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(t) {
        var e, n, a, i, s, o, r, l = "",
        d = 0;
        for (t = Base64._utf8_encode(t); t.length > d;) e = t.charCodeAt(d++),
        n = t.charCodeAt(d++),
        a = t.charCodeAt(d++),
        i = e >> 2,
        s = (3 & e) << 4 | n >> 4,
        o = (15 & n) << 2 | a >> 6,
        r = 63 & a,
        isNaN(n) ? o = r = 64 : isNaN(a) && (r = 64),
        l = l + this._keyStr.charAt(i) + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(r);
        return l
    },
    decode: function(t) {
        var e, n, a, i, s, o, r, l = "",
        d = 0;
        for (t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""); t.length > d;) i = this._keyStr.indexOf(t.charAt(d++)),
        s = this._keyStr.indexOf(t.charAt(d++)),
        o = this._keyStr.indexOf(t.charAt(d++)),
        r = this._keyStr.indexOf(t.charAt(d++)),
        e = i << 2 | s >> 4,
        n = (15 & s) << 4 | o >> 2,
        a = (3 & o) << 6 | r,
        l += String.fromCharCode(e),
        64 != o && (l += String.fromCharCode(n)),
        64 != r && (l += String.fromCharCode(a));
        return l = Base64._utf8_decode(l)
    },
    _utf8_encode: function(t) {
        t = t.replace(/\r\n/g, "\n");
        for (var e = "",
        n = 0; t.length > n; n++) {
            var a = t.charCodeAt(n);
            128 > a ? e += String.fromCharCode(a) : a > 127 && 2048 > a ? (e += String.fromCharCode(192 | a >> 6), e += String.fromCharCode(128 | 63 & a)) : (e += String.fromCharCode(224 | a >> 12), e += String.fromCharCode(128 | 63 & a >> 6), e += String.fromCharCode(128 | 63 & a))
        }
        return e
    },
    _utf8_decode: function(t) {
        for (var e = "",
        n = 0,
        a = c1 = c2 = 0; t.length > n;) a = t.charCodeAt(n),
        128 > a ? (e += String.fromCharCode(a), n++) : a > 191 && 224 > a ? (c2 = t.charCodeAt(n + 1), e += String.fromCharCode((31 & a) << 6 | 63 & c2), n += 2) : (c2 = t.charCodeAt(n + 1), c3 = t.charCodeAt(n + 2), e += String.fromCharCode((15 & a) << 12 | (63 & c2) << 6 | 63 & c3), n += 3);
        return e
    }
},
g_isAlertDlgOpen = !1;
navigator.userAgent.indexOf("Firefox") > 0 && (window.alert = function(t) {
    if (!g_isAlertDlgOpen) {
        var e, n, a;
        e = 300,
        n = 120,
        a = "#336699",
        titlecolor = "#235cdb";
        var i, s;
        i = document.body.offsetWidth,
        s = document.body.offsetHeight;
        var o = document.createElement("iframe");
        o.style.position = "absolute",
        o.style.top = document.documentElement.scrollTop + (s - n) / 2 + "px",
        o.style.left = (i - e) / 2 + "px",
        o.style.zIndex = 1003,
        o.style.background = "#777",
        o.style.width = "298px",
        o.style.height = "118px",
        document.body.appendChild(o);
        var r = document.createElement("div");
        r.setAttribute("id", "bgDiv"),
        r.style.position = "absolute",
        r.style.top = "0",
        r.style.left = "0",
        r.style.background = "#777",
        r.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75",
        r.style.opacity = "0.6",
        r.style.width = i + "px",
        r.style.height = s + "px",
        document.body.appendChild(r);
        var l = document.createElement("div");
        l.setAttribute("id", "msgDiv"),
        l.setAttribute("align", "center"),
        l.style.position = "absolute",
        l.style.background = "#ece9d8",
        l.style.font = "12px/1.6em Verdana, Geneva, Arial, Helvetica, sans-serif",
        l.style.border = "1px solid " + a,
        l.style.width = e + "px",
        l.style.height = n + "px",
        l.style.top = document.documentElement.scrollTop + (s - n) / 2 + "px",
        l.style.left = (i - e) / 2 + "px",
        l.style.zIndex = 1004;
        var d = document.createElement("h4");
        d.setAttribute("id", "msgTitle"),
        d.setAttribute("align", "right"),
        d.style.margin = "0",
        d.style.padding = "3px",
        d.style.background = a,
        d.style.filter = "progid:DXImageTransform.Microsoft.Alpha(startX=20, startY=20, finishX=100, finishY=100,style=1,opacity=75,finishOpacity=100);",
        d.style.opacity = "0.75",
        d.style.border = "1px solid " + a,
        d.style.height = "18px",
        d.style.font = "12px Verdana, Geneva, Arial, Helvetica, sans-serif",
        d.style.color = "white",
        d.style.cursor = "pointer",
        d.innerHTML = "X",
        d.onclick = function() {
            document.body.removeChild(r),
            document.body.removeChild(o),
            document.getElementById("msgDiv").removeChild(d),
            document.body.removeChild(l),
            g_isAlertDlgOpen = !1
        },
        document.body.appendChild(l),
        document.getElementById("msgDiv").appendChild(d);
        var c = document.createElement("p");
        c.style.margin = "1em 0",
        c.setAttribute("id", "msgTxt"),
        c.innerHTML = t,
        document.getElementById("msgDiv").appendChild(c);
        var u = document.createElement("input");
        u.setAttribute("type", "button"),
        "zh" == parent.translator.szCurLanguage.split("_")[0].toLowerCase() ? u.setAttribute("value", "确定") : u.setAttribute("value", "OK"),
        u.style.width = "100px",
        u.style.position = "absolute",
        u.style.top = "90px",
        u.style.left = "100px",
        u.onclick = function() {
            document.body.removeChild(r),
            document.body.removeChild(o),
            document.getElementById("msgDiv").removeChild(d),
            document.body.removeChild(l),
            g_isAlertDlgOpen = !1
        },
        document.getElementById("msgDiv").appendChild(u),
        g_isAlertDlgOpen = !0
    }
}),
String.prototype.replaceAll = function(t, e) {
    for (var n = this; n.indexOf(t) >= 0;) n = n.replace(t, e);
    return n
},
Date.prototype.Format = function(t) {
    var e = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds()
    };
    /(y+)/.test(t) && (t = t.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)));
    for (var n in e) RegExp("(" + n + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[n] : ("00" + e[n]).substr(("" + e[n]).length)));
    return t
},
webSession.prototype.getItem = function(szAttr) {
    with(this) {
        if (_bSupportSession) return sessionStorage.getItem(szAttr);
        with(document.documentElement) try {
            return load(szAttr),
            getAttribute("value")
        } catch(ex) {
            return null
        }
    }
},
webSession.prototype.setItem = function(szAttr, szVal) {
    with(this) {
        if (_bSupportSession) return sessionStorage.setItem(szAttr, szVal);
        with(document.documentElement) try {
            return load(szAttr),
            setAttribute("value", szVal),
            save(szAttr),
            getAttribute("value")
        } catch(ex) {
            return null
        }
    }
},
webSession.prototype.removeItem = function(szAttr) {
    with(this) if (_bSupportSession) sessionStorage.removeItem(szAttr);
    else with(document.documentElement) try {
        load(szAttr),
        expires = new Date(630892799e3).toUTCString(),
        save(szAttr)
    } catch(ex) {}
},
g_oWebSession = new webSession,
webSession.prototype.getUNamePWD = function(t) {
    var e = ["", ""];
    if (t) {
        var n = Base64.decode(t);
        ":" === n.charAt(0) && (n = n.substring(1));
        var a = n.indexOf(":");
        a > 0 && (e[0] = n.substring(0, a), e[1] = n.substring(a + 1))
    }
    return e
};