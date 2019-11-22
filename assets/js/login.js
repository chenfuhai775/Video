
function Login() {
    this._lxdLogin = null;  //Login.xml
}

Login.prototype = {
	//字符串长度判断函数
    _judgeTextLength: function (szString) {
		var iLength = 0;   
		for(var i = 0; i < szString.length; i++) {   
			if(szString.charCodeAt(i) > 255) {   
				iLength+=2;   
			} else {   
				iLength+=1;   
			}        
		}   
		return  iLength;	
	},
	//事件绑定函数
	_loginEventBind: function () {
		var that = this;
		//回车事件
		$("body").bind({
			keydown: function (e) {
				if(e.keyCode === 13) {
					that.doLogin(); 
				}	    
			}
		}); 	
	},
	//登录页面初始化函数
	initLogin: function () {
		var strUsername, strPassword, strLoginLog, strSubLoginLog;
		var szLanguage = $.cookie("language");
		//如果直接到登录界面，也获取一下语言
		console.log("navigator.appName = %s szLanguage = %s\n", navigator.appName, szLanguage);
		if (szLanguage === null) {
			if (navigator.appName === "Netscape" || navigator.appName === "Opera") {
				var sysLanguage = navigator.language.toLowerCase();
			} else {
				var sysLanguage = navigator.browserLanguage.toLowerCase();
			}
			console.log("sysLanguage = %s\n", sysLanguage);
			var szLanguage = sysLanguage.substring(0, 2);
			console.log("szLanguage = %s\n", szLanguage);
			if(szLanguage == "zh") {  //中文需要区分简体和繁体
				var arSysLan = sysLanguage.split("-");
				if (arSysLan.length === 2) {
					szLanguage = arSysLan[0].toLowerCase() + "_" + arSysLan[1].toUpperCase();
					if(arSysLan[1].toLowerCase() === "cn") {
						$.cookie('language', 'zh');
						szLanguage = "zh";
					} else {
						$.cookie('language', szLanguage);
					}
				}
			} else {
				$.cookie('language', szLanguage);
			}
		}
		
		translator.initLanguageSelect(szLanguage);
		this._lxdLogin = translator.getLanguageXmlDoc("Login");
		translator.translatePage(this._lxdLogin, document);
		strSystemTitle = translator.translateNode(this._lxdLogin, "laSystemTitle");
		strUsername = translator.translateNode(this._lxdLogin, "laUsername");
		strPassword = translator.translateNode(this._lxdLogin, "laPassword");
		strBtnLogin = translator.translateNode(this._lxdLogin, "laBtnLogin");
		
		$(document).find('input').each(function(i) {
			if($(this).attr('name') == "loginUserName")
				$(this).attr('placeholder', strUsername);
			else if($(this).attr('name') == "loginPassword")
				$(this).attr('placeholder', strPassword);
		});
		$("#SysTitle").text(strSystemTitle);
		$("#BtnLogin").text(strBtnLogin);
		//jquery无法对title赋值
		document.title = translator.translateNode(this._lxdLogin, "laSystemTitle");	
		if (!(document.cookie || navigator.cookieEnabled)) {
			alert(translator.translateNode(this._lxdLogin, "CookieTips"));
			return;
		}
		$("#loginUserName").focus();
		$("#loginUserName").val("");
		this._loginEventBind();	
	},
	//登录函数
	doLogin: function () {
		var that = this;
		// //用户名为空时提示
		// if($("#loginUserName").val().length == 0) {
		// 	document.getElementById("msgError").style.display="block";
		// 	var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";
		// 	szTipsInfo += g_oCommon.getNodeValue("LoginTips1");
		// 	$("#msgError").html(szTipsInfo);
		// 	$("#loginUserName").focus();
		// 	setTimeout(function(){
		// 		document.getElementById("msgError").style.display="none";
		// 	}, 5000 );
		// 	return false;
		// }
		// if(this._judgeTextLength($("#loginUserName").val()) > 16) {
		// 	document.getElementById("msgError").style.display="block";
		// 	var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";
		// 	szTipsInfo += g_oCommon.getNodeValue("LoginTips2");
		// 	$("#msgError").html(szTipsInfo);
		// 	$("#loginUserName").focus();
		// 	setTimeout(function(){
		// 		document.getElementById("msgError").style.display="none";
		// 	}, 5000 );
		// 	return false;
		// }
		// if(this._judgeTextLength($("#loginPassword").val()) > 16) {
		// 	document.getElementById("msgError").style.display="block";
		// 	var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";
		// 	szTipsInfo += g_oCommon.getNodeValue("LoginTips3");
		// 	$("#msgError").html(szTipsInfo);
		// 	$("#loginPassword").focus();
		// 	setTimeout(function(){
		// 		document.getElementById("msgError").style.display="none";
		// 	}, 5000 );
		// 	return false;
		// }

		g_oCommon.m_szUserPwdValue = Base64.encode($("#loginUserName").val() + ":" + $("#loginPassword").val());
		$.ajax({
			type: "get",
			url: "userCheck",
			async: !0,
			timeout: 15000,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data){
				var statusCode = $.parseJSON(data).statusCode;
				if(statusCode==1){
					var szUrl = decodeURI(document.URL);
					if(szUrl.indexOf("?page=") != -1) {
						var szPage = szUrl.substring(szUrl.indexOf("page=") + 5, szUrl.indexOf("&params="));
						if(szPage.indexOf(".html") == -1) {
							szPage = szPage.concat(".html");
						}
						var szParam = szUrl.substring(szUrl.indexOf("&params=") + 8, szUrl.length);
						$.cookie("page", szPage + "?" + szParam + "%1");
					} else {
						$.cookie("page", null);
					}
					$.cookie("userInfo" + g_oCommon.m_lHttpPort, g_oCommon.m_szUserPwdValue);
					$.cookie('MsgInfoIndex', 0);
					$.cookie('SysTimeCompare', 1);
					$.cookie("userName",$("#loginUserName").val());
					window.location.href = "index.html";
				} else {
					document.getElementById("msgError").style.display="block";
					var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";		
					szTipsInfo += g_oCommon.getNodeValue("LoginTips4"); 
					$("#msgError").html(szTipsInfo); 
					$("#loginUserName").focus();
					$("#loginUserName").val("");
					$("#loginPassword").val("");
					setTimeout(function(){
						document.getElementById("msgError").style.display="none";
					}, 5000 );
					return false;					
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				if("timeout" == textStatus) {
					document.getElementById("msgError").style.display="block";
					var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";		
					szTipsInfo += g_oCommon.getNodeValue("ConnectTimeoutTips"); 
					$("#msgError").html(szTipsInfo); 
					setTimeout(function(){
						document.getElementById("msgError").style.display="none";
					}, 5000 );
					return false;				
				} else {
					document.getElementById("msgError").style.display="block";
					var szTipsInfo = "<span class='am-icon-minus-circle am-text-danger'></span>&nbsp;";		
					szTipsInfo += g_oCommon.getNodeValue("NetworkErrorTips"); 
					$("#msgError").html(szTipsInfo); 
					setTimeout(function(){
						document.getElementById("msgError").style.display="none";
					}, 5000 );
					return false;
				}
			}
		});	
	},
	//语言切换函数
	changeFrameLanguage: function (lan) {
		var strUsername, strPassword, strLoginLog, strSubLoginLog;
		$.cookie("language", lan);
		this._lxdLogin = translator.getLanguageXmlDoc("Login", lan);
		translator.translatePage(this._lxdLogin, document);
		strSystemTitle = translator.translateNode(this._lxdLogin, "laSystemTitle");
		strUsername = translator.translateNode(this._lxdLogin, "laUsername");
		strPassword = translator.translateNode(this._lxdLogin, "laPassword");
		strBtnLogin = translator.translateNode(this._lxdLogin, "laBtnLogin");
		$(document).find('input').each(function(i) {
			if($(this).attr('name') == "loginUserName")
				$(this).attr('placeholder', strUsername);
			else if($(this).attr('name') == "loginPassword")
				$(this).attr('placeholder', strPassword);
		});
		$("#SysTitle").text(strSystemTitle);
		$("#BtnLogin").text(strBtnLogin);
		document.title = translator.translateNode(this._lxdLogin, "laPageTitle");	
	}
}

var g_oLogin = new Login();