!(function () {
  "use strict";
  var r = window.location,
    i = window.document,
    // by = {'data-domain': 'http://localhost:3000'},
    // o = { getAttribute: (attr) => by[attr], src: "http://localhost:3000/script.js" },
    o = i.currentScript,
    s = o.getAttribute("data-api") || new URL(o.src).origin + "/api";
  function log(e) {
    console.warn("Ignoring Event: " + e);
  }
  function e(e, t) {
    if (
      /^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(r.hostname) ||
      "file:" === r.protocol
    )
      return log("localhost");
    if (
      !(
        window._phantom ||
        window.__nightmare ||
        window.navigator.webdriver ||
        window.Cypress
      )
    ) {
      try {
        if ("true" === window.localStorage.plausible_ignore)
          return log("localStorage flag");
      } catch (e) {}
      var n = {},
        a =
          ((n.n = e),
          (n.u = r.href),
          (n.d = o.getAttribute("data-domain")),
          (n.r = i.referrer || null),
          t && t.meta && (n.m = JSON.stringify(t.meta)),
          t && t.props && (n.p = t.props),
          new XMLHttpRequest());
      if (window.screen) {
        n.s = `${window.screen.width}x${window.screen.height}`
      }
      a.open("POST", s, !0),
        a.setRequestHeader("Content-Type", "text/plain"),
        a.send(JSON.stringify(n)),
        (a.onreadystatechange = function () {
          4 === a.readyState && t && t.callback && t.callback();
        });
    }
  }
  var t = (window.plausible && window.plausible.q) || [];
  window.plausible = e;
  for (var n, a = 0; a < t.length; a++) e.apply(this, t[a]);
  function p() {
    n !== r.pathname && ((n = r.pathname), e("pageview"));
  }
  var u,
    c = window.history;
  function f(e) {
    return e && e.tagName && "a" === e.tagName.toLowerCase();
  }
  c.pushState &&
    ((u = c.pushState),
    (c.pushState = function () {
      u.apply(this, arguments), p();
    }),
    window.addEventListener("popstate", p)),
    "prerender" === i.visibilityState
      ? i.addEventListener("visibilitychange", function () {
          n || "visible" !== i.visibilityState || p();
        })
      : p();
  var d = 1;
  function v(e) {
    ("auxclick" === e.type && e.button !== d) ||
      ((e = (function (e) {
        for (; e && (void 0 === e.tagName || !f(e) || !e.href); )
          e = e.parentNode;
        return e;
      })(e.target)) &&
        e.href &&
        e.href.split("?")[0],
      (function e(t, n) {
        if (!t || g < n) return !1;
        if (b(t)) return !0;
        return e(t.parentNode, n + 1);
      })(e, 0));
  }
  function m(e, t, n) {
    var a = !1;
    function r() {
      a || ((a = !0), (window.location = t.href));
    }
    !(function (e, t) {
      if (!e.defaultPrevented)
        return (
          (t = !t.target || t.target.match(/^_(self|parent|top)$/i)),
          (e = !(e.ctrlKey || e.metaKey || e.shiftKey) && "click" === e.type),
          t && e
        );
    })(e, t)
      ? plausible(n.name, { props: n.props })
      : (plausible(n.name, { props: n.props, callback: r }),
        setTimeout(r, 5e3),
        e.preventDefault());
  }
  function w(e) {
    var e = b(e) ? e : e && e.parentNode,
      t = { name: null, props: {} },
      n = e && e.classList;
    if (n)
      for (var a = 0; a < n.length; a++) {
        var r,
          i = n.item(a).match(/ja-event-(.+)(=|--)(.+)/);
        i &&
          ((r = i[1]),
          (i = i[3].replace(/\+/g, " ")),
          "name" === r.toLowerCase() ? (t.name = i) : (t.props[r] = i));
      }
    return t;
  }
  i.addEventListener("click", v), i.addEventListener("auxclick", v);
  var g = 3;
  function h(e) {
    if ("auxclick" !== e.type || e.button === d) {
      for (var t, n, a, r, i = e.target, o = 0; o <= g && i; o++) {
        if ((a = i) && a.tagName && "form" === a.tagName.toLowerCase()) return;
        f(i) && (t = i), b(i) && (n = i), (i = i.parentNode);
      }
      n &&
        ((r = w(n)),
        t
          ? ((r.props.url = t.href), m(e, t, r))
          : plausible(r.name, { props: r.props }));
    }
  }
  function b(e) {
    var t = e && e.classList;
    if (t)
      for (var n = 0; n < t.length; n++)
        if (t.item(n).match(/ja-event-name(=|--)(.+)/)) return !0;
    return !1;
  }
  i.addEventListener("submit", function (e) {
    var t,
      n = e.target,
      a = w(n);
    function r() {
      t || ((t = !0), n.submit());
    }
    a.name &&
      (e.preventDefault(),
      (t = !1),
      setTimeout(r, 5e3),
      plausible(a.name, { props: a.props, callback: r }));
  }),
    i.addEventListener("click", h),
    i.addEventListener("auxclick", h);

  console.log('installed')


  function sendPostRequest(url, data, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText)
      }
    }
    xhr.send(JSON.stringify(data))
  }

  var domain = window.document.currentScript.getAttribute('data-domain')
  window.addEventListener('error', (event) => {
    try {
      const origin = domain
      const url = window.location.href
      const payload = { message: event.message, origin, url }
      sendPostRequest('https://a.jorgeadolfo.com/error', payload)
      // sendPostRequest('http://localhost:3000/error', payload)
      console.error('error', event)
    } catch (e) {
      console.error('catch', e)
    }
  )

console.log('error-installed')
})();

