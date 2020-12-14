import TIM from 'tim-wx-sdk';
import Store from '../store/index.js'

// IM监听事件 事件列表 https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/module-EVENT.html
export const addTIMEventListener = function () {

    // SDK 进入 ready 状态
    window.timInit.on(TIM.EVENT.SDK_READY, function imReadyHandler(){
        // tim 已经准备好了
        Store.commit('SET_IM_IS_READY',true)
    });

    // SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息
    window.timInit.on(TIM.EVENT.MESSAGE_RECEIVED, function onMessageReceived(event){
		
		// 收到群文本消息
		if(event.data[0].type === TIM.TYPES.MSG_TEXT){
			Store.commit('SET_GROUP_MSG',JSON.parse(event.data[0].payload.text))
		}
		
		
		// 收到群自定义消息
		if(event.data[0].type === TIM.TYPES.MSG_CUSTOM){
			
			// 学生端接收到轮播切换事件监听
			if(event.data[0].payload.description === 'switchSwiper'){
				let msgInfo = JSON.parse(event.data[0].payload.data);
				Store.commit('SET_SWIPRE_INDEX',msgInfo.index)
			}
			
			// 教师发送图片监听
			if(event.data[0].payload.description === 'sedImg'){
				let msgInfo = JSON.parse(event.data[0].payload.data);
				Store.commit('SET_GROUP_MSG',msgInfo)
			}
			
			// 教师发送语音监听
			if(event.data[0].payload.description === 'sedVoice'){
				let msgInfo = JSON.parse(event.data[0].payload.data);
				Store.commit('SET_GROUP_MSG',msgInfo)
			}
			
			// 教师更新图片库监听
			if(event.data[0].payload.description === 'updateImgFileSwiper'){
				let msgInfo = JSON.parse(event.data[0].payload.data);
				Store.commit('SET_PPT_IMAGES_FILE',msgInfo.pptImages)
			}
			
			// 教师禁言/解除禁言监听
			if(event.data[0].payload.description === 'speakControl'){
				let status = event.data[0].payload.data;
								
				Store.commit('SET_ESTOPPEL_STATUS',status === 'true' ? 'On' : 'Off',)
			}
			
			// 教师关闭直播监听
			if(event.data[0].payload.description === 'closeLive'){
				Store.commit('SET_LIVING',2)
			}
		}
       
        // 收到群提示消息
        if(event.data[0].type === TIM.TYPES.MSG_GRP_TIP){
			
            //处理加群操作--有成员加群
            if(operationType === TIM.TYPES.GRP_TIP_MBR_JOIN){

            }
            //处理退群操作--有群成员退群
            else if(operationType === TIM.TYPES.GRP_TIP_MBR_QUIT){

            }
        }
        
    });

    // SDK 群组列表更新时触发
    window.timInit.on(TIM.EVENT.GROUP_LIST_UPDATED, function onGroupListUpdated(event){
        // console.log(event.data);
    });

    // 用户被踢下线时触发
    window.timInit.on(TIM.EVENT.KICKED_OUT, function onKickedOut(event){
        // console.log(event.data.type);
    });
}

// 发送群组文本消息
export const sendGroupTextMessage = function (msgObj,callback){
    let tim =  window.timInit;
    
    // 1. 创建群组文本消息
    let message = tim.createTextMessage({
        to: String(Store.state.LOGIN_INFO.roomId),
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
            text: JSON.stringify(msgObj)
        }
    })
    // 2. 发送消息
    let promise = tim.sendMessage(message);
    promise.then(function(imResponse) {
        // 发送成功
        callback && callback()
    }).catch(function(imError) {
        // 发送失败
        console.warn('群组文本消息发送失败:', imError);
        if(imError.code === 10017){
			throw new Error('禁言中，无法发送消息')
        }
    });
}

// 发送自定义消息
export const sendCustomMessage = function(type,options,callback){
    let tim =  window.timInit;
    let message = tim.createCustomMessage({
        to: type === 'group' ? String(Store.state.LOGIN_INFO.roomId) : options.toUserId,
        conversationType: type==='group' ? TIM.TYPES.CONV_GROUP : TIM.TYPES.CONV_C2C,
        
        payload: {
            data: JSON.stringify(options),
            description: options.description
        }
    });

    // 发送消息
    let promise = tim.sendMessage(message);
    promise.then(function(imResponse) {
        // 发送成功
        callback && callback(imResponse);
    }).catch(function(imError) {
        // 发送失败
        throw new Error('sendCustomMessage error:', imError);
    });
}

// 群组禁言/解除禁言
export const groupEstoppel = function(behavior, callbck) {
	uni.showLoading({ title: '状态设置中...' })
    // 1.调用 getGroupProfile 接口查看所在群组类型，确认是否支持禁言/取消禁言操作。
    let getGroupProfile =  window.timInit.getGroupProfile({
        groupID: Store.state.LOGIN_INFO.roomId,
        groupCustomFieldFilter: []
    });
    getGroupProfile.then(imResponse => {
        let groupData = imResponse.data.group;
        if (groupData.type != 'Private' && groupData.type != 'Work') {
            // 2.调用 getGroupMemberProfile 接口查看指定的 userID 在当前群的成员角色，确认是否有权限进行禁言/取消禁言操作。
            let userGroup = [Store.state.LOGIN_INFO.memberId];

            _checkIdentity(userGroup, userInfo => {
                let ordinaryDentity = TIM.TYPES.GRP_MBR_ROLE_MEMBER; //普通身份
                if (userInfo[0].role === ordinaryDentity) {
					uni.hideLoading()
					 uni.showToast({
						icon:'none',
						title:'抱歉 您无权进行此操作！仅群主或管理员可进行禁言控制！'
					 })
                } else {
                    _speechControlApi(behavior, callbck)
                }
            })

        } else {
			uni.showToast({
				icon:'none',
				title:'抱歉该群组暂不支持禁言操作'
			})
        }
    }).catch((imError) => {
        uni.hideLoading()
    });
}

const _checkIdentity = function(userID, callbck){
    let promise = window.timInit.getGroupMemberProfile({
        groupID: Store.state.LOGIN_INFO.roomId,
        userIDList: [...userID],
        memberCustomFieldFilter: [],
    });
    promise.then(function (imResponse) {
        callbck(imResponse.data.memberList);
    }).catch(function (imError) {
        console.warn('查看指定的 userID 在当前群的成员角色 error:', imError);
    });
}

const _speechControlApi = function(muteAllMembers, callbck) {
    let promise = window.timInit.updateGroupProfile({
        groupID: Store.state.LOGIN_INFO.roomId,
        muteAllMembers: muteAllMembers, // true 全体禁言，false 取消全体禁言
    });
    promise.then((imResponse) => {
        console.log(imResponse.data.group) // 修改成功后的群组详细资料
        // 禁言/取消禁言成功后创建自定义消息实例并发送通知给其他群成员
        _HinweisOtherMitglied(muteAllMembers, callbck)

    }).catch(function (imError) {
        console.warn('禁言失败 error:', imError); // 修改群组资料失败的相关信息
		uni.hideLoading()
    });
}

/**
 * 创建自定义消息并发送
 * muteAllMembers : true 禁言 false 取消禁言
 */
const _HinweisOtherMitglied = function(muteAllMembers, callbck) {
    let options = {
        to: Store.state.LOGIN_INFO.roomId,
        conversationType: TIM.TYPES.CONV_GROUP, //群组会话
        payload: {
            data: String(muteAllMembers), // muteAllMembers:true禁言 false取消禁言
            description:'speakControl'
        }
    };
    let message = window.timInit.createCustomMessage(options)

    let sendMsg = window.timInit.sendMessage(message);
    sendMsg.then((imResponse) => {
        // 发送成功
		uni.hideLoading()
        callbck(muteAllMembers)
    }).catch(function (imError) {
        // 发送失败
		uni.hideLoading()
        console.warn('sendMessage error:', imError);
    });
}