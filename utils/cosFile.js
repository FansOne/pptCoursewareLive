import COS from 'cos-js-sdk-v5'
import SparkMD5 from 'spark-md5'
import {
	upload
} from '../api/index.js';

var key = ''
// 配置
const cosConfig = {
	Bucket: 'xfky-1255765740',
	Region: 'ap-beijing',
	Domain: process.env.Domain
}

// 初始化实例
var cos = new COS({
	getAuthorization: function(options, callback) {
		const promise = upload.cosKey()
		promise.then(res => {
			const auth = {
				TmpSecretId: res.data.credentials.tmpSecretId,
				TmpSecretKey: res.data.credentials.tmpSecretKey,
				XCosSecurityToken: res.data.credentials.sessionToken,
				StartTime: res.data.startTime,
				ExpiredTime: res.data.expiredTime // 在ExpiredTime时间前，不会再次调用getAuthorization
			}
			callback(auth)
		})
	}
})

// 获取cos存储的图片地址，替换为域名地址
function getObjectUrl() {
	const url = cos.getObjectUrl({
		Bucket: cosConfig.Bucket,
		Region: cosConfig.Region,
		Key: key,
		Sign: false
	}, function(err, data) {
		// console.log(err || data)
	})
	// 腾讯云的地址替换为域名地址
	const p = `${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com`
	return url.replace(p, cosConfig.Domain)
}

// 获得文件md5
function getFileMD5(file, callback) {
	// 声明必要的变量
	const fileReader = new FileReader()
	// 文件每块分割2M，计算分割详情
	const chunkSize = 2 * 1024 * 1024;
	const chunks = Math.ceil(file.size / chunkSize)
	let currentChunk = 0

	// 创建md5对象（基于SparkMD5）
	const spark = new SparkMD5()

	// 每块文件读取完毕之后的处理
	fileReader.onload = function(e) {
		// 每块交由sparkMD5进行计算
		spark.appendBinary(e.target.result)
		currentChunk++

		// 如果文件处理完成计算MD5，如果还有分片继续处理
		if (currentChunk < chunks) {
			loadNext()
		} else {
			callback(spark.end())
		}
	}

	// 处理单片文件的上传
	function loadNext() {
		const start = currentChunk * chunkSize
		const end = start + chunkSize >= file.size ? file.size : start + chunkSize

		fileReader.readAsBinaryString(file.slice(start, end))
	}

	loadNext()
}

// 大文件分片上传-通过sliceUploadFile上传
export function uploadMaxFile(file, callback, progressBc) {
	// 得到md5码
	getFileMD5(file, md5 => {
		// 存储文件的md5码
		file.md5 = md5
		const subfix = file.name.substr(file.name.lastIndexOf('.'))
		key = file.md5 + subfix;
		cos.sliceUploadFile({
			Bucket: cosConfig.Bucket,
			Region: cosConfig.Region,
			Key: key,
			Body: file,
			onProgress: function(progressData) {
				progressBc(progressData.percent)
			}
		}, function(err, data) {
			if (err) {
				callback(err)
			} else {
				data.fid = getObjectUrl()
				callback(null, data)
			}
		})
	})
}

// 小文件上传-通过putObject上传
export function uploadMinFile(file, callback, progress) {

	let isAudioBlobFile = false
	if (file.type && file.type === 'audio/mp3') isAudioBlobFile = true;
	// 得到md5码
	getFileMD5(file, md5 => {
		// 存储文件的md5码
		file.md5 = md5
		const subfix = file.name.substr(file.name.lastIndexOf('.'));
		
		if(isAudioBlobFile) key = 'h5pptlive/upload/' + file.md5 + subfix +'.mp3';
		else key = 'h5pptlive/upload/' + file.md5 + subfix;
		
		cos.putObject({
			Bucket: cosConfig.Bucket,
			Region: cosConfig.Region,
			Key: key,
			Body: file,
			onProgress: (progressData) => {
				// console.log(JSON.stringify(info))
				progress(progressData.percent)
			}
		}, (err, data) => {
			callback(err, data)
		})
	})
}

/**
 * 多文件上传
 * @param {Object}  options = {
	file: [...]; 待上传文件集合
	process: fun, 上传进度
	success: fun, 上传成功回调
	fail: fun, 上传失败回调
 }*/
export function syncManyFileUpload(options){
	let idx = 0;
	let _upload = ()=> {
		_promiseUpload(options.file[idx], (percent,fileIndex) =>{
			options.process && options.process(percent,fileIndex)
		})
		.then(([data,fileIdx]) =>{
			options.success(data,fileIdx)
		})
		.catch(([err,fileIdx]) =>{
			options.fail(err,fileIdx)
		})
		
		idx++
		if(options.file[idx]){
			_upload()
		}else{
			// end
			return
		}
	};
	
	_upload()
}

var _promiseUpload = function(file,processCallback){
	return new Promise((resolve,reject) => {
		getFileMD5(file.blob, md5 => {
			// 存储文件的md5码
			file.blob.md5 = md5
			const subfix = file.blob.name.substr(file.blob.name.lastIndexOf('.'));
			
			key = 'h5pptlive/upload/' + file.blob.md5 + subfix;
			
			cos.putObject({
				Bucket: cosConfig.Bucket,
				Region: cosConfig.Region,
				Key: key,
				Body: file.blob,
				onProgress: (progressData) => {
					// 单个文件上传进度 0 1
					processCallback && processCallback(progressData.percent,file.index)
				}
			}, (err, data) => {
				if (err) {
					reject([err,file.index]);
				}
				if (data) {
					resolve([data,file.index]);
				}
			})
		})
	})
}

// 删除指定文件
export function removeFile(Key, callback) {
	cos.deleteObject({
		Bucket: cosConfig.Bucket,
		Region: cosConfig.Region,
		Key: Key
	}, function(err, data) {
		callback(err, data)
	});
}
