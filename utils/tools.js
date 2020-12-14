import Store from '../store/index.js'

/**
 * 统一消息数据格式处理
 * @param { Object }event 包含input键入值及绑定在DOM节点中的自定义值eg：data-xxx
 * @param { Object }studentAskInfo 学生提问信息内容
 * */
export const msgformatManage = function(event, studentAskInfo = {}) {
	let type = event.target.dataset.msgtype || event.currentTarget.dataset.msgtype; // 聊天:0 ;问：1 ;答：2 ;语音：3 ;图片：4
	let identity = Store.state.LOGIN_INFO.identity
	let params = {
		'identity': identity,
		'from': Store.state.LOGIN_INFO.nickname,
		'avatar': Store.state.LOGIN_INFO.avatar
	};

	if (identity === 'teacher') {

		params['type'] = Number(type)

		if (type !== 3 && type !== 4) params['message'] = event.detail.value;

		// 定义回复学生问题消息格式
		if (Object.keys(studentAskInfo).length) params['askMessage'] = studentAskInfo.message, params['askUserId'] =
			studentAskInfo.from;


	} else if (identity === 'student') {
		event.target.dataset.studentask ? params['type'] = 1 : params['type'] = type,
			params['message'] = event.detail.value
	}

	return params
}

//函数节流
export const throttle = function(fn, interval) {
	var enterTime = 0; //触发的时间
	var gapTime = interval || 3000; //间隔时间
	return function() {
		var context = this;
		var backTime = new Date();
		if (backTime - enterTime > gapTime) {
			fn.call(context, arguments);
			enterTime = backTime;
		}
	};
}


// 时间戳转换剩余时分秒

export const SurplusDateConversion = function(timeStamp) {
	var currentTimeStamp = new Date().getTime();

	var SurplusTimeStamp = timeStamp - currentTimeStamp;

	var hours = parseInt((SurplusTimeStamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = parseInt((SurplusTimeStamp % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = (SurplusTimeStamp % (1000 * 60)) / 1000;
	
	return {
		hour:hours,
		minute:minutes,
		second:seconds
	}
}
