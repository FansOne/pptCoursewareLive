<template>
	<scroll-view scroll-y :scroll-into-view="scrollId" class="content">
		<view class="message-item-box" v-for="(item,index) in filterTeacherMsg" :key='index' :id="'scroll'+(index+1)">
			<image :src="item.avatar" mode='aspectFill' style="background-color: #cccccc;"/>
			<view class="message-item-flex-right">
				
				<view class="message-userid-box">
					<text>主讲人</text>
					<text>{{item.from}}</text>
				</view>
				
				<view class="message-content-box">
					
					<!-- 文本 （普通聊天、答）-->
					<block class="message-text-box" v-if="item.type == 0 || item.type == 2">
						<view v-if="item.type == 0" class="ordinary-chat">
							{{item.message}}
						</view>
						<view v-if="item.type == 2" class="ordinary-chat reply-content">
							<!-- 问题 -->
							<view class="flex-top-box">
								<text class="msg-content" style="color:#999999">
									<text class="iconfont iconwen" style="transform: translateY(5rpx);"></text>
									{{`[${item.askUserId}]：${item.askMessage}`}}
								</text>
							</view>
							<!-- 答复 -->
							<text v-if="item.type == 2" class="msg-answer-content">{{item.message}}</text>
						</view>
					</block>
					
					<!-- 语音 -->
					<view class="message-audio-box" v-if="item.type == 3" @click="handlePlayVoice(`https://${item.url}`,index,item)">
						<image :src="item.visit ? 'https://xfky-1255765740.cos.ap-beijing.myqcloud.com/h5pptlive/upload/2249e9065916561d13ee080663c195f6.gif' : 'https://xfky-1255765740.cos.ap-beijing.myqcloud.com/h5pptlive/upload/a3889ba90f1a6f8fbfcb95363b1554ad.png'"/>
						<text>{{item.duration}}″</text>
					</view>
					
					<!-- 图片 -->
					<view class="message-img-box" v-if="item.type == 4" style="width: 200rpx;height: 200rpx;background-color: #d8d8d8;" @click="handlePreviewImage(item.url,index)">
						<image :src="`https://${item.url}`" class="send-image" mode='aspectFit'/>
					</view>
				</view>
			</view>
		</view>
		
		<!-- empty -->
		<view class="empty" v-if="!filterTeacherMsg.length">
			<text class="iconfont icondayi"></text>
		</view>
		
		<audio :src="currentAudioUrl" ref='audio' :controls='false' @ended="voiceEnded" type="audio/mp3"></audio>
	</scroll-view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data(){
			return{
				groupMsg:[],
				scrollId:'', //scroll-into-view
				currentAudioUrl:''
			}
		},
		computed:{
			...mapState(['GROUP_MSG']),
			
			filterTeacherMsg(){
				let newArr = this.groupMsg.filter(item => item.identity === 'teacher')
				return newArr
			}
		},
		
		created() {
			this.groupMsg = this.GROUP_MSG
		},
		
		watch:{
			'GROUP_MSG'(arr){
				this.groupMsg = arr
			},
			'filterTeacherMsg'(){
				// 滚动至底部元素
				this.$nextTick(()=> {
					this.scrollId = `scroll${this.filterTeacherMsg.length}`
				});
				
				this.scrollId = ''
			}
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
				this.filterTeacherMsg.forEach((item,idx)=>{
					if(index == idx){
						item['visit'] = true
					}else{
						item['visit'] = false
					}
				})
			},
			
			voiceEnded(){
				this.filterTeacherMsg.forEach((item,index) => item.visit = false)
			},
		}
	}
</script>

<style lang="less" scoped>
	.content{
		height: 100%;
		/deep/.uni-scroll-view-content{
			
			.message-item-box{
				display: flex;
				align-items: flex-start;
				padding-left: 30rpx;
				margin-bottom: 30rpx;
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
						text:nth-child(1){
							display: inline-block;
							background-color: #DC1D16;
							color: #FFFFFF;
							font-size: 20rpx;
							height: 32rpx;
							line-height: 32rpx;
							padding: 4rpx 10rpx;
							border-radius: 6rpx;
						}
						text:nth-child(2){
							display: inline-block;
							color: #999999;
							font-size: 24rpx;
							margin-left: 20rpx;
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
			
				.reply-content{
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
			}
		}
	}
</style>
