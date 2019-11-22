function UsersManage() {
    this._lxdUsersManage = null;  //UsersManage.xml
}
UsersManage.prototype = {
	
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		////getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdUsersManage = translator.getLanguageXmlDoc("UsersManage");
		translator.translatePage(this._lxdUsersManage, document);
		this.getUserList();
		g_oUsersManage.syncMsg();
		setInterval("g_oUsersManage.syncMsg()", 2000);
	},
	getUserList: function(){
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getUserList",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s\n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var json = $.parseJSON(data);
					var userNum = json.UserNum;
					var index,userName,userStatus,indexReal;
					var TableList = "";
					for(index=0; userNum>index; index++){
						userNo = json.item[index].Index;						
						userName = json.item[index].UserName;
						userStatus = json.item[index].UserStatus;
                        TableList +=" <tr>";
                        TableList +="     <td>"+userNo+"</td>";
                        TableList +="     <td>"+userName+"</td>";
                        TableList +="     <td>"+g_oCommon.getNodeValue(userStatus)+"</td>";
                        TableList +="     <td>";
                        TableList +="		<div class='am-btn-toolbar'>";
                        TableList +="			<div class='am-btn-group am-btn-group-sm'>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary' onclick='g_oUsersManage.editUser(\""+userNo+"\")'><span class='am-icon-pencil-square-o'></span> "+g_oCommon.getNodeValue('btnEdit')+"</button>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-danger' onclick='g_oUsersManage.delUser(\""+userNo+"\")'><span class='am-icon-trash-o'></span> "+g_oCommon.getNodeValue('btnDel')+"</button>";
                        TableList +="     		</div>";
                        TableList +="       </div>";
                        TableList +="     </td>";
                        TableList +=" </tr>"; 
					};
					document.getElementById("userList").innerHTML = TableList;
				}
			},
			timeOut: function (data){
				asert("请求数据超时");
			}
		})
    },
	
	outputModalHtml:function(modalID){
		
		var modalTitle = "";
		if(modalID == "addUser"){
			modalTitle = g_oCommon.getNodeValue('laUserAdd');
		}
		else if(modalID == "editUser"){
			modalTitle = g_oCommon.getNodeValue('laUserEdit');
		}
		document.getElementById('modalContent').innerHTML = "";
		var modalContentHtml = ""
		modalContentHtml += "<div class='am-modal am-modal-prompt' tabindex='-1' id="+modalID+">";
		modalContentHtml += "	<div class='am-modal-dialog'>";
		modalContentHtml += "		<form class='am-form am-form-horizontal' id='saveUserInfo'>";
		modalContentHtml += "		<div class='am-modal-hd'>"+modalTitle+"<a href='javascript: void(0)' class='am-close am-close-spin' data-am-modal-close>&times;</a></div>";
		modalContentHtml += "		<div class='am-modal-bd am-text-left' id='bodyContent'>";
		modalContentHtml += "		    <legend>"+g_oCommon.getNodeValue('laUserInfo')+"</legend>";
		modalContentHtml += "			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laUserName')+"</label>";
		modalContentHtml +="				<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="					<input type='text' id='UserName1'>";
		modalContentHtml +="					<small id='UserNametips' class='formtips'></small>";
		modalContentHtml +="				</div>";
		modalContentHtml += "			</div>";
		modalContentHtml += "			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laUserPsw')+"</label>";
		modalContentHtml +="				<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="					<input type='text' id='UserPsw'>";
		modalContentHtml +="				</div>";
		modalContentHtml += "			</div>";
		modalContentHtml += "			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laCheckPsw')+"</label>";
		modalContentHtml +="				<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="					<input type='text' id='UserPswConfirm'>";
		modalContentHtml +="					<small id='UserPswtips' class='formtips'></small>";
		modalContentHtml +="				</div>";
		modalContentHtml += "			</div>";
		modalContentHtml +="			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laUserStatus')+"</label>";
		modalContentHtml +="					<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="						<select id='UserStatus' name='UserStatus'>";
		modalContentHtml +="							 <option value='0'>"+g_oCommon.getNodeValue('aEnable')+"</option>";
		modalContentHtml +="							 <option value='1'>"+g_oCommon.getNodeValue('aDisable')+"</option>";
		modalContentHtml +="						</select>";
		modalContentHtml +="					</div>";
		modalContentHtml +="			</div>";
		modalContentHtml +="			</div>"
		modalContentHtml += "		<div class='am-modal-footer'>";
		modalContentHtml += "			<span class='am-modal-btn' data-am-modal-cancel>"+g_oCommon.getNodeValue('btnCancel')+"</span>";
		modalContentHtml += "			<span class='am-modal-btn' data-am-modal-confirm>"+g_oCommon.getNodeValue('btnConfirm')+"</span>";
		modalContentHtml += "		</div>";
		modalContentHtml += "		</form>";
		modalContentHtml += "	<div>";
		modalContentHtml += "<div>";		
		document.getElementById('modalContent').innerHTML = modalContentHtml;
		
	},
	
	addUser:function(){
		var that = this;
		that.outputModalHtml("addUser");
		$('#addUser').modal({
			relatedTarget: this,
			width: 600,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				$(".formtips").html("");
				if (!checkNameAndLength($("#UserName1").val(), "UserNametips", "laUserName", 0 ,16)) return;
				if($("#UserPsw").val() != $("#UserPswConfirm").val()) {
					$("#UserPsw").focus();
					$("#UserPsw").val("");
					$("#UserPswConfirm").val("");
					var szTipsInfo = "<span class='am-icon-times'></span>&nbsp;";					
					szTipsInfo += g_oCommon.getNodeValue("aPswErr"); 
					$("#UserPswtips").html(szTipsInfo); 
					return false;
				}
				//保存新用户信息
				var json = {};
					json.UserName = $("#UserName1").val();
					json.UserPwd = $("#UserPsw").val();
					json.UserStatus = $("#UserStatus").val();
				var jsonStr = JSON.stringify(json);
				$.ajax({
					type: "put",
					url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/newUser",
					timeout: 15e3,
					async: !1,
					processData: !1,
					data: jsonStr,
					beforeSend: function (xhr) {
						xhr.setRequestHeader("If-Modified-Since", 0);
						xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
					},
					success: function(data) {
						var json_rcv = $.parseJSON(data);
						if(json_rcv.statusCode == 1)
						{	
							AMUI.dialog.tip({
								tip: g_oCommon.getNodeValue('aAddOk'),
								timeout:1000
							});
							$('#addUser').modal('close');
						}
						else{
							AMUI.dialog.tip({
								tip: g_oCommon.getNodeValue('aAddFailed'),
								timeout:1000
							});
						}
							
					},
					complete: function(t) {
					}
				})
			},
            onCancel: function(e) {
				this.close();
            }
		}); 
	},
	
	editUser:function(userNo){
		var that = this;
		that.outputModalHtml("editUser");
		$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getUserInfo?UserNo="+userNo+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
			},

			success: function (data) {
				console.log("data = %s \n", data);
				var json = $.parseJSON(data);	
				if(json.statusCode == 1){
					var jsonUserName = json.UserName;
					var jsonUserStatus = json.UserStatus;
					var jsonUserPwd = json.UserPwd;
					$("#UserName1").val(jsonUserName);
					$("#UserPsw").val(jsonUserPwd);
					$("#UserPswConfirm").val(jsonUserPwd);
					$("#UserStatus").find("option[value="+jsonUserStatus+"]").attr("selected",true);
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
		$('#editUser').modal({
			relatedTarget: this,
			width: 600,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				$(".formtips").html("");
				if (!checkNameAndLength($("#UserName1").val(), "UserNametips", "laUserName", 0 ,16)) return;
				if($("#UserPsw").val() != $("#UserPswConfirm").val()) {
					$("#UserPsw").focus();
					$("#UserPsw").val("");
					$("#UserPswConfirm").val("");
					var szTipsInfo = "<span class='am-icon-times'></span>&nbsp;";					
					szTipsInfo += g_oCommon.getNodeValue("aPswErr"); 
					$("#UserPswtips").html(szTipsInfo); 
					return false;
				}
				
				//保存用户信息
				var json = {};
					json.UserNo = userNo;
					json.UserName = $("#UserName1").val();
					json.UserPwd = $("#UserPsw").val();
					json.UserStatus = $("#UserStatus").val();
					
				var jsonStr = JSON.stringify(json);
				$.ajax({
					type: "put",
					url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/editUserInfo"+"?&",
					timeout: 15e3,
					async: !1,
					processData: !1,
					data: jsonStr,
					beforeSend: function (xhr) {
						xhr.setRequestHeader("If-Modified-Since", 0);
						xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
					},
					
					success: function(data) {
						var json_rcv = $.parseJSON(data);
						if(json_rcv.statusCode == 1)
						{	
							AMUI.dialog.tip({
								tip: g_oCommon.getNodeValue('aEditOk'),
								timeout:1000
							});
							$('#editUser').modal('close');
						}
						else
							AMUI.dialog.tip({
								tip: g_oCommon.getNodeValue('aEditFailed'),
								timeout:1000
							});
					},
					
				})
				
			},
            onCancel: function(e) {
				
				this.close();
				
            }
		}); 
	},
	
	//删除用户
	delUser:function (UserNo){
		var that = this;
		AMUI.dialog.confirm({
		  title: translator.translateNode(this._lxdUsersManage, "dialogTitle"),
		  content: translator.translateNode(this._lxdUsersManage, "dialogContent1"),
		  btnConfirm: translator.translateNode(this._lxdUsersManage, "btnConfirm"),
		  btnCancel: translator.translateNode(this._lxdUsersManage, "btnCancel"),
		  onConfirm: function() {
			console.log('onConfirm');
			$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/userDel?UserNo="+userNo+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
				},
				success: function (data) {
					var json = $.parseJSON(data);	
					if(json.statusCode == 1){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DelOk'),
							timeout:1000
						});
						//重新加载区域列表
						that.getUserList();
					}
					else{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DelFailed'),
							timeout:1000
						});
					}
				},

				timeOut: function (data){
					alert("请求数据超时");
				}
			})
			
		  },
		  onCancel: function() {
			console.log('onCancel')
		  }
		});
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

var g_oUsersManage= new UsersManage();