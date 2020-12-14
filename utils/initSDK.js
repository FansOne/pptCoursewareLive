import TIM from 'tim-wx-sdk';
import COS from "cos-wx-sdk-v5";

import { addTIMEventListener } from './imApi.js'

class initSDK {
    constructor(options){
		this.tim = null; //即时通讯对象
		
        this.sdkAppId = options.sdkAppId;
        this.userId = options.userId; //用户昵称
        this.memberId = options.memberId; //用户id
        this.userSig = options.userSig;		
    }

    // 初始化IM SDK
    async initTIM(callback) {

        window.timInit = this.tim = TIM.create({ SDKAppID:this.sdkAppId });
		await addTIMEventListener()
		this._imLogin(callback)
    }

    // IM登录
    _imLogin(options) {
        this.tim.registerPlugin({'cos-wx-sdk': COS});
		
        let promise = this.tim.login({userID: this.memberId, userSig: this.userSig});

        promise.then(function(imResponse) {
            if (imResponse.data.repeatLogin === true) {
                // 标识账号已登录，本次登录操作为重复登录。v2.5.1 起支持
                // console.log(imResponse.data.errorInfo);
                return options.error('账号已登录，本次登录操作为重复登录');
            }
			options.success(imResponse.data)
        })
        .catch(function(imError) {
            options.error(imError);
        });
    }
}

export default initSDK