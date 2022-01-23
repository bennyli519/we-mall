const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
var WxParse = require('../../templates/wxParse/wxParse.js');
var app = getApp();
var starscore = require("../../templates/starscore/starscore.js");
//var server = require('../../utils/server');
Page(Object.assign({},{
  data: {
    onLoadStatus: true,
    indicatorDots: true,
    loadingStatus: false, // loading
    loadingFinish: false,
    goodsList: [],
    page: 1,
    pageSize: 5000,
  },
  onPullDownRefresh: function () {
    var that = this
    wx.showNavigationBarLoading()
    that.reLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  async onLoad(options) {
    AUTH.authorize().then(res => {
      AUTH.bindSeller()
    })
    var that = this
    app.getMallName().then(res => {
      wx.setNavigationBarTitle({
        title: res
      })
    })
    console.log('id---',options.id);

    await this.getGoods(options.id)
    that.setData({
      goodsList: app.globalData.goodsList,
      onLoadStatus: app.globalData.onLoadStatus,
    })
    if (!that.data.onLoadStatus) {
      that.showDialog('.onLoad-err')
    }
    
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('shareProfile'),
      path: '/pages/classification/index?inviter_id=' + wx.getStorageSync('uid'),
      imageUrl:'https://dcdn.it120.cc/2022/01/21/2edb8bc0-f423-45fd-a535-ca47e15ae2ee.png',
    }
  },
  reLoad: function () {
    var that = this
    that.setData({
      loadingStatus: true
    })
    /*wx.showLoading({
      title: '努力加载中···',
      mask: true,
    });*/
  },
  //事件处理函数
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  getGoods: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize,
        categoryId:Number(categoryId) 
      },
      success: function (res) {
        console.log('res-------------',res);
        that.setData({
          goodsList:res.data.data
        })
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
          data: {
            page: that.data.page,
            pageSize: that.data.pageSize,
            categoryId: categoryId
          },
          success: function (res) {
            that.setData({
              loadingStatus: false,
              loadingFinish: true
            })
            setTimeout(() => {
              that.setData({
                loadingFinish: false
              })
            }, 1500)

          },
          fail: function () {
            that.setData({
              onLoadStatus: false,
            })
            console.log('33')
          }
        })
      }
    })
  },
  async getPrompt() {
    const res = await WXAPI.queryConfigBatch('shopPrompt,shopPromptRate')
    if (res.code == 0) {
      const _data = {}
      res.data.forEach(config => {
        _data[config.key] = config.value        
      })
      _data.movable = { text: _data.shopPrompt }
      this.setData(_data)
    }
  },
  showDialog: function (dialogName) {
    let dialogComponent = this.selectComponent(dialogName)
    dialogComponent && dialogComponent.show();
  },
  hideDialog: function (dialogName) {
    let dialogComponent = this.selectComponent(dialogName)
    dialogComponent && dialogComponent.hide();
  },
  onConfirm: function () {
    this.hideDialog('.onLoad-err')
    this.reLoad()
  },
  onCancel: function () {
    this.hideDialog('.onLoad-err')
  },
}));

