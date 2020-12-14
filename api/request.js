
function base_request (url, data,localHost = false,method = 'GET',header = {'content-type': 'application/json'})  {
	const BASE_URL = window.SITE_CONFIG['BASE_URL'];
	let token = uni.getStorageSync('token');
	if (token) header['token'] = token
	
    return new Promise((resolve,reject)=>{
		uni.showLoading({
			title:"加载中..."
		})
		uni.request({
		    method,
		    data,
		    // url: localHost ? localHost + url : BASE_URL + url, 
		    url: '/api' + url, 
		    header,
			success(res) {
				let { data } = res;
				if(data.code === 0){
					resolve(data)
				}else{
					reject(data)
				}
			},
			fail(err) {
				reject(err)
			},
			complete(res) {
				uni.hideLoading()
				let { data } = res;
				if(data.code !== 0){
					uni.showToast({
						title:data.msg || "数据异常",
						icon:'none'
					})
				}
			}
		})
	})
}

function postReq(url, data,localHost) {
    return base_request(url, data, localHost,'POST');
}

function getReq(url, data,localHost) {
    return base_request(url, data,localHost);
}

function putReq(url, data,localHost) {
    return base_request(url, data,localHost,'PUT');
}

export default {
    postReq,
    getReq,
	putReq
}