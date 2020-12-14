import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const Store = new Vuex.Store({
    // 初始 state 对象
    state:{
        IM_IS_READY:false,
		LOGIN_INFO:null,
		GROUP_MSG:[
			// {
			// 	message:'',
			// 	type:0, // 聊天:0 问：1 答：2 语音：3 图片：4
			// 	identity: '',
			// 	from: '',
			// 	avatar:'',
			// }
		],
		SWIPRE_INDEX: 0, //学生端同步教师轮播索引
		LIVING:2,// 直播状态 1:直播中 2:已经结束 3:未开始
		
		PPT_IMAGES_FILE:[],
		
		ESTOPPEL_STATUS:'', //学生更新禁言状态 Off:未禁言 On:禁言
    },
	
    mutations:{
        SET_IM_IS_READY(state,options) {
			state.IM_IS_READY = options
        },
		SET_LOGIN_INFO(state,options) {
			state.LOGIN_INFO = options
        },
		SET_GROUP_MSG(state,options) {
			state.GROUP_MSG.push(options)
        },
		SET_SWIPRE_INDEX(state,options) {
			state.SWIPRE_INDEX = options
        },
		SET_LIVING(state,options) {
			state.LIVING = options
        },
		SET_PPT_IMAGES_FILE(state,options) {
			state.PPT_IMAGES_FILE = options
        },
		SET_ESTOPPEL_STATUS(state,options) {
			state.ESTOPPEL_STATUS = options
        },
    }
})

export default Store