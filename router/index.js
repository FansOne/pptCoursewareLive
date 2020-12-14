import Vue from 'vue'
import Router from 'uni-simple-router';
Vue.use(Router);

// uniapp-router & vue-router 结合模式
const router = new Router({
	h5: {
		useUniConfig: true,
		loading: true,
		resetStyle: () => {
			return {
				style: `
					#router-loadding .loadding {
						background-color: #f00 !important;
						box-shadow: 0 0 15px #f00 !important;
					}
				`
			}
		}
	},
	routes: [
		{
			path: '/pages/teacher/index',
			name: 'pptLiveTeacher',
			aliasPath: '/pptLiveTeacher',
		},
		{
			path: '/pages/student/index',
			name: 'pptLiveStudent',
			aliasPath: '/pptLiveStudent',
		},
		{
			path: '/pages/poster/index',
			name: 'poster',
			aliasPath: '/poster',
		},
		{
			path: '*',
			name:'404',
			redirect: to =>{
				let index = to.path.lastIndexOf("/");
				if(to.path.indexOf('pptLiveTeacher/') != -1){
					let code =  to.path.substring(index+1,to.path.length);
					if(code){
						uni.setStorageSync('code', code);
						return 'pptLiveTeacher'
					}
				}
			},
		},
	]
})

export default router;
