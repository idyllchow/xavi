var app = getApp()

const constants = require('../../utils/constants.js');
const RIGHT_BAR_HEIGHT = 20; // 右侧每一类的 bar 的高度（固定）
const RIGHT_ITEM_HEIGHT = 60; // 右侧每个子类的高度（固定）
const LEFT_ITEM_HEIGHT = 50 // 左侧每个类的高度（固定）

Page({
  data: {
    constants: [], // 总数据
    toView: null, // 左 => 右联动 右scroll-into-view 所需的id
    currentLeftSelect: null, // 当前左侧选择的
    eachRightItemToTop: [], // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    leftToTop: 0,
    totalCategory: 0,
    selecteds: [], // 已选数据
    totalNum: 0,
    totalPrice: 0,
  },
  onLoad: function() {
    this.setData({
      // menuContent: this.data.menu
      constants: constants,
      currentLeftSelect: constants[0].id,
      eachRightItemToTop: this.getEachRightItemToTop()
    })
  },

  getEachRightItemToTop: function() { // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
    var obj = {};
    var totop = 0;
    obj[constants[0].id] = totop // 右侧第一类肯定是到顶部的距离为 0
    for (let i = 1; i < (constants.length + 1); i++) { // 循环来计算每个子类到顶部的高度
      totop += (RIGHT_BAR_HEIGHT + constants[i - 1].category.length * RIGHT_ITEM_HEIGHT)
      obj[constants[i] ? constants[i].id : 'last'] = totop // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
    }
    return obj
  },
  rightScroll: function(e) { // 监听右侧的滚动事件与 eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
    for (let i = 0; i < this.data.constants.length; i++) {
      let left = this.data.eachRightItemToTop[this.data.constants[i].id]
      let right = this.data.eachRightItemToTop[this.data.constants[i + 1] ? this.data.constants[i + 1].id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        this.setData({
          currentLeftSelect: this.data.constants[i].id,
          leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }
  },
  jumpTo: function(e) { // 左侧类的点击事件，点击时，右侧会滚动到对应分类
    this.setData({
      toView: e.target.id || e.target.dataset.id,
      currentLeftSelect: e.target.id || e.target.dataset.id
    })
  },
  jumpToDetail: function(e) { //跳转到详情页面
    wx.navigateTo({
      url: '../detail/detail?menuItem=' + this.data.constants[parseInt(e.currentTarget.dataset.parentindex)],
    })
  },
  addFood: function(e) {
    //总数量+1
    this.data.totalNum += 1
    // console.log('selectedNum: ' + JSON.stringify(e))
    //当前物品
    var menuItem = this.data.constants[parseInt(e.currentTarget.dataset.parentindex)].category[e.currentTarget.dataset.childindex]
    //总价增加
    this.data.totalPrice += menuItem.price
    //当前物品选择数量+1
    menuItem.change_num += 1        
    for (var j = 0, len = this.data.selecteds.length; j < len; j++) {
      console.log('===========%d========%d======id: %s', j, len, JSON.stringify(this.data.selecteds))
      if (this.data.selecteds[j].category_id == menuItem.category_id) {
        this.data.selecteds.splice(j, 1)
        break
      }
    }
    this.data.selecteds.push(menuItem)
    // var name = menuItem.name
    // var count = menuItem.change_num
    console.log('parentid: ' + e.currentTarget.dataset.parentindex + '; childindex: ' + e.currentTarget.dataset.childindex + '; selected ' + JSON.stringify(this.data.selecteds))
    this.setData({ constants: this.data.constants, totalNum: this.data.totalNum, totalPrice: this.data.totalPrice})
  },
  removeFood: function(e) {
    this.data.totalNum -= 1
    var menuItem = this.data.constants[parseInt(e.currentTarget.dataset.parentindex)].category[e.currentTarget.dataset.childindex]
    // this.data.constants[parseInt(e.currentTarget.dataset.parentindex)].category[e.currentTarget.dataset.childindex].change_num -= 1
    this.data.totalPrice -= menuItem.price
    menuItem.change_num -= 1
    console.log('total num: ' + this.data.totalNum + '; total price: ' + this.data.totalPrice)
    this.setData({ constants: this.data.constants, totalNum: this.data.totalNum, totalPrice: this.data.totalPrice })
  },
  showShoppingCart: function(e) {
    if (this.data.totalNum <= 0) {
      return
    }
    wx.showActionSheet({
      itemList: ['A', 'B', 'C']
    })
  },
  submitBill: function(e) {
    if (this.data.totalNum <= 0) {
      wx.showToast({
        title: '请选择菜品',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '确定下单吗？',
    })
  }
})