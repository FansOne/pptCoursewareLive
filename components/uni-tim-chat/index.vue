<template>
	<view class="chat-box">
		<view class="chat-title-box">
			<view class="title-flex-left">
				<view class="live-status" :style="{'color': LIVING == 1?'#DF1900':'#999'}">
					<text class="iconfont icondian"></text>
					<text>{{LIVING == 1? '直播中' : (LIVING == 2?'已结束':'未开始')}}</text>
				</view>
				<view class="line">|</view>
				<view class="live-nums">{{userInfo.memberNum}}人次</view>
			</view>
			<view class="title-flex-right" @click="handleChatEnlarge">
				<text class="iconfont iconxiangshang" :class="[chatViewportEnlarge ?'rotate':'restore']"></text>
			</view>
		</view>
		<!-- INDEX聊天区 & 学生讨论弹幕区 -->
		<view class="chat-content-box">
			<!-- 聊天消息 -->
			<view class="flex-content-box">
				<!-- 教室聊天消息主页展示 -->
				<ImMessageUiIndex/>
				<!-- 学生讨论区主页定位展示 -->
				<view class="absolute-chat-box" :style="{height:clientType === 'student'?'210rpx':'350rpx',bottom: clientType === 'student'?'30rpx':'0rpx'}">
					
					<!-- 问题区 -->
					<view  v-if="clientType === 'teacher'" class="ask-region" @click="handleAskRegionPopup">
						问题区
					</view>
					
					<!-- 学生交流弹幕 -->
					<scroll-view scroll-y class="student-chat-viewport" :scroll-into-view="bulletScrollId" v-show="!closeStudentDiscuss">
						<view class="discuss-item" v-for="(item,index) in studentDiscussChat" :key='index' :id="'scroll'+(index+1)">
							<view class="stu-ask" v-show="item.type === 1">
								<text class="iconfont iconwen"></text>
							</view>
							<view class="text-content">{{item.message}}</view>
							<view class="user-icon">
								<image :src="item.avatar" mode='aspectFill'/>
							</view>
						</view>
					</scroll-view>
					
					<!-- 弹幕&讨论区控制 -->
					<view class="button-switch-box" v-if="clientType === 'teacher'">
						<!-- 学生讨论弹幕显示控制 -->
						<view class="barrage-control" @click="closeStudentDiscuss = !closeStudentDiscuss">
							<text class="iconfont" :class="[closeStudentDiscuss ?'icondanmukai-':'icondanmuguanbi-']"></text>
						</view>
						<!-- 讨论区 -->
						<view class="discuss" @click="handleDiscussPopup">
							<text class="iconfont icontaolunqu"></text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- Input Library-->
			<view class="flex-input-box index-padding-bottom">
				
				<view class="flex-input-top-box">
					<view class="flex-left-input-box" @click="coursewareShow = !coursewareShow" v-if="clientType === 'teacher'">
						<text class="iconfont iconjiahao" :class="[coursewareShow ? 'addIconRotate' : 'addIconRestore']"></text>
					</view>
					
					<view class="flex-middle-input-box">
						<input type="text" confirm-type='send' :focus='!alreadyReply' :disabled="ESTOPPEL_STATUS==='On'?true:false" v-model="indexInputValue" :placeholder='placeholder' :data-msgType="alreadyReply?2:0" :data-studentAsk='studentAsk' @confirm='handleSendMsg'/>
						<!-- 学员提问 -->
						<view class="student-ask-switch" v-if="clientType === 'student'" @click="studentAsk = !studentAsk">
							<label class="radio"><radio :checked="studentAsk" color='#ee3a3a'/>提问</label>
						</view>
						
						<!-- 取消回复学生问题按钮 -->
						<icon v-if='alreadyReply' type="clear" size="12" color='rgb(189 189 189)' @click="handleCancelReply" style="transform: translateX(15rpx);"/>
					</view>
					
					<view class="flex-right-input-box">
						<view v-if="clientType === 'teacher'" class="main-show">
							<text class="iconfont iconmaikefeng1" @click="mi"></text>
							<text class="iconfont icontupian1" :data-msgType='4' @click="handleChooseSendImg"></text>
							<text class="iconfont icongengduo" @click="$refs.moreControl.open()"></text>
						</view>
						
						<view v-else-if="clientType === 'student'" class="main-show main-show-student">
							<text class="iconfont" :class="[closeStudentDiscuss ?'icondanmukai-':'icondanmuguanbi-']" @click="closeStudentDiscuss = !closeStudentDiscuss"></text>
							<text class="iconfont icontaolunqu" @click="handleDiscussPopup"></text>
						</view>
					</view>
				</view>
				
				<!-- 课件图片库（上传、增、删、改） -->
				<view class="flex-courseware-bottom-box" :class="[coursewareShow ? 'courseware-show' : 'courseware-hidden']">
					<view class="item select-img-courseware"  @click="handleOpenPictureLibrary">
						<text class="iconfont icontupian"></text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 弹窗 -->
		
		<!-- 问题区弹窗 -->
		<Popup ref='askRegionPopup' type='bottom'>
			<view class="picture-libray-box" style="background-color: rgb(240, 241, 242);padding: 0;">
				
				<!-- bgColor='rgb(240, 241, 242)' -->
				<v-tabs
				  v-model="activeTab"
				  activeColor='#000'
				  lineColor='#C8161D'
				  :scroll='false'
				  :lineScale='0.15'
				  padding='15rpx 0 5rpx 0'
				  :tabs="['提问', '回答']"
				  @change="handleChangeTab"
				></v-tabs>
				
				<view class="ask-region-content-box">
					<!-- 未、已回答展示组件 -->
					<ImMessageUiAskAnswer :msgType.sync = 'activeTab' @replyStudentAsk = "replyStudentAsk"/>
				</view>
			</view>
		</Popup>
		
		<!-- 讨论区弹窗 -->
		<Popup ref='discussPopup' type="bottom">
			<view class="picture-libray-box" style="background-color: #F0F1F2;padding: 0;">
				<view class="title" style="background-color: #FFFFFF;border-radius: 25rpx 25rpx 0 0;">讨论区</view>
				 
				 <!-- 讨论聊天内容组件 -->
				<ImMessageUiDiscuss/>
				
				<view class="flex-input-box">
					
					<view class="flex-input-top-box">
						<view class="flex-left-input-box"  v-if="clientType === 'teacher'"  @click="$refs.recorderPopup.open()">
							<text class="iconfont iconmaikefeng1" style="font-size: 44rpx;color: #555555;"></text>
						</view>
						
						<view class="flex-middle-input-box">
							<input type="text" v-model="discussInputValue" :placeholder='placeholder' :disabled="ESTOPPEL_STATUS==='On'?true:false" :data-msgType='0' :data-studentAsk='studentAsk' @confirm='handleSendMsg'/>
							<!-- 学员提问 -->
							<view class="student-ask-switch" v-if="clientType === 'student'" @click="studentAsk = !studentAsk">
								<label class="radio"><radio :checked="studentAsk" color='#ee3a3a'/>提问</label>
							</view>
						</view>
						
						<view class="flex-right-input-box">
							<view class="main-show">
								<text style="font-size: 28rpx;color: #C8161D;" @click="handleSendMsg">发送</text>
							</view>
						</view>
					</view>
					
					<!-- 课件图片库（上传、增、删、改） -->
					<view class="flex-courseware-bottom-box" :class="[coursewareShow ? 'courseware-show' : 'courseware-hidden']">
						<view class="item select-img-courseware"  @click="handleOpenPictureLibrary">
							<text class="iconfont icontupian"></text>
						</view>
					</view>
				</view>
			</view>
		</Popup>
		
		<!-- 录音弹窗 -->
		<Popup ref="recorderPopup" type="bottom">
			<RecorderComponent ref='recorderComponent' @closePopup = '$refs.recorderPopup.close()'/>
		</Popup>
		
		<!-- 图片库弹窗 -->
		<Popup ref="pictureLibraryPopup" type="bottom">
			<view class="picture-libray-box">
				<view class="title">图片库</view>
				<view class="prompt-box">
					<view class="file-nums">
						共{{list.length}}张
					</view>
					<view class="prompt-text">
						直播前预先上传课件图片至图片库中，点击下方按钮可同步上传至顶部轮播中，也可点击拖拽图片后对课件进行重新排序。
					</view>
				</view>
				<DragImage ref="dragImage" :list.sync="list" :cols="3" :number='60' @updateList = 'handleUpdateList'/>
				<view class="upload-button-box">
					<button @click="handleUploadImg">上传图片课件</button>
				</view>
			</view>
		</Popup>
	
		<!-- 更多操作弹窗 -->
		<Popup ref='moreControl' type='bottom'>
			<view class="picture-libray-box">
				<view class="title">更多</view>
				<view class="control-item">
					<view class="">
						学员禁言模式
					</view>
					<switch :checked="userInfo.shutUpAllMember==='Off'?false:true" @change="handleTabooSwitch"/>
				</view>
				<view class="control-item" @click="handleCloseLive">
					<view class="">
						结束直播
					</view>
				</view>
			</view>
		</Popup>
	
		<!-- 结束直播弹窗 -->
		<Popup ref='closeLive' type='dialog' :transparent='true'>
			<PopupDialog type='info' @confirm="handleConfirmCLoseLive(userInfo.lessonId)" title='结束直播' content="1. 结束直播后，讲师嘉宾将不能继续发言。 2. 结束本次直播，用户将从头开始回顾。">
			</PopupDialog>
		</Popup>
		
		<!-- 提示信息弹窗 type可选值： success/warn/info/error-->
		<uni-popup ref="popupMsg" type="message" :transparent='true'>
		    <PopupMessage :type="popupMsgType" :message="promptMsg"></PopupMessage>
		</uni-popup>
	</view>
</template>

<script>
	import { mapState,mapMutations } from 'vuex'
	import { sendGroupTextMessage,sendCustomMessage,groupEstoppel } from '../../utils/imApi.js'
	import { msgformatManage,throttle } from '../../utils/tools.js'
	import { uploadMinFile,syncManyFileUpload } from '../../utils/cosFile.js'
	
	import { upload } from '../../api/index.js'
	
	import initSDK from '../../utils/initSDK.js'
	import Popup from '@/components/uni-popup/uni-popup.vue'
	import PopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	import PopupMessage from '@/components/uni-popup/uni-popup-message.vue'
	import DragImage from '@/components/shmily-drag-image/shmily-drag-image.vue'
	import Tabs from '@/components/v-tabs/v-tabs.vue'
	import ImMessageUiIndex from '@/components/uni-im-message-index/index.vue'
	import ImMessageUiDiscuss from '@/components/uni-im-message-discuss/index.vue'
	import ImMessageUiAskAnswer from '@/components/uni-im-message-ask-answer/index.vue'
	import RecorderComponent from '@/components/uni-recorder/index.vue'
	
	var IMExample = null; //TIM实例对象
	var iTime;
	export default{
		props:{
			
			// 客户端类型 教师、学生
			clientType:{
				type:String,
				default:'teacher'
			},
			
			// 登录信息
			userInfo:{
				type:Object,
				default:null
			}
		},
		
		components:{ 
			Popup,
			DragImage,
			PopupDialog,
			Tabs,
			PopupMessage,
			ImMessageUiIndex,
			ImMessageUiDiscuss,
			ImMessageUiAskAnswer,
			RecorderComponent
		},
		
		data(){
			return{
				activeTab:0,
				chatViewportEnlarge:false,
				placeholder: this.clientType === 'teacher'?'分享知识':'说点什么?',
				coursewareShow:false,
				closeStudentDiscuss:false,
				promptMsg:'',
				list:[],
				popupMsgType:'success',
				indexInputValue:'',
				discussInputValue:'',
				studentAsk:false, //学生提问
				studentAskInfo:{}, //学生提问信息内容
				bulletScrollId:'', //scroll-into-view
				alreadyReply:false, //准备回复学生问题
				waitUploadImgFIle:[],
			}
		},
		
		computed:{
			...mapState(['IM_IS_READY','LIVING','LOGIN_INFO','GROUP_MSG','ESTOPPEL_STATUS']),
			
			studentDiscussChat(){
				let newArr = this.GROUP_MSG.filter(item => item.identity === 'student')
				return newArr
			}
		},
		
		watch:{
			'IM_IS_READY'(status){
				if(status){}
			},
			'studentDiscussChat'(){
				// 滚动至底部元素
				this.$nextTick(()=> {
					this.bulletScrollId = `scroll${this.studentDiscussChat.length}`
				});
				
				this.bulletScrollId = ''
			},
			'ESTOPPEL_STATUS'(status){
				status === 'On' ? this.placeholder = '全员禁言中' : this.placeholder = '说点什么?'
			}
		},
		
		created(){
			this.TimLogin()
			
			if(this.clientType === 'student' && this.userInfo.shutUpAllMember==='On') this.SET_ESTOPPEL_STATUS('On');
		},
		
		methods:{
			...mapMutations(['SET_LOGIN_INFO','SET_GROUP_MSG','SET_LIVING','SET_ESTOPPEL_STATUS']),
			
			// TIM登录
			TimLogin(){
				// 实例化IM
				IMExample = new initSDK(this.userInfo)
				
				// IM(监听)登录
				IMExample.initTIM({
					success: (succ) =>{
						// 登录成功回调
						if(succ.actionStatus === 'OK') {
							
							this.SET_LOGIN_INFO(Object.assign(this.userInfo,{}))
						}
					}, 
					error: (err) =>{
						// 登录异常回调
						this.popupMsgType = 'error'
						this.promptMsg = err
						this.$refs.popupMsg.open()
						
						throw new Error(err)
					}
				})
			},
			
			// 设置图片库原始数据
			setImgFile(imgFile){
				this.list = imgFile
			},
			
			handleChatEnlarge(){
				this.chatViewportEnlarge = !this.chatViewportEnlarge
				this.$emit('chatViewportChange',this.chatViewportEnlarge)
			},
			
			// 回答区域Tab切换事件
			handleChangeTab(index){
				console.log('当前选中索引：' + index)
			},
			
			// 打开问题区弹窗
			handleAskRegionPopup(){
				this.$refs.askRegionPopup.open()
			},
			
			// 打开讨论区弹窗
			handleDiscussPopup(){
				this.$refs.discussPopup.open()
			},
			
			//打开麦克风弹窗
			async mi(){
				await this.$refs.recorderPopup.open()
				// this.$refs.recorderComponent.reReq()
			},
			
			//打开图片库弹窗
			handleOpenPictureLibrary(){
				this.coursewareShow = false
				this.$refs.pictureLibraryPopup.open()
			},
			
			// 禁言控制
			handleTabooSwitch(e){
				let status = e.target.value // true/fasle  禁言/解除禁言
				 
				groupEstoppel(status, muteAllMembers => {
					uni.showToast({
						title:muteAllMembers ? '已开启全体禁言' : '已解除禁言',
						success: () => {
							this.$refs.moreControl.close()
							
							this.userInfo['shutUpAllMember'] = muteAllMembers ? 'On' : 'Off'
							this.SET_LOGIN_INFO(this.userInfo)
						}
					})
				});
			},
			
			// 打开结束直播弹窗
			handleCloseLive(){
				if(this.LIVING != 1) return uni.showToast({
					title:'无效操作，当前非直播中状态',
					icon:'none'
				})
				this.$refs.closeLive.open();
			},
			
			//结束直播
			handleConfirmCLoseLive(lessonId){
				upload.closeLive({
					id: lessonId
				})
				.then(res=>{
					this.SET_LIVING(2)
					// 发送群组自定义消息
					let params = {
						description: 'closeLive',
					};
					sendCustomMessage('group',params)
				})
			},
			
			// 图片库拖拽排序回调
			handleUpdateList(newList){
				clearTimeout(iTime);
				iTime = setTimeout(()=>{
					this.list = newList
					// console.log(newList)
					this.waitUploadImgFIle = newList.filter(item => item.blob)
					// console.log(this.waitUploadImgFIle)
					
					let updateImgFIle = newList.filter(item => item.blob === undefined)
					// console.log(updateImgFIle)
					this.updateImgFileApi(updateImgFIle,true)
				},250);
				
			},
			
			// 上传图片至COS
			handleUploadImg(){
				if(!this.waitUploadImgFIle.length) return uni.showToast({title: '请选择文件后上传',icon:'none'});
				
				// 多图上传处理
				syncManyFileUpload({
					file: this.waitUploadImgFIle,
					process: (percent,fileIdx)=> {},
					success: async (data,fileIdx)=>{
						// 上传COS成功回调
						this.waitUploadImgFIle = [];
						// 更新上传组件数据
						await this.$refs.dragImage.updatePath(data.Location,fileIdx)
						// 更新本地数据
						let waitSpliceArr = {
							path:`https://${data.Location}`,
							index:fileIdx
						};
						
						await this.list.splice(fileIdx,1,waitSpliceArr)
						
						// 更新图片库信息
						await this.updateImgFileApi(this.list)
						
						uni.showToast({
							title:'上传成功'
						})
					},
					fail:(err)=>{
						console.error('上传失败:'+err)
					}
				})
			},
			
			// 更新图片库信息 moreOperation = true(删除、排序)
			updateImgFileApi(imgList,moreOperation = false){
				let params = {
					id: this.LOGIN_INFO.lessonId,
					pptImages: imgList
				}
				upload.updateImgFile(params).then(async res=>{
					let { pptImages } = res.data
					if(!moreOperation) this.list = imgList
					await this.$parent.$parent.$parent.updateImgFile(pptImages)
					if(!moreOperation) await this.$refs.pictureLibraryPopup.close();
					
					// 发送群组自定义消息
					let params = {
						description: 'updateImgFileSwiper',
						pptImages: imgList
					};
					sendCustomMessage('group',params)
					
					console.log(JSON.parse(JSON.stringify(pptImages)))
				})
			},
			
			//发送文本类消息
			handleSendMsg:throttle(function(event){
				let params = msgformatManage(event[0],this.studentAskInfo); // 统一消息格式处理
				sendGroupTextMessage(params,()=>{
					//消息发送成功回调
					this.SET_GROUP_MSG(params)
					this.indexInputValue = ''
					this.discussInputValue = ''
					
					if(this.clientType === 'student') this.studentAsk = false; //修改提问radio状态
					
					uni.hideKeyboard()
					this.handleCancelReply()
				})
			},800),
			
			//发送图片消息
			handleChooseSendImg(event){
				uni.chooseImage({
				    count: 1, // 只选一张，目前 SDK 不支持一次发送多张图片
				    success: (res)=> {
						// COS存储
						uploadMinFile(res.tempFiles[0], async (err, data)=>{
							
							if (err) return console.error('上传失败，请刷新重试！')
							
							let url = data.Location;
							// let key = url.substring(url.indexOf('h5pptlive/upload/'))
							
							// 发送群组自定义消息
							let params = await msgformatManage(event); 
							params['description'] = 'sedImg'
							params['url'] = url
							
							
							sendCustomMessage('group',params,()=>{
								this.SET_GROUP_MSG(params)
							})
							
						})
				    },
				});
				
			},
			
			// 回复学生问题
			replyStudentAsk(item){
				let askInfo = this.studentAskInfo = item;
				this.$refs.askRegionPopup.close()
				console.log(askInfo)
				this.placeholder = `回复「${askInfo.from}」:${askInfo.message}`
				this.alreadyReply = true
			},
			
			// 取消回复学生问题
			handleCancelReply(){
				this.placeholder = '分享知识'
				this.alreadyReply = false;
				this.studentAskInfo = {};
			}
		}
	}
</script>

<style lang="less" scoped>
	.chat-box{
		height: 100%;
		display: flex;
		flex-direction: column;
		.chat-title-box{
			z-index: 1;
			height: 108rpx;
			background-color: #FFFFFF;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			border-radius: 20rpx 20rpx 0 0;
			transform: translateY(-14rpx);
			.title-flex-left{
				display: flex;
				align-items: center;
				font-size: 28rpx;
				.line{
					font-size: 15rpx;
					line-height: 100%;
					margin: 0 18rpx;
					color: #b3b3b3;
				}
				.live-nums{
					color: #999;
				}
			}
			.title-flex-right{
				.iconxiangshang{
					display: inline-block;
					color: #999;
					font-size: 45rpx;
					transition: transform .6s;
				}
				.rotate{
					transform:rotate(180deg);
				}
				.restore{
					transform:rotate(0deg);
				}
			}
		}
		.chat-content-box{
			flex: 1;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			.flex-content-box{
				position: relative;
				flex: 1;
				overflow: hidden;
				background-color: #F0F1F2;
				.absolute-chat-box{
					width: 350rpx;
					position: absolute;
					right: 0;
					z-index: 1;
					.ask-region{
						width: 130rpx;
						height: 60rpx;
						line-height: 60rpx;
						text-align: center;
						position: absolute;
						top: -300rpx;
						right: 0;
						color: #C8161D;
						background-color: #FFFFFF;
						border-radius: 50rpx 0 0 50rpx;
						box-shadow: 0 0 20rpx #cccccc;
					}
					.student-chat-viewport{
						height: 210rpx;
						/deep/.uni-scroll-view-content{
							max-width: 350rpx;
							display: flex;
							flex-direction: column;
							align-items: flex-end;
							.discuss-item{
								margin-right: 30rpx;
								max-width: 350rpx;
								display: flex;
								align-items: flex-start;
								flex-shrink: 0;
								color: #FFFFFF;
								background-color: rgba(0,0,0,.6);
								padding: 10rpx 20rpx;
								border-radius: 25rpx 0 25rpx 0rpx;
								margin-bottom: 10rpx;
								.stu-ask{
									margin-right: 10rpx;
									text{
										color: #ffe000;
									}
								}
								.text-content{
									flex: 1;
									font-size: 22rpx;
									word-break: break-word;
									display: -webkit-box;
									-webkit-box-orient: vertical;
									-webkit-line-clamp: 2;
									overflow: hidden;
									
								}
								.user-icon{
									width: 35rpx;
									height: 35rpx;
									border-radius: 50%;
									background-color: rgba(0,0,0,.6);
									margin-left: 10rpx;
									image{
										width: 35rpx;
										height: 35rpx;
										border-radius: 50%;
									}
								}
							}
						}
					}
					.student-chat-viewport::-webkit-scrollbar {
						display: none;
					}
					.button-switch-box{
						width: 100%;
						padding-bottom: 30rpx;
						position: absolute;
						bottom: 0;
						left: 0;
						display: flex;
						align-items: center;
						padding-right: 30rpx;
						justify-content: flex-end;
						view{
							background-color: #FFFFFF;
							width: 80rpx;
							height: 80rpx;
							text-align: center;
							line-height: 80rpx;
							border-radius: 50%;
							box-shadow: 0 10rpx 30rpx #d9d9d9;
							text{
								font-size: 40rpx;
								color: #818181;
							}
						}
						.discuss{
							margin-left: 30rpx;
							text{
								font-size: 45rpx;
							}
						}
					}
				}
			}
		}
	
		.picture-libray-box{
			background-color: #FFFFFF;
			border-radius: 25rpx 25rpx 0 0;
			height: 80vh;
			padding: 0 30rpx;
			display: flex;
			flex-direction: column;
			.title{
				height: 90rpx;
				font-size: 32rpx;
				line-height: 90rpx;
				text-align: center;
			}
			
			.prompt-box{
				.file-nums{
					font-size: 24rpx;
					margin-bottom: 15rpx;
				}
				.prompt-text{
					color: #A5A6A7;
					font-size: 22rpx;
					margin-bottom: 20rpx;
				}
			}
			
			.upload-button-box{
				padding-bottom: 15rpx;
				button{
					height: 80rpx;
					height: 100%;
					background-color: #ee3a3a;
					color: #FFFFFF;
					border-radius: 50rpx;
					font-size: 30rpx;
					line-height: 80rpx;
					letter-spacing: 2rpx;
				}
				button:after{
					border: none;
				}
			}
			
			.control-item{
				display: flex;
				align-items: center;
				justify-content: space-between;
				border-bottom: 1px solid #F1F1F1;
				font-size: 30rpx;
				padding: 30rpx 0;
			}
		}
		.flex-input-box{
			background-color: #FFFFFF;
			min-height: 100rpx;
			
			.flex-input-top-box{
				height: 100rpx;
				padding: 0 30rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.flex-left-input-box{
					.iconjiahao{
						display: inline-block;
						color: #6a6a6a;
						font-size: 45rpx;
						transition: transform .3s;
					}
					.addIconRotate{
						transform:rotate(222deg);
					}
					.addIconRestore{
						transform:rotate(0deg);
					}
				}
				
				.flex-middle-input-box{
					background-color: #F0F1F2;
					flex: 1;
					height: 72rpx;
					display: flex;
					margin: 0 20rpx;
					align-items: center;
					padding: 0 40rpx;
					border-radius: 50rpx;
					input{
						flex: 1;
						font-size: 24rpx;
					}
					.student-ask-switch{
						color: #A5A6A7;
						/deep/.uni-label-pointer{
							display: flex;
							align-items: center;
							uni-radio{
								transform: scale(0.6) translatex(15rpx);
							}
						}
					}
				}
							
				.flex-right-input-box{
					.main-show{
						text{
							display: inline-block;
							color: #555555;
							font-size: 45rpx;
						}
						.icontupian1{
							margin: 0 20rpx 0 15rpx;
						}
						.icongengduo{
							font-size: 38rpx !important;
							transform: translateY(-4rpx);
						}
					}
					.main-show-student{
						text{
							display: inline-block;
							color: #767676;
							font-size: 48rpx;
						}
						text:nth-child(2){
							display: inline-block;
							transform: translateY(3rpx);
							font-size: 55rpx;
							margin-left: 20rpx;
						}
					}
				}
			}
		
			.flex-courseware-bottom-box{
				background-color: #F1F1F1;
				transition: all .4s;
				overflow: hidden;
				display: flex;
				align-items: center;
			}
			.courseware-show{
				padding: 30rpx 40rpx;
				height: 220rpx;
			}
			.courseware-hidden{
				padding: 0;
				height: 0;
			}
			.item{
				background-color: #FFFFFF;
				width: 110rpx;
				height: 110rpx;
				border-radius: 15rpx;
				text-align: center;
				line-height: 110rpx;
				color: #717171;
				.icontupian{
					font-size: 47rpx;
				}
			}
		}
		.index-padding-bottom{
			/* #ifdef H5 */
				padding-bottom: constant(safe-area-inset-bottom);/* 兼容 iOS < 11.2 */
				padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
				box-sizing: content-box;
			/* #endif */
		}
		.ask-region-content-box{
			flex: 1;
			overflow: hidden;
			.not-answer-box,.already-answer-box{
				height: 100%;
			}
		}
	}
</style>
