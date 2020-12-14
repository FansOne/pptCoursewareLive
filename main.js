import Vue from 'vue'
import App from './App'
import Store from './store'

import router from "./router/index.js";
import { RouterMount } from "uni-simple-router";

// import VConsole from 'vconsole'
// new VConsole()


import './static/iconFont/iconfont.css';
import './static/iconFont/iconfont.ttf';
import './static/iconFont/iconfont.eot';
import './static/iconFont/iconfont.svg';
import './static/iconFont/iconfont.woff';

Vue.config.productionTip = false

Vue.prototype.$store = Store;

App.mpType = 'app'

const app = new Vue({
    ...App
})

//#ifdef H5
RouterMount(app, "#app");
//#endif

//#ifndef H5
app.$mount();
//#endif
