function NetworkSetting() {
    this._lxdNetworkSetting = null;  //NetworkSetting.xml
}

NetworkSetting.prototype = {
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdNetworkSetting = translator.getLanguageXmlDoc("NetworkSetting");
		translator.translatePage(this._lxdNetworkSetting, document);
		this.getNetBasicInfo();
		this.getWifiInfo();
		this.getF4gInfo();
		this.getCmsInfo();
		this.getSiaInfo();
		this.getEmailInfo();
		g_oNetworkSetting.syncMsg();
		setInterval("g_oNetworkSetting.syncMsg()", 2000);
	},
	
	getNetBasicInfo: function() {
		var that = this;
		
		var jsonReq = {};
			jsonReq.Cmd=7001;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_NETWORK";
						
		var jsonReqStr = JSON.stringify(jsonReq);

        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				console.log("Ask = %d \n", json.Ask);
				if(json.Ask == 0)
				{
					var bDhcpEnable = json.Dhcp;
					var strDhcpAddr = json.DhcpIp;
					var strIpAddr = json.Ip;
					var strNetMask = json.SubNetMask;
					var strGateway = json.Gateway;
					var strMac = json.Mac;
					var strDns1 = json.Dns1;
					var strDns2 = json.Dns2;
		
					if(0 == bDhcpEnable)
					{
						$("#IsUseDHCP").prop("checked", !1);
						$("#laDhcpIpAddr").hide();
					}
					else
					{
						$("#IsUseDHCP").prop("checked", !0);
						$("#laDhcpIpAddr").html(strDhcpAddr);
					}
	
					$("#ipAddress").val(strIpAddr);
					$("#subnetMask").val(strNetMask);
					$("#DefaultGateway").val(strGateway);
					$("#MacAddress").val(strMac);
					$("#PrimaryDNS").val(strDns1);
					$("#DNSServer2IP").val(strDns2);
					
					if("0.0.0.0" == $("#PrimaryDNS").val())
						$("#PrimaryDNS").val("");
					
					if("0.0.0.0" == $("#DNSServer2IP").val())
						$("#DNSServer2IP").val("");
					
					that.checkIsDHCP();
				}
            },
			
            error: function(e) {
                
            }
        })
    },
	
	setNetBasicInfo: function() {
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
			json.Cmd=7002;
			json.Id="web";
			json.User=123;
			json.Def="JSON_DEV_SET_NETWORK";
			json.DhcpIp="";
			
			if($("#IsUseDHCP").prop("checked"))
				json.Dhcp = true;
			else
				json.Dhcp = false;
			
			json.Ip = $("#ipAddress").val();
			json.SubNetMask = $("#subnetMask").val();
			json.Gateway = $("#DefaultGateway").val();
			json.Mac = $("#MacAddress").val();
			json.Dns1 = $("#PrimaryDNS").val();
			json.Dns2 = $("#DNSServer2IP").val();
			
			var jsonStr = JSON.stringify(json);
			$.ajax({
                type: "PUT",
                url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
                timeout: 15e3,
				async: !1,
				processData: !1,
                data: jsonStr,
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
                success: function(data) {
					console.log("data = %s \n", data);
                    var json = $.parseJSON(data);
					if(json.Ask == 0)
					{
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
				
                complete: function(t) {
                   
                }
            })
        }
    },
	
	checkIsDHCP: function() {
        $("#IsUseDHCP").prop("checked") ? ($("#ipAddress").prop("disabled", !0), $("#subnetMask").prop("disabled", !0), $("#DefaultGateway").prop("disabled", !0), $("#PrimaryDNS").prop("disabled", !0), $("#DNSServer2IP").prop("disabled", !0)) : ($("#ipAddress").prop("disabled", !1), $("#subnetMask").prop("disabled", !1), $("#DefaultGateway").prop("disabled", !1),($("#PrimaryDNS").prop("disabled", !1), $("#DNSServer2IP").prop("disabled", !1)))
    },
	
	//获取WiFi信息
	getWifiInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=8001;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_NETWORK";
						
		var jsonReqStr = JSON.stringify(jsonReq);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
			timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				console.log("data = %s \n", data);
				var json = $.parseJSON(data);
				if(json.statusCode == 1)
				{
					var jsonApAddr = json.ApAddr;
					var jsonApWpaSel = json.ApWpaSel;
					var jsonApMac = json.ApMac;
					var jsonApSsid = json.ApSsid;
					var jsonApPwd = json.ApPwd;
					var jsonApChannleSel = json.ApChannleSel;
					var jsonApAreaSel = json.ApAreaSel;
					
					$("#wifiApAddr").val(jsonApAddr);
					$("#wifiApWpaSel").val(jsonApWpaSel);
					$("#wifiApMac").val(jsonApMac);
					$("#wifiApSsid").val(jsonApSsid);
					$("#wifiApPwd").val(jsonApPwd);
					$("#wifiApChannleSel").val(jsonApChannleSel);
					$("#wifiApAreaSel").val(jsonApAreaSel);
				}
            },
			
            error: function(e) {
                
            }
        })
    },
	//保存wifi信息
	setWifiInfo: function () {
        var json = {};
		json.Cmd=8001;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_NETWORK";
		
		json.ApAddr = $("#wifiApAddr").val();
		json.ApWpaSel = $("#wifiApWpaSel").val();
		json.ApMac = $("#wifiApMac").val();
		json.ApSsid = $("#wifiApSsid").val();
		json.ApPwd = $("#wifiApPwd").val();
		json.ApChannleSel = $("#wifiApChannleSel").val();
		json.ApAreaSel = $("#wifiApAreaSel").val();

		var jsonStr = JSON.stringify(json);
		console.log("jsonStr = %s \n", jsonStr);
		$.ajax({
			type: "put",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
			async: !1,
			processData: !1,
			data: jsonStr,
			beforeSend: function (xhr) {
			xhr.setRequestHeader("If-Modified-Since", 0);
			xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
		
			success: function(data) {
				var json = $.parseJSON(data);
				if(json.statusCode == 1)
				{
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('Success1'),
						timeout:1000
					});
				}
			},
		
			complete: function(t) {
            
			}
		})
	},
	
	//4G设置
	getF4gInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=8001;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_NETWORK";
						
		var jsonReqStr = JSON.stringify(jsonReq);
		
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.statusCode == 1)
				{
					var jsonEnable = json.Enable;
					var jsonUserName = json.UserName;
					var jsonPassword = json.Password;
					var jsonApn = json.Apn;
					var jsonDialCode = json.DialCode;
					
					if(0 == jsonEnable)
					{
						$("#F4gEnable").prop("checked", !1);
					}
					else
					{
						$("#F4gEnable").prop("checked", !0);
					}
					
					$("#f4GUserName").val(jsonUserName);
					$("#f4GPassword").val(jsonPassword);
					$("#f4GApn").val(jsonApn);
					$("#f4GDialCode").val(jsonDialCode);
				}
            },
			
            error: function(e) {
                
            }
        })
    },
	setF4gInfo: function () {
        var json = {};
		json.Cmd=8001;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_NETWORK";
		
		if($("#F4gEnable").prop("checked"))
			json.Enable = 1;
		else
			json.Enable = 0;
		
		json.UserName = $("#f4GUserName").val();
		json.Password = $("#f4GPassword").val();
		json.Apn = $("#f4GApn").val();
		json.DialCode = $("#f4GDialCode").val();
		
		var jsonStr = JSON.stringify(json);
		console.log("jsonStr = %s \n", jsonStr);
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
            async: !1,
            processData: !1,
			data: jsonStr,
		beforeSend: function (xhr) {
			xhr.setRequestHeader("If-Modified-Since", 0);
			xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
		},
		
		success: function(data) {
			var json = $.parseJSON(data);
			if(json.Ask == 0)
			{
				AMUI.dialog.tip({
					tip: g_oCommon.getNodeValue('Success1'),
					timeout:1000
				});
			}
		},
		
		complete: function(t) {
           
        }
		})
    },
	
	//CMS平台设置
	getCmsInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=7003;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_PLATFORM";
						
		var jsonReqStr = JSON.stringify(jsonReq);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					var jsonAuthEn = json.AutoAuth;
					var jsonEnabled = json.Enable;
					var jsonServerAddr1 = json.MainDomain;
					var jsonServerPort1 = json.MainPort;
					var jsonServerAddr2 = json.SubDomain;
					var jsonServerPort2 = json.SubPort;
					var jsonUserName = json.RegId;
					var jsonPassword = json.RegPwd;
					var jsonBeat = json.HeartBeat;
					var jsonConnectMode = json.ConnectMode;
					
					if(0 == jsonAuthEn)
					{
						$("#cmsAuthEn").prop("checked", !1);
					}
					else
					{
						$("#cmsAuthEn").prop("checked", !0);
					}
					
					if(0 == jsonEnabled)
					{
						$("#cmsEnabled").prop("checked", !1);
					}
					else
					{
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
			
            error: function(e) {
                
            }
        })
    },
	
	setCmsInfo: function () {
        var json = {};
		
		json.Cmd=7004;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_PLATFORM";

		if($("#cmsAuthEn").prop("checked"))
			json.AutoAuth = 1;
		else
			json.AutoAuth = 0;
		
		if($("#cmsEnabled").prop("checked"))
			json.Enable = 1;
		else
			json.Enable = 0;
		
		json.MainDomain = $("#cms1ServerAddr").val();
		json.MainPort = $("#cms1ServerPort").val();
		json.SubDomain = $("#cms2ServerAddr").val();
		json.SubPort = $("#cms2ServerPort").val();
		
		json.RegId = $("#cmsUserName").val();
		json.RegPwd = $("#cmsPassword").val();
		json.HeartBeat = $("#cmsBeat").val();
		json.ConnectMode = 30;
		
		var jsonStr = JSON.stringify(json);
		console.log("jsonStr = %s \n", jsonStr);
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
            async: !1,
            processData: !1,
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			
			success: function(data) {
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('Success1'),
						timeout:1000
					});	
				}
			},
			
			complete: function(t) {
				
			}
		
		})
    },
	//SIA设置
	getSiaInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=7011;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_SIA";
						
		var jsonReqStr = JSON.stringify(jsonReq);

        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					var jsonEnabled = json.Enable;
					var jsonServerAddr = json.Domain;
					var jsonServerPort = json.Port;
					var jsonUser = json.Account;
					var jsonPwd = json.Pwd;
					var jsonBeat = json.Beat;
					
					if(0 == jsonEnabled)
					{
						$("#siaEnabled").prop("checked", !1);
					}
					else
					{
						$("#siaEnabled").prop("checked", !0);
					}
					
					$("#siaServerAddr").val(jsonServerAddr);
					$("#siaServerPort").val(jsonServerPort);
					$("#siaUser").val(jsonUser);
					$("#siaBeat").val(jsonBeat);
				}
            },
			
            error: function(e) {
            }
        })
    },
	
	setSiaInfo: function () {
        var json = {};
		
		json.Cmd=7012;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_SIA";	
		
		if($("#siaEnabled").prop("checked"))
			json.Enable = 1;
		else
			json.Enable = 0;
		
		json.Domain = $("#siaServerAddr").val();
		json.Port = $("#siaServerPort").val();
		json.Account = $("#siaUser").val();
		json.Pwd = "123456";
		json.Beat = $("#siaBeat").val();
		
		var jsonStr = JSON.stringify(json);

		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
			async: !1,
			processData: !1,
			data: jsonStr,
		beforeSend: function (xhr) {
			xhr.setRequestHeader("If-Modified-Since", 0);
			xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
		},
		
		success: function(data) {
			var json = $.parseJSON(data);
			if(json.Ask == 0)
			{
				AMUI.dialog.tip({
					tip: g_oCommon.getNodeValue('Success1'),
					timeout:1000
				});	
			}
		},
		
		complete: function(t) {
            
        }
		
		})
    },
	//邮件设置
	getEmailInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=7007;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_EMAIL";
			
		var jsonReqStr = JSON.stringify(jsonReq);
			
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.statusCode == 1)
				{
					var jsonEnable = json.Enable;
					var jsonSsl = json.SSL;
					var jsonSmtpServer = json.Domain;
					var jsonSmtpPort = json.Port;
					var jsonUserName = json.SenderAccount;
					var jsonPassword = json.SenderPwd;
					var jsonReceiver = json.RecvicerAccount;
					
					if(0 == jsonSsl)
					{
						$("#chSsl").prop("checked", !1);
					}
					else
					{
						$("#chSsl").prop("checked", !0);
					}
					
					$("#SMTPServerAddress").val(jsonSmtpServer);
					$("#SMTPPort").val(jsonSmtpPort);
					$("#EmailUserName").val(jsonUserName);
					$("#Password").val(jsonPassword);
					$("#ReceiverName").val(jsonReceiver);
				}
            },
			
            error: function(e) {
                
            }
        })
    },
	setEmailInfo: function () {
		var json = {};
		
		json.Cmd=7008;
		json.Id="web";
		json.User=123;
		json.Def="JSON_DEV_SET_EMAIL";
		json.Enable = 1;
		
		if($("#chSsl").prop("checked"))
			json.SSL = 1;
		else
			json.SSL = 0;
		
		json.Domain = $("#SMTPServerAddress").val();
		json.Port = $("#SMTPPort").val();
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
                data: jsonStr,
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			
			success: function(data) {
				var json = $.parseJSON(data);
				if(json.statusCode == 1)
				{
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('Success1'),
						timeout:1000
					});	
				}
			},
			
			complete: function(t) {
                  
            }
		})
    },
	displayLastMsg: function(){
		if(!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
		{
			getLogList(5,'lTypeAlarm');
		}
	},
	syncMsg: function(){
		$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/syncMsgInfo",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
			},
			success: function (data) {
				var json = $.parseJSON(data);
				
				if(json.Ask==0){
					var eventNum = json.EventNum;
					
					if(!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
						$("#alarmInfoNum").text(eventNum);
				}
			},
			timeOut: function (data){
				alert("操作超时");
			}
		})
	},
}

var g_oNetworkSetting= new NetworkSetting();