!(function (e) {
  var t,
    n,
    i,
    o,
    c,
    l =
      '<svg><symbol id="icon-zhifupingtai-zhifubao" viewBox="0 0 1325 1024"><path d="M240.941176 512c0 233.411765 188.235294 421.647059 421.647059 421.647059s421.647059-188.235294 421.647059-421.647059S896 90.352941 662.588235 90.352941 240.941176 278.588235 240.941176 512z" fill="#5A9EF7" ></path><path d="M751.435294 564.705882s15.058824-21.082353 30.117647-63.247058c16.564706-42.164706 18.070588-66.258824 18.070588-66.258824l-120.470588-1.505882v-40.658824l146.070588-1.505882v-30.117647H677.647059v-66.258824h-72.282353V361.411765H466.823529v30.117647l137.035295-1.505883v45.176471h-108.42353v24.094118h225.882353c-1.505882 15.058824-6.023529 28.611765-10.541176 42.164706-9.035294 22.588235-18.070588 43.670588-18.070589 43.670588s-105.411765-37.647059-162.635294-37.647059c-55.717647 0-123.482353 22.588235-131.011764 87.341176-6.023529 64.752941 31.623529 100.894118 85.835294 112.941177 52.705882 12.047059 102.4 0 146.070588-21.082353 43.670588-21.082353 85.835294-69.270588 85.835294-69.270588l224.376471 109.929411s13.552941-21.082353 24.094117-40.658823c7.529412-13.552941 13.552941-28.611765 19.576471-42.164706l-233.411765-79.811765z m-231.905882 106.917647c-79.811765 0-94.870588-39.152941-94.870588-66.258823 0-27.105882 16.564706-58.729412 84.329411-63.247059 66.258824-4.517647 158.117647 48.188235 158.117647 48.188235s-67.764706 81.317647-147.57647 81.317647z" fill="#FFFFFF" ></path></symbol><symbol id="icon-weixinzhifu" viewBox="0 0 1024 1024"><path d="M395.846 603.585c-3.921 1.98-7.936 2.925-12.81 2.925-10.9 0-19.791-5.85-24.764-14.625l-2.006-3.864-78.106-167.913c-0.956-1.98-0.956-3.865-0.956-5.845 0-7.83 5.928-13.68 13.863-13.68 2.965 0 5.928 0.944 8.893 2.924l91.965 64.43c6.884 3.864 14.82 6.79 23.708 6.79 4.972 0 9.85-0.945 14.822-2.926L861.71 282.479c-77.149-89.804-204.684-148.384-349.135-148.384-235.371 0-427.242 157.158-427.242 351.294 0 105.368 57.361 201.017 147.323 265.447 6.88 4.905 11.852 13.68 11.852 22.45 0 2.925-0.957 5.85-2.006 8.775-6.881 26.318-18.831 69.334-18.831 71.223-0.958 2.92-2.013 6.79-2.013 10.75 0 7.83 5.929 13.68 13.865 13.68 2.963 0 5.928-0.944 7.935-2.925l92.922-53.674c6.885-3.87 14.82-6.794 22.756-6.794 3.916 0 8.889 0.944 12.81 1.98 43.496 12.644 91.012 19.53 139.48 19.53 235.372 0 427.24-157.158 427.24-351.294 0-58.58-17.78-114.143-48.467-163.003l-491.39 280.07-2.963 1.98z" fill="#09BB07" ></path></symbol></svg>',
    d = (d = document.getElementsByTagName('script'))[d.length - 1].getAttribute('data-injectcss'),
    s = function (e, t) {
      t.parentNode.insertBefore(e, t);
    };
  if (d && !e.__iconfont__svg__cssinject__) {
    e.__iconfont__svg__cssinject__ = !0;
    try {
      document.write(
        '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>'
      );
    } catch (e) {
      console && console.log(e);
    }
  }
  function a() {
    c || ((c = !0), i());
  }
  function r() {
    try {
      o.documentElement.doScroll('left');
    } catch (e) {
      return void setTimeout(r, 50);
    }
    a();
  }
  (t = function () {
    var e,
      t = document.createElement('div');
    (t.innerHTML = l),
      (l = null),
      (t = t.getElementsByTagName('svg')[0]) &&
        (t.setAttribute('aria-hidden', 'true'),
        (t.style.position = 'absolute'),
        (t.style.width = 0),
        (t.style.height = 0),
        (t.style.overflow = 'hidden'),
        (t = t),
        (e = document.body).firstChild ? s(t, e.firstChild) : e.appendChild(t));
  }),
    document.addEventListener
      ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
        ? setTimeout(t, 0)
        : ((n = function () {
            document.removeEventListener('DOMContentLoaded', n, !1), t();
          }),
          document.addEventListener('DOMContentLoaded', n, !1))
      : document.attachEvent &&
        ((i = t),
        (o = e.document),
        (c = !1),
        r(),
        (o.onreadystatechange = function () {
          'complete' == o.readyState && ((o.onreadystatechange = null), a());
        }));
})(window);
