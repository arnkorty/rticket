const md5 = () => {}
const l = function(key, value) {
  this.key = key
  this.value = value
}

const h = {
  userAgent: '',
  appName: 'Netscape',
  appCodeName: 'Mozilla',
  language: 'zh-CN',
  onLine: true,
  mimeTypes: [
    {type: 'application/pdf'},
    {type: 'application/x-google-chrome-pdf'},
    {type: 'application/x-nacl'},
    {type: 'application/x-pnacl'}
  ] 
}
const queryInfo = {
  getMachineCode: function() {
      return [this.getUUID(), this.getCookieCode(), this.getUserAgent(), this.getScrHeight(), this.getScrWidth(), this.getScrAvailHeight(), this.getScrAvailWidth(), this.md5ScrColorDepth(), this.getScrDeviceXDPI(), this.getAppCodeName(), this.getAppName(), this.getJavaEnabled(), this.getMimeTypes(), this.getPlatform(), this.getAppMinorVersion(), this.getBrowserLanguage(), this.getCookieEnabled(), this.getCpuClass(), this.getOnLine(), this.getSystemLanguage(), this.getUserLanguage(), this.getTimeZone(), this.getFlashVersion(), this.getHistoryList(), this.getCustId(), this.getSendPlatform()]
  },
  md5ScrColorDepth: function() {
      return new l("scrColorDepth",r.screen.colorDepth.toString())
  },
  getHasLiedBrowser: function(a) {
      return new l("hasLiedBrowser",a)
  },
  hashAlg: function(a, b, c) {
      a.sort(function(a, b) {
          var c, d;
          if ("object" === typeof a && "object" === typeof b && a && b)
              return c = a.key,
              d = b.key,
              c === d ? 0 : typeof c === typeof d ? c < d ? -1 : 1 : typeof c < typeof d ? -1 : 1;
          throw "error";
      });
      for (var d = 0; d < a.length; d++) {
          var e = a[d].key.replace(RegExp("%", "gm"), "")
            , f = ""
            , f = "string" == typeof a[d].value ? a[d].value.replace(RegExp("%", "gm"), "") : a[d].value;
          "" !== f && (c += e + f,
          b += "\x26" + (void 0 == ib[e] ? e : ib[e]) + "\x3d" + f)
      }
      a = Ra(c);
      c = a.length;
      d = a.split("");
      for (e = 0; e < parseInt(c / 2); e++)
          0 == e % 2 && (f = a.charAt(e),
          d[e] = d[c - 1 - e],
          d[c - 1 - e] = f);
      a = d.join("");
      c = a.length;
      d = 0 == c % 3 ? parseInt(c / 3) : parseInt(c / 3) + 1;
      3 > c || (e = a.substring(0, 1 * d),
      f = a.substring(1 * d, 2 * d),
      a = a.substring(2 * d, c) + e + f);
      a = R.SHA256(a).toString(R.enc.Base64);
      c = Ra(a);
      c = R.SHA256(c).toString(R.enc.Base64);
      return new l(b,c)
  },
  NeedUpdate: function() {
      W("fp_ver", "4.6.1", 0);
      W("BSFIT_OKLJUJ", "", 0);
      return !1
  },
  getCpuClass: function() {
      var a;
      a = "IE" == this.checkBroswer() ? h.cpuClass.toString() : "";
      return new l("cpuClass",a)
  },
  getFlashVersion: function() {
      var a = 0;
      if ("IE" == this.checkBroswer())
          var b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
            , a = Number(b.GetVariable("$version").split(" ")[1].replace(/,/g, ".").replace(/^(d+.d+).*$/, "$1"));
      else
          h.plugins && 0 < h.plugins.length && (b = h.plugins["Shockwave Flash"]) && (flashArr = b.description.split(" "),
          a = flashArr[2] + " " + flashArr[3]);
      return new l("flashVersion",a)
  },
  getUserAgent: function() {
      var a = h.userAgent
        , a = a.replace(/\&|\+/g, "");
      return new l("userAgent",a.toString())
  },
  getCanvansCode: function(a) {
      var b;
      b = this.checkWapOrWeb() ? "wapSmartID" : "webSmartID";
      return new l(b,a)
  },
  getDfpMoreInfo: function(a) {
      var b = this;
      this.moreInfoArray = [];
      b.cfp.get(function(c, d) {
          b.moreInfoArray.push(b.getCanvansCode(c + ""));
          for (var e in d) {
              c = d[e].key;
              var f = d[e].value + "";
              switch (c) {
              case "session_storage":
                  b.moreInfoArray.push(b.getSessionStorage(f));
                  break;
              case "local_storage":
                  b.moreInfoArray.push(b.getLocalStorage(f));
                  break;
              case "indexed_db":
                  b.moreInfoArray.push(b.getIndexedDb(f));
                  break;
              case "open_database":
                  b.moreInfoArray.push(b.getOpenDatabase(f));
                  break;
              case "do_not_track":
                  b.moreInfoArray.push(b.getDoNotTrack(f));
                  break;
              case "ie_plugins":
                  b.moreInfoArray.push(b.getPlugins(f));
                  break;
              case "regular_plugins":
                  b.moreInfoArray.push(b.getPlugins());
                  break;
              case "adblock":
                  b.moreInfoArray.push(b.getAdblock(f));
                  break;
              case "has_lied_languages":
                  b.moreInfoArray.push(b.getHasLiedLanguages(f));
                  break;
              case "has_lied_resolution":
                  b.moreInfoArray.push(b.getHasLiedResolution(f));
                  break;
              case "has_lied_os":
                  b.moreInfoArray.push(b.getHasLiedOs(f));
                  break;
              case "has_lied_browser":
                  b.moreInfoArray.push(b.getHasLiedBrowser(f));
                  break;
              case "touch_support":
                  b.moreInfoArray.push(b.getTouchSupport(f));
                  break;
              case "js_fonts":
                  b.moreInfoArray.push(b.getJsFonts(f))
              }
          }
          "function" == typeof a && a()
      })
  },
  checkWapOrWeb: function() {
      return "WindowsPhone" == Ia() || "iOS" == Ia() || "Android" == Ia() ? !0 : !1
  },
  getTouchSupport: function(a) {
      a = "0,false,fals"
      return new l("touchSupport",ba(a.replace(RegExp(",", "gm"), "#")))
  },
  getLocalStorage: function(a) {
      return new l("localStorage",a)
  },
  getScrDeviceXDPI: function() {
      var a;
      // a = "IE" == this.checkBroswer() ? r.screen.deviceXDPI.toString() : "";
      return new l("scrDeviceXDPI", '')
  },
  getSendPlatform: function() {
      var a = ['WEB', 'WAP'];
      // a = this.checkWapOrWeb() ? ab[1] : ab[0];
      return new l("platform",a[0])
  },
  getAppCodeName: function() {
      return new l("appCodeName",h.appCodeName.toString())
  },
  getJsFonts: function(a) {
    // getJsFonts
    a = "Andale Mono,Arial,Arial Black,Arial Hebrew,Arial Narrow,Arial Rounded MT Bold,Arial Unicode MS,Comic Sans MS,Courier,Courier New,Geneva,Georgia,Helvetica,Helvetica Neue,Impact,LUCIDA GRANDE,Microsoft Sans Serif,Monaco,Palatino,Tahoma,Times,Times New Roman,Trebuchet MS,Verdana,Wingdings,Wingdings 2,Wingdings 3"
      return new l("jsFonts",ba(a.replace(RegExp(",", "gm"), "#")))
  },
  getOpenDatabase: function(a) {
      return new l("openDatabase",a || '1')
  },
  getAdblock: function(a) {
      return new l("adblock", '0')
  },
  getOnLine: function() {
      return new l("onLine",h.onLine.toString())
  },
  getMimeTypes: function() {
      for (var a = h.mimeTypes, b = "", c = 0; c < a.length; c++)
          b += a[c].type + "#";
      return new l("mimeTypes",ba(b.substr(0, b.length - 1)))
  },
  getCustId: function() {
      return new l("custID","133")
  },
  getAppMinorVersion: function() {
      var a;
      a = "IE" == this.checkBroswer() ? h.appMinorVersion.toString() : "";
      return new l("appMinorVersion",a)
  },
  getAppName: function() {
      return new l("appName",h.appName.toString())
  },
  checkBroswer: function() {
      h.userAgent.toString().indexOf("MSIE")
  },
  getpackStr: function(a) {
      var b = []
        , b = []
        , b = this.getMachineCode()
        , b = b.concat(this.moreInfoArray);
      null != a && void 0 != a && "" != a && 32 == a.length && b.push(new l("cookieCode",a));
      b.sort(function(a, b) {
          var c, d;
          if ("object" === typeof a && "object" === typeof b && a && b)
              return c = a.key,
              d = b.key,
              c === d ? 0 : typeof c === typeof d ? c < d ? -1 : 1 : typeof c < typeof d ? -1 : 1;
          throw "error";
      });
      return b
  },
  getPlugins: function(a) {
      // if ("IE" == this.checkBroswer())
      //     return new l("plugins",ba(a.replace(RegExp(",", "gm"), "#")));
      // a = h.plugins;
      // var b = "";
      a = [{
        name: 'fidjsof'
      }, {
        name: 'fodsjfodsf'
      }]
      for (i = 0; i < a.length; i++)
          b += a[i].name.toString() + "#";
      return new l("plugins",ba(b))
  },
  getSessionStorage: function(a) {
      return new l("sessionStorage",a)
  },
  getScrAvailWidth: function() {
      return new l("scrAvailWidth",r.screen.availWidth.toString())
  },
  getHasLiedResolution: function(a) {
      return new l("hasLiedResolution",a)
  },
  getTimeZone: function() {
      var a = (new Date).getTimezoneOffset() / 60;
      return new l("timeZone",a)
  },
  getJavaEnabled: function() {
      return new l("javaEnabled",h.javaEnabled() ? "1" : "0")
  },
  getUserLanguage: function() {
      var a;
      a = "IE" == this.checkBroswer() || this.checkOperaBroswer() ? h.userLanguage.toString() : "";
      return new l("userLanguage",a)
  },
  getDoNotTrack: function(a) {
      return new l("doNotTrack",a)
  },
  initEc: function(a) {
      var b = ""
        , c = this
        , d = void 0 != a && void 0 != a.localAddr ? a.localAddr : "";
      c.checkWapOrWeb();
      this.ec.get("RAIL_OkLJUJ", function(a) {
          b = a;
          c.getDfpMoreInfo(function() {
              if (!(9E5 < G("RAIL_EXPIRATION") - (new Date).getTime() & null != G("RAIL_DEVICEID") & void 0 != G("RAIL_DEVICEID") & !c.NeedUpdate())) {
                  for (var a = "", e = "", h = c.getpackStr(b), m = [], q = [], t = [], k = [], n = 0; n < h.length; n++)
                      "new" != h[n].value && -1 == Ib.indexOf(h[n].key) && (-1 != Gb.indexOf(h[n].key) ? q.push(h[n]) : -1 != Jb.indexOf(h[n].key) ? t.push(h[n]) : -1 != Hb.indexOf(h[n].key) ? k.push(h[n]) : m.push(h[n]));
                  h = "";
                  for (n = 0; n < q.length; n++)
                      h = h + q[n].key.charAt(0) + q[n].value;
                  q = "";
                  for (n = 0; n < k.length; n++)
                      q = 0 == n ? q + k[n].value : q + "x" + k[n].value;
                  k = "";
                  for (n = 0; n < t.length; n++)
                      k = 0 == n ? k + t[n].value : k + "x" + t[n].value;
                  m.push(new l("storeDb",h));
                  m.push(new l("srcScreenSize",q));
                  m.push(new l("scrAvailSize",k));
                  "" != d && m.push(new l("localCode",qb(d)));
                  e = c.hashAlg(m, a, e);
                  a = e.key;
                  e = e.value;
                  a += "\x26timestamp\x3d" + (new Date).getTime();
                  $a.getJSON("https://kyfw.12306.cn/otn/HttpZF/logdevice" + ("?algID\x3d8Q0hDwS83k\x26hashCode\x3d" + e + a), null, function(a) {
                      var b = JSON.parse(a);
                      void 0 != mb && mb.postMessage(a, r.parent);
                      for (var d in b)
                          "dfp" == d ? G("RAIL_DEVICEID") != b[d] && (W("RAIL_DEVICEID", b[d], 1E3),
                          c.deviceEc.set("RAIL_DEVICEID", b[d])) : "exp" == d ? W("RAIL_EXPIRATION", b[d], 1E3) : "cookieCode" == d && (c.ec.set("RAIL_OkLJUJ", b[d]),
                          W("RAIL_OkLJUJ", "", 0))
                  })
              }
          })
      }, 1)
  },
  getHasLiedOs: function(a) {
      return new l("hasLiedOs",a)
  },
  getHasLiedLanguages: function(a) {
      return new l("hasLiedLanguages",a)
  },
  checkOperaBroswer: function() {
      return r.opera
  },
  getSystemLanguage: function() {
      var a;
      a = "IE" == this.checkBroswer() || this.checkOperaBroswer() ? h.systemLanguage.toString() : "";
      return new l("systemLanguage",a)
  },
  getScrWidth: function() {
      return new l("scrWidth",r.screen.width.toString())
  },
  getLanguage: function() {
      return null != h.language ? h.language.toString() : ""
  },
  getBrowserLanguage: function() {
      var a;
      a = "IE" == this.checkBroswer() || this.checkOperaBroswer() ? h.browserLanguage.toString() : this.getLanguage();
      return new l("browserLanguage",a)
  },
  getPlatform: function() {
      return new l("os",h.platform.toString())
  },
  getScrHeight: function() {
      return new l("scrHeight",r.screen.height.toString())
  },
  getUUID: function() {
      return "" == G("RAIL_UUID") || null == G("RAIL_UUID") || void 0 == G("RAIL_UUID") ? new l("cookieCode","new") : new l("UUID",G("RAIL_UUID"))
  },
  getIndexedDb: function(a) {
      return new l("indexedDb",a)
  },
  getCookieCode: function() {
      "" == G("RAIL_OkLJUJ") || null == G("RAIL_OkLJUJ") || void 0 == G("RAIL_OkLJUJ") || G("RAIL_OkLJUJ");
      return new l("cookieCode","new")
  },
  getFingerPrint: function() {
      var a = this;
      r.RTCPeerConnection || r.webkitRTCPeerConnection || r.mozRTCPeerConnection ? ob(function(b) {
          a.initEc(b)
      }) : a.initEc()
  },
  getScrAvailHeight: function() {
      return new l("scrAvailHeight",r.screen.availHeight.toString())
  },
  getHistoryList: function() {
      return new l("historyList",r.history.length)
  },
  getCookieEnabled: function() {
      return new l("cookieEnabled",h.cookieEnabled ? "1" : "0")
  }
};
