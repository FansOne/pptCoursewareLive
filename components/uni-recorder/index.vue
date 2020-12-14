<template>
	<view class="content">
		<view class="prompt-title" v-show="!recorderStop">{{recorderStart?'点击结束录音':'点击开始录音'}}</view>
		<view class="control-box">
			<!-- 开始录音按钮 -->
			<view v-if="!recorderStart" class="start-btn" @click="recStart()">
				<text class="iconfont iconmaikefeng"></text>
			</view>

			<!-- 结束录音按钮 -->
			<view v-else-if="!recorderStop" class="start-btn end-btn" @click="recStop">
				<Progress type="circle" :percent="(bufferDuration/60)*100" :show-info='false' :stroke-width='5' stroke-color='#22ac38'></Progress>
				<view class="block"></view>
				<view class="rec-duration">
					{{bufferDuration}}s
				</view>
			</view>

			<!-- 操作已完成的录音 -->
			<view v-else class="control-recorder">
				<view class="item-box">
					<view class="circle" @click="recorderStart=false,recorderStop=false,bufferDuration=0,audition=false,$refs.audioa.$refs.audio.pause()">
						<text class="iconfont iconicon--"></text>
					</view>
					<view class="prompt">重录</view>
				</view>
				<view class="item-box">
					<view class="circle" @click="audition = !audition">
						<text class="iconfont" :class="[audition?'iconzanting':'iconbofang']"></text>
					</view>
					<view class="prompt">{{audition?'正在试听':'试听'}}</view>
				</view>
				<view class="item-box">
					<view class="circle" :data-msgtype='3' @click="sendRecorder">
						<text class="iconfont iconfasong"></text>
					</view>
					<view class="prompt">发送</view>
				</view>
				<view class="rec-duration">
					已录音{{bufferDuration}}秒
				</view>
			</view>
		</view>

		<audio :src="audioUrl" ref='audioa' :controls='false' @ended="audition = false" type="audio/mp3"></audio>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex'

	import '../../utils/ios-weixin-config.js'
	import RecordApp from 'recorder-core/src/app-support/app'
	import 'recorder-core/src/app-support/app-ios-weixin-support'
	import 'recorder-core'
	import 'recorder-core/src/engine/mp3'
	import 'recorder-core/src/engine/mp3-engine'
	import 'recorder-core/src/engine/beta-amr'
	import 'recorder-core/src/engine/beta-amr-engine'
	import 'recorder-core/src/engine/wav.js'

	import Progress from "@/components/cmd-progress/cmd-progress.vue"
	import {
		uploadMinFile
	} from '../../utils/cosFile.js'
	import {
		msgformatManage,
		throttle
	} from '../../utils/tools.js'
	import {
		sendCustomMessage
	} from '../../utils/imApi.js'

	var rec, recBlob, timer;
	var wxRecorderTimer = 0;
	export default {
		data() {
			return {
				blob: null, //录音文件实例对象
				duration: 0, //时长
				bufferDuration: 0, //时长

				recorderStart: false,
				recorderStop: false,
				audition: false, //试听
				audioUrl: '',
			}
		},

		components: {
			Progress
		},

		watch: {
			'audition'(status) {
				//试听录音
				if (status) this.$refs.audioa.$refs.audio.play();
			},
			'bufferDuration'(time){
				if(time == 58) clearInterval(timer),this.recStop();
			}
		},

		created() {
			//立即加载环境，自动把Recorder加载进来
			RecordApp.Install(() => {

				console.log("RecordApp.Install成功", 1);

				rec = false;
				this.reReq()
			}, () => {
				var msg = "RecordApp.Install出错：" + err;
				uni.showModal({
					title: '无法发送语音',
					content: msg,
					showCancel: false,
					success: (res) => {
						if (res.confirm) this.$emit('closePopup')
					}
				});
			});
		},

		beforeDestroy() {
			clearInterval(timer)
			this.bufferDuration = 0
			wxRecorderTimer = 0
			RecordApp.Stop(
				null //success传null就只会清理资源，不会进行转码
				,
				function(msg) {
					console.log("已清理，错误信息：" + msg);
				}
			);
		},

		methods: {
			...mapMutations(['SET_GROUP_MSG']),

			// 调用 RequestPermission 请求录音权限
			reReq() {
				RecordApp.RequestPermission(() => {
					rec = true;
					console.log("已打开录音，可以点击录制开始录音了", 2);
				}, (err, isUserNotAllow) => {

					console.log((isUserNotAllow ? "UserNotAllow，" : "") + "请求录音权限失败：" + err, 2);

					if (!isUserNotAllow) return uni.showModal({
						title: '请求录音权限失败',
						content: err,
						showCancel: false,
						success: (res) => {
							if (res.confirm) this.$emit('closePopup')
						}
					});
				});
			},

			/**开始录音**/
			recStart() {
				if (rec != true) return uni.showToast({
					title: '微信授权中，请稍后再试',
					icon: 'none'
				})

				if (RecordApp.Current == RecordApp.Platforms.Weixin) {
					console.log("正在使用微信JsSDK，录音过程中不会有任何回调");
				} else if (RecordApp.Current == RecordApp.Platforms.Native) {
					console.log("正在使用Native录音，底层由App原生层提供支持");
				} else {
					console.log("正在使用H5录音，底层由Recorder直接提供支持");
				};

				var set = {
					type: "mp3",
					bitRate: 16,
					sampleRate: 16000,
					onProcess: (buffers, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
						//录音实时回调，大约1秒调用12次本回调。*IOS微信浏览器环境中不会走该回调
						this.bufferDuration = (bufferDuration / 1000).toFixed(1)
					}
				};

				this.blob = null;

				RecordApp.Start(set, () => {
					console.log(RecordApp.Current.Key + "录制中:" + set.type + " " + set.bitRate + "kbps", 2);
					this.recorderStart = true
					
					// ios微信浏览器中录音计时
					if (!RecordApp.Current.CanProcess()) {
						console.log("当前环境" + RecordApp.Current.Key + "不支持实时回调onProcess，不能模拟实时编码传输", 2)
					
						timer = setInterval(() => {
							this.bufferDuration = (wxRecorderTimer += 0.1).toFixed(1)
						}, 100)
					}
				}, function(err) {
					console.log(RecordApp.Current.Key + "开始录音失败：" + err, 1);
					RecordApp.close()
				});
			},

			/**结束录音**/
			recStop: throttle(function(){
				
				wxRecorderTimer = 0
				clearInterval(timer)
				
				RecordApp.Stop((blob, duration) => {
					let src = (window.URL || webkitURL).createObjectURL(blob); // 简单利用URL生成播放地址，注意不用了时需要revokeObjectURL，否则霸占内存
					this.audioUrl = src

					this.blob = blob;
					this.duration = duration;
					this.bufferDuration = (duration / 1000).toFixed(1);
					this.recorderStop = true;
					console.log("已录制mp3：" + duration + "ms " + blob.size + "字节，可以点击播放、上传了", 2);
				}, msg => {
					uni.showModal({
						showCancel: false,
						title: 'ERROR',
						content: msg || '录音失败',
						icon: 'none'
					})
					clearInterval(timer)
					this.bufferDuration = 0
					this.recorderStart = false
					wxRecorderTimer = 0
				});
			}),


			// 上传录音并发送
			sendRecorder(event) {
				uni.hideLoading()
				uni.showLoading({
					title:'录音同步中...'
				})
				this.audition = false;
				this.$refs.audioa.$refs.audio.pause();

				let newBlob = Object.assign(this.blob, {
					name: 'pptLiveVoice'
				});
				// 上传云 COS
				uploadMinFile(newBlob, async (err, data) => {
					uni.hideLoading();
					if (err) return uni.showToast({title:'上传失败，请刷新重试！',icon:'none'});

					let url = data.Location;

					// 发送群组自定义消息
					let params = await msgformatManage(event);

					params['description'] = 'sedVoice'
					params['url'] = url
					params['visit'] = false
					params['duration'] = (this.duration / 1000).toFixed(1)


					sendCustomMessage('group', params, () => {
						this.SET_GROUP_MSG(params)
						this.$emit('closePopup')
						window.URL.revokeObjectURL(this.audioUrl)
					})
				})
			},
		}
	}
</script>

<style lang="less" scoped>
	.content {
		height: 447rpx;
		background-color: #FFFFFF;
		border-radius: 25rpx 25rpx 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;

		.prompt-title {
			position: absolute;
			top: 90rpx;
			font-size: 22rpx;
			color: #A5A6A8;
		}

		.control-box {
			width: 100%;
			display: flex;
			justify-content: center;

			.start-btn {
				height: 160rpx;
				width: 160rpx;
				border-radius: 100rpx;
				background-color: #32BE82;
				box-shadow: 0 0 10rpx #32BE82;
				line-height: 160rpx;
				text-align: center;

				text {
					color: #FFFFFF;
					font-size: 80rpx;
				}
			}

			.end-btn {
				position: relative;
				border-radius: 0;
				background-color: #FFFFFF;
				box-shadow: none;

				.block {
					z-index: 999;
					position: absolute;
					left: 0;
					right: 0;
					top: 0;
					bottom: 0;
					width: 45rpx;
					height: 45rpx;
					border-radius: 10rpx;
					box-shadow: 0 0 10rpx #4CD964;
					background-color: #22ac38;
					margin: auto;
					transform: translateY(4rpx);
				}

				.rec-duration {
					color: #A5A6A8;
					line-height: 60rpx;
				}
			}

			.control-recorder {
				position: relative;
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0 137rpx;

				.item-box {
					width: 106rpx;

					.circle {
						width: 106rpx;
						height: 106rpx;
						text-align: center;
						border-radius: 50%;
						background-color: #F9F9F9;
						text-align: center;
						line-height: 106rpx;

						text {
							color: #666;
							display: inline-block;
						}

						.iconicon-- {
							font-size: 50rpx;
						}

						.iconbofang {
							font-size: 35rpx;
							transform: translateX(4rpx);
						}

						.iconzanting {
							font-size: 38rpx;
						}
					}

					.prompt {
						color: #666666;
						text-align: center;
						margin-top: 20rpx;
						font-size: 24rpx;
					}
				}

				.rec-duration {
					position: absolute;
					left: 0;
					right: 0;
					margin: auto;
					bottom: -77rpx;
					color: #A5A6A8;
					font-size: 20rpx;
					text-align: center;
				}
			}
		}
	}
</style>
