//cj.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    token: '',
    clickcj: '',
    help_status: false,
    cjInfo: [

    ],
    xqNum: {
      grade: '',
      semester: ''
    },
    xqName: {
      grade: '',
      semester: ''
    },
    jd: 0,
    xf: 0,
  },
  onPullDownRefresh: function() {
    if (this.data.pull == true)
      return
    this.data.pull = true;
    this.get_cj()
  },
  onLoad: function() {
    var _this = this;
    if (app.user_token === '' || app.user_token === null) {
      app.remind = "未绑定"
      wx.navigateTo({
        url: '/pages/index/index'
      });
    }
    app.name = app.name || wx.getStorageSync("name")
    app.xh = app.xh || wx.getStorageSync("xh")
    this.setData({
      xh: app.xh,
      name: app.name,
      offline: app.offline
    })
    if (!app.offline)
      this.get_cj()
    else {
      var ks = wx.getStorageSync("cj")
    }
  },
  onShow: function() {
    var _this = this;
    //判断并读取缓存    
    // if (wx.getStorageSync('cj') === '' || wx.getStorageSync('cj') === null) {
    //   //console.log("onshow cj获取的缓存为空");
    //   //重定向
    //   _this.setData({
    //     remind: '加载中'
    //   });
    //   this.getkscj();
    // } else {
    //   var cj = wx.getStorageSync('cj')

    //   //console.log(cj);
    //   _this.setData({
    //     'user': {
    //       'is_bind': true
    //     }
    //   });
    //   _this.cjRender(cj);
    //   _this.setData({
    //     remind: '加载中'
    //   });
    //   this.getkscj();

    // }
  },
  calgpa: function() {
    var cjInfo = this.data.cjInfo;
    var i;
    var credit = 0,
      totaljd = 0,
      xf = 0
    var totalfs = 0,
      totalxf = 0;
    for (i = 0; i < cjInfo.length; i++) {
      cjInfo[i].xf = parseFloat(cjInfo[i].xf)
      if (cjInfo[i].selected && cjInfo[i].jd) {
        credit += cjInfo[i].xf;
        totaljd += cjInfo[i].jd * cjInfo[i].xf;
      }
      if (cjInfo[i].selected) {
        var tcj = this.cjhs(cjInfo[i].score)
        if (tcj && tcj >= 60) {
          totalfs += tcj * cjInfo[i].xf //计算分数
          totalxf += cjInfo[i].xf //计算学分
        }
      }
      if (cjInfo[i].selected)
        xf += cjInfo[i].xf;
    }
    var jd = 0,
      aver = 0
    if (credit)
      jd = totaljd / credit;
    else
      jd = 0;
    if (totalxf)
      aver = totalfs / totalxf;
    this.setData({
      'jd': jd.toFixed(3),
      'xf': xf,
      'aver': aver.toFixed(3)
    })
  },
  bindCheckbox: function(e) {
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在cjInfo作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = this.data.cjInfo[index].selected;
    var cjInfo = this.data.cjInfo;
    // 对勾选状态取反
    cjInfo[index].selected = !selected;
    // 写回经点击修改后的数组
    this.setData({
      cjInfo: cjInfo
    });
    this.calgpa()
  },
  cjhs: function(cj) {
    if (parseFloat(cj)) {
      return cj;
    } else {
      switch (cj) {
        case "优秀":
        case "优":
          return 90;
        case "良":
        case "良好":
          return 80;
        case "中":
        case "中等":
          return 70;
        case "合格":
        case "及格":
          return 60
        case "不合格":
        case "不及格":
          return 0
        default:
          return undefined
      }
    }
  },
  bindSelectAll: function() {
    // 环境中目前已选状态
    var selectedAllStatus = this.data.selectedAllStatus;
    // 取反操作
    selectedAllStatus = !selectedAllStatus;
    // 购物车数据，关键是处理selected值
    var cjInfo = this.data.cjInfo;
    // 遍历
    for (var i = 0; i < cjInfo.length; i++) {
      cjInfo[i].selected = selectedAllStatus;
    }
    this.setData({
      selectedAllStatus: selectedAllStatus,
      cjInfo: cjInfo
    });
    this.calgpa()
  },
  get_cj: function() {
    if (!app.jwc) {
      this.setData({
        "remind": "请先绑定"
      })
      return
    }
    var _this = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/cj",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res && res.data)
          var cj = res.data.reverse()
        else
          var cj = []
        wx.setStorageSync('cj', cj);
        _this.cjRender(cj)
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      fail: function(error) {
        var cj = wx.getStorageSync("cj")
        _this.cjRender(cj)
        _this.setData({
          offline: true
        })
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  cjRender: function(_data) {
    var _this = this;
    _this.setData({
      cjInfo: _data,
      remind: ''
    });
    this.bindSelectAll()
  },
  tapHelp: function(e) {
    if (e.target.id == 'help') {
      this.hideHelp();
    }
  },
  showHelp: function(e) {
    var id = e.target.id;
    this.setData({
      'clickcj': this.data.cjInfo[id],
      'help_status': true
    });
  },
  hideHelp: function(e) {
    this.setData({
      'help_status': false
    });
  }
});