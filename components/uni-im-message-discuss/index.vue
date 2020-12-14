<template>
	<scroll-view scroll-y :scroll-into-view="scrollId" class="content">
		<!--   -->
		<view class="message-item-box" v-for="(item,index) in GROUP_MSG" :key='index' :id="'scroll'+(index+1)" :style="{'justify-content':item.from===LOGIN_INFO.memberId && item.type != 3?'flex-end':'flex-start'}">
			<image :src="item.avatar" mode='aspectFill' v-if="item.from != LOGIN_INFO.memberId || item.type == 3" style="background-color: #cccccc;"/>
			
			<view class="message-item-flex-right" :style="{'align-items':item.from===LOGIN_INFO.memberId && item.type != 3?'flex-end':'flex-start'}">
				
				<view class="message-userid-box">
					<text class="name" v-if="item.from === LOGIN_INFO.memberId && item.type != 3" style="margin-right: 10rpx;">{{item.from}}</text>
					<text v-if="item.identity === 'teacher'" class="identity">主讲人</text>
					<text class="name" v-if="item.from != LOGIN_INFO.memberId || item.type == 3">{{item.from}}</text>
					
				</view>
				
				<view class="message-content-box">
					
					<!-- 文本 （普通聊天、问、答）-->
					<block class="message-text-box" v-if="item.type == 0 || item.type == 1 || item.type == 2">
						<view class="ordinary-chat" :style="{'margin-right':item.from===LOGIN_INFO.memberId && item.type != 3?'20rpx':0}">
							<view class="flex-top-box">
								<text v-if="item.type == 1" class="iconfont iconwen"></text>
								<text class="msg-content" :style="{'color':item.type == 2 ? '#999999':''}">
									<text v-if="item.type == 2" class="iconfont iconwen" style="transform: translateY(5rpx);"></text>
									{{item.type == 2?`[${item.askUserId}]：`:''}}{{item.type == 2 ? item.askMessage : item.message}}
								</text>
							</view>
							<!-- 答复 -->
							<text v-if="item.type == 2" class="msg-answer-content">{{item.message}}</text>
						</view>
					</block>
					
					<!-- 语音 -->
					<view class="message-audio-box" v-if="item.type == 3" @click="handlePlayVoice(`https://${item.url}`,index,item)">
						<image :src="item.visit ? '../../static/images/voicePlay.gif' : '../../static/images/voice.png'"/>
						<text>{{item.duration}}″</text>
					</view>
					
					<!-- 图片 -->
					<view class="message-img-box" v-if="item.type == 4" style="width: 200rpx;height: 200rpx;background-color: #d8d8d8;" @click="handlePreviewImage(item.url)">
						<image :src="`https://${item.url}`" class="send-image" mode='aspectFit'/>
					</view>
				</view>
			</view>
			<image :src="item.avatar" mode='aspectFill' v-if="item.from === LOGIN_INFO.memberId && item.type != 3"/>
		</view>
		
		<!-- empty -->
		<view class="empty" v-if="!GROUP_MSG.length">
			<text class="iconfont iconqueshengyewuliaotianjilu"></text>
		</view>
		
		<audio :src="currentAudioUrl" ref='audio' :controls='false' @ended="voiceEnded" type="audio/mp3"></audio>
	</scroll-view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data(){
			return{
				scrollId:'', //scroll-into-view
				currentAudioUrl:''
			}
		},
		computed:{
			...mapState(['GROUP_MSG','LOGIN_INFO']),
		},
		
		methods:{
			handlePreviewImage(url){
				uni.previewImage({
					urls: [`https://${url}`]
				});
			},
			
			handlePlayVoice(url,index,item){
				this.currentAudioUrl = url;
				this.$nextTick(()=>{
					this.$refs.audio.$refs.audio.pause();
					this.$refs.audio.$refs.audio.play();
				})
				this.GROUP_MSG.forEach((item,idx)=>{
					if(index == idx){
						item['visit'] = true
					}else{
						item['visit'] = false
					}
				})
			},
			
			voiceEnded(){
				this.GROUP_MSG.forEach((item,index) => item.visit = false)
			},
		},
		
		watch:{
			'GROUP_MSG'(arr){
				// 滚动至底部元素
				this.$nextTick(()=> {
					this.scrollId = `scroll${this.GROUP_MSG.length}`
				});
				
				this.scrollId = ''
			}
		},
	}
</script>

<style lang="less" scoped>
	.content{
		box-sizing: border-box;
		flex: 1;
		overflow: hidden;
		/deep/.uni-scroll-view-content{
			
			.message-item-box{
				display: flex;
				padding-left: 30rpx;
				margin-top: 15rpx;
				margin-bottom: 20rpx;
				align-items: flex-start;
				image{
					width: 60rpx;
					height: 60rpx;
					border-radius: 50rpx;
					margin-right: 30rpx;
				}
				.send-image{
					width: 100%;
					height: 100%;
					border-radius: 0;
				}
				.message-item-flex-right{
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					.message-userid-box{
						.identity{
							display: inline-block;
							background-color: #DC1D16;
							color: #FFFFFF;
							font-size: 20rpx;
							height: 32rpx;
							line-height: 32rpx;
							padding: 4rpx 10rpx;
							border-radius: 6rpx;
							margin-right: 20rpx;
						}
						.name{
							display: inline-block;
							color: #999999;
							font-size: 24rpx;
						}
					}
					.message-content-box{
						padding-top: 20rpx;
						.ordinary-chat,.message-audio-box{
							max-width: 428rpx;
							background-color: #FFFFFF;
							padding: 20rpx 30rpx;
							border-radius: 15rpx;
							box-shadow: 0 0 10rpx #eee;
							font-size: 24rpx;
							color: #000;
							word-break: break-word;
							
							.flex-top-box{
								display: flex;
								align-items: flex-start;
							}
							text{
								display: inline-block;
							}
							.iconwen{
								color: #DC1D16;
								margin-right: 10rpx;
							}
							.msg-answer-content{
								width: 100%;
								border-top: 1rpx dashed #dddddd;
								margin-top: 20rpx;
								padding-top: 15rpx;
							}
						}
						.message-audio-box{
							display: flex;
							align-items: center;
							min-width: 170rpx;
							text{
								display: inline-block;
								font-size: 22rpx;
							}
							image{
								width: 33rpx;
								height: 33rpx;
							}
						}
					}
				}
			}
		}
	}
</style>
