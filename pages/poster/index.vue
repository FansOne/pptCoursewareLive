<template>
	<view class="content">
		<button type="default" @click="$refs.moreControl.open()">picker</button>

		<Popup ref='moreControl' type='bottom'>
			<view class="picker-box">
				<picker-view indicator-class="indicator-class" :value="value" @change="bindChange">
					<picker-view-column>
						<view class="item" v-for="(item,index) in days" :key="index">{{item}}</view>
					</picker-view-column>
				</picker-view>
			</view>
		</Popup>
	</view>

</template>

<script>
	import Popup from '@/components/uni-popup/uni-popup.vue'
	export default {
		data(){
			return{
				value:[3],
				days:[1,2,3,4,5,6,7,8,9]
			}
		},
		components: {
			Popup
		},
		methods:{
			bindChange(e){
				console.log(e.detail.value)
				this.value = e.detail.value
			}
		}
	}
</script>

<style lang="less" scoped>
	.picker-box {
		height: 500rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx 20rpx 0 0;
		overflow: hidden;
		picker-view{
			height: 500rpx;
			text-align: center;
			line-height: 70rpx;
		}
		/deep/.indicator-class{
			height: 70rpx;
		}
	}
</style>
