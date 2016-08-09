var Background = {
	USER_ID:null,
	CONST_URL:{
		0:'apitest.yourdream.cc',
		1:'local.yourdream.cc',
		2:'outertest.ichuanyi.com',
		3:'local.ichuanyi.com',
		4:'ichuanyi.com',
		5:'apitest.ichuanyi.com'
	},
	ENVIR_PARAMS:{
		"apitest":{
			keyword:'ichuanyi.com'
		},
		"outertest":{
			keyword:'ichuanyi.com'
		},
		"master":{
			keyword:'ichuanyi.com'
		}
	},
	init:function(){
		Background.instance	 = this;
		this.bindLoginSuccessMSG();
		this.bindActivatChanged();
		this.bindTabCreate();
		this.bindTabUpdate();
	},

	setOfflineIcon:function() {
		if(!Background.instance.USER_ID){
			chrome.browserAction.setIcon({path: '128-offline.png'});
		}
		else{
			chrome.browserAction.setIcon({path: '128.png'});
		}
	},

	getCookies:function(domain, name,callback) {
		chrome.cookies.getAll({},function (cookieArray) {
			for(var key in cookieArray){
				if(cookieArray[key].domain.indexOf(domain)>0
					|| domain.indexOf(cookieArray[key].domain)>0){
					if(cookieArray[key].name == name){
						Background.instance.USER_ID = cookieArray[key].value;
					}
				}
			}
			callback && callback();
		})
	},

	bindActivatChanged:function(){
		var that = this;
		chrome.tabs.onActivated.addListener(function(activeTab){
			that.judgeIsLogined(activeTab.tabId);
		});
	},

	bindLoginSuccessMSG:function(){
		var that = this;
		chrome.runtime.onMessage.addListener(function(res){
			if(res.msg == "LOGIN_REQUEST_SUCCESS"){
				// res.envir
				chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
					if(res.envir
						&& that.ENVIR_PARAMS[res.envir]
						&& that.ENVIR_PARAMS[res.envir].keyword){
						var urlKeyword = that.ENVIR_PARAMS[res.envir].keyword;
						if(arrayOfTabs[0].url.indexOf(urlKeyword)>0){
							chrome.tabs.reload(arrayOfTabs[0].id,{},function(){});
						}
					}
				});
				chrome.browserAction.setIcon({path: '128.png'});
			}
		})		
	},

	bindTabCreate:function(){
		chrome.tabs.onCreated.addListener(function(tab){
		})
	},

	bindTabUpdate:function(){
		var that = this;
		chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
			if(changeInfo.status
				&& changeInfo.status == 'complete'){
				that.judgeIsLogined(tabId);
			}
		})
	},

	judgeIsLogined:function(tabId){
		var that = this;
		chrome.tabs.get(tabId,function (tabObj) {
			that.USER_ID = null;
			var currentUrl = tabObj.url;
			var isCYZSDomain = false,
				domain = '';
			for(var key in that.CONST_URL){
				if(currentUrl.indexOf(that.CONST_URL[key])>0){
					isCYZSDomain = true;
					domain = Background.instance.CONST_URL[key];
				}
			}
			if(isCYZSDomain){
				that.getCookies(domain,"_userId",Background.instance.setOfflineIcon);
			}
		})
	}
};
Background.instance = null;
Background.init();