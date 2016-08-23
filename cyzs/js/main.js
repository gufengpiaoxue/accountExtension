var account = {
	ENVIR_PARAMS:{
		"apitest":{
			url:'http://apitest.ichuanyi.com'
		},
		"outertest":{
			url:'http://outertest.ichuanyi.com'
		},
		"master":{
			url:'http://ichuanyi.com'
		}
	},
	init:function(){
		this.bindSubmitClick();
		this.renderCurrentUrl();
	},

	bindSubmitClick:function(){
		var that = this;
		$("#js_login_btn").bind('click',function() {
			var envir = $(".radio input[type='radio']:checked").val();
			if(that.ENVIR_PARAMS[envir]){
				var id = $("#js_account_id").val(),
					pwd = $("#js_account_pwd").val();
				if(id && pwd){
					var baseUrl = that.ENVIR_PARAMS[envir].url;
					that.sendLoginRequest(baseUrl,envir,id,pwd);	
				}
				else{
					$(".js_warn").show().html('账号！密码！');
				}
			}
		});

		$("#js_grab_tb").bind('click',function() {
			var envir = $(".radio input[type='radio']:checked").val();
			var baseUrl = that.ENVIR_PARAMS[envir].url;
			chrome.tabs.getSelected(null, function(tab) {
				var currentTabUrl = tab.url,platform;
				if(currentTabUrl.indexOf('taobao') > -1){
					platform = '1';
				}else if(currentTabUrl.indexOf('tmall') > -1){
					platform = '2';
				}
				if(platform){
					var id = that.getQueryString(currentTabUrl,'id');
					chrome.tabs.create({
						url:baseUrl+'/admin.php?method=shoppingguide.doAddGoods?thirdPartyGoodsId='+id+'&platform='+platform
					});
				}
			});
		});
	},

	sendLoginRequest:function(baseUrl,envir,id,pwd){
		var shouldReload = $("#js_should_reload").prop('checked');
		var that = this;
		var url = baseUrl+"/index.php?method=user.doLogin&username="+id+"&password="+pwd;
		var xhr = new XMLHttpRequest();
	    xhr.open("GET", url, true);
	    xhr.onreadystatechange = function() {
	        if (xhr.readyState == 4) {
	        	if(xhr.status == 200){
	        		var opt = {
						msg:"LOGIN_REQUEST_SUCCESS"
	        		};
	        		if(shouldReload){
	        			opt.envir = envir;
	        		}
					chrome.runtime.sendMessage(opt,{}, function (){
						window.close();
					})
	        	}
	        }
	    }
	    xhr.send();
	},

	getCurrentTabid:function (argument) {
		chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
		    return arrayOfTabs[0].id;
		 });
	},

	renderCurrentUrl:function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
			$("#js_qrcode_container").qrcode({
	            width       : 180,     //设置宽度
	            height      : 180,     //设置高度
	            typeNumber  : -1,      //计算模式
	            background  : "#ffffff",//背景颜色
	            foreground  : "#555555", //前景颜色
	            correctLevel: 3,
	            text : arrayOfTabs[0].url
	        }); 
		});
	},
	getQueryString:function(url,name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = url.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}
}

account.init();