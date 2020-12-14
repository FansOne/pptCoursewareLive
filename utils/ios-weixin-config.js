
  (function() {
  	"use strict";

  	var MyWxApi = "https://xxx.com/api/wx/mp/jsapi/signature"; //JsSDK签名
  	var MyWxDown = "https://xxx.com/api/wx/mp/jsapi/mediaDownload"; //素材下载
  

  	//Install Begin
  	window.OnRecordAppInstalled = window.IOS_Weixin_RecordApp_Config = function() {
  		console.log("ios-weixin-config install");

  		window.IOS_Weixin_RecordApp_Config = null;

  		var App = RecordApp;
  		var platform = App.Platforms.Weixin;
  		var config = platform.Config;

  		var win = window.top; //微信JsSDK让顶层去加载，免得iframe各种麻烦


  		/*********实现app.js内IOS-Weixin中Config的接口*************/
  		config.Enable = function(call) {
  			//是否启用微信支持，默认启用，如果要禁用就回调call(false)
  			call(true);
  		};
  		config.WxReady = function(call) {
  			//此方法已实现在微信JsSDK wx.config好后调用call(wx,err)函数
  			//微信JsSDK wx.config需使用到后端接口进行签名，文档： https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html 阅读：通过config接口注入权限验证配置、附录1-JS-SDK使用权限签名算法
  			if (!win.WxReady) {
  				win.eval("var InitJsSDK=" + InitJsSDK.toString() + ";InitJsSDK")(App, MyWxApi, ajax);
  			};

  			win.WxReady(call);
  		};
  		config.DownWxMedia = function(param, success, fail) {

  			ajax(MyWxDown, {
  				action: "wxdown",
  				mediaID: param.mediaId,
  				transform_mediaIds: param.transform_mediaIds,
  				transform_type: param.transform_type,
  				transform_bitRate: param.transform_bitRate,
  				transform_sampleRate: param.transform_sampleRate
  			}, function(data) {
				let result = {
					mime:"audio/amr",
					duration:0,
					data:JSON.parse(data.data).data64 //未转码 (直接返回amr base64格式 )
				};
  				success(result);
  			}, function(msg) {
  				fail("下载音频失败：" + msg);
  			});
  		};
  		/*********接口实现END*************/



  		//ajax
  		var ajax = function(url, data, True, False) {
  			var xhr = new XMLHttpRequest();
  			xhr.timeout = 20000;
			
  			if(data.action === 'sign') xhr.open("GET", `${url}?action=${data.action}&url=${data.url}`);
			else if(data.action === 'wxdown') xhr.open("GET", `${url}/${data.mediaID}`);
			
  			xhr.onreadystatechange = function() {
  				if (xhr.readyState == 4) {
  					if (xhr.status == 200) {
  						var o = JSON.parse(xhr.responseText);
  						if (o.c) {
  							False(o.m);
  							return;
  						};
  						True(o);
  					} else {
  						False("请求失败[" + xhr.status + "]");
  					}
  				}
  			};
  			var arr = [];
  			for (var k in data) {
  				arr.push(k + "=" + encodeURIComponent(data[k]));
  			};
  			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  			xhr.send(arr.join("&"));
  		};



  		/*********JsSDK*************/
  		var InitJsSDK = function(App, MyWxApi, ajax) {
			console.log('before init JsSDK')
  			var wxOjbK = function(call) {
  				if (errMsg) {
  					call(null, errMsg);
  					return;
  				};

  				wxConfig(function() {
  					call(wx);
  				}, function(msg) {
  					call(wx, "请求微信接口失败: " + msg);
  				});
  			};

  			//微信环境准备完毕
  			window.WxReady = function(call) {
				console.log('微信环境准备完毕')
  				if (isReady) {
  					wxOjbK(call);
  				} else {
  					calls.push(call);
  				};
  			};
  			var isReady = false;
  			var calls = [];
  			var errMsg = "";

  			var jsEnd = function() {
  				isReady = true;
  				var arr = calls;
  				calls = [];
  				for (var i = 0; i < arr.length; i++) {
  					wxOjbK(arr[i]);
  				};
  			};
  			App.Js([{
  				url: "https://res.wx.qq.com/open/js/jweixin-1.6.0.js",
  				check: function() {
  					return !window.wx || !wx.config
  				}
  			}], function() {
  				console.log("weixin jssdk加载好了");
  				jsEnd();
  			}, function(msg) {
  				errMsg = "加载微信JsSDK失败，请刷新页面：" + msg;
  				console.error("weixin jssdk加载失败:" + msg);
  				jsEnd();
  			}, window);



  			//等等完成签名
  			var wxConfigStatus = 0;
  			var wxConfigErr = "";
  			var wxConfigCalls = [];
  			var wxConfig = function(True, False) {
  				if (wxConfigStatus == 6) {
  					True();
  					return;
  				} else if (wxConfigStatus == 5) {
  					False(wxConfigErr);
  					return;
  				};
  				wxConfigCalls.push({
  					t: True,
  					f: False
  				});
  				var end = function(err) {
  					if (wxConfigStatus < 5) {
  						wxConfigErr = err ? "微信config失败，请刷新页面重试：" + err : "";
  						wxConfigStatus = err ? 5 : 6;
  						for (var i = 0; i < wxConfigCalls.length; i++) {
  							var o = wxConfigCalls[i];
  							if (err) {
  								o.f(wxConfigErr);
  							} else {
  								o.t();
  							};
  						};
  					};
  				};
  				if (wxConfigStatus != 0) {
  					return;
  				};
  				wxConfigStatus = 1;

  				var config = function(data) {
  					wx.config({
  						appId: data.appId,
  						timestamp: data.timestamp,
  						nonceStr: data.nonceStr,
  						signature: data.signature,
						jsApiList: ["getLocation","startRecord","stopRecord","onVoiceRecordEnd","playVoice","pauseVoice","stopVoice","onVoicePlayEnd","uploadVoice","downloadVoice"]
  					});
  					wx.error(function(res) {
  						console.error("wx.config", res);
  						end(res.errMsg);
  					});
  					wx.ready(function() {
  						console.log("微信JsSDK签名配置完成");
  						end();
  					});
  				};
				
  				ajax(MyWxApi, {
  					action: "sign",
  					url: encodeURIComponent(location.href.split('#')[0])
  				}, function(data) {
  					config(data.data);
  				}, end);
  			};
  		};

  	};
  	//Install End


  	//如果已加载RecordApp，手动进行触发
  	if (window.RecordApp) {
  		OnRecordAppInstalled();
  	};

  })();
