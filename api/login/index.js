import BASE from '../request.js';

var localHost = 'http://192.168.0.19:8087/api';

export default{
	
	// 讲师登录
	loginTeacher(data) {
		return BASE.getReq('/live/loginByCode', data)
	},
	
	//学生登录
	loginStudent(data){
		return BASE.getReq('/live/goToStudy', data)
	}
}