import BASE from '../request.js';

var localHost = 'http://192.168.0.19:8087/api';

export default{
	// 腾讯云存储获取签名
	cosKey() {
		return BASE.getReq('/oss/tencent/getCredential', { path:'h5pptlive/upload/' })
	},
	// 更新图片库资料
	updateImgFile(data) {
		return BASE.postReq('/product/lesson/updateLessonForImages',data)
	},
	
	// 结束直播
	closeLive(data) {
		return BASE.putReq('/product/lesson/endLive',data)
	},
}