<template>
	<scroll-view :scroll-y="true" :scroll-into-view="scrollId" class="content" >
		
		<!-- 提问 -->
		<block v-if="msgType === 0">
			<view class="message-item-box" v-for="(item,index) in filterAskMsg" :key="index+'not'" :id="'scroll'+(index+1)">
				<image :src="item.avatar" mode='aspectFill' style="background-color: #ccc;"/>
				
				<view class="message-item-flex-right">
					
					<view class="message-userid-box">
						<text class="name">{{item.from}}</text>
					</view>
					
					<view class="message-content-box">
						
						<block class="message-text-box">
							<view class="ordinary-chat" :style="{'margin-right':item.from===LOGIN_INFO.memberId?'20rpx':0}">
								<view class="flex-top-box">
									<text class="iconfont iconwen"></text>
									<text class="msg-content">{{item.message}}</text>
								</view>
							</view>
						</block>
						
						<view class="reply" @click="handleReplyAsk(item)">回复</view>
					</view>
				</view>
			</view>
			
			<!-- empty -->
			<view class="empty" v-if="!filterAskMsg.length">
				<text class="iconfont iconqueshengyewuliaotianjilu"></text>
			</view>
		</block>
		
		<!-- 回复 -->
		<block v-if="msgType === 1">
			<view class="already-answer-item" v-for="(item,index) in filterAnswerMsg" :key="index+'already'" :id="'scroll'+(index+1)">
				<image :src="item.avatar" mode='aspectFill' style="background-color: #ccc;"/>
				
				<view class="message-item-flex-right">
					
					<view class="message-userid-box">
						<text class="identity">主讲人</text>
						<text>{{item.from}}</text>
					</view>
					
					<view class="message-content-box">
						
						<block class="message-text-box">
							<view class="ordinary-chat">
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
					</view>
				</view>
			</view>
			
			<!-- empty -->
			<view class="empty" v-if="!filterAnswerMsg.length">
				<text class="iconfont iconqueshengyewuliaotianjilu"></text>
			</view>
		</block>
	</scroll-view>
</template>

<script>
	import { mapState } from 'vuex'
	export default{
		props:{
			// msgType: 0 未回答； 1 已回答
			msgType:{
				type: Number,
				default:0
			}
		},
		
		data(){
			return{
				groupMsg:[],
				scrollId:'', //scroll-into-view
			}
		},
		
		watch:{
			'GROUP_MSG'(arr){
				this.groupMsg = arr
				
				// 滚动至底部元素
				this.$nextTick(()=> {
					this.scrollId = `scroll${this.GROUP_MSG.length}`
				});
				
				this.scrollId = ''
			}
		},
		
		created() {
			this.groupMsg = this.GROUP_MSG
		},
		
		computed:{
			...mapState(['GROUP_MSG','LOGIN_INFO']),
			
			// 过滤未回答（提问）消息数据 type = 1
			filterAskMsg(){
				let newArr = this.groupMsg.filter(item => item.type == 1)
				return newArr
			},
			
			// 过滤已回答消息数据 type = 2
			filterAnswerMsg(){
				let newArr = this.groupMsg.filter(item => item.type == 2)
				return newArr
			}
		},
		
		methods:{
			// 回复学生问题
			handleReplyAsk(item){
				this.$emit('replyStudentAsk',item)
			}
		}
	}
</script>

<style lang="less" scoped>
	.content{
		height: 100%;
		/deep/.uni-scroll-view-content{
			
			.message-item-box,.already-answer-item{
				display: flex;
				padding-left: 30rpx;
				margin-top: 15rpx;
				margin-bottom: 15rpx;
				align-items: flex-start;
				image{
					width: 60rpx;
					height: 60rpx;
					border-radius: 50rpx;
					margin-right: 30rpx;
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
						display: flex;
						align-items: center;
						.ordinary-chat{
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
						.reply{
							padding-left: 30rpx;
							color: red;
						}
					}
				}
			}
		
		}
	}
</style>
