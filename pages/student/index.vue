<template>
	<view class="content">
		<view class="flex-swiper-top" :class="[swiperHidden?'transition-swiper-hidden':'transition-swiper-show']">
			<!-- swiper -->
			<swiper circular class="swiper-style" :disable-touch='true' :current="SWIPRE_INDEX">
				<swiper-item v-for="(item,index) in swiperData" :key='index'>
					<image :src="item.path" mode='aspectFit' class="swiper-img"/>
				</swiper-item>
			</swiper>
			<!-- swiper下标&倒计时 -->
			<view class="swiper-stick-box" v-show="!swiperHidden_">
				<view class="count-down" v-show="LIVING == 3">
					<view>直播倒计时：</view>
					<uni-countdown :show-day="false" :hour="1" :minute="12" :second="40" color='#fff' background-color='rgba(0,0,0,0)' splitorColor='#fff' :show-colon='false' @timeup='handleTimeUp'/>
				</view>
				<view class="swiper-index-box">
					<view class="swiper-index">
						{{SWIPRE_INDEX+1}}/{{swiperData.length}}
					</view>
				</view>
			</view>
			
			<view class="no-file" v-if="!swiperData.length" :style="{'background-color' : swiperHidden ? '#F0F1F2' : '#ddddde'}">
				<text>no ppt courseware</text>
			</view>
		</view>
		
		<view class="flex-chat-bottom" :class="[swiperHidden?'chat-box-height-big':'chat-box-height-small']">
			<uniTimChat v-if='userInfo.userSig' clientType='student' :userInfo='userInfo' @chatViewportChange = 'chatViewportChange'/>
		</view>
	</view>
</template>

<script>
	import qs from 'qs'
	import { mapState,mapMutations } from 'vuex'
	import uniCountdown from '@/components/uni-countdown/uni-countdown.vue'
	import uniTimChat from '@/components/uni-tim-chat/index.vue'
	
	import { login } from '../../api/index.js'
	export default {
		components: { uniCountdown,uniTimChat },
		
		data() {
			return {
				userInfo:{
					sdkAppId: "",
					roomId:'',
					memberId: '',
					identity:'student',
					userSig:'',
					avatar:'',
					shutUpAllMember:'',
					memberNum:''
				},
				swiperHidden:false,
				swiperHidden_:false,
				currentIndex:1,
				swiperData:[]
			}
		},
		
		computed:{
			...mapState(['SWIPRE_INDEX','LIVING','PPT_IMAGES_FILE'])
		},
		
		watch:{
			'PPT_IMAGES_FILE'(newFile){
				this.swiperData = newFile
			}
		},
		
		async created() {
			let url = location.href.split('/#')[0];
			let query = qs.parse(url.split('?')[1]);
			
			if(!query.lessonId || !query.token) return uni.showModal({
				title: '警告',
				showCancel:false,
				content: '缺少必要参数，请检查访问路径无误后重新尝试进入直播间！',
			});
			
			await uni.setStorageSync('token',query.token)
			let params = {
				lessonId:query.lessonId
			};
			login.loginStudent(params).then(res=>{
				let { data } = res
				
				this.SET_LIVING = data.liveStatus
				this.swiperData = data.pptImages
				
				this.userInfo['sdkAppId'] = data.sdkAppId
				this.userInfo['avatar'] = data.avator
				this.userInfo['roomId'] = String(data.roomId)
				this.userInfo['userSig'] = data.userSig
				this.userInfo['memberId'] = data.memberId
				this.userInfo['nickname'] = data.nickname
				this.userInfo['shutUpAllMember'] = data.shutUpAllMember
				this.userInfo['memberNum'] = data.memberNum
			})
		},
		
		methods: {
			...mapMutations(['SET_LIVING']),
			handleTimeUp(){
				console.log('倒计时时间到触发事件')
			},
			
			// 改变聊天区域视图大小
			chatViewportChange(status){
				this.swiperHidden = status
				
				if(status) this.swiperHidden_ = status;
				else setTimeout(()=>{ this.swiperHidden_ = status },500);
			}
		}
	}
</script>

<style lang="less" scoped>
	.content {
		width: 750rpx;
		height: 100vh;
		display: flex;
		flex-direction: column;
		.flex-swiper-top{
			position: relative;
			transition: height .6s;
			.swiper-style{
				position: relative;
				width: 100%;
				
				height: 100%;
				swiper-item{
					background-color: #333333;
				}
				.swiper-img{
					width: 100%;
					height: 100%;
				}
			}
			.swiper-stick-box{
				height: 86rpx;
				width: 100%;
				position: absolute;
				left: 0;
				top: 308rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				.count-down{
					height: 32rpx;
					line-height: 32rpx;
					color: #fff;
					background-color: rgba(0,0,0,.5);
					border-radius: 50rpx;
					padding: 0 15rpx;
					font-size: 16rpx;
					display: flex;
					align-items: center;
				}
				.swiper-index-box{
					width: 100%;
					display: flex;
					justify-content: flex-start;
					.swiper-index{
						color: #fff;
						background-color: rgba(0,0,0,.5);
						height: 42rpx;
						width: 70rpx;
						line-height: 42rpx;
						text-align: center;
						letter-spacing: 6rpx;
						margin-top: 15rpx;
					}
				}
			}
			
			.no-file{
				background-color: #ddddde;
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				padding-top: 170rpx;
				text-align: center;
				font: bold 40rpx/100% "微软雅黑", "Lucida Grande", "Lucida Sans", Helvetica, Arial, Sans;
				color: #fff;
				text-transform: uppercase;
				text{
					color: #fff;
					text-shadow: 1px 1px rgba(197, 223, 248,0.8),2px 2px rgba(197, 223, 248,0.8),3px 3px rgba(197, 223, 248,0.8),4px 4px rgba(197, 223, 248,0.8),5px 5px rgba(197, 223, 248,0.8),6px 6px rgba(197, 223, 248,0.8); 
				}
			}
		}
		
		.flex-chat-bottom{
			background-color: #F0F1F2;
		}
		
		.transition-swiper-hidden{
			height: 0;
		}
		.transition-swiper-show{
			height: 420rpx;
		}
		.chat-box-height-small{
			height: calc(100vh - 420rpx);
		}
		.chat-box-height-big{
			height: 100vh;
		}
	}
</style>