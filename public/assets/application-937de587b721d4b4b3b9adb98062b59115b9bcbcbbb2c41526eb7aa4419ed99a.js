/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */

(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
/*!
 * jQuery JavaScript Library v3.3.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2018-01-20T17:24Z
 */

( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};




	var preservedScriptAttributes = {
		type: true,
		src: true,
		noModule: true
	};

	function DOMEval( code, doc, node ) {
		doc = doc || document;

		var i,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {
				if ( node[ i ] ) {
					script[ i ] = node[ i ];
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.3.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {

		/* eslint-disable no-unused-vars */
		// See https://github.com/eslint/eslint/issues/6125
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		DOMEval( code );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	disabledAncestor = addCombinator(
		function( elem ) {
			return elem.disabled === true && ("form" in elem || "label" in elem);
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						disabledAncestor( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
        if ( nodeName( elem, "iframe" ) ) {
            return elem.contentDocument;
        }

        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
        // Treat the template element as a regular one in browsers that
        // don't support it.
        if ( nodeName( elem, "template" ) ) {
            elem = elem.content || elem;
        }

        return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			jQuery.contains( elem.ownerDocument, elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, contains, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();
var documentElement = document.documentElement;



var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 only
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), doc, node );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		div.style.position = "absolute";
		scrollboxSizeVal = div.offsetWidth === 36 || "absolute";

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a property mapped along what jQuery.cssProps suggests or to
// a vendor prefixed property.
function finalPropName( name ) {
	var ret = jQuery.cssProps[ name ];
	if ( !ret ) {
		ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
	}
	return ret;
}

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5
		) );
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),
		val = curCSS( elem, dimension, styles ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox;

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}

	// Check for style in case a browser which returns unreliable values
	// for getComputedStyle silently falls back to the reliable elem.style
	valueIsBorderBox = valueIsBorderBox &&
		( support.boxSizingReliable() || val === elem.style[ dimension ] );

	// Fall back to offsetWidth/offsetHeight when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	// Support: Android <=4.1 - 4.3 only
	// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
	if ( val === "auto" ||
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) {

		val = elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ];

		// offsetWidth/offsetHeight provide border-box values
		valueIsBorderBox = true;
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),
				isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra && boxModelAdjustment(
					elem,
					dimension,
					extra,
					isBorderBox,
					styles
				);

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && support.scrollboxSize() === styles.position ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = Date.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" ).prop( {
					charset: s.scriptCharset,
					src: s.url
				} ).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.14.5
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Popper = factory());
}(this, (function () { 'use strict';

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  return isFixed(getParentNode(element));
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  // Avoid blurry text by using full pixel integers.
  // For pixel-perfect positioning, top/bottom prefers rounded
  // values, while left/right prefers floored values.
  var offsets = {
    left: Math.floor(popper.left),
    top: Math.round(popper.top),
    bottom: Math.round(popper.bottom),
    right: Math.floor(popper.right)
  };

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport'
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

return Popper;

})));
/*!
  * Bootstrap v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
  (global = global || self, factory(global.bootstrap = {}, global.jQuery, global.Popper));
}(this, function (exports, $, Popper) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
  Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): util.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */

  var TRANSITION_END = 'transitionend';
  var MAX_UID = 1000000;
  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined; // eslint-disable-line no-undefined
      }
    };
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;
    $(this).one(Util.TRANSITION_END, function () {
      called = true;
    });
    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);
    return this;
  }

  function setTransitionEndSupport() {
    $.fn.emulateTransitionEnd = transitionEndEmulator;
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  var Util = {
    TRANSITION_END: 'bsTransitionEnd',
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));

      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute('data-target');

      if (!selector || selector === '#') {
        var hrefAttr = element.getAttribute('href');
        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        return null;
      }
    },
    getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
      if (!element) {
        return 0;
      } // Get transition-duration of the element


      var transitionDuration = $(element).css('transition-duration');
      var transitionDelay = $(element).css('transition-delay');
      var floatTransitionDuration = parseFloat(transitionDuration);
      var floatTransitionDelay = parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // If multiple durations are defined, take the first


      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];
      return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    // TODO: Remove in v5
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && Util.isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      if (!document.documentElement.attachShadow) {
        return null;
      } // Can find the shadow root otherwise it'll return the document


      if (typeof element.getRootNode === 'function') {
        var root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }

      if (element instanceof ShadowRoot) {
        return element;
      } // when we don't find a shadow root


      if (!element.parentNode) {
        return null;
      }

      return Util.findShadowRoot(element.parentNode);
    }
  };
  setTransitionEndSupport();

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'alert';
  var VERSION = '4.3.1';
  var DATA_KEY = 'bs.alert';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  };
  var Event = {
    CLOSE: "close" + EVENT_KEY,
    CLOSED: "closed" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Alert =
  /*#__PURE__*/
  function () {
    function Alert(element) {
      this._element = element;
    } // Getters


    var _proto = Alert.prototype;

    // Public
    _proto.close = function close(element) {
      var rootElement = this._element;

      if (element) {
        rootElement = this._getRootElement(element);
      }

      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    } // Private
    ;

    _proto._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = document.querySelector(selector);
      }

      if (!parent) {
        parent = $(element).closest("." + ClassName.ALERT)[0];
      }

      return parent;
    };

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $.Event(Event.CLOSE);
      $(element).trigger(closeEvent);
      return closeEvent;
    };

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      $(element).removeClass(ClassName.SHOW);

      if (!$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element);

        return;
      }

      var transitionDuration = Util.getTransitionDurationFromElement(element);
      $(element).one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }).emulateTransitionEnd(transitionDuration);
    };

    _proto._destroyElement = function _destroyElement(element) {
      $(element).detach().trigger(Event.CLOSED).remove();
    } // Static
    ;

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === 'close') {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Alert._jQueryInterface;
  $.fn[NAME].Constructor = Alert;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$1 = 'button';
  var VERSION$1 = '4.3.1';
  var DATA_KEY$1 = 'bs.button';
  var EVENT_KEY$1 = "." + DATA_KEY$1;
  var DATA_API_KEY$1 = '.data-api';
  var JQUERY_NO_CONFLICT$1 = $.fn[NAME$1];
  var ClassName$1 = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };
  var Selector$1 = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLE: '[data-toggle="buttons"]',
    INPUT: 'input:not([type="hidden"])',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };
  var Event$1 = {
    CLICK_DATA_API: "click" + EVENT_KEY$1 + DATA_API_KEY$1,
    FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY$1 + DATA_API_KEY$1 + " " + ("blur" + EVENT_KEY$1 + DATA_API_KEY$1)
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Button =
  /*#__PURE__*/
  function () {
    function Button(element) {
      this._element = element;
    } // Getters


    var _proto = Button.prototype;

    // Public
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true;
      var rootElement = $(this._element).closest(Selector$1.DATA_TOGGLE)[0];

      if (rootElement) {
        var input = this._element.querySelector(Selector$1.INPUT);

        if (input) {
          if (input.type === 'radio') {
            if (input.checked && this._element.classList.contains(ClassName$1.ACTIVE)) {
              triggerChangeEvent = false;
            } else {
              var activeElement = rootElement.querySelector(Selector$1.ACTIVE);

              if (activeElement) {
                $(activeElement).removeClass(ClassName$1.ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            if (input.hasAttribute('disabled') || rootElement.hasAttribute('disabled') || input.classList.contains('disabled') || rootElement.classList.contains('disabled')) {
              return;
            }

            input.checked = !this._element.classList.contains(ClassName$1.ACTIVE);
            $(input).trigger('change');
          }

          input.focus();
          addAriaPressed = false;
        }
      }

      if (addAriaPressed) {
        this._element.setAttribute('aria-pressed', !this._element.classList.contains(ClassName$1.ACTIVE));
      }

      if (triggerChangeEvent) {
        $(this._element).toggleClass(ClassName$1.ACTIVE);
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$1);
      this._element = null;
    } // Static
    ;

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$1);

        if (!data) {
          data = new Button(this);
          $(this).data(DATA_KEY$1, data);
        }

        if (config === 'toggle') {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$1;
      }
    }]);

    return Button;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$1.CLICK_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    event.preventDefault();
    var button = event.target;

    if (!$(button).hasClass(ClassName$1.BUTTON)) {
      button = $(button).closest(Selector$1.BUTTON);
    }

    Button._jQueryInterface.call($(button), 'toggle');
  }).on(Event$1.FOCUS_BLUR_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    var button = $(event.target).closest(Selector$1.BUTTON)[0];
    $(button).toggleClass(ClassName$1.FOCUS, /^focus(in)?$/.test(event.type));
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$1] = Button._jQueryInterface;
  $.fn[NAME$1].Constructor = Button;

  $.fn[NAME$1].noConflict = function () {
    $.fn[NAME$1] = JQUERY_NO_CONFLICT$1;
    return Button._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$2 = 'carousel';
  var VERSION$2 = '4.3.1';
  var DATA_KEY$2 = 'bs.carousel';
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = '.data-api';
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  var SWIPE_THRESHOLD = 40;
  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true,
    touch: true
  };
  var DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean',
    touch: 'boolean'
  };
  var Direction = {
    NEXT: 'next',
    PREV: 'prev',
    LEFT: 'left',
    RIGHT: 'right'
  };
  var Event$2 = {
    SLIDE: "slide" + EVENT_KEY$2,
    SLID: "slid" + EVENT_KEY$2,
    KEYDOWN: "keydown" + EVENT_KEY$2,
    MOUSEENTER: "mouseenter" + EVENT_KEY$2,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$2,
    TOUCHSTART: "touchstart" + EVENT_KEY$2,
    TOUCHMOVE: "touchmove" + EVENT_KEY$2,
    TOUCHEND: "touchend" + EVENT_KEY$2,
    POINTERDOWN: "pointerdown" + EVENT_KEY$2,
    POINTERUP: "pointerup" + EVENT_KEY$2,
    DRAG_START: "dragstart" + EVENT_KEY$2,
    LOAD_DATA_API: "load" + EVENT_KEY$2 + DATA_API_KEY$2,
    CLICK_DATA_API: "click" + EVENT_KEY$2 + DATA_API_KEY$2
  };
  var ClassName$2 = {
    CAROUSEL: 'carousel',
    ACTIVE: 'active',
    SLIDE: 'slide',
    RIGHT: 'carousel-item-right',
    LEFT: 'carousel-item-left',
    NEXT: 'carousel-item-next',
    PREV: 'carousel-item-prev',
    ITEM: 'carousel-item',
    POINTER_EVENT: 'pointer-event'
  };
  var Selector$2 = {
    ACTIVE: '.active',
    ACTIVE_ITEM: '.active.carousel-item',
    ITEM: '.carousel-item',
    ITEM_IMG: '.carousel-item img',
    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
    INDICATORS: '.carousel-indicators',
    DATA_SLIDE: '[data-slide], [data-slide-to]',
    DATA_RIDE: '[data-ride="carousel"]'
  };
  var PointerType = {
    TOUCH: 'touch',
    PEN: 'pen'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Carousel =
  /*#__PURE__*/
  function () {
    function Carousel(element, config) {
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._element = element;
      this._indicatorsElement = this._element.querySelector(Selector$2.INDICATORS);
      this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent);

      this._addEventListeners();
    } // Getters


    var _proto = Carousel.prototype;

    // Public
    _proto.next = function next() {
      if (!this._isSliding) {
        this._slide(Direction.NEXT);
      }
    };

    _proto.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && $(this._element).is(':visible') && $(this._element).css('visibility') !== 'hidden') {
        this.next();
      }
    };

    _proto.prev = function prev() {
      if (!this._isSliding) {
        this._slide(Direction.PREV);
      }
    };

    _proto.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (this._element.querySelector(Selector$2.NEXT_PREV)) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    _proto.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    };

    _proto.to = function to(index) {
      var _this = this;

      this._activeElement = this._element.querySelector(Selector$2.ACTIVE_ITEM);

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $(this._element).one(Event$2.SLID, function () {
          return _this.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

      this._slide(direction, this._items[index]);
    };

    _proto.dispose = function dispose() {
      $(this._element).off(EVENT_KEY$2);
      $.removeData(this._element, DATA_KEY$2);
      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default, config);
      Util.typeCheckConfig(NAME$2, config, DefaultType);
      return config;
    };

    _proto._handleSwipe = function _handleSwipe() {
      var absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      var direction = absDeltax / this.touchDeltaX; // swipe left

      if (direction > 0) {
        this.prev();
      } // swipe right


      if (direction < 0) {
        this.next();
      }
    };

    _proto._addEventListeners = function _addEventListeners() {
      var _this2 = this;

      if (this._config.keyboard) {
        $(this._element).on(Event$2.KEYDOWN, function (event) {
          return _this2._keydown(event);
        });
      }

      if (this._config.pause === 'hover') {
        $(this._element).on(Event$2.MOUSEENTER, function (event) {
          return _this2.pause(event);
        }).on(Event$2.MOUSELEAVE, function (event) {
          return _this2.cycle(event);
        });
      }

      if (this._config.touch) {
        this._addTouchEventListeners();
      }
    };

    _proto._addTouchEventListeners = function _addTouchEventListeners() {
      var _this3 = this;

      if (!this._touchSupported) {
        return;
      }

      var start = function start(event) {
        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
          _this3.touchStartX = event.originalEvent.clientX;
        } else if (!_this3._pointerEvent) {
          _this3.touchStartX = event.originalEvent.touches[0].clientX;
        }
      };

      var move = function move(event) {
        // ensure swiping with one touch and not pinching
        if (event.originalEvent.touches && event.originalEvent.touches.length > 1) {
          _this3.touchDeltaX = 0;
        } else {
          _this3.touchDeltaX = event.originalEvent.touches[0].clientX - _this3.touchStartX;
        }
      };

      var end = function end(event) {
        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
          _this3.touchDeltaX = event.originalEvent.clientX - _this3.touchStartX;
        }

        _this3._handleSwipe();

        if (_this3._config.pause === 'hover') {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          _this3.pause();

          if (_this3.touchTimeout) {
            clearTimeout(_this3.touchTimeout);
          }

          _this3.touchTimeout = setTimeout(function (event) {
            return _this3.cycle(event);
          }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
        }
      };

      $(this._element.querySelectorAll(Selector$2.ITEM_IMG)).on(Event$2.DRAG_START, function (e) {
        return e.preventDefault();
      });

      if (this._pointerEvent) {
        $(this._element).on(Event$2.POINTERDOWN, function (event) {
          return start(event);
        });
        $(this._element).on(Event$2.POINTERUP, function (event) {
          return end(event);
        });

        this._element.classList.add(ClassName$2.POINTER_EVENT);
      } else {
        $(this._element).on(Event$2.TOUCHSTART, function (event) {
          return start(event);
        });
        $(this._element).on(Event$2.TOUCHMOVE, function (event) {
          return move(event);
        });
        $(this._element).on(Event$2.TOUCHEND, function (event) {
          return end(event);
        });
      }
    };

    _proto._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;

        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;

        default:
      }
    };

    _proto._getItemIndex = function _getItemIndex(element) {
      this._items = element && element.parentNode ? [].slice.call(element.parentNode.querySelectorAll(Selector$2.ITEM)) : [];
      return this._items.indexOf(element);
    };

    _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
      var isNextDirection = direction === Direction.NEXT;
      var isPrevDirection = direction === Direction.PREV;

      var activeIndex = this._getItemIndex(activeElement);

      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === Direction.PREV ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;
      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
    };

    _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
      var targetIndex = this._getItemIndex(relatedTarget);

      var fromIndex = this._getItemIndex(this._element.querySelector(Selector$2.ACTIVE_ITEM));

      var slideEvent = $.Event(Event$2.SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });
      $(this._element).trigger(slideEvent);
      return slideEvent;
    };

    _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        var indicators = [].slice.call(this._indicatorsElement.querySelectorAll(Selector$2.ACTIVE));
        $(indicators).removeClass(ClassName$2.ACTIVE);

        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName$2.ACTIVE);
        }
      }
    };

    _proto._slide = function _slide(direction, element) {
      var _this4 = this;

      var activeElement = this._element.querySelector(Selector$2.ACTIVE_ITEM);

      var activeElementIndex = this._getItemIndex(activeElement);

      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

      var nextElementIndex = this._getItemIndex(nextElement);

      var isCycling = Boolean(this._interval);
      var directionalClassName;
      var orderClassName;
      var eventDirectionName;

      if (direction === Direction.NEXT) {
        directionalClassName = ClassName$2.LEFT;
        orderClassName = ClassName$2.NEXT;
        eventDirectionName = Direction.LEFT;
      } else {
        directionalClassName = ClassName$2.RIGHT;
        orderClassName = ClassName$2.PREV;
        eventDirectionName = Direction.RIGHT;
      }

      if (nextElement && $(nextElement).hasClass(ClassName$2.ACTIVE)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $.Event(Event$2.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });

      if ($(this._element).hasClass(ClassName$2.SLIDE)) {
        $(nextElement).addClass(orderClassName);
        Util.reflow(nextElement);
        $(activeElement).addClass(directionalClassName);
        $(nextElement).addClass(directionalClassName);
        var nextElementInterval = parseInt(nextElement.getAttribute('data-interval'), 10);

        if (nextElementInterval) {
          this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
          this._config.interval = nextElementInterval;
        } else {
          this._config.interval = this._config.defaultInterval || this._config.interval;
        }

        var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
        $(activeElement).one(Util.TRANSITION_END, function () {
          $(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName$2.ACTIVE);
          $(activeElement).removeClass(ClassName$2.ACTIVE + " " + orderClassName + " " + directionalClassName);
          _this4._isSliding = false;
          setTimeout(function () {
            return $(_this4._element).trigger(slidEvent);
          }, 0);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        $(activeElement).removeClass(ClassName$2.ACTIVE);
        $(nextElement).addClass(ClassName$2.ACTIVE);
        this._isSliding = false;
        $(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    } // Static
    ;

    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$2);

        var _config = _objectSpread({}, Default, $(this).data());

        if (typeof config === 'object') {
          _config = _objectSpread({}, _config, config);
        }

        var action = typeof config === 'string' ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $(this).data(DATA_KEY$2, data);
        }

        if (typeof config === 'number') {
          data.to(config);
        } else if (typeof action === 'string') {
          if (typeof data[action] === 'undefined') {
            throw new TypeError("No method named \"" + action + "\"");
          }

          data[action]();
        } else if (_config.interval && _config.ride) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $(selector)[0];

      if (!target || !$(target).hasClass(ClassName$2.CAROUSEL)) {
        return;
      }

      var config = _objectSpread({}, $(target).data(), $(this).data());

      var slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($(target), config);

      if (slideIndex) {
        $(target).data(DATA_KEY$2).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$2;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);

    return Carousel;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$2.CLICK_DATA_API, Selector$2.DATA_SLIDE, Carousel._dataApiClickHandler);
  $(window).on(Event$2.LOAD_DATA_API, function () {
    var carousels = [].slice.call(document.querySelectorAll(Selector$2.DATA_RIDE));

    for (var i = 0, len = carousels.length; i < len; i++) {
      var $carousel = $(carousels[i]);

      Carousel._jQueryInterface.call($carousel, $carousel.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Carousel._jQueryInterface;
  $.fn[NAME$2].Constructor = Carousel;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Carousel._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$3 = 'collapse';
  var VERSION$3 = '4.3.1';
  var DATA_KEY$3 = 'bs.collapse';
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var DATA_API_KEY$3 = '.data-api';
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var Default$1 = {
    toggle: true,
    parent: ''
  };
  var DefaultType$1 = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event$3 = {
    SHOW: "show" + EVENT_KEY$3,
    SHOWN: "shown" + EVENT_KEY$3,
    HIDE: "hide" + EVENT_KEY$3,
    HIDDEN: "hidden" + EVENT_KEY$3,
    CLICK_DATA_API: "click" + EVENT_KEY$3 + DATA_API_KEY$3
  };
  var ClassName$3 = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector$3 = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Collapse =
  /*#__PURE__*/
  function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = [].slice.call(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
      var toggleList = [].slice.call(document.querySelectorAll(Selector$3.DATA_TOGGLE));

      for (var i = 0, len = toggleList.length; i < len; i++) {
        var elem = toggleList[i];
        var selector = Util.getSelectorFromElement(elem);
        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
          return foundElem === element;
        });

        if (selector !== null && filterElement.length > 0) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      if ($(this._element).hasClass(ClassName$3.SHOW)) {
        this.hide();
      } else {
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      if (this._isTransitioning || $(this._element).hasClass(ClassName$3.SHOW)) {
        return;
      }

      var actives;
      var activesData;

      if (this._parent) {
        actives = [].slice.call(this._parent.querySelectorAll(Selector$3.ACTIVES)).filter(function (elem) {
          if (typeof _this._config.parent === 'string') {
            return elem.getAttribute('data-parent') === _this._config.parent;
          }

          return elem.classList.contains(ClassName$3.COLLAPSE);
        });

        if (actives.length === 0) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $(actives).not(this._selector).data(DATA_KEY$3);

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $.Event(Event$3.SHOW);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($(actives).not(this._selector), 'hide');

        if (!activesData) {
          $(actives).data(DATA_KEY$3, null);
        }
      }

      var dimension = this._getDimension();

      $(this._element).removeClass(ClassName$3.COLLAPSE).addClass(ClassName$3.COLLAPSING);
      this._element.style[dimension] = 0;

      if (this._triggerArray.length) {
        $(this._triggerArray).removeClass(ClassName$3.COLLAPSED).attr('aria-expanded', true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $(_this._element).removeClass(ClassName$3.COLLAPSING).addClass(ClassName$3.COLLAPSE).addClass(ClassName$3.SHOW);
        _this._element.style[dimension] = '';

        _this.setTransitioning(false);

        $(_this._element).trigger(Event$3.SHOWN);
      };

      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension;
      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      if (this._isTransitioning || !$(this._element).hasClass(ClassName$3.SHOW)) {
        return;
      }

      var startEvent = $.Event(Event$3.HIDE);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();

      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
      Util.reflow(this._element);
      $(this._element).addClass(ClassName$3.COLLAPSING).removeClass(ClassName$3.COLLAPSE).removeClass(ClassName$3.SHOW);
      var triggerArrayLength = this._triggerArray.length;

      if (triggerArrayLength > 0) {
        for (var i = 0; i < triggerArrayLength; i++) {
          var trigger = this._triggerArray[i];
          var selector = Util.getSelectorFromElement(trigger);

          if (selector !== null) {
            var $elem = $([].slice.call(document.querySelectorAll(selector)));

            if (!$elem.hasClass(ClassName$3.SHOW)) {
              $(trigger).addClass(ClassName$3.COLLAPSED).attr('aria-expanded', false);
            }
          }
        }
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this2.setTransitioning(false);

        $(_this2._element).removeClass(ClassName$3.COLLAPSING).addClass(ClassName$3.COLLAPSE).trigger(Event$3.HIDDEN);
      };

      this._element.style[dimension] = '';
      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$3);
      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$1, config);
      config.toggle = Boolean(config.toggle); // Coerce string values

      Util.typeCheckConfig(NAME$3, config, DefaultType$1);
      return config;
    };

    _proto._getDimension = function _getDimension() {
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent;

      if (Util.isElement(this._config.parent)) {
        parent = this._config.parent; // It's a jQuery object

        if (typeof this._config.parent.jquery !== 'undefined') {
          parent = this._config.parent[0];
        }
      } else {
        parent = document.querySelector(this._config.parent);
      }

      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
      var children = [].slice.call(parent.querySelectorAll(selector));
      $(children).each(function (i, element) {
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
      });
      return parent;
    };

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      var isOpen = $(element).hasClass(ClassName$3.SHOW);

      if (triggerArray.length) {
        $(triggerArray).toggleClass(ClassName$3.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
      }
    } // Static
    ;

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? document.querySelector(selector) : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$3);

        var _config = _objectSpread({}, Default$1, $this.data(), typeof config === 'object' && config ? config : {});

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY$3, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$3;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$1;
      }
    }]);

    return Collapse;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$3.CLICK_DATA_API, Selector$3.DATA_TOGGLE, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.currentTarget.tagName === 'A') {
      event.preventDefault();
    }

    var $trigger = $(this);
    var selector = Util.getSelectorFromElement(this);
    var selectors = [].slice.call(document.querySelectorAll(selector));
    $(selectors).each(function () {
      var $target = $(this);
      var data = $target.data(DATA_KEY$3);
      var config = data ? 'toggle' : $trigger.data();

      Collapse._jQueryInterface.call($target, config);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$3] = Collapse._jQueryInterface;
  $.fn[NAME$3].Constructor = Collapse;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Collapse._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$4 = 'dropdown';
  var VERSION$4 = '4.3.1';
  var DATA_KEY$4 = 'bs.dropdown';
  var EVENT_KEY$4 = "." + DATA_KEY$4;
  var DATA_API_KEY$4 = '.data-api';
  var JQUERY_NO_CONFLICT$4 = $.fn[NAME$4];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event$4 = {
    HIDE: "hide" + EVENT_KEY$4,
    HIDDEN: "hidden" + EVENT_KEY$4,
    SHOW: "show" + EVENT_KEY$4,
    SHOWN: "shown" + EVENT_KEY$4,
    CLICK: "click" + EVENT_KEY$4,
    CLICK_DATA_API: "click" + EVENT_KEY$4 + DATA_API_KEY$4,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY$4 + DATA_API_KEY$4,
    KEYUP_DATA_API: "keyup" + EVENT_KEY$4 + DATA_API_KEY$4
  };
  var ClassName$4 = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector$4 = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
  };
  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT: 'right-start',
    RIGHTEND: 'right-end',
    LEFT: 'left-start',
    LEFTEND: 'left-end'
  };
  var Default$2 = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent',
    reference: 'toggle',
    display: 'dynamic'
  };
  var DefaultType$2 = {
    offset: '(number|string|function)',
    flip: 'boolean',
    boundary: '(string|element)',
    reference: '(string|element)',
    display: 'string'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Dropdown =
  /*#__PURE__*/
  function () {
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    // Public
    _proto.toggle = function toggle() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this._element);

      var isActive = $(this._menu).hasClass(ClassName$4.SHOW);

      Dropdown._clearMenus();

      if (isActive) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $.Event(Event$4.SHOW, relatedTarget);
      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      } // Disable totally Popper.js for Dropdown in Navbar


      if (!this._inNavbar) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        if (typeof Popper === 'undefined') {
          throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org/)');
        }

        var referenceElement = this._element;

        if (this._config.reference === 'parent') {
          referenceElement = parent;
        } else if (Util.isElement(this._config.reference)) {
          referenceElement = this._config.reference; // Check if it's jQuery element

          if (typeof this._config.reference.jquery !== 'undefined') {
            referenceElement = this._config.reference[0];
          }
        } // If boundary is not `scrollParent`, then set position to `static`
        // to allow the menu to "escape" the scroll parent's boundaries
        // https://github.com/twbs/bootstrap/issues/24251


        if (this._config.boundary !== 'scrollParent') {
          $(parent).addClass(ClassName$4.POSITION_STATIC);
        }

        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$4.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.SHOWN, relatedTarget));
    };

    _proto.show = function show() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED) || $(this._menu).hasClass(ClassName$4.SHOW)) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $.Event(Event$4.SHOW, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.SHOWN, relatedTarget));
    };

    _proto.hide = function hide() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED) || !$(this._menu).hasClass(ClassName$4.SHOW)) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var hideEvent = $.Event(Event$4.HIDE, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.HIDDEN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$4);
      $(this._element).off(EVENT_KEY$4);
      this._element = null;
      this._menu = null;

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Private
    ;

    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      $(this._element).on(Event$4.CLICK, function (event) {
        event.preventDefault();
        event.stopPropagation();

        _this.toggle();
      });
    };

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, this.constructor.Default, $(this._element).data(), config);
      Util.typeCheckConfig(NAME$4, config, this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      if (!this._menu) {
        var parent = Dropdown._getParentFromElement(this._element);

        if (parent) {
          this._menu = parent.querySelector(Selector$4.MENU);
        }
      }

      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      var $parentDropdown = $(this._element.parentNode);
      var placement = AttachmentMap.BOTTOM; // Handle dropup

      if ($parentDropdown.hasClass(ClassName$4.DROPUP)) {
        placement = AttachmentMap.TOP;

        if ($(this._menu).hasClass(ClassName$4.MENURIGHT)) {
          placement = AttachmentMap.TOPEND;
        }
      } else if ($parentDropdown.hasClass(ClassName$4.DROPRIGHT)) {
        placement = AttachmentMap.RIGHT;
      } else if ($parentDropdown.hasClass(ClassName$4.DROPLEFT)) {
        placement = AttachmentMap.LEFT;
      } else if ($(this._menu).hasClass(ClassName$4.MENURIGHT)) {
        placement = AttachmentMap.BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      return $(this._element).closest('.navbar').length > 0;
    };

    _proto._getOffset = function _getOffset() {
      var _this2 = this;

      var offset = {};

      if (typeof this._config.offset === 'function') {
        offset.fn = function (data) {
          data.offsets = _objectSpread({}, data.offsets, _this2._config.offset(data.offsets, _this2._element) || {});
          return data;
        };
      } else {
        offset.offset = this._config.offset;
      }

      return offset;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      var popperConfig = {
        placement: this._getPlacement(),
        modifiers: {
          offset: this._getOffset(),
          flip: {
            enabled: this._config.flip
          },
          preventOverflow: {
            boundariesElement: this._config.boundary
          }
        } // Disable Popper.js if we have a static display

      };

      if (this._config.display === 'static') {
        popperConfig.modifiers.applyStyle = {
          enabled: false
        };
      }

      return popperConfig;
    } // Static
    ;

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$4);

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $(this).data(DATA_KEY$4, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        return;
      }

      var toggles = [].slice.call(document.querySelectorAll(Selector$4.DATA_TOGGLE));

      for (var i = 0, len = toggles.length; i < len; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);

        var context = $(toggles[i]).data(DATA_KEY$4);
        var relatedTarget = {
          relatedTarget: toggles[i]
        };

        if (event && event.type === 'click') {
          relatedTarget.clickEvent = event;
        }

        if (!context) {
          continue;
        }

        var dropdownMenu = context._menu;

        if (!$(parent).hasClass(ClassName$4.SHOW)) {
          continue;
        }

        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          continue;
        }

        var hideEvent = $.Event(Event$4.HIDE, relatedTarget);
        $(parent).trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
          continue;
        } // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support


        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        }

        toggles[i].setAttribute('aria-expanded', 'false');
        $(dropdownMenu).removeClass(ClassName$4.SHOW);
        $(parent).removeClass(ClassName$4.SHOW).trigger($.Event(Event$4.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = document.querySelector(selector);
      }

      return parent || element.parentNode;
    } // eslint-disable-next-line complexity
    ;

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $(event.target).closest(Selector$4.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $(this).hasClass(ClassName$4.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);

      var isActive = $(parent).hasClass(ClassName$4.SHOW);

      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        if (event.which === ESCAPE_KEYCODE) {
          var toggle = parent.querySelector(Selector$4.DATA_TOGGLE);
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      var items = [].slice.call(parent.querySelectorAll(Selector$4.VISIBLE_ITEMS));

      if (items.length === 0) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // Up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // Down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$4;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$2;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$2;
      }
    }]);

    return Dropdown;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$4.KEYDOWN_DATA_API, Selector$4.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event$4.KEYDOWN_DATA_API, Selector$4.MENU, Dropdown._dataApiKeydownHandler).on(Event$4.CLICK_DATA_API + " " + Event$4.KEYUP_DATA_API, Dropdown._clearMenus).on(Event$4.CLICK_DATA_API, Selector$4.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($(this), 'toggle');
  }).on(Event$4.CLICK_DATA_API, Selector$4.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$4] = Dropdown._jQueryInterface;
  $.fn[NAME$4].Constructor = Dropdown;

  $.fn[NAME$4].noConflict = function () {
    $.fn[NAME$4] = JQUERY_NO_CONFLICT$4;
    return Dropdown._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$5 = 'modal';
  var VERSION$5 = '4.3.1';
  var DATA_KEY$5 = 'bs.modal';
  var EVENT_KEY$5 = "." + DATA_KEY$5;
  var DATA_API_KEY$5 = '.data-api';
  var JQUERY_NO_CONFLICT$5 = $.fn[NAME$5];
  var ESCAPE_KEYCODE$1 = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default$3 = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };
  var DefaultType$3 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };
  var Event$5 = {
    HIDE: "hide" + EVENT_KEY$5,
    HIDDEN: "hidden" + EVENT_KEY$5,
    SHOW: "show" + EVENT_KEY$5,
    SHOWN: "shown" + EVENT_KEY$5,
    FOCUSIN: "focusin" + EVENT_KEY$5,
    RESIZE: "resize" + EVENT_KEY$5,
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$5,
    KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY$5,
    MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY$5,
    MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY$5,
    CLICK_DATA_API: "click" + EVENT_KEY$5 + DATA_API_KEY$5
  };
  var ClassName$5 = {
    SCROLLABLE: 'modal-dialog-scrollable',
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$5 = {
    DIALOG: '.modal-dialog',
    MODAL_BODY: '.modal-body',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Modal =
  /*#__PURE__*/
  function () {
    function Modal(element, config) {
      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = element.querySelector(Selector$5.DIALOG);
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollbarWidth = 0;
    } // Getters


    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      if (this._isShown || this._isTransitioning) {
        return;
      }

      if ($(this._element).hasClass(ClassName$5.FADE)) {
        this._isTransitioning = true;
      }

      var showEvent = $.Event(Event$5.SHOW, {
        relatedTarget: relatedTarget
      });
      $(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();

      this._setScrollbar();

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      $(this._element).on(Event$5.CLICK_DISMISS, Selector$5.DATA_DISMISS, function (event) {
        return _this.hide(event);
      });
      $(this._dialog).on(Event$5.MOUSEDOWN_DISMISS, function () {
        $(_this._element).one(Event$5.MOUSEUP_DISMISS, function (event) {
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      if (event) {
        event.preventDefault();
      }

      if (!this._isShown || this._isTransitioning) {
        return;
      }

      var hideEvent = $.Event(Event$5.HIDE);
      $(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;
      var transition = $(this._element).hasClass(ClassName$5.FADE);

      if (transition) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      $(document).off(Event$5.FOCUSIN);
      $(this._element).removeClass(ClassName$5.SHOW);
      $(this._element).off(Event$5.CLICK_DISMISS);
      $(this._dialog).off(Event$5.MOUSEDOWN_DISMISS);

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      [window, this._element, this._dialog].forEach(function (htmlElement) {
        return $(htmlElement).off(EVENT_KEY$5);
      });
      /**
       * `document` has 2 events `Event.FOCUSIN` and `Event.CLICK_DATA_API`
       * Do not move `document` in `htmlElements` array
       * It will remove `Event.CLICK_DATA_API` event that should remain
       */

      $(document).off(Event$5.FOCUSIN);
      $.removeData(this._element, DATA_KEY$5);
      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._isTransitioning = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      this._adjustDialog();
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$3, config);
      Util.typeCheckConfig(NAME$5, config, DefaultType$3);
      return config;
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this3 = this;

      var transition = $(this._element).hasClass(ClassName$5.FADE);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.appendChild(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      if ($(this._dialog).hasClass(ClassName$5.SCROLLABLE)) {
        this._dialog.querySelector(Selector$5.MODAL_BODY).scrollTop = 0;
      } else {
        this._element.scrollTop = 0;
      }

      if (transition) {
        Util.reflow(this._element);
      }

      $(this._element).addClass(ClassName$5.SHOW);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $.Event(Event$5.SHOWN, {
        relatedTarget: relatedTarget
      });

      var transitionComplete = function transitionComplete() {
        if (_this3._config.focus) {
          _this3._element.focus();
        }

        _this3._isTransitioning = false;
        $(_this3._element).trigger(shownEvent);
      };

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._dialog);
        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
      } else {
        transitionComplete();
      }
    };

    _proto._enforceFocus = function _enforceFocus() {
      var _this4 = this;

      $(document).off(Event$5.FOCUSIN) // Guard against infinite focus loop
      .on(Event$5.FOCUSIN, function (event) {
        if (document !== event.target && _this4._element !== event.target && $(_this4._element).has(event.target).length === 0) {
          _this4._element.focus();
        }
      });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this5 = this;

      if (this._isShown && this._config.keyboard) {
        $(this._element).on(Event$5.KEYDOWN_DISMISS, function (event) {
          if (event.which === ESCAPE_KEYCODE$1) {
            event.preventDefault();

            _this5.hide();
          }
        });
      } else if (!this._isShown) {
        $(this._element).off(Event$5.KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this6 = this;

      if (this._isShown) {
        $(window).on(Event$5.RESIZE, function (event) {
          return _this6.handleUpdate(event);
        });
      } else {
        $(window).off(Event$5.RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this7 = this;

      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._isTransitioning = false;

      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName$5.OPEN);

        _this7._resetAdjustments();

        _this7._resetScrollbar();

        $(_this7._element).trigger(Event$5.HIDDEN);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this8 = this;

      var animate = $(this._element).hasClass(ClassName$5.FADE) ? ClassName$5.FADE : '';

      if (this._isShown && this._config.backdrop) {
        this._backdrop = document.createElement('div');
        this._backdrop.className = ClassName$5.BACKDROP;

        if (animate) {
          this._backdrop.classList.add(animate);
        }

        $(this._backdrop).appendTo(document.body);
        $(this._element).on(Event$5.CLICK_DISMISS, function (event) {
          if (_this8._ignoreBackdropClick) {
            _this8._ignoreBackdropClick = false;
            return;
          }

          if (event.target !== event.currentTarget) {
            return;
          }

          if (_this8._config.backdrop === 'static') {
            _this8._element.focus();
          } else {
            _this8.hide();
          }
        });

        if (animate) {
          Util.reflow(this._backdrop);
        }

        $(this._backdrop).addClass(ClassName$5.SHOW);

        if (!callback) {
          return;
        }

        if (!animate) {
          callback();
          return;
        }

        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
      } else if (!this._isShown && this._backdrop) {
        $(this._backdrop).removeClass(ClassName$5.SHOW);

        var callbackRemove = function callbackRemove() {
          _this8._removeBackdrop();

          if (callback) {
            callback();
          }
        };

        if ($(this._element).hasClass(ClassName$5.FADE)) {
          var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);

          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------
    ;

    _proto._adjustDialog = function _adjustDialog() {
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      var rect = document.body.getBoundingClientRect();
      this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this9 = this;

      if (this._isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
        var fixedContent = [].slice.call(document.querySelectorAll(Selector$5.FIXED_CONTENT));
        var stickyContent = [].slice.call(document.querySelectorAll(Selector$5.STICKY_CONTENT)); // Adjust fixed content padding

        $(fixedContent).each(function (index, element) {
          var actualPadding = element.style.paddingRight;
          var calculatedPadding = $(element).css('padding-right');
          $(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
        }); // Adjust sticky content margin

        $(stickyContent).each(function (index, element) {
          var actualMargin = element.style.marginRight;
          var calculatedMargin = $(element).css('margin-right');
          $(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
        }); // Adjust body padding

        var actualPadding = document.body.style.paddingRight;
        var calculatedPadding = $(document.body).css('padding-right');
        $(document.body).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
      }

      $(document.body).addClass(ClassName$5.OPEN);
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // Restore fixed content padding
      var fixedContent = [].slice.call(document.querySelectorAll(Selector$5.FIXED_CONTENT));
      $(fixedContent).each(function (index, element) {
        var padding = $(element).data('padding-right');
        $(element).removeData('padding-right');
        element.style.paddingRight = padding ? padding : '';
      }); // Restore sticky content

      var elements = [].slice.call(document.querySelectorAll("" + Selector$5.STICKY_CONTENT));
      $(elements).each(function (index, element) {
        var margin = $(element).data('margin-right');

        if (typeof margin !== 'undefined') {
          $(element).css('margin-right', margin).removeData('margin-right');
        }
      }); // Restore body padding

      var padding = $(document.body).data('padding-right');
      $(document.body).removeData('padding-right');
      document.body.style.paddingRight = padding ? padding : '';
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement('div');
      scrollDiv.className = ClassName$5.SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    } // Static
    ;

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$5);

        var _config = _objectSpread({}, Default$3, $(this).data(), typeof config === 'object' && config ? config : {});

        if (!data) {
          data = new Modal(this, _config);
          $(this).data(DATA_KEY$5, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$5;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$3;
      }
    }]);

    return Modal;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$5.CLICK_DATA_API, Selector$5.DATA_TOGGLE, function (event) {
    var _this10 = this;

    var target;
    var selector = Util.getSelectorFromElement(this);

    if (selector) {
      target = document.querySelector(selector);
    }

    var config = $(target).data(DATA_KEY$5) ? 'toggle' : _objectSpread({}, $(target).data(), $(this).data());

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    }

    var $target = $(target).one(Event$5.SHOW, function (showEvent) {
      if (showEvent.isDefaultPrevented()) {
        // Only register focus restorer if modal will actually get shown
        return;
      }

      $target.one(Event$5.HIDDEN, function () {
        if ($(_this10).is(':visible')) {
          _this10.focus();
        }
      });
    });

    Modal._jQueryInterface.call($(target), config, this);
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$5] = Modal._jQueryInterface;
  $.fn[NAME$5].Constructor = Modal;

  $.fn[NAME$5].noConflict = function () {
    $.fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return Modal._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): tools/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  var uriAttrs = ['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href'];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
    /**
     * A pattern that recognizes a commonly useful subset of URLs that are safe.
     *
     * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
     */

  };
  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase();

    if (allowedAttributeList.indexOf(attrName) !== -1) {
      if (uriAttrs.indexOf(attrName) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN));
      }

      return true;
    }

    var regExp = allowedAttributeList.filter(function (attrRegex) {
      return attrRegex instanceof RegExp;
    }); // Check if a regular expression validates the attribute.

    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }

    return false;
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    var domParser = new window.DOMParser();
    var createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    var whitelistKeys = Object.keys(whiteList);
    var elements = [].slice.call(createdDocument.body.querySelectorAll('*'));

    var _loop = function _loop(i, len) {
      var el = elements[i];
      var elName = el.nodeName.toLowerCase();

      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
        el.parentNode.removeChild(el);
        return "continue";
      }

      var attributeList = [].slice.call(el.attributes);
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []);
      attributeList.forEach(function (attr) {
        if (!allowedAttribute(attr, whitelistedAttributes)) {
          el.removeAttribute(attr.nodeName);
        }
      });
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      var _ret = _loop(i, len);

      if (_ret === "continue") continue;
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$6 = 'tooltip';
  var VERSION$6 = '4.3.1';
  var DATA_KEY$6 = 'bs.tooltip';
  var EVENT_KEY$6 = "." + DATA_KEY$6;
  var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
  var CLASS_PREFIX = 'bs-tooltip';
  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType$4 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    whiteList: 'object'
  };
  var AttachmentMap$1 = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default$4 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent',
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var Event$6 = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
  };
  var ClassName$6 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$6 = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tooltip =
  /*#__PURE__*/
  function () {
    function Tooltip(element, config) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper.js (https://popper.js.org/)');
      } // private


      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if ($(this.getTipElement()).hasClass(ClassName$6.SHOW)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      $.removeData(this.element, this.constructor.DATA_KEY);
      $(this.element).off(this.constructor.EVENT_KEY);
      $(this.element).closest('.modal').off('hide.bs.modal');

      if (this.tip) {
        $(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper !== null) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      }

      var showEvent = $.Event(this.constructor.Event.SHOW);

      if (this.isWithContent() && this._isEnabled) {
        $(this.element).trigger(showEvent);
        var shadowRoot = Util.findShadowRoot(this.element);
        var isInTheDom = $.contains(shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element);

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);
        tip.setAttribute('id', tipId);
        this.element.setAttribute('aria-describedby', tipId);
        this.setContent();

        if (this.config.animation) {
          $(tip).addClass(ClassName$6.FADE);
        }

        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

        var attachment = this._getAttachment(placement);

        this.addAttachmentClass(attachment);

        var container = this._getContainer();

        $(tip).data(this.constructor.DATA_KEY, this);

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          $(tip).appendTo(container);
        }

        $(this.element).trigger(this.constructor.Event.INSERTED);
        this._popper = new Popper(this.element, tip, {
          placement: attachment,
          modifiers: {
            offset: this._getOffset(),
            flip: {
              behavior: this.config.fallbackPlacement
            },
            arrow: {
              element: Selector$6.ARROW
            },
            preventOverflow: {
              boundariesElement: this.config.boundary
            }
          },
          onCreate: function onCreate(data) {
            if (data.originalPlacement !== data.placement) {
              _this._handlePopperPlacementChange(data);
            }
          },
          onUpdate: function onUpdate(data) {
            return _this._handlePopperPlacementChange(data);
          }
        });
        $(tip).addClass(ClassName$6.SHOW); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().on('mouseover', null, $.noop);
        }

        var complete = function complete() {
          if (_this.config.animation) {
            _this._fixTransition();
          }

          var prevHoverState = _this._hoverState;
          _this._hoverState = null;
          $(_this.element).trigger(_this.constructor.Event.SHOWN);

          if (prevHoverState === HoverState.OUT) {
            _this._leave(null, _this);
          }
        };

        if ($(this.tip).hasClass(ClassName$6.FADE)) {
          var transitionDuration = Util.getTransitionDurationFromElement(this.tip);
          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
        } else {
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      var tip = this.getTipElement();
      var hideEvent = $.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this2._cleanTipClass();

        _this2.element.removeAttribute('aria-describedby');

        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

        if (_this2._popper !== null) {
          _this2._popper.destroy();
        }

        if (callback) {
          callback();
        }
      };

      $(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(tip).removeClass(ClassName$6.SHOW); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      }

      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false;

      if ($(this.tip).hasClass(ClassName$6.FADE)) {
        var transitionDuration = Util.getTransitionDurationFromElement(tip);
        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }

      this._hoverState = '';
    };

    _proto.update = function update() {
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Protected
    ;

    _proto.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var tip = this.getTipElement();
      this.setElementContent($(tip.querySelectorAll(Selector$6.TOOLTIP_INNER)), this.getTitle());
      $(tip).removeClass(ClassName$6.FADE + " " + ClassName$6.SHOW);
    };

    _proto.setElementContent = function setElementContent($element, content) {
      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // Content is a DOM node or a jQuery
        if (this.config.html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($(content).text());
        }

        return;
      }

      if (this.config.html) {
        if (this.config.sanitize) {
          content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
        }

        $element.html(content);
      } else {
        $element.text(content);
      }
    };

    _proto.getTitle = function getTitle() {
      var title = this.element.getAttribute('data-original-title');

      if (!title) {
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    } // Private
    ;

    _proto._getOffset = function _getOffset() {
      var _this3 = this;

      var offset = {};

      if (typeof this.config.offset === 'function') {
        offset.fn = function (data) {
          data.offsets = _objectSpread({}, data.offsets, _this3.config.offset(data.offsets, _this3.element) || {});
          return data;
        };
      } else {
        offset.offset = this.config.offset;
      }

      return offset;
    };

    _proto._getContainer = function _getContainer() {
      if (this.config.container === false) {
        return document.body;
      }

      if (Util.isElement(this.config.container)) {
        return $(this.config.container);
      }

      return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
      return AttachmentMap$1[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this4 = this;

      var triggers = this.config.trigger.split(' ');
      triggers.forEach(function (trigger) {
        if (trigger === 'click') {
          $(_this4.element).on(_this4.constructor.Event.CLICK, _this4.config.selector, function (event) {
            return _this4.toggle(event);
          });
        } else if (trigger !== Trigger.MANUAL) {
          var eventIn = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSEENTER : _this4.constructor.Event.FOCUSIN;
          var eventOut = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSELEAVE : _this4.constructor.Event.FOCUSOUT;
          $(_this4.element).on(eventIn, _this4.config.selector, function (event) {
            return _this4._enter(event);
          }).on(eventOut, _this4.config.selector, function (event) {
            return _this4._leave(event);
          });
        }
      });
      $(this.element).closest('.modal').on('hide.bs.modal', function () {
        if (_this4.element) {
          _this4.hide();
        }
      });

      if (this.config.selector) {
        this.config = _objectSpread({}, this.config, {
          trigger: 'manual',
          selector: ''
        });
      } else {
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      var titleType = typeof this.element.getAttribute('data-original-title');

      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
        this.element.setAttribute('title', '');
      }
    };

    _proto._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      }

      if ($(context.getTipElement()).hasClass(ClassName$6.SHOW) || context._hoverState === HoverState.SHOW) {
        context._hoverState = HoverState.SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    _proto._getConfig = function _getConfig(config) {
      var dataAttributes = $(this.element).data();
      Object.keys(dataAttributes).forEach(function (dataAttr) {
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          delete dataAttributes[dataAttr];
        }
      });
      config = _objectSpread({}, this.constructor.Default, dataAttributes, typeof config === 'object' && config ? config : {});

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);

      if (config.sanitize) {
        config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
      }

      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

      if (tabClass !== null && tabClass.length) {
        $tip.removeClass(tabClass.join(''));
      }
    };

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
      var popperInstance = popperData.instance;
      this.tip = popperInstance.popper;

      this._cleanTipClass();

      this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      var tip = this.getTipElement();
      var initConfigAnimation = this.config.animation;

      if (tip.getAttribute('x-placement') !== null) {
        return;
      }

      $(tip).removeClass(ClassName$6.FADE);
      this.config.animation = false;
      this.hide();
      this.show();
      this.config.animation = initConfigAnimation;
    } // Static
    ;

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$6);

        var _config = typeof config === 'object' && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $(this).data(DATA_KEY$6, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$6;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$4;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$6;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$6;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$6;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$6;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$4;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$6] = Tooltip._jQueryInterface;
  $.fn[NAME$6].Constructor = Tooltip;

  $.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Tooltip._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$7 = 'popover';
  var VERSION$7 = '4.3.1';
  var DATA_KEY$7 = 'bs.popover';
  var EVENT_KEY$7 = "." + DATA_KEY$7;
  var JQUERY_NO_CONFLICT$7 = $.fn[NAME$7];
  var CLASS_PREFIX$1 = 'bs-popover';
  var BSCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", 'g');

  var Default$5 = _objectSpread({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var DefaultType$5 = _objectSpread({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName$7 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$7 = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };
  var Event$7 = {
    HIDE: "hide" + EVENT_KEY$7,
    HIDDEN: "hidden" + EVENT_KEY$7,
    SHOW: "show" + EVENT_KEY$7,
    SHOWN: "shown" + EVENT_KEY$7,
    INSERTED: "inserted" + EVENT_KEY$7,
    CLICK: "click" + EVENT_KEY$7,
    FOCUSIN: "focusin" + EVENT_KEY$7,
    FOCUSOUT: "focusout" + EVENT_KEY$7,
    MOUSEENTER: "mouseenter" + EVENT_KEY$7,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$7
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Popover =
  /*#__PURE__*/
  function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    _proto.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var $tip = $(this.getTipElement()); // We use append for html objects to maintain js events

      this.setElementContent($tip.find(Selector$7.TITLE), this.getTitle());

      var content = this._getContent();

      if (typeof content === 'function') {
        content = content.call(this.element);
      }

      this.setElementContent($tip.find(Selector$7.CONTENT), content);
      $tip.removeClass(ClassName$7.FADE + " " + ClassName$7.SHOW);
    } // Private
    ;

    _proto._getContent = function _getContent() {
      return this.element.getAttribute('data-content') || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX$1);

      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    } // Static
    ;

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$7);

        var _config = typeof config === 'object' ? config : null;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $(this).data(DATA_KEY$7, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: "VERSION",
      // Getters
      get: function get() {
        return VERSION$7;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$5;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$7;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$7;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$7;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$7;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$5;
      }
    }]);

    return Popover;
  }(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$7] = Popover._jQueryInterface;
  $.fn[NAME$7].Constructor = Popover;

  $.fn[NAME$7].noConflict = function () {
    $.fn[NAME$7] = JQUERY_NO_CONFLICT$7;
    return Popover._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$8 = 'scrollspy';
  var VERSION$8 = '4.3.1';
  var DATA_KEY$8 = 'bs.scrollspy';
  var EVENT_KEY$8 = "." + DATA_KEY$8;
  var DATA_API_KEY$6 = '.data-api';
  var JQUERY_NO_CONFLICT$8 = $.fn[NAME$8];
  var Default$6 = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  var DefaultType$6 = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  var Event$8 = {
    ACTIVATE: "activate" + EVENT_KEY$8,
    SCROLL: "scroll" + EVENT_KEY$8,
    LOAD_DATA_API: "load" + EVENT_KEY$8 + DATA_API_KEY$6
  };
  var ClassName$8 = {
    DROPDOWN_ITEM: 'dropdown-item',
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active'
  };
  var Selector$8 = {
    DATA_SPY: '[data-spy="scroll"]',
    ACTIVE: '.active',
    NAV_LIST_GROUP: '.nav, .list-group',
    NAV_LINKS: '.nav-link',
    NAV_ITEMS: '.nav-item',
    LIST_ITEMS: '.list-group-item',
    DROPDOWN: '.dropdown',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };
  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var ScrollSpy =
  /*#__PURE__*/
  function () {
    function ScrollSpy(element, config) {
      var _this = this;

      this._element = element;
      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config);
      this._selector = this._config.target + " " + Selector$8.NAV_LINKS + "," + (this._config.target + " " + Selector$8.LIST_ITEMS + ",") + (this._config.target + " " + Selector$8.DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      $(this._scrollElement).on(Event$8.SCROLL, function (event) {
        return _this._process(event);
      });
      this.refresh();

      this._process();
    } // Getters


    var _proto = ScrollSpy.prototype;

    // Public
    _proto.refresh = function refresh() {
      var _this2 = this;

      var autoMethod = this._scrollElement === this._scrollElement.window ? OffsetMethod.OFFSET : OffsetMethod.POSITION;
      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
      var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      var targets = [].slice.call(document.querySelectorAll(this._selector));
      targets.map(function (element) {
        var target;
        var targetSelector = Util.getSelectorFromElement(element);

        if (targetSelector) {
          target = document.querySelector(targetSelector);
        }

        if (target) {
          var targetBCR = target.getBoundingClientRect();

          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [$(target)[offsetMethod]().top + offsetBase, targetSelector];
          }
        }

        return null;
      }).filter(function (item) {
        return item;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (item) {
        _this2._offsets.push(item[0]);

        _this2._targets.push(item[1]);
      });
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$8);
      $(this._scrollElement).off(EVENT_KEY$8);
      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$6, typeof config === 'object' && config ? config : {});

      if (typeof config.target !== 'string') {
        var id = $(config.target).attr('id');

        if (!id) {
          id = Util.getUID(NAME$8);
          $(config.target).attr('id', id);
        }

        config.target = "#" + id;
      }

      Util.typeCheckConfig(NAME$8, config, DefaultType$6);
      return config;
    };

    _proto._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    _proto._getScrollHeight = function _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };

    _proto._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    };

    _proto._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;

      var scrollHeight = this._getScrollHeight();

      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      var offsetLength = this._offsets.length;

      for (var i = offsetLength; i--;) {
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    _proto._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(',').map(function (selector) {
        return selector + "[data-target=\"" + target + "\"]," + selector + "[href=\"" + target + "\"]";
      });

      var $link = $([].slice.call(document.querySelectorAll(queries.join(','))));

      if ($link.hasClass(ClassName$8.DROPDOWN_ITEM)) {
        $link.closest(Selector$8.DROPDOWN).find(Selector$8.DROPDOWN_TOGGLE).addClass(ClassName$8.ACTIVE);
        $link.addClass(ClassName$8.ACTIVE);
      } else {
        // Set triggered link as active
        $link.addClass(ClassName$8.ACTIVE); // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

        $link.parents(Selector$8.NAV_LIST_GROUP).prev(Selector$8.NAV_LINKS + ", " + Selector$8.LIST_ITEMS).addClass(ClassName$8.ACTIVE); // Handle special case when .nav-link is inside .nav-item

        $link.parents(Selector$8.NAV_LIST_GROUP).prev(Selector$8.NAV_ITEMS).children(Selector$8.NAV_LINKS).addClass(ClassName$8.ACTIVE);
      }

      $(this._scrollElement).trigger(Event$8.ACTIVATE, {
        relatedTarget: target
      });
    };

    _proto._clear = function _clear() {
      [].slice.call(document.querySelectorAll(this._selector)).filter(function (node) {
        return node.classList.contains(ClassName$8.ACTIVE);
      }).forEach(function (node) {
        return node.classList.remove(ClassName$8.ACTIVE);
      });
    } // Static
    ;

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$8);

        var _config = typeof config === 'object' && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $(this).data(DATA_KEY$8, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$8;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$6;
      }
    }]);

    return ScrollSpy;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(window).on(Event$8.LOAD_DATA_API, function () {
    var scrollSpys = [].slice.call(document.querySelectorAll(Selector$8.DATA_SPY));
    var scrollSpysLength = scrollSpys.length;

    for (var i = scrollSpysLength; i--;) {
      var $spy = $(scrollSpys[i]);

      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$8] = ScrollSpy._jQueryInterface;
  $.fn[NAME$8].Constructor = ScrollSpy;

  $.fn[NAME$8].noConflict = function () {
    $.fn[NAME$8] = JQUERY_NO_CONFLICT$8;
    return ScrollSpy._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$9 = 'tab';
  var VERSION$9 = '4.3.1';
  var DATA_KEY$9 = 'bs.tab';
  var EVENT_KEY$9 = "." + DATA_KEY$9;
  var DATA_API_KEY$7 = '.data-api';
  var JQUERY_NO_CONFLICT$9 = $.fn[NAME$9];
  var Event$9 = {
    HIDE: "hide" + EVENT_KEY$9,
    HIDDEN: "hidden" + EVENT_KEY$9,
    SHOW: "show" + EVENT_KEY$9,
    SHOWN: "shown" + EVENT_KEY$9,
    CLICK_DATA_API: "click" + EVENT_KEY$9 + DATA_API_KEY$7
  };
  var ClassName$9 = {
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$9 = {
    DROPDOWN: '.dropdown',
    NAV_LIST_GROUP: '.nav, .list-group',
    ACTIVE: '.active',
    ACTIVE_UL: '> li > .active',
    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
    DROPDOWN_TOGGLE: '.dropdown-toggle',
    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tab =
  /*#__PURE__*/
  function () {
    function Tab(element) {
      this._element = element;
    } // Getters


    var _proto = Tab.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(ClassName$9.ACTIVE) || $(this._element).hasClass(ClassName$9.DISABLED)) {
        return;
      }

      var target;
      var previous;
      var listElement = $(this._element).closest(Selector$9.NAV_LIST_GROUP)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        var itemSelector = listElement.nodeName === 'UL' || listElement.nodeName === 'OL' ? Selector$9.ACTIVE_UL : Selector$9.ACTIVE;
        previous = $.makeArray($(listElement).find(itemSelector));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $.Event(Event$9.HIDE, {
        relatedTarget: this._element
      });
      var showEvent = $.Event(Event$9.SHOW, {
        relatedTarget: previous
      });

      if (previous) {
        $(previous).trigger(hideEvent);
      }

      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = document.querySelector(selector);
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $.Event(Event$9.HIDDEN, {
          relatedTarget: _this._element
        });
        var shownEvent = $.Event(Event$9.SHOWN, {
          relatedTarget: previous
        });
        $(previous).trigger(hiddenEvent);
        $(_this._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$9);
      this._element = null;
    } // Private
    ;

    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      var activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? $(container).find(Selector$9.ACTIVE_UL) : $(container).children(Selector$9.ACTIVE);
      var active = activeElements[0];
      var isTransitioning = callback && active && $(active).hasClass(ClassName$9.FADE);

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      };

      if (active && isTransitioning) {
        var transitionDuration = Util.getTransitionDurationFromElement(active);
        $(active).removeClass(ClassName$9.SHOW).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
      if (active) {
        $(active).removeClass(ClassName$9.ACTIVE);
        var dropdownChild = $(active.parentNode).find(Selector$9.DROPDOWN_ACTIVE_CHILD)[0];

        if (dropdownChild) {
          $(dropdownChild).removeClass(ClassName$9.ACTIVE);
        }

        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      $(element).addClass(ClassName$9.ACTIVE);

      if (element.getAttribute('role') === 'tab') {
        element.setAttribute('aria-selected', true);
      }

      Util.reflow(element);

      if (element.classList.contains(ClassName$9.FADE)) {
        element.classList.add(ClassName$9.SHOW);
      }

      if (element.parentNode && $(element.parentNode).hasClass(ClassName$9.DROPDOWN_MENU)) {
        var dropdownElement = $(element).closest(Selector$9.DROPDOWN)[0];

        if (dropdownElement) {
          var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(Selector$9.DROPDOWN_TOGGLE));
          $(dropdownToggleList).addClass(ClassName$9.ACTIVE);
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    } // Static
    ;

    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$9);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY$9, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$9;
      }
    }]);

    return Tab;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$9.CLICK_DATA_API, Selector$9.DATA_TOGGLE, function (event) {
    event.preventDefault();

    Tab._jQueryInterface.call($(this), 'show');
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$9] = Tab._jQueryInterface;
  $.fn[NAME$9].Constructor = Tab;

  $.fn[NAME$9].noConflict = function () {
    $.fn[NAME$9] = JQUERY_NO_CONFLICT$9;
    return Tab._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$a = 'toast';
  var VERSION$a = '4.3.1';
  var DATA_KEY$a = 'bs.toast';
  var EVENT_KEY$a = "." + DATA_KEY$a;
  var JQUERY_NO_CONFLICT$a = $.fn[NAME$a];
  var Event$a = {
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$a,
    HIDE: "hide" + EVENT_KEY$a,
    HIDDEN: "hidden" + EVENT_KEY$a,
    SHOW: "show" + EVENT_KEY$a,
    SHOWN: "shown" + EVENT_KEY$a
  };
  var ClassName$a = {
    FADE: 'fade',
    HIDE: 'hide',
    SHOW: 'show',
    SHOWING: 'showing'
  };
  var DefaultType$7 = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  var Default$7 = {
    animation: true,
    autohide: true,
    delay: 500
  };
  var Selector$a = {
    DATA_DISMISS: '[data-dismiss="toast"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Toast =
  /*#__PURE__*/
  function () {
    function Toast(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._timeout = null;

      this._setListeners();
    } // Getters


    var _proto = Toast.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      $(this._element).trigger(Event$a.SHOW);

      if (this._config.animation) {
        this._element.classList.add(ClassName$a.FADE);
      }

      var complete = function complete() {
        _this._element.classList.remove(ClassName$a.SHOWING);

        _this._element.classList.add(ClassName$a.SHOW);

        $(_this._element).trigger(Event$a.SHOWN);

        if (_this._config.autohide) {
          _this.hide();
        }
      };

      this._element.classList.remove(ClassName$a.HIDE);

      this._element.classList.add(ClassName$a.SHOWING);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto.hide = function hide(withoutTimeout) {
      var _this2 = this;

      if (!this._element.classList.contains(ClassName$a.SHOW)) {
        return;
      }

      $(this._element).trigger(Event$a.HIDE);

      if (withoutTimeout) {
        this._close();
      } else {
        this._timeout = setTimeout(function () {
          _this2._close();
        }, this._config.delay);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      this._timeout = null;

      if (this._element.classList.contains(ClassName$a.SHOW)) {
        this._element.classList.remove(ClassName$a.SHOW);
      }

      $(this._element).off(Event$a.CLICK_DISMISS);
      $.removeData(this._element, DATA_KEY$a);
      this._element = null;
      this._config = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$7, $(this._element).data(), typeof config === 'object' && config ? config : {});
      Util.typeCheckConfig(NAME$a, config, this.constructor.DefaultType);
      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this3 = this;

      $(this._element).on(Event$a.CLICK_DISMISS, Selector$a.DATA_DISMISS, function () {
        return _this3.hide(true);
      });
    };

    _proto._close = function _close() {
      var _this4 = this;

      var complete = function complete() {
        _this4._element.classList.add(ClassName$a.HIDE);

        $(_this4._element).trigger(Event$a.HIDDEN);
      };

      this._element.classList.remove(ClassName$a.SHOW);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    } // Static
    ;

    Toast._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY$a);

        var _config = typeof config === 'object' && config;

        if (!data) {
          data = new Toast(this, _config);
          $element.data(DATA_KEY$a, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config](this);
        }
      });
    };

    _createClass(Toast, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$a;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$7;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$7;
      }
    }]);

    return Toast;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$a] = Toast._jQueryInterface;
  $.fn[NAME$a].Constructor = Toast;

  $.fn[NAME$a].noConflict = function () {
    $.fn[NAME$a] = JQUERY_NO_CONFLICT$a;
    return Toast._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */

  (function () {
    if (typeof $ === 'undefined') {
      throw new TypeError('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.');
    }

    var version = $.fn.jquery.split(' ')[0].split('.');
    var minMajor = 1;
    var ltMajor = 2;
    var minMinor = 9;
    var minPatch = 1;
    var maxMajor = 4;

    if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
      throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
    }
  })();

  exports.Util = Util;
  exports.Alert = Alert;
  exports.Button = Button;
  exports.Carousel = Carousel;
  exports.Collapse = Collapse;
  exports.Dropdown = Dropdown;
  exports.Modal = Modal;
  exports.Popover = Popover;
  exports.Scrollspy = ScrollSpy;
  exports.Tab = Tab;
  exports.Toast = Toast;
  exports.Tooltip = Tooltip;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
(() => {
  const selectedClass = 'selected';
  const inactiveClass = 'inactive';
  const timeout = 1000 * 20;
  let $filter = null;
  let $filterItems = [];
  let $bells = [];
  let resetTimeout = null;

  /**
   * Filters all filter items and sets the inactive class to all items, which are
   * which have no corrosponding bells.
   */
  const filterFilterItems = () => {
    // get all first bell name chars
    // and unique it with Set
    const chars = [...new Set([...$bells]
      .map($bell => $bell.getAttribute('data-name').toLowerCase().substr(0, 1)))];

    // remove all not needed characters from filter
    [...$filterItems]
      .filter($item => !chars.includes($item.textContent.toLowerCase()))
      .forEach($item => {
        $item.classList.add(inactiveClass);
      })
  };

  /**
   * Filters all bells by selected filter item.
   *
   * @param {string|null} char
   */
  const filterBells = (char = null) => {
    // show all bells
    $bells.forEach($bell => {
      $bell.classList.remove('hide');
    })

    if (!char) {
      return;
    }

    // hide if names first char not matches char
    $bells.forEach($bell => {
      if ($bell.getAttribute('data-name').toLowerCase().substr(0, 1) !== char) {
        $bell.classList.add('hide');
      }
    })
  };

  /**
   * Removes the selected class from all filter items.
   */
  const removeSelectedClass = () => {
    $filterItems.forEach(item => item.classList.remove(selectedClass))
  };

  /**
   * Handles a click on a filter item.
   *
   * @param {MouseEvent|TouchEvent} event
   */
  const onFilterItemClick = (event) => {
    event.preventDefault();

    // remove selected class from all items
    removeSelectedClass();

    // add selected class to clicked item
    event.target.classList.add(selectedClass)

    // trigger filter
    filterBells(event.target.textContent.toLowerCase())

    // clear existing timeout
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }

    // set timeout after which all gets resetted
    resetTimeout = setTimeout(() => {
      filterBells(null);
      removeSelectedClass();
    }, timeout)
  };

  /**
   * Loads all elements and registers event listeners.
   */
  const init = () => {
    // load elements
    $filter = document.querySelector('.alphabetical-filter')
    $filterItems = $filter.querySelectorAll('.alphabetical-filter-item')
    $bells = document.querySelectorAll('.bell')

    filterFilterItems();

    // register click handler on
    // on all not inactive items
    [...$filterItems]
      .filter($item => !$item.classList.contains(inactiveClass))
      .forEach($item => $item.addEventListener('click', onFilterItemClick));
  };

  window.addEventListener('DOMContentLoaded', init);
})();
// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

const RELOAD_TIME = 1000 * 60 * 20; // 20 min

const $bells = new Map();
let $ringInfo = null;
let $requestSend = null;

$(document).ready(function() {
  $ringInfo = $('#ring_info');
  $requestSend = $('#request_send');

  $(".modal").on('show.bs.modal', function () {
    $('.blur').addClass('blur_active');
  });

  $(".modal").on('hide.bs.modal', function () {
    $('.blur').removeClass('blur_active');
  });

  document.ontouchmove = function (e) {
    e.preventDefault();
  }

  //reload every {RELOAD_TIME}
  setTimeout(function() {
    window.location.reload(1);
  }, RELOAD_TIME);
});

function ringring(id) {
  // get get bell from cache
  // if exist
  const $bell = $bells.has(id)
    ? $bells.get(id)
    : $(`#bell${id}`);

  // update bell in cache
  $bells.set(id, $bell)

  $.ajax({
    method: 'GET',
    url: `/ringring/${id}`,
    beforeSend: () => {
      $bell.modal('hide');
      $requestSend.modal('show');
      $('.alert').html('request send');
    },
    success: () => {
      $ringInfo.html('Klingel wurde erfolgreich ausgelöst.');
    },
    error: () => {
      $ringInfo.html('Klingel konnte nicht ausgelöst werden.');
    },
    complete: () => {
      setTimeout(function() {
        hide_requst_modal();
      }, 5000);
    },
  });
}

function hide_requst_modal() {
  $requestSend.modal('hide');
  reset();
}

function reset() {
  $ringInfo.html('...')
}
;
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
/*
 * Uploadcare (2.10.4)
 * Date: 2017-06-22 14:37:01 +0000
 * Rev: 74d1f4d6cb
 */

!function(e,t){e.document&&("object"==typeof module&&module.exports?module.exports=t(e,require("jquery")):e.uploadcare=t(e))}("undefined"!=typeof window?window:this,function(e,a){var r,n=e.document;return!function(e,t){"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof e?e:this,function(e,t){var i=[],a=e.document,r=i.slice,n=i.concat,o=i.push,l=i.indexOf,s={},c=s.toString,u=s.hasOwnProperty,d={},p="2.2.4",f=function(e,t){return new f.fn.init(e,t)},h=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,g=/^-ms-/,m=/-([\da-z])/gi,v=function(e,t){return t.toUpperCase()};f.fn=f.prototype={jquery:p,constructor:f,selector:"",length:0,toArray:function(){return r.call(this)},get:function(e){return null!=e?0>e?this[e+this.length]:this[e]:r.call(this)},pushStack:function(e){var t=f.merge(this.constructor(),e);return t.prevObject=this,t.context=this.context,t},each:function(e){return f.each(this,e)},map:function(e){return this.pushStack(f.map(this,function(t,i){return e.call(t,i,t)}))},slice:function(){return this.pushStack(r.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,i=+e+(0>e?t:0);return this.pushStack(i>=0&&t>i?[this[i]]:[])},end:function(){return this.prevObject||this.constructor()},push:o,sort:i.sort,splice:i.splice},f.extend=f.fn.extend=function(){var e,t,i,a,r,n,o=arguments[0]||{},l=1,s=arguments.length,c=!1;for("boolean"==typeof o&&(c=o,o=arguments[l]||{},l++),"object"==typeof o||f.isFunction(o)||(o={}),l===s&&(o=this,l--);s>l;l++)if(null!=(e=arguments[l]))for(t in e)i=o[t],a=e[t],o!==a&&(c&&a&&(f.isPlainObject(a)||(r=f.isArray(a)))?(r?(r=!1,n=i&&f.isArray(i)?i:[]):n=i&&f.isPlainObject(i)?i:{},o[t]=f.extend(c,n,a)):void 0!==a&&(o[t]=a));return o},f.extend({expando:"jQuery"+(p+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isFunction:function(e){return"function"===f.type(e)},isArray:Array.isArray,isWindow:function(e){return null!=e&&e===e.window},isNumeric:function(e){var t=e&&e.toString();return!f.isArray(e)&&t-parseFloat(t)+1>=0},isPlainObject:function(e){var t;if("object"!==f.type(e)||e.nodeType||f.isWindow(e))return!1;if(e.constructor&&!u.call(e,"constructor")&&!u.call(e.constructor.prototype||{},"isPrototypeOf"))return!1;for(t in e);return void 0===t||u.call(e,t)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?s[c.call(e)]||"object":typeof e},globalEval:function(e){var t,i=eval;e=f.trim(e),e&&(1===e.indexOf("use strict")?(t=a.createElement("script"),t.text=e,a.head.appendChild(t).parentNode.removeChild(t)):i(e))},camelCase:function(e){return e.replace(g,"ms-").replace(m,v)},nodeName:function(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()},each:function(e,t){var i,a=0;if(b(e)){for(i=e.length;i>a;a++)if(t.call(e[a],a,e[a])===!1)break}else for(a in e)if(t.call(e[a],a,e[a])===!1)break;return e},trim:function(e){return null==e?"":(e+"").replace(h,"")},makeArray:function(e,t){var i=t||[];return null!=e&&(b(Object(e))?f.merge(i,"string"==typeof e?[e]:e):o.call(i,e)),i},inArray:function(e,t,i){return null==t?-1:l.call(t,e,i)},merge:function(e,t){for(var i=+t.length,a=0,r=e.length;i>a;a++)e[r++]=t[a];return e.length=r,e},grep:function(e,t,i){for(var a,r=[],n=0,o=e.length,l=!i;o>n;n++)a=!t(e[n],n),a!==l&&r.push(e[n]);return r},map:function(e,t,i){var a,r,o=0,l=[];if(b(e))for(a=e.length;a>o;o++)r=t(e[o],o,i),null!=r&&l.push(r);else for(o in e)r=t(e[o],o,i),null!=r&&l.push(r);return n.apply([],l)},guid:1,proxy:function(e,t){var i,a,n;return"string"==typeof t&&(i=e[t],t=e,e=i),f.isFunction(e)?(a=r.call(arguments,2),n=function(){return e.apply(t||this,a.concat(r.call(arguments)))},n.guid=e.guid=e.guid||f.guid++,n):void 0},now:Date.now,support:d}),"function"==typeof Symbol&&(f.fn[Symbol.iterator]=i[Symbol.iterator]),f.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){s["[object "+t+"]"]=t.toLowerCase()});function b(e){var t=!!e&&"length"in e&&e.length,i=f.type(e);return"function"===i||f.isWindow(e)?!1:"array"===i||0===t||"number"==typeof t&&t>0&&t-1 in e}var _=function(e){var t,i,a,r,n,o,l,s,c,u,d,p,f,h,g,m,v,b,_,y="sizzle"+1*new Date,w=e.document,x=0,k=0,C=oe(),A=oe(),T=oe(),S=function(e,t){return e===t&&(d=!0),0},z=1<<31,j={}.hasOwnProperty,F=[],D=F.pop,I=F.push,E=F.push,P=F.slice,O=function(e,t){for(var i=0,a=e.length;a>i;i++)if(e[i]===t)return i;return-1},U="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",R="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",L="\\["+R+"*("+M+")(?:"+R+"*([*^$|!~]?=)"+R+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+R+"*\\]",B=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+L+")*)|.*)\\)|)",N=new RegExp(R+"+","g"),q=new RegExp("^"+R+"+|((?:^|[^\\\\])(?:\\\\.)*)"+R+"+$","g"),V=new RegExp("^"+R+"*,"+R+"*"),W=new RegExp("^"+R+"*([>+~]|"+R+")"+R+"*"),K=new RegExp("="+R+"*([^\\]'\"]*?)"+R+"*\\]","g"),H=new RegExp(B),G=new RegExp("^"+M+"$"),Q={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+L),PSEUDO:new RegExp("^"+B),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+R+"*(even|odd|(([+-]|)(\\d*)n|)"+R+"*(?:([+-]|)"+R+"*(\\d+)|))"+R+"*\\)|)","i"),bool:new RegExp("^(?:"+U+")$","i"),needsContext:new RegExp("^"+R+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+R+"*((?:-\\d)?\\d*)"+R+"*\\)|)(?=[^-]|$)","i")},J=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,X=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Z=/[+~]/,ee=/'|\\/g,te=new RegExp("\\\\([\\da-f]{1,6}"+R+"?|("+R+")|.)","ig"),ie=function(e,t,i){var a="0x"+t-65536;return a!==a||i?t:0>a?String.fromCharCode(a+65536):String.fromCharCode(a>>10|55296,1023&a|56320)},ae=function(){p()};try{E.apply(F=P.call(w.childNodes),w.childNodes),F[w.childNodes.length].nodeType}catch(re){E={apply:F.length?function(e,t){I.apply(e,P.call(t))}:function(e,t){var i=e.length,a=0;while(e[i++]=t[a++]);e.length=i-1}}}function ne(e,t,a,r){var n,l,c,u,d,h,v,b,x=t&&t.ownerDocument,k=t?t.nodeType:9;if(a=a||[],"string"!=typeof e||!e||1!==k&&9!==k&&11!==k)return a;if(!r&&((t?t.ownerDocument||t:w)!==f&&p(t),t=t||f,g)){if(11!==k&&(h=$.exec(e)))if(n=h[1]){if(9===k){if(!(c=t.getElementById(n)))return a;if(c.id===n)return a.push(c),a}else if(x&&(c=x.getElementById(n))&&_(t,c)&&c.id===n)return a.push(c),a}else{if(h[2])return E.apply(a,t.getElementsByTagName(e)),a;if((n=h[3])&&i.getElementsByClassName&&t.getElementsByClassName)return E.apply(a,t.getElementsByClassName(n)),a}if(i.qsa&&!T[e+" "]&&(!m||!m.test(e))){if(1!==k)x=t,b=e;else if("object"!==t.nodeName.toLowerCase()){(u=t.getAttribute("id"))?u=u.replace(ee,"\\$&"):t.setAttribute("id",u=y),v=o(e),l=v.length,d=G.test(u)?"#"+u:"[id='"+u+"']";while(l--)v[l]=d+" "+me(v[l]);b=v.join(","),x=Z.test(e)&&he(t.parentNode)||t}if(b)try{return E.apply(a,x.querySelectorAll(b)),a}catch(C){}finally{u===y&&t.removeAttribute("id")}}}return s(e.replace(q,"$1"),t,a,r)}function oe(){var e=[];function t(i,r){return e.push(i+" ")>a.cacheLength&&delete t[e.shift()],t[i+" "]=r}return t}function le(e){return e[y]=!0,e}function se(e){var t=f.createElement("div");try{return!!e(t)}catch(i){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function ce(e,t){var i=e.split("|"),r=i.length;while(r--)a.attrHandle[i[r]]=t}function ue(e,t){var i=t&&e,a=i&&1===e.nodeType&&1===t.nodeType&&(~t.sourceIndex||z)-(~e.sourceIndex||z);if(a)return a;if(i)while(i=i.nextSibling)if(i===t)return-1;return e?1:-1}function de(e){return function(t){var i=t.nodeName.toLowerCase();return"input"===i&&t.type===e}}function pe(e){return function(t){var i=t.nodeName.toLowerCase();return("input"===i||"button"===i)&&t.type===e}}function fe(e){return le(function(t){return t=+t,le(function(i,a){var r,n=e([],i.length,t),o=n.length;
    while(o--)i[r=n[o]]&&(i[r]=!(a[r]=i[r]))})})}function he(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}i=ne.support={},n=ne.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return t?"HTML"!==t.nodeName:!1},p=ne.setDocument=function(e){var t,r,o=e?e.ownerDocument||e:w;return o!==f&&9===o.nodeType&&o.documentElement?(f=o,h=f.documentElement,g=!n(f),(r=f.defaultView)&&r.top!==r&&(r.addEventListener?r.addEventListener("unload",ae,!1):r.attachEvent&&r.attachEvent("onunload",ae)),i.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),i.getElementsByTagName=se(function(e){return e.appendChild(f.createComment("")),!e.getElementsByTagName("*").length}),i.getElementsByClassName=X.test(f.getElementsByClassName),i.getById=se(function(e){return h.appendChild(e).id=y,!f.getElementsByName||!f.getElementsByName(y).length}),i.getById?(a.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var i=t.getElementById(e);return i?[i]:[]}},a.filter.ID=function(e){var t=e.replace(te,ie);return function(e){return e.getAttribute("id")===t}}):(delete a.find.ID,a.filter.ID=function(e){var t=e.replace(te,ie);return function(e){var i="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return i&&i.value===t}}),a.find.TAG=i.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):i.qsa?t.querySelectorAll(e):void 0}:function(e,t){var i,a=[],r=0,n=t.getElementsByTagName(e);if("*"===e){while(i=n[r++])1===i.nodeType&&a.push(i);return a}return n},a.find.CLASS=i.getElementsByClassName&&function(e,t){return"undefined"!=typeof t.getElementsByClassName&&g?t.getElementsByClassName(e):void 0},v=[],m=[],(i.qsa=X.test(f.querySelectorAll))&&(se(function(e){h.appendChild(e).innerHTML="<a id='"+y+"'></a><select id='"+y+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+R+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+R+"*(?:value|"+U+")"),e.querySelectorAll("[id~="+y+"-]").length||m.push("~="),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+y+"+*").length||m.push(".#.+[+~]")}),se(function(e){var t=f.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+R+"*[*^$|!~]?="),e.querySelectorAll(":enabled").length||m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:")})),(i.matchesSelector=X.test(b=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){i.disconnectedMatch=b.call(e,"div"),b.call(e,"[s!='']:x"),v.push("!=",B)}),m=m.length&&new RegExp(m.join("|")),v=v.length&&new RegExp(v.join("|")),t=X.test(h.compareDocumentPosition),_=t||X.test(h.contains)?function(e,t){var i=9===e.nodeType?e.documentElement:e,a=t&&t.parentNode;return e===a||!(!a||1!==a.nodeType||!(i.contains?i.contains(a):e.compareDocumentPosition&&16&e.compareDocumentPosition(a)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},S=t?function(e,t){if(e===t)return d=!0,0;var a=!e.compareDocumentPosition-!t.compareDocumentPosition;return a?a:(a=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1,1&a||!i.sortDetached&&t.compareDocumentPosition(e)===a?e===f||e.ownerDocument===w&&_(w,e)?-1:t===f||t.ownerDocument===w&&_(w,t)?1:u?O(u,e)-O(u,t):0:4&a?-1:1)}:function(e,t){if(e===t)return d=!0,0;var i,a=0,r=e.parentNode,n=t.parentNode,o=[e],l=[t];if(!r||!n)return e===f?-1:t===f?1:r?-1:n?1:u?O(u,e)-O(u,t):0;if(r===n)return ue(e,t);i=e;while(i=i.parentNode)o.unshift(i);i=t;while(i=i.parentNode)l.unshift(i);while(o[a]===l[a])a++;return a?ue(o[a],l[a]):o[a]===w?-1:l[a]===w?1:0},f):f},ne.matches=function(e,t){return ne(e,null,null,t)},ne.matchesSelector=function(e,t){if((e.ownerDocument||e)!==f&&p(e),t=t.replace(K,"='$1']"),i.matchesSelector&&g&&!T[t+" "]&&(!v||!v.test(t))&&(!m||!m.test(t)))try{var a=b.call(e,t);if(a||i.disconnectedMatch||e.document&&11!==e.document.nodeType)return a}catch(r){}return ne(t,f,null,[e]).length>0},ne.contains=function(e,t){return(e.ownerDocument||e)!==f&&p(e),_(e,t)},ne.attr=function(e,t){(e.ownerDocument||e)!==f&&p(e);var r=a.attrHandle[t.toLowerCase()],n=r&&j.call(a.attrHandle,t.toLowerCase())?r(e,t,!g):void 0;return void 0!==n?n:i.attributes||!g?e.getAttribute(t):(n=e.getAttributeNode(t))&&n.specified?n.value:null},ne.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ne.uniqueSort=function(e){var t,a=[],r=0,n=0;if(d=!i.detectDuplicates,u=!i.sortStable&&e.slice(0),e.sort(S),d){while(t=e[n++])t===e[n]&&(r=a.push(n));while(r--)e.splice(a[r],1)}return u=null,e},r=ne.getText=function(e){var t,i="",a=0,n=e.nodeType;if(n){if(1===n||9===n||11===n){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)i+=r(e)}else if(3===n||4===n)return e.nodeValue}else while(t=e[a++])i+=r(t);return i},a=ne.selectors={cacheLength:50,createPseudo:le,match:Q,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ie),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ie),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||ne.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&ne.error(e[0]),e},PSEUDO:function(e){var t,i=!e[6]&&e[2];return Q.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":i&&H.test(i)&&(t=o(i,!0))&&(t=i.indexOf(")",i.length-t)-i.length)&&(e[0]=e[0].slice(0,t),e[2]=i.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ie).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=C[e+" "];return t||(t=new RegExp("(^|"+R+")"+e+"("+R+"|$)"))&&C(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,i){return function(a){var r=ne.attr(a,e);return null==r?"!="===t:t?(r+="","="===t?r===i:"!="===t?r!==i:"^="===t?i&&0===r.indexOf(i):"*="===t?i&&r.indexOf(i)>-1:"$="===t?i&&r.slice(-i.length)===i:"~="===t?(" "+r.replace(N," ")+" ").indexOf(i)>-1:"|="===t?r===i||r.slice(0,i.length+1)===i+"-":!1):!0}},CHILD:function(e,t,i,a,r){var n="nth"!==e.slice(0,3),o="last"!==e.slice(-4),l="of-type"===t;return 1===a&&0===r?function(e){return!!e.parentNode}:function(t,i,s){var c,u,d,p,f,h,g=n!==o?"nextSibling":"previousSibling",m=t.parentNode,v=l&&t.nodeName.toLowerCase(),b=!s&&!l,_=!1;if(m){if(n){while(g){p=t;while(p=p[g])if(l?p.nodeName.toLowerCase()===v:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[o?m.firstChild:m.lastChild],o&&b){p=m,d=p[y]||(p[y]={}),u=d[p.uniqueID]||(d[p.uniqueID]={}),c=u[e]||[],f=c[0]===x&&c[1],_=f&&c[2],p=f&&m.childNodes[f];while(p=++f&&p&&p[g]||(_=f=0)||h.pop())if(1===p.nodeType&&++_&&p===t){u[e]=[x,f,_];break}}else if(b&&(p=t,d=p[y]||(p[y]={}),u=d[p.uniqueID]||(d[p.uniqueID]={}),c=u[e]||[],f=c[0]===x&&c[1],_=f),_===!1)while(p=++f&&p&&p[g]||(_=f=0)||h.pop())if((l?p.nodeName.toLowerCase()===v:1===p.nodeType)&&++_&&(b&&(d=p[y]||(p[y]={}),u=d[p.uniqueID]||(d[p.uniqueID]={}),u[e]=[x,_]),p===t))break;return _-=r,_===a||_%a===0&&_/a>=0}}},PSEUDO:function(e,t){var i,r=a.pseudos[e]||a.setFilters[e.toLowerCase()]||ne.error("unsupported pseudo: "+e);return r[y]?r(t):r.length>1?(i=[e,e,"",t],a.setFilters.hasOwnProperty(e.toLowerCase())?le(function(e,i){var a,n=r(e,t),o=n.length;while(o--)a=O(e,n[o]),e[a]=!(i[a]=n[o])}):function(e){return r(e,0,i)}):r}},pseudos:{not:le(function(e){var t=[],i=[],a=l(e.replace(q,"$1"));return a[y]?le(function(e,t,i,r){var n,o=a(e,null,r,[]),l=e.length;while(l--)(n=o[l])&&(e[l]=!(t[l]=n))}):function(e,r,n){return t[0]=e,a(t,null,n,i),t[0]=null,!i.pop()}}),has:le(function(e){return function(t){return ne(e,t).length>0}}),contains:le(function(e){return e=e.replace(te,ie),
    function(t){return(t.textContent||t.innerText||r(t)).indexOf(e)>-1}}),lang:le(function(e){return G.test(e||"")||ne.error("unsupported lang: "+e),e=e.replace(te,ie).toLowerCase(),function(t){var i;do if(i=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return i=i.toLowerCase(),i===e||0===i.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var i=e.location&&e.location.hash;return i&&i.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===f.activeElement&&(!f.hasFocus||f.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:function(e){return e.disabled===!1},disabled:function(e){return e.disabled===!0},checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!a.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return J.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:fe(function(){return[0]}),last:fe(function(e,t){return[t-1]}),eq:fe(function(e,t,i){return[0>i?i+t:i]}),even:fe(function(e,t){for(var i=0;t>i;i+=2)e.push(i);return e}),odd:fe(function(e,t){for(var i=1;t>i;i+=2)e.push(i);return e}),lt:fe(function(e,t,i){for(var a=0>i?i+t:i;--a>=0;)e.push(a);return e}),gt:fe(function(e,t,i){for(var a=0>i?i+t:i;++a<t;)e.push(a);return e})}},a.pseudos.nth=a.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})a.pseudos[t]=de(t);for(t in{submit:!0,reset:!0})a.pseudos[t]=pe(t);function ge(){}ge.prototype=a.filters=a.pseudos,a.setFilters=new ge,o=ne.tokenize=function(e,t){var i,r,n,o,l,s,c,u=A[e+" "];if(u)return t?0:u.slice(0);l=e,s=[],c=a.preFilter;while(l){i&&!(r=V.exec(l))||(r&&(l=l.slice(r[0].length)||l),s.push(n=[])),i=!1,(r=W.exec(l))&&(i=r.shift(),n.push({value:i,type:r[0].replace(q," ")}),l=l.slice(i.length));for(o in a.filter)!(r=Q[o].exec(l))||c[o]&&!(r=c[o](r))||(i=r.shift(),n.push({value:i,type:o,matches:r}),l=l.slice(i.length));if(!i)break}return t?l.length:l?ne.error(e):A(e,s).slice(0)};function me(e){for(var t=0,i=e.length,a="";i>t;t++)a+=e[t].value;return a}function ve(e,t,i){var a=t.dir,r=i&&"parentNode"===a,n=k++;return t.first?function(t,i,n){while(t=t[a])if(1===t.nodeType||r)return e(t,i,n)}:function(t,i,o){var l,s,c,u=[x,n];if(o){while(t=t[a])if((1===t.nodeType||r)&&e(t,i,o))return!0}else while(t=t[a])if(1===t.nodeType||r){if(c=t[y]||(t[y]={}),s=c[t.uniqueID]||(c[t.uniqueID]={}),(l=s[a])&&l[0]===x&&l[1]===n)return u[2]=l[2];if(s[a]=u,u[2]=e(t,i,o))return!0}}}function be(e){return e.length>1?function(t,i,a){var r=e.length;while(r--)if(!e[r](t,i,a))return!1;return!0}:e[0]}function _e(e,t,i){for(var a=0,r=t.length;r>a;a++)ne(e,t[a],i);return i}function ye(e,t,i,a,r){for(var n,o=[],l=0,s=e.length,c=null!=t;s>l;l++)(n=e[l])&&(i&&!i(n,a,r)||(o.push(n),c&&t.push(l)));return o}function we(e,t,i,a,r,n){return a&&!a[y]&&(a=we(a)),r&&!r[y]&&(r=we(r,n)),le(function(n,o,l,s){var c,u,d,p=[],f=[],h=o.length,g=n||_e(t||"*",l.nodeType?[l]:l,[]),m=!e||!n&&t?g:ye(g,p,e,l,s),v=i?r||(n?e:h||a)?[]:o:m;if(i&&i(m,v,l,s),a){c=ye(v,f),a(c,[],l,s),u=c.length;while(u--)(d=c[u])&&(v[f[u]]=!(m[f[u]]=d))}if(n){if(r||e){if(r){c=[],u=v.length;while(u--)(d=v[u])&&c.push(m[u]=d);r(null,v=[],c,s)}u=v.length;while(u--)(d=v[u])&&(c=r?O(n,d):p[u])>-1&&(n[c]=!(o[c]=d))}}else v=ye(v===o?v.splice(h,v.length):v),r?r(null,o,v,s):E.apply(o,v)})}function xe(e){for(var t,i,r,n=e.length,o=a.relative[e[0].type],l=o||a.relative[" "],s=o?1:0,u=ve(function(e){return e===t},l,!0),d=ve(function(e){return O(t,e)>-1},l,!0),p=[function(e,i,a){var r=!o&&(a||i!==c)||((t=i).nodeType?u(e,i,a):d(e,i,a));return t=null,r}];n>s;s++)if(i=a.relative[e[s].type])p=[ve(be(p),i)];else{if(i=a.filter[e[s].type].apply(null,e[s].matches),i[y]){for(r=++s;n>r;r++)if(a.relative[e[r].type])break;return we(s>1&&be(p),s>1&&me(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(q,"$1"),i,r>s&&xe(e.slice(s,r)),n>r&&xe(e=e.slice(r)),n>r&&me(e))}p.push(i)}return be(p)}function ke(e,t){var i=t.length>0,r=e.length>0,n=function(n,o,l,s,u){var d,h,m,v=0,b="0",_=n&&[],y=[],w=c,k=n||r&&a.find.TAG("*",u),C=x+=null==w?1:Math.random()||.1,A=k.length;for(u&&(c=o===f||o||u);b!==A&&null!=(d=k[b]);b++){if(r&&d){h=0,o||d.ownerDocument===f||(p(d),l=!g);while(m=e[h++])if(m(d,o||f,l)){s.push(d);break}u&&(x=C)}i&&((d=!m&&d)&&v--,n&&_.push(d))}if(v+=b,i&&b!==v){h=0;while(m=t[h++])m(_,y,o,l);if(n){if(v>0)while(b--)_[b]||y[b]||(y[b]=D.call(s));y=ye(y)}E.apply(s,y),u&&!n&&y.length>0&&v+t.length>1&&ne.uniqueSort(s)}return u&&(x=C,c=w),_};return i?le(n):n}return l=ne.compile=function(e,t){var i,a=[],r=[],n=T[e+" "];if(!n){t||(t=o(e)),i=t.length;while(i--)n=xe(t[i]),n[y]?a.push(n):r.push(n);n=T(e,ke(r,a)),n.selector=e}return n},s=ne.select=function(e,t,r,n){var s,c,u,d,p,f="function"==typeof e&&e,h=!n&&o(e=f.selector||e);if(r=r||[],1===h.length){if(c=h[0]=h[0].slice(0),c.length>2&&"ID"===(u=c[0]).type&&i.getById&&9===t.nodeType&&g&&a.relative[c[1].type]){if(t=(a.find.ID(u.matches[0].replace(te,ie),t)||[])[0],!t)return r;f&&(t=t.parentNode),e=e.slice(c.shift().value.length)}s=Q.needsContext.test(e)?0:c.length;while(s--){if(u=c[s],a.relative[d=u.type])break;if((p=a.find[d])&&(n=p(u.matches[0].replace(te,ie),Z.test(c[0].type)&&he(t.parentNode)||t))){if(c.splice(s,1),e=n.length&&me(c),!e)return E.apply(r,n),r;break}}}return(f||l(e,h))(n,t,!g,r,!t||Z.test(e)&&he(t.parentNode)||t),r},i.sortStable=y.split("").sort(S).join("")===y,i.detectDuplicates=!!d,p(),i.sortDetached=se(function(e){return 1&e.compareDocumentPosition(f.createElement("div"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||ce("type|href|height|width",function(e,t,i){return i?void 0:e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),i.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||ce("value",function(e,t,i){return i||"input"!==e.nodeName.toLowerCase()?void 0:e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||ce(U,function(e,t,i){var a;return i?void 0:e[t]===!0?t.toLowerCase():(a=e.getAttributeNode(t))&&a.specified?a.value:null}),ne}(e);f.find=_,f.expr=_.selectors,f.expr[":"]=f.expr.pseudos,f.uniqueSort=f.unique=_.uniqueSort,f.text=_.getText,f.isXMLDoc=_.isXML,f.contains=_.contains;var y=function(e,t,i){var a=[],r=void 0!==i;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(r&&f(e).is(i))break;a.push(e)}return a},w=function(e,t){for(var i=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&i.push(e);return i},x=f.expr.match.needsContext,k=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,C=/^.[^:#\[\.,]*$/;function A(e,t,i){if(f.isFunction(t))return f.grep(e,function(e,a){return!!t.call(e,a,e)!==i});if(t.nodeType)return f.grep(e,function(e){return e===t!==i});if("string"==typeof t){if(C.test(t))return f.filter(t,e,i);t=f.filter(t,e)}return f.grep(e,function(e){return l.call(t,e)>-1!==i})}f.filter=function(e,t,i){var a=t[0];return i&&(e=":not("+e+")"),1===t.length&&1===a.nodeType?f.find.matchesSelector(a,e)?[a]:[]:f.find.matches(e,f.grep(t,function(e){return 1===e.nodeType}))},f.fn.extend({find:function(e){var t,i=this.length,a=[],r=this;if("string"!=typeof e)return this.pushStack(f(e).filter(function(){for(t=0;i>t;t++)if(f.contains(r[t],this))return!0}));for(t=0;i>t;t++)f.find(e,r[t],a);return a=this.pushStack(i>1?f.unique(a):a),a.selector=this.selector?this.selector+" "+e:e,a},filter:function(e){return this.pushStack(A(this,e||[],!1))},not:function(e){return this.pushStack(A(this,e||[],!0))},is:function(e){return!!A(this,"string"==typeof e&&x.test(e)?f(e):e||[],!1).length}});var T,S=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,z=f.fn.init=function(e,t,i){var r,n;if(!e)return this;if(i=i||T,"string"==typeof e){if(r="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:S.exec(e),
    !r||!r[1]&&t)return!t||t.jquery?(t||i).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof f?t[0]:t,f.merge(this,f.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:a,!0)),k.test(r[1])&&f.isPlainObject(t))for(r in t)f.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return n=a.getElementById(r[2]),n&&n.parentNode&&(this.length=1,this[0]=n),this.context=a,this.selector=e,this}return e.nodeType?(this.context=this[0]=e,this.length=1,this):f.isFunction(e)?void 0!==i.ready?i.ready(e):e(f):(void 0!==e.selector&&(this.selector=e.selector,this.context=e.context),f.makeArray(e,this))};z.prototype=f.fn,T=f(a);var j=/^(?:parents|prev(?:Until|All))/,F={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({has:function(e){var t=f(e,this),i=t.length;return this.filter(function(){for(var e=0;i>e;e++)if(f.contains(this,t[e]))return!0})},closest:function(e,t){for(var i,a=0,r=this.length,n=[],o=x.test(e)||"string"!=typeof e?f(e,t||this.context):0;r>a;a++)for(i=this[a];i&&i!==t;i=i.parentNode)if(i.nodeType<11&&(o?o.index(i)>-1:1===i.nodeType&&f.find.matchesSelector(i,e))){n.push(i);break}return this.pushStack(n.length>1?f.uniqueSort(n):n)},index:function(e){return e?"string"==typeof e?l.call(f(e),this[0]):l.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(f.uniqueSort(f.merge(this.get(),f(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function D(e,t){while((e=e[t])&&1!==e.nodeType);return e}f.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return y(e,"parentNode")},parentsUntil:function(e,t,i){return y(e,"parentNode",i)},next:function(e){return D(e,"nextSibling")},prev:function(e){return D(e,"previousSibling")},nextAll:function(e){return y(e,"nextSibling")},prevAll:function(e){return y(e,"previousSibling")},nextUntil:function(e,t,i){return y(e,"nextSibling",i)},prevUntil:function(e,t,i){return y(e,"previousSibling",i)},siblings:function(e){return w((e.parentNode||{}).firstChild,e)},children:function(e){return w(e.firstChild)},contents:function(e){return e.contentDocument||f.merge([],e.childNodes)}},function(e,t){f.fn[e]=function(i,a){var r=f.map(this,t,i);return"Until"!==e.slice(-5)&&(a=i),a&&"string"==typeof a&&(r=f.filter(a,r)),this.length>1&&(F[e]||f.uniqueSort(r),j.test(e)&&r.reverse()),this.pushStack(r)}});var I=/\S+/g;function E(e){var t={};return f.each(e.match(I)||[],function(e,i){t[i]=!0}),t}f.Callbacks=function(e){e="string"==typeof e?E(e):f.extend({},e);var t,i,a,r,n=[],o=[],l=-1,s=function(){for(r=e.once,a=t=!0;o.length;l=-1){i=o.shift();while(++l<n.length)n[l].apply(i[0],i[1])===!1&&e.stopOnFalse&&(l=n.length,i=!1)}e.memory||(i=!1),t=!1,r&&(n=i?[]:"")},c={add:function(){return n&&(i&&!t&&(l=n.length-1,o.push(i)),function a(t){f.each(t,function(t,i){f.isFunction(i)?e.unique&&c.has(i)||n.push(i):i&&i.length&&"string"!==f.type(i)&&a(i)})}(arguments),i&&!t&&s()),this},remove:function(){return f.each(arguments,function(e,t){var i;while((i=f.inArray(t,n,i))>-1)n.splice(i,1),l>=i&&l--}),this},has:function(e){return e?f.inArray(e,n)>-1:n.length>0},empty:function(){return n&&(n=[]),this},disable:function(){return r=o=[],n=i="",this},disabled:function(){return!n},lock:function(){return r=o=[],i||(n=i=""),this},locked:function(){return!!r},fireWith:function(e,i){return r||(i=i||[],i=[e,i.slice?i.slice():i],o.push(i),t||s()),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!a}};return c},f.extend({Deferred:function(e){var t=[["resolve","done",f.Callbacks("once memory"),"resolved"],["reject","fail",f.Callbacks("once memory"),"rejected"],["notify","progress",f.Callbacks("memory")]],i="pending",a={state:function(){return i},always:function(){return r.done(arguments).fail(arguments),this},then:function(){var e=arguments;return f.Deferred(function(i){f.each(t,function(t,n){var o=f.isFunction(e[t])&&e[t];r[n[1]](function(){var e=o&&o.apply(this,arguments);e&&f.isFunction(e.promise)?e.promise().progress(i.notify).done(i.resolve).fail(i.reject):i[n[0]+"With"](this===a?i.promise():this,o?[e]:arguments)})}),e=null}).promise()},promise:function(e){return null!=e?f.extend(e,a):a}},r={};return a.pipe=a.then,f.each(t,function(e,n){var o=n[2],l=n[3];a[n[1]]=o.add,l&&o.add(function(){i=l},t[1^e][2].disable,t[2][2].lock),r[n[0]]=function(){return r[n[0]+"With"](this===r?a:this,arguments),this},r[n[0]+"With"]=o.fireWith}),a.promise(r),e&&e.call(r,r),r},when:function(e){var t=0,i=r.call(arguments),a=i.length,n=1!==a||e&&f.isFunction(e.promise)?a:0,o=1===n?e:f.Deferred(),l=function(e,t,i){return function(a){t[e]=this,i[e]=arguments.length>1?r.call(arguments):a,i===s?o.notifyWith(t,i):--n||o.resolveWith(t,i)}},s,c,u;if(a>1)for(s=new Array(a),c=new Array(a),u=new Array(a);a>t;t++)i[t]&&f.isFunction(i[t].promise)?i[t].promise().progress(l(t,c,s)).done(l(t,u,i)).fail(o.reject):--n;return n||o.resolveWith(u,i),o.promise()}});var P;f.fn.ready=function(e){return f.ready.promise().done(e),this},f.extend({isReady:!1,readyWait:1,holdReady:function(e){e?f.readyWait++:f.ready(!0)},ready:function(e){(e===!0?--f.readyWait:f.isReady)||(f.isReady=!0,e!==!0&&--f.readyWait>0||(P.resolveWith(a,[f]),f.fn.triggerHandler&&(f(a).triggerHandler("ready"),f(a).off("ready"))))}});function O(){a.removeEventListener("DOMContentLoaded",O),e.removeEventListener("load",O),f.ready()}f.ready.promise=function(t){return P||(P=f.Deferred(),"complete"===a.readyState||"loading"!==a.readyState&&!a.documentElement.doScroll?e.setTimeout(f.ready):(a.addEventListener("DOMContentLoaded",O),e.addEventListener("load",O))),P.promise(t)},f.ready.promise();var U=function(e,t,i,a,r,n,o){var l=0,s=e.length,c=null==i;if("object"===f.type(i)){r=!0;for(l in i)U(e,t,l,i[l],!0,n,o)}else if(void 0!==a&&(r=!0,f.isFunction(a)||(o=!0),c&&(o?(t.call(e,a),t=null):(c=t,t=function(e,t,i){return c.call(f(e),i)})),t))for(;s>l;l++)t(e[l],i,o?a:a.call(e[l],l,t(e[l],i)));return r?e:c?t.call(e):s?t(e[0],i):n},R=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function M(){this.expando=f.expando+M.uid++}M.uid=1,M.prototype={register:function(e,t){var i=t||{};return e.nodeType?e[this.expando]=i:Object.defineProperty(e,this.expando,{value:i,writable:!0,configurable:!0}),e[this.expando]},cache:function(e){if(!R(e))return{};var t=e[this.expando];return t||(t={},R(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,i){var a,r=this.cache(e);if("string"==typeof t)r[t]=i;else for(a in t)r[a]=t[a];return r},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][t]},access:function(e,t,i){var a;return void 0===t||t&&"string"==typeof t&&void 0===i?(a=this.get(e,t),void 0!==a?a:this.get(e,f.camelCase(t))):(this.set(e,t,i),void 0!==i?i:t)},remove:function(e,t){var i,a,r,n=e[this.expando];if(void 0!==n){if(void 0===t)this.register(e);else{f.isArray(t)?a=t.concat(t.map(f.camelCase)):(r=f.camelCase(t),t in n?a=[t,r]:(a=r,a=a in n?[a]:a.match(I)||[])),i=a.length;while(i--)delete n[a[i]]}(void 0===t||f.isEmptyObject(n))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!f.isEmptyObject(t)}};var L=new M,B=new M,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,q=/[A-Z]/g;function V(e,t,i){var a;if(void 0===i&&1===e.nodeType)if(a="data-"+t.replace(q,"-$&").toLowerCase(),i=e.getAttribute(a),"string"==typeof i){try{i="true"===i?!0:"false"===i?!1:"null"===i?null:+i+""===i?+i:N.test(i)?f.parseJSON(i):i}catch(r){}B.set(e,t,i)}else i=void 0;return i}f.extend({hasData:function(e){return B.hasData(e)||L.hasData(e)},data:function(e,t,i){return B.access(e,t,i)},removeData:function(e,t){B.remove(e,t)},_data:function(e,t,i){return L.access(e,t,i)},_removeData:function(e,t){L.remove(e,t)}}),f.fn.extend({data:function(e,t){var i,a,r,n=this[0],o=n&&n.attributes;if(void 0===e){if(this.length&&(r=B.get(n),1===n.nodeType&&!L.get(n,"hasDataAttrs"))){i=o.length;while(i--)o[i]&&(a=o[i].name,0===a.indexOf("data-")&&(a=f.camelCase(a.slice(5)),V(n,a,r[a])));L.set(n,"hasDataAttrs",!0)}
    return r}return"object"==typeof e?this.each(function(){B.set(this,e)}):U(this,function(t){var i,a;if(n&&void 0===t){if(i=B.get(n,e)||B.get(n,e.replace(q,"-$&").toLowerCase()),void 0!==i)return i;if(a=f.camelCase(e),i=B.get(n,a),void 0!==i)return i;if(i=V(n,a,void 0),void 0!==i)return i}else a=f.camelCase(e),this.each(function(){var i=B.get(this,a);B.set(this,a,t),e.indexOf("-")>-1&&void 0!==i&&B.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){B.remove(this,e)})}}),f.extend({queue:function(e,t,i){var a;return e?(t=(t||"fx")+"queue",a=L.get(e,t),i&&(!a||f.isArray(i)?a=L.access(e,t,f.makeArray(i)):a.push(i)),a||[]):void 0},dequeue:function(e,t){t=t||"fx";var i=f.queue(e,t),a=i.length,r=i.shift(),n=f._queueHooks(e,t),o=function(){f.dequeue(e,t)};"inprogress"===r&&(r=i.shift(),a--),r&&("fx"===t&&i.unshift("inprogress"),delete n.stop,r.call(e,o,n)),!a&&n&&n.empty.fire()},_queueHooks:function(e,t){var i=t+"queueHooks";return L.get(e,i)||L.access(e,i,{empty:f.Callbacks("once memory").add(function(){L.remove(e,[t+"queue",i])})})}}),f.fn.extend({queue:function(e,t){var i=2;return"string"!=typeof e&&(t=e,e="fx",i--),arguments.length<i?f.queue(this[0],e):void 0===t?this:this.each(function(){var i=f.queue(this,e,t);f._queueHooks(this,e),"fx"===e&&"inprogress"!==i[0]&&f.dequeue(this,e)})},dequeue:function(e){return this.each(function(){f.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var i,a=1,r=f.Deferred(),n=this,o=this.length,l=function(){--a||r.resolveWith(n,[n])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(o--)i=L.get(n[o],e+"queueHooks"),i&&i.empty&&(a++,i.empty.add(l));return l(),r.promise(t)}});var W=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,K=new RegExp("^(?:([+-])=|)("+W+")([a-z%]*)$","i"),H=["Top","Right","Bottom","Left"],G=function(e,t){return e=t||e,"none"===f.css(e,"display")||!f.contains(e.ownerDocument,e)};function Q(e,t,i,a){var r,n=1,o=20,l=a?function(){return a.cur()}:function(){return f.css(e,t,"")},s=l(),c=i&&i[3]||(f.cssNumber[t]?"":"px"),u=(f.cssNumber[t]||"px"!==c&&+s)&&K.exec(f.css(e,t));if(u&&u[3]!==c){c=c||u[3],i=i||[],u=+s||1;do n=n||".5",u/=n,f.style(e,t,u+c);while(n!==(n=l()/s)&&1!==n&&--o)}return i&&(u=+u||+s||0,r=i[1]?u+(i[1]+1)*i[2]:+i[2],a&&(a.unit=c,a.start=u,a.end=r)),r}var J=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,X=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function Z(e,t){var i="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[];return void 0===t||t&&f.nodeName(e,t)?f.merge([e],i):i}function ee(e,t){for(var i=0,a=e.length;a>i;i++)L.set(e[i],"globalEval",!t||L.get(t[i],"globalEval"))}var te=/<|&#?\w+;/;function ie(e,t,i,a,r){for(var n,o,l,s,c,u,d=t.createDocumentFragment(),p=[],h=0,g=e.length;g>h;h++)if(n=e[h],n||0===n)if("object"===f.type(n))f.merge(p,n.nodeType?[n]:n);else if(te.test(n)){o=o||d.appendChild(t.createElement("div")),l=(Y.exec(n)||["",""])[1].toLowerCase(),s=$[l]||$._default,o.innerHTML=s[1]+f.htmlPrefilter(n)+s[2],u=s[0];while(u--)o=o.lastChild;f.merge(p,o.childNodes),o=d.firstChild,o.textContent=""}else p.push(t.createTextNode(n));d.textContent="",h=0;while(n=p[h++])if(a&&f.inArray(n,a)>-1)r&&r.push(n);else if(c=f.contains(n.ownerDocument,n),o=Z(d.appendChild(n),"script"),c&&ee(o),i){u=0;while(n=o[u++])X.test(n.type||"")&&i.push(n)}return d}!function(){var e=a.createDocumentFragment(),t=e.appendChild(a.createElement("div")),i=a.createElement("input");i.setAttribute("type","radio"),i.setAttribute("checked","checked"),i.setAttribute("name","t"),t.appendChild(i),d.checkClone=t.cloneNode(!0).cloneNode(!0).lastChild.checked,t.innerHTML="<textarea>x</textarea>",d.noCloneChecked=!!t.cloneNode(!0).lastChild.defaultValue}();var ae=/^key/,re=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,ne=/^([^.]*)(?:\.(.+)|)/;function oe(){return!0}function le(){return!1}function se(){try{return a.activeElement}catch(e){}}function ce(e,t,i,a,r,n){var o,l;if("object"==typeof t){"string"!=typeof i&&(a=a||i,i=void 0);for(l in t)ce(e,l,i,a,t[l],n);return e}if(null==a&&null==r?(r=i,a=i=void 0):null==r&&("string"==typeof i?(r=a,a=void 0):(r=a,a=i,i=void 0)),r===!1)r=le;else if(!r)return e;return 1===n&&(o=r,r=function(e){return f().off(e),o.apply(this,arguments)},r.guid=o.guid||(o.guid=f.guid++)),e.each(function(){f.event.add(this,t,r,a,i)})}f.event={global:{},add:function(e,t,i,a,r){var n,o,l,s,c,u,d,p,h,g,m,v=L.get(e);if(v){i.handler&&(n=i,i=n.handler,r=n.selector),i.guid||(i.guid=f.guid++),(s=v.events)||(s=v.events={}),(o=v.handle)||(o=v.handle=function(t){return"undefined"!=typeof f&&f.event.triggered!==t.type?f.event.dispatch.apply(e,arguments):void 0}),t=(t||"").match(I)||[""],c=t.length;while(c--)l=ne.exec(t[c])||[],h=m=l[1],g=(l[2]||"").split(".").sort(),h&&(d=f.event.special[h]||{},h=(r?d.delegateType:d.bindType)||h,d=f.event.special[h]||{},u=f.extend({type:h,origType:m,data:a,handler:i,guid:i.guid,selector:r,needsContext:r&&f.expr.match.needsContext.test(r),namespace:g.join(".")},n),(p=s[h])||(p=s[h]=[],p.delegateCount=0,d.setup&&d.setup.call(e,a,g,o)!==!1||e.addEventListener&&e.addEventListener(h,o)),d.add&&(d.add.call(e,u),u.handler.guid||(u.handler.guid=i.guid)),r?p.splice(p.delegateCount++,0,u):p.push(u),f.event.global[h]=!0)}},remove:function(e,t,i,a,r){var n,o,l,s,c,u,d,p,h,g,m,v=L.hasData(e)&&L.get(e);if(v&&(s=v.events)){t=(t||"").match(I)||[""],c=t.length;while(c--)if(l=ne.exec(t[c])||[],h=m=l[1],g=(l[2]||"").split(".").sort(),h){d=f.event.special[h]||{},h=(a?d.delegateType:d.bindType)||h,p=s[h]||[],l=l[2]&&new RegExp("(^|\\.)"+g.join("\\.(?:.*\\.|)")+"(\\.|$)"),o=n=p.length;while(n--)u=p[n],!r&&m!==u.origType||i&&i.guid!==u.guid||l&&!l.test(u.namespace)||a&&a!==u.selector&&("**"!==a||!u.selector)||(p.splice(n,1),u.selector&&p.delegateCount--,d.remove&&d.remove.call(e,u));o&&!p.length&&(d.teardown&&d.teardown.call(e,g,v.handle)!==!1||f.removeEvent(e,h,v.handle),delete s[h])}else for(h in s)f.event.remove(e,h+t[c],i,a,!0);f.isEmptyObject(s)&&L.remove(e,"handle events")}},dispatch:function(e){e=f.event.fix(e);var t,i,a,n,o,l=[],s=r.call(arguments),c=(L.get(this,"events")||{})[e.type]||[],u=f.event.special[e.type]||{};if(s[0]=e,e.delegateTarget=this,!u.preDispatch||u.preDispatch.call(this,e)!==!1){l=f.event.handlers.call(this,e,c),t=0;while((n=l[t++])&&!e.isPropagationStopped()){e.currentTarget=n.elem,i=0;while((o=n.handlers[i++])&&!e.isImmediatePropagationStopped())e.rnamespace&&!e.rnamespace.test(o.namespace)||(e.handleObj=o,e.data=o.data,a=((f.event.special[o.origType]||{}).handle||o.handler).apply(n.elem,s),void 0!==a&&(e.result=a)===!1&&(e.preventDefault(),e.stopPropagation()))}return u.postDispatch&&u.postDispatch.call(this,e),e.result}},handlers:function(e,t){var i,a,r,n,o=[],l=t.delegateCount,s=e.target;if(l&&s.nodeType&&("click"!==e.type||isNaN(e.button)||e.button<1))for(;s!==this;s=s.parentNode||this)if(1===s.nodeType&&(s.disabled!==!0||"click"!==e.type)){for(a=[],i=0;l>i;i++)n=t[i],r=n.selector+" ",void 0===a[r]&&(a[r]=n.needsContext?f(r,this).index(s)>-1:f.find(r,this,null,[s]).length),a[r]&&a.push(n);a.length&&o.push({elem:s,handlers:a})}return l<t.length&&o.push({elem:this,handlers:t.slice(l)}),o},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(e,t){return null==e.which&&(e.which=null!=t.charCode?t.charCode:t.keyCode),e}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(e,t){var i,r,n,o=t.button;return null==e.pageX&&null!=t.clientX&&(i=e.target.ownerDocument||a,r=i.documentElement,n=i.body,e.pageX=t.clientX+(r&&r.scrollLeft||n&&n.scrollLeft||0)-(r&&r.clientLeft||n&&n.clientLeft||0),
    e.pageY=t.clientY+(r&&r.scrollTop||n&&n.scrollTop||0)-(r&&r.clientTop||n&&n.clientTop||0)),e.which||void 0===o||(e.which=1&o?1:2&o?3:4&o?2:0),e}},fix:function(e){if(e[f.expando])return e;var t,i,r,n=e.type,o=e,l=this.fixHooks[n];l||(this.fixHooks[n]=l=re.test(n)?this.mouseHooks:ae.test(n)?this.keyHooks:{}),r=l.props?this.props.concat(l.props):this.props,e=new f.Event(o),t=r.length;while(t--)i=r[t],e[i]=o[i];return e.target||(e.target=a),3===e.target.nodeType&&(e.target=e.target.parentNode),l.filter?l.filter(e,o):e},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==se()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===se()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&f.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(e){return f.nodeName(e.target,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},f.removeEvent=function(e,t,i){e.removeEventListener&&e.removeEventListener(t,i)},f.Event=function(e,t){return this instanceof f.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&e.returnValue===!1?oe:le):this.type=e,t&&f.extend(this,t),this.timeStamp=e&&e.timeStamp||f.now(),void(this[f.expando]=!0)):new f.Event(e,t)},f.Event.prototype={constructor:f.Event,isDefaultPrevented:le,isPropagationStopped:le,isImmediatePropagationStopped:le,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=oe,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=oe,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=oe,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},f.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){f.event.special[e]={delegateType:t,bindType:t,handle:function(e){var i,a=this,r=e.relatedTarget,n=e.handleObj;return r&&(r===a||f.contains(a,r))||(e.type=n.origType,i=n.handler.apply(this,arguments),e.type=t),i}}}),f.fn.extend({on:function(e,t,i,a){return ce(this,e,t,i,a)},one:function(e,t,i,a){return ce(this,e,t,i,a,1)},off:function(e,t,i){var a,r;if(e&&e.preventDefault&&e.handleObj)return a=e.handleObj,f(e.delegateTarget).off(a.namespace?a.origType+"."+a.namespace:a.origType,a.selector,a.handler),this;if("object"==typeof e){for(r in e)this.off(r,t,e[r]);return this}return t!==!1&&"function"!=typeof t||(i=t,t=void 0),i===!1&&(i=le),this.each(function(){f.event.remove(this,e,i,t)})}});var ue=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,de=/<script|<style|<link/i,pe=/checked\s*(?:[^=]|=\s*.checked.)/i,fe=/^true\/(.*)/,he=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function ge(e,t){return f.nodeName(e,"table")&&f.nodeName(11!==t.nodeType?t:t.firstChild,"tr")?e.getElementsByTagName("tbody")[0]||e.appendChild(e.ownerDocument.createElement("tbody")):e}function me(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function ve(e){var t=fe.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function be(e,t){var i,a,r,n,o,l,s,c;if(1===t.nodeType){if(L.hasData(e)&&(n=L.access(e),o=L.set(t,n),c=n.events)){delete o.handle,o.events={};for(r in c)for(i=0,a=c[r].length;a>i;i++)f.event.add(t,r,c[r][i])}B.hasData(e)&&(l=B.access(e),s=f.extend({},l),B.set(t,s))}}function _e(e,t){var i=t.nodeName.toLowerCase();"input"===i&&J.test(e.type)?t.checked=e.checked:"input"!==i&&"textarea"!==i||(t.defaultValue=e.defaultValue)}function ye(e,t,i,a){t=n.apply([],t);var r,o,l,s,c,u,p=0,h=e.length,g=h-1,m=t[0],v=f.isFunction(m);if(v||h>1&&"string"==typeof m&&!d.checkClone&&pe.test(m))return e.each(function(r){var n=e.eq(r);v&&(t[0]=m.call(this,r,n.html())),ye(n,t,i,a)});if(h&&(r=ie(t,e[0].ownerDocument,!1,e,a),o=r.firstChild,1===r.childNodes.length&&(r=o),o||a)){for(l=f.map(Z(r,"script"),me),s=l.length;h>p;p++)c=r,p!==g&&(c=f.clone(c,!0,!0),s&&f.merge(l,Z(c,"script"))),i.call(e[p],c,p);if(s)for(u=l[l.length-1].ownerDocument,f.map(l,ve),p=0;s>p;p++)c=l[p],X.test(c.type||"")&&!L.access(c,"globalEval")&&f.contains(u,c)&&(c.src?f._evalUrl&&f._evalUrl(c.src):f.globalEval(c.textContent.replace(he,"")))}return e}function we(e,t,i){for(var a,r=t?f.filter(t,e):e,n=0;null!=(a=r[n]);n++)i||1!==a.nodeType||f.cleanData(Z(a)),a.parentNode&&(i&&f.contains(a.ownerDocument,a)&&ee(Z(a,"script")),a.parentNode.removeChild(a));return e}f.extend({htmlPrefilter:function(e){return e.replace(ue,"<$1></$2>")},clone:function(e,t,i){var a,r,n,o,l=e.cloneNode(!0),s=f.contains(e.ownerDocument,e);if(!(d.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||f.isXMLDoc(e)))for(o=Z(l),n=Z(e),a=0,r=n.length;r>a;a++)_e(n[a],o[a]);if(t)if(i)for(n=n||Z(e),o=o||Z(l),a=0,r=n.length;r>a;a++)be(n[a],o[a]);else be(e,l);return o=Z(l,"script"),o.length>0&&ee(o,!s&&Z(e,"script")),l},cleanData:function(e){for(var t,i,a,r=f.event.special,n=0;void 0!==(i=e[n]);n++)if(R(i)){if(t=i[L.expando]){if(t.events)for(a in t.events)r[a]?f.event.remove(i,a):f.removeEvent(i,a,t.handle);i[L.expando]=void 0}i[B.expando]&&(i[B.expando]=void 0)}}}),f.fn.extend({domManip:ye,detach:function(e){return we(this,e,!0)},remove:function(e){return we(this,e)},text:function(e){return U(this,function(e){return void 0===e?f.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return ye(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ge(this,e);t.appendChild(e)}})},prepend:function(){return ye(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=ge(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return ye(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return ye(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(f.cleanData(Z(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null==e?!1:e,t=null==t?e:t,this.map(function(){return f.clone(this,e,t)})},html:function(e){return U(this,function(e){var t=this[0]||{},i=0,a=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!de.test(e)&&!$[(Y.exec(e)||["",""])[1].toLowerCase()]){e=f.htmlPrefilter(e);try{for(;a>i;i++)t=this[i]||{},1===t.nodeType&&(f.cleanData(Z(t,!1)),t.innerHTML=e);t=0}catch(r){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=[];return ye(this,arguments,function(t){var i=this.parentNode;f.inArray(this,e)<0&&(f.cleanData(Z(this)),i&&i.replaceChild(t,this))},e)}}),f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){f.fn[e]=function(e){for(var i,a=[],r=f(e),n=r.length-1,l=0;n>=l;l++)i=l===n?this:this.clone(!0),f(r[l])[t](i),o.apply(a,i.get());return this.pushStack(a)}});var xe,ke={HTML:"block",BODY:"block"};function Ce(e,t){var i=f(t.createElement(e)).appendTo(t.body),a=f.css(i[0],"display");return i.detach(),a}function Ae(e){var t=a,i=ke[e];return i||(i=Ce(e,t),"none"!==i&&i||(xe=(xe||f("<iframe frameborder='0' width='0' height='0'/>")).appendTo(t.documentElement),t=xe[0].contentDocument,t.write(),t.close(),i=Ce(e,t),xe.detach()),ke[e]=i),i}var Te=/^margin/,Se=new RegExp("^("+W+")(?!px)[a-z%]+$","i"),ze=function(t){var i=t.ownerDocument.defaultView;return i&&i.opener||(i=e),i.getComputedStyle(t)},je=function(e,t,i,a){var r,n,o={};for(n in t)o[n]=e.style[n],e.style[n]=t[n];r=i.apply(e,a||[]);for(n in t)e.style[n]=o[n];return r},Fe=a.documentElement;!function(){var t,i,r,n,o=a.createElement("div"),l=a.createElement("div");if(l.style){l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",d.clearCloneStyle="content-box"===l.style.backgroundClip,
    o.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",o.appendChild(l);function s(){l.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",l.innerHTML="",Fe.appendChild(o);var a=e.getComputedStyle(l);t="1%"!==a.top,n="2px"===a.marginLeft,i="4px"===a.width,l.style.marginRight="50%",r="4px"===a.marginRight,Fe.removeChild(o)}f.extend(d,{pixelPosition:function(){return s(),t},boxSizingReliable:function(){return null==i&&s(),i},pixelMarginRight:function(){return null==i&&s(),r},reliableMarginLeft:function(){return null==i&&s(),n},reliableMarginRight:function(){var t,i=l.appendChild(a.createElement("div"));return i.style.cssText=l.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",i.style.marginRight=i.style.width="0",l.style.width="1px",Fe.appendChild(o),t=!parseFloat(e.getComputedStyle(i).marginRight),Fe.removeChild(o),l.removeChild(i),t}})}}();function De(e,t,i){var a,r,n,o,l=e.style;return i=i||ze(e),o=i?i.getPropertyValue(t)||i[t]:void 0,""!==o&&void 0!==o||f.contains(e.ownerDocument,e)||(o=f.style(e,t)),i&&!d.pixelMarginRight()&&Se.test(o)&&Te.test(t)&&(a=l.width,r=l.minWidth,n=l.maxWidth,l.minWidth=l.maxWidth=l.width=o,o=i.width,l.width=a,l.minWidth=r,l.maxWidth=n),void 0!==o?o+"":o}function Ie(e,t){return{get:function(){return e()?void delete this.get:(this.get=t).apply(this,arguments)}}}var Ee=/^(none|table(?!-c[ea]).+)/,Pe={position:"absolute",visibility:"hidden",display:"block"},Oe={letterSpacing:"0",fontWeight:"400"},Ue=["Webkit","O","Moz","ms"],Re=a.createElement("div").style;function Me(e){if(e in Re)return e;var t=e[0].toUpperCase()+e.slice(1),i=Ue.length;while(i--)if(e=Ue[i]+t,e in Re)return e}function Le(e,t,i){var a=K.exec(t);return a?Math.max(0,a[2]-(i||0))+(a[3]||"px"):t}function Be(e,t,i,a,r){for(var n=i===(a?"border":"content")?4:"width"===t?1:0,o=0;4>n;n+=2)"margin"===i&&(o+=f.css(e,i+H[n],!0,r)),a?("content"===i&&(o-=f.css(e,"padding"+H[n],!0,r)),"margin"!==i&&(o-=f.css(e,"border"+H[n]+"Width",!0,r))):(o+=f.css(e,"padding"+H[n],!0,r),"padding"!==i&&(o+=f.css(e,"border"+H[n]+"Width",!0,r)));return o}function Ne(e,t,i){var a=!0,r="width"===t?e.offsetWidth:e.offsetHeight,n=ze(e),o="border-box"===f.css(e,"boxSizing",!1,n);if(0>=r||null==r){if(r=De(e,t,n),(0>r||null==r)&&(r=e.style[t]),Se.test(r))return r;a=o&&(d.boxSizingReliable()||r===e.style[t]),r=parseFloat(r)||0}return r+Be(e,t,i||(o?"border":"content"),a,n)+"px"}function qe(e,t){for(var i,a,r,n=[],o=0,l=e.length;l>o;o++)a=e[o],a.style&&(n[o]=L.get(a,"olddisplay"),i=a.style.display,t?(n[o]||"none"!==i||(a.style.display=""),""===a.style.display&&G(a)&&(n[o]=L.access(a,"olddisplay",Ae(a.nodeName)))):(r=G(a),"none"===i&&r||L.set(a,"olddisplay",r?i:f.css(a,"display"))));for(o=0;l>o;o++)a=e[o],a.style&&(t&&"none"!==a.style.display&&""!==a.style.display||(a.style.display=t?n[o]||"":"none"));return e}f.extend({cssHooks:{opacity:{get:function(e,t){if(t){var i=De(e,"opacity");return""===i?"1":i}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(e,t,i,a){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var r,n,o,l=f.camelCase(t),s=e.style;return t=f.cssProps[l]||(f.cssProps[l]=Me(l)||l),o=f.cssHooks[t]||f.cssHooks[l],void 0===i?o&&"get"in o&&void 0!==(r=o.get(e,!1,a))?r:s[t]:(n=typeof i,"string"===n&&(r=K.exec(i))&&r[1]&&(i=Q(e,t,r),n="number"),void(null!=i&&i===i&&("number"===n&&(i+=r&&r[3]||(f.cssNumber[l]?"":"px")),d.clearCloneStyle||""!==i||0!==t.indexOf("background")||(s[t]="inherit"),o&&"set"in o&&void 0===(i=o.set(e,i,a))||(s[t]=i))))}},css:function(e,t,i,a){var r,n,o,l=f.camelCase(t);return t=f.cssProps[l]||(f.cssProps[l]=Me(l)||l),o=f.cssHooks[t]||f.cssHooks[l],o&&"get"in o&&(r=o.get(e,!0,i)),void 0===r&&(r=De(e,t,a)),"normal"===r&&t in Oe&&(r=Oe[t]),""===i||i?(n=parseFloat(r),i===!0||isFinite(n)?n||0:r):r}}),f.each(["height","width"],function(e,t){f.cssHooks[t]={get:function(e,i,a){return i?Ee.test(f.css(e,"display"))&&0===e.offsetWidth?je(e,Pe,function(){return Ne(e,t,a)}):Ne(e,t,a):void 0},set:function(e,i,a){var r,n=a&&ze(e),o=a&&Be(e,t,a,"border-box"===f.css(e,"boxSizing",!1,n),n);return o&&(r=K.exec(i))&&"px"!==(r[3]||"px")&&(e.style[t]=i,i=f.css(e,t)),Le(e,i,o)}}}),f.cssHooks.marginLeft=Ie(d.reliableMarginLeft,function(e,t){return t?(parseFloat(De(e,"marginLeft"))||e.getBoundingClientRect().left-je(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px":void 0}),f.cssHooks.marginRight=Ie(d.reliableMarginRight,function(e,t){return t?je(e,{display:"inline-block"},De,[e,"marginRight"]):void 0}),f.each({margin:"",padding:"",border:"Width"},function(e,t){f.cssHooks[e+t]={expand:function(i){for(var a=0,r={},n="string"==typeof i?i.split(" "):[i];4>a;a++)r[e+H[a]+t]=n[a]||n[a-2]||n[0];return r}},Te.test(e)||(f.cssHooks[e+t].set=Le)}),f.fn.extend({css:function(e,t){return U(this,function(e,t,i){var a,r,n={},o=0;if(f.isArray(t)){for(a=ze(e),r=t.length;r>o;o++)n[t[o]]=f.css(e,t[o],!1,a);return n}return void 0!==i?f.style(e,t,i):f.css(e,t)},e,t,arguments.length>1)},show:function(){return qe(this,!0)},hide:function(){return qe(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){G(this)?f(this).show():f(this).hide()})}});function Ve(e,t,i,a,r){return new Ve.prototype.init(e,t,i,a,r)}f.Tween=Ve,Ve.prototype={constructor:Ve,init:function(e,t,i,a,r,n){this.elem=e,this.prop=i,this.easing=r||f.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=a,this.unit=n||(f.cssNumber[i]?"":"px")},cur:function(){var e=Ve.propHooks[this.prop];return e&&e.get?e.get(this):Ve.propHooks._default.get(this)},run:function(e){var t,i=Ve.propHooks[this.prop];return this.options.duration?this.pos=t=f.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),i&&i.set?i.set(this):Ve.propHooks._default.set(this),this}},Ve.prototype.init.prototype=Ve.prototype,Ve.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=f.css(e.elem,e.prop,""),t&&"auto"!==t?t:0)},set:function(e){f.fx.step[e.prop]?f.fx.step[e.prop](e):1!==e.elem.nodeType||null==e.elem.style[f.cssProps[e.prop]]&&!f.cssHooks[e.prop]?e.elem[e.prop]=e.now:f.style(e.elem,e.prop,e.now+e.unit)}}},Ve.propHooks.scrollTop=Ve.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},f.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},f.fx=Ve.prototype.init,f.fx.step={};var We,Ke,He=/^(?:toggle|show|hide)$/,Ge=/queueHooks$/;function Qe(){return e.setTimeout(function(){We=void 0}),We=f.now()}function Je(e,t){var i,a=0,r={height:e};for(t=t?1:0;4>a;a+=2-t)i=H[a],r["margin"+i]=r["padding"+i]=e;return t&&(r.opacity=r.width=e),r}function Ye(e,t,i){for(var a,r=(Ze.tweeners[t]||[]).concat(Ze.tweeners["*"]),n=0,o=r.length;o>n;n++)if(a=r[n].call(i,t,e))return a}function Xe(e,t,i){var a,r,n,o,l,s,c,u,d=this,p={},h=e.style,g=e.nodeType&&G(e),m=L.get(e,"fxshow");i.queue||(l=f._queueHooks(e,"fx"),null==l.unqueued&&(l.unqueued=0,s=l.empty.fire,l.empty.fire=function(){l.unqueued||s()}),l.unqueued++,d.always(function(){d.always(function(){l.unqueued--,f.queue(e,"fx").length||l.empty.fire()})})),1===e.nodeType&&("height"in t||"width"in t)&&(i.overflow=[h.overflow,h.overflowX,h.overflowY],c=f.css(e,"display"),u="none"===c?L.get(e,"olddisplay")||Ae(e.nodeName):c,"inline"===u&&"none"===f.css(e,"float")&&(h.display="inline-block")),i.overflow&&(h.overflow="hidden",d.always(function(){h.overflow=i.overflow[0],h.overflowX=i.overflow[1],h.overflowY=i.overflow[2]}));for(a in t)if(r=t[a],He.exec(r)){if(delete t[a],n=n||"toggle"===r,r===(g?"hide":"show")){if("show"!==r||!m||void 0===m[a])continue;
    g=!0}p[a]=m&&m[a]||f.style(e,a)}else c=void 0;if(f.isEmptyObject(p))"inline"===("none"===c?Ae(e.nodeName):c)&&(h.display=c);else{m?"hidden"in m&&(g=m.hidden):m=L.access(e,"fxshow",{}),n&&(m.hidden=!g),g?f(e).show():d.done(function(){f(e).hide()}),d.done(function(){var t;L.remove(e,"fxshow");for(t in p)f.style(e,t,p[t])});for(a in p)o=Ye(g?m[a]:0,a,d),a in m||(m[a]=o.start,g&&(o.end=o.start,o.start="width"===a||"height"===a?1:0))}}function $e(e,t){var i,a,r,n,o;for(i in e)if(a=f.camelCase(i),r=t[a],n=e[i],f.isArray(n)&&(r=n[1],n=e[i]=n[0]),i!==a&&(e[a]=n,delete e[i]),o=f.cssHooks[a],o&&"expand"in o){n=o.expand(n),delete e[a];for(i in n)i in e||(e[i]=n[i],t[i]=r)}else t[a]=r}function Ze(e,t,i){var a,r,n=0,o=Ze.prefilters.length,l=f.Deferred().always(function(){delete s.elem}),s=function(){if(r)return!1;for(var t=We||Qe(),i=Math.max(0,c.startTime+c.duration-t),a=i/c.duration||0,n=1-a,o=0,s=c.tweens.length;s>o;o++)c.tweens[o].run(n);return l.notifyWith(e,[c,n,i]),1>n&&s?i:(l.resolveWith(e,[c]),!1)},c=l.promise({elem:e,props:f.extend({},t),opts:f.extend(!0,{specialEasing:{},easing:f.easing._default},i),originalProperties:t,originalOptions:i,startTime:We||Qe(),duration:i.duration,tweens:[],createTween:function(t,i){var a=f.Tween(e,c.opts,t,i,c.opts.specialEasing[t]||c.opts.easing);return c.tweens.push(a),a},stop:function(t){var i=0,a=t?c.tweens.length:0;if(r)return this;for(r=!0;a>i;i++)c.tweens[i].run(1);return t?(l.notifyWith(e,[c,1,0]),l.resolveWith(e,[c,t])):l.rejectWith(e,[c,t]),this}}),u=c.props;for($e(u,c.opts.specialEasing);o>n;n++)if(a=Ze.prefilters[n].call(c,e,u,c.opts))return f.isFunction(a.stop)&&(f._queueHooks(c.elem,c.opts.queue).stop=f.proxy(a.stop,a)),a;return f.map(u,Ye,c),f.isFunction(c.opts.start)&&c.opts.start.call(e,c),f.fx.timer(f.extend(s,{elem:e,anim:c,queue:c.opts.queue})),c.progress(c.opts.progress).done(c.opts.done,c.opts.complete).fail(c.opts.fail).always(c.opts.always)}f.Animation=f.extend(Ze,{tweeners:{"*":[function(e,t){var i=this.createTween(e,t);return Q(i.elem,e,K.exec(t),i),i}]},tweener:function(e,t){f.isFunction(e)?(t=e,e=["*"]):e=e.match(I);for(var i,a=0,r=e.length;r>a;a++)i=e[a],Ze.tweeners[i]=Ze.tweeners[i]||[],Ze.tweeners[i].unshift(t)},prefilters:[Xe],prefilter:function(e,t){t?Ze.prefilters.unshift(e):Ze.prefilters.push(e)}}),f.speed=function(e,t,i){var a=e&&"object"==typeof e?f.extend({},e):{complete:i||!i&&t||f.isFunction(e)&&e,duration:e,easing:i&&t||t&&!f.isFunction(t)&&t};return a.duration=f.fx.off?0:"number"==typeof a.duration?a.duration:a.duration in f.fx.speeds?f.fx.speeds[a.duration]:f.fx.speeds._default,null!=a.queue&&a.queue!==!0||(a.queue="fx"),a.old=a.complete,a.complete=function(){f.isFunction(a.old)&&a.old.call(this),a.queue&&f.dequeue(this,a.queue)},a},f.fn.extend({fadeTo:function(e,t,i,a){return this.filter(G).css("opacity",0).show().end().animate({opacity:t},e,i,a)},animate:function(e,t,i,a){var r=f.isEmptyObject(e),n=f.speed(t,i,a),o=function(){var t=Ze(this,f.extend({},e),n);(r||L.get(this,"finish"))&&t.stop(!0)};return o.finish=o,r||n.queue===!1?this.each(o):this.queue(n.queue,o)},stop:function(e,t,i){var a=function(e){var t=e.stop;delete e.stop,t(i)};return"string"!=typeof e&&(i=t,t=e,e=void 0),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,r=null!=e&&e+"queueHooks",n=f.timers,o=L.get(this);if(r)o[r]&&o[r].stop&&a(o[r]);else for(r in o)o[r]&&o[r].stop&&Ge.test(r)&&a(o[r]);for(r=n.length;r--;)n[r].elem!==this||null!=e&&n[r].queue!==e||(n[r].anim.stop(i),t=!1,n.splice(r,1));!t&&i||f.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,i=L.get(this),a=i[e+"queue"],r=i[e+"queueHooks"],n=f.timers,o=a?a.length:0;for(i.finish=!0,f.queue(this,e,[]),r&&r.stop&&r.stop.call(this,!0),t=n.length;t--;)n[t].elem===this&&n[t].queue===e&&(n[t].anim.stop(!0),n.splice(t,1));for(t=0;o>t;t++)a[t]&&a[t].finish&&a[t].finish.call(this);delete i.finish})}}),f.each(["toggle","show","hide"],function(e,t){var i=f.fn[t];f.fn[t]=function(e,a,r){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(Je(t,!0),e,a,r)}}),f.each({slideDown:Je("show"),slideUp:Je("hide"),slideToggle:Je("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){f.fn[e]=function(e,i,a){return this.animate(t,e,i,a)}}),f.timers=[],f.fx.tick=function(){var e,t=0,i=f.timers;for(We=f.now();t<i.length;t++)e=i[t],e()||i[t]!==e||i.splice(t--,1);i.length||f.fx.stop(),We=void 0},f.fx.timer=function(e){f.timers.push(e),e()?f.fx.start():f.timers.pop()},f.fx.interval=13,f.fx.start=function(){Ke||(Ke=e.setInterval(f.fx.tick,f.fx.interval))},f.fx.stop=function(){e.clearInterval(Ke),Ke=null},f.fx.speeds={slow:600,fast:200,_default:400},f.fn.delay=function(t,i){return t=f.fx?f.fx.speeds[t]||t:t,i=i||"fx",this.queue(i,function(i,a){var r=e.setTimeout(i,t);a.stop=function(){e.clearTimeout(r)}})},function(){var e=a.createElement("input"),t=a.createElement("select"),i=t.appendChild(a.createElement("option"));e.type="checkbox",d.checkOn=""!==e.value,d.optSelected=i.selected,t.disabled=!0,d.optDisabled=!i.disabled,e=a.createElement("input"),e.value="t",e.type="radio",d.radioValue="t"===e.value}();var et,tt=f.expr.attrHandle;f.fn.extend({attr:function(e,t){return U(this,f.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){f.removeAttr(this,e)})}}),f.extend({attr:function(e,t,i){var a,r,n=e.nodeType;return 3!==n&&8!==n&&2!==n?"undefined"==typeof e.getAttribute?f.prop(e,t,i):(1===n&&f.isXMLDoc(e)||(t=t.toLowerCase(),r=f.attrHooks[t]||(f.expr.match.bool.test(t)?et:void 0)),void 0!==i?null===i?void f.removeAttr(e,t):r&&"set"in r&&void 0!==(a=r.set(e,i,t))?a:(e.setAttribute(t,i+""),i):r&&"get"in r&&null!==(a=r.get(e,t))?a:(a=f.find.attr(e,t),null==a?void 0:a)):void 0},attrHooks:{type:{set:function(e,t){if(!d.radioValue&&"radio"===t&&f.nodeName(e,"input")){var i=e.value;return e.setAttribute("type",t),i&&(e.value=i),t}}}},removeAttr:function(e,t){var i,a,r=0,n=t&&t.match(I);if(n&&1===e.nodeType)while(i=n[r++])a=f.propFix[i]||i,f.expr.match.bool.test(i)&&(e[a]=!1),e.removeAttribute(i)}}),et={set:function(e,t,i){return t===!1?f.removeAttr(e,i):e.setAttribute(i,i),i}},f.each(f.expr.match.bool.source.match(/\w+/g),function(e,t){var i=tt[t]||f.find.attr;tt[t]=function(e,t,a){var r,n;return a||(n=tt[t],tt[t]=r,r=null!=i(e,t,a)?t.toLowerCase():null,tt[t]=n),r}});var it=/^(?:input|select|textarea|button)$/i,at=/^(?:a|area)$/i;f.fn.extend({prop:function(e,t){return U(this,f.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[f.propFix[e]||e]})}}),f.extend({prop:function(e,t,i){var a,r,n=e.nodeType;return 3!==n&&8!==n&&2!==n?(1===n&&f.isXMLDoc(e)||(t=f.propFix[t]||t,r=f.propHooks[t]),void 0!==i?r&&"set"in r&&void 0!==(a=r.set(e,i,t))?a:e[t]=i:r&&"get"in r&&null!==(a=r.get(e,t))?a:e[t]):void 0},propHooks:{tabIndex:{get:function(e){var t=f.find.attr(e,"tabindex");return t?parseInt(t,10):it.test(e.nodeName)||at.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),d.optSelected||(f.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),f.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){f.propFix[this.toLowerCase()]=this});var rt=/[\t\r\n\f]/g;function nt(e){return e.getAttribute&&e.getAttribute("class")||""}f.fn.extend({addClass:function(e){var t,i,a,r,n,o,l,s=0;if(f.isFunction(e))return this.each(function(t){f(this).addClass(e.call(this,t,nt(this)))});if("string"==typeof e&&e){t=e.match(I)||[];while(i=this[s++])if(r=nt(i),a=1===i.nodeType&&(" "+r+" ").replace(rt," ")){o=0;while(n=t[o++])a.indexOf(" "+n+" ")<0&&(a+=n+" ");l=f.trim(a),r!==l&&i.setAttribute("class",l)}}return this},removeClass:function(e){var t,i,a,r,n,o,l,s=0;if(f.isFunction(e))return this.each(function(t){f(this).removeClass(e.call(this,t,nt(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof e&&e){t=e.match(I)||[];while(i=this[s++])if(r=nt(i),
    a=1===i.nodeType&&(" "+r+" ").replace(rt," ")){o=0;while(n=t[o++])while(a.indexOf(" "+n+" ")>-1)a=a.replace(" "+n+" "," ");l=f.trim(a),r!==l&&i.setAttribute("class",l)}}return this},toggleClass:function(e,t){var i=typeof e;return"boolean"==typeof t&&"string"===i?t?this.addClass(e):this.removeClass(e):f.isFunction(e)?this.each(function(i){f(this).toggleClass(e.call(this,i,nt(this),t),t)}):this.each(function(){var t,a,r,n;if("string"===i){a=0,r=f(this),n=e.match(I)||[];while(t=n[a++])r.hasClass(t)?r.removeClass(t):r.addClass(t)}else void 0!==e&&"boolean"!==i||(t=nt(this),t&&L.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||e===!1?"":L.get(this,"__className__")||""))})},hasClass:function(e){var t,i,a=0;t=" "+e+" ";while(i=this[a++])if(1===i.nodeType&&(" "+nt(i)+" ").replace(rt," ").indexOf(t)>-1)return!0;return!1}});var ot=/\r/g,lt=/[\x20\t\r\n\f]+/g;f.fn.extend({val:function(e){var t,i,a,r=this[0];return arguments.length?(a=f.isFunction(e),this.each(function(i){var r;1===this.nodeType&&(r=a?e.call(this,i,f(this).val()):e,null==r?r="":"number"==typeof r?r+="":f.isArray(r)&&(r=f.map(r,function(e){return null==e?"":e+""})),t=f.valHooks[this.type]||f.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&void 0!==t.set(this,r,"value")||(this.value=r))})):r?(t=f.valHooks[r.type]||f.valHooks[r.nodeName.toLowerCase()],t&&"get"in t&&void 0!==(i=t.get(r,"value"))?i:(i=r.value,"string"==typeof i?i.replace(ot,""):null==i?"":i)):void 0}}),f.extend({valHooks:{option:{get:function(e){var t=f.find.attr(e,"value");return null!=t?t:f.trim(f.text(e)).replace(lt," ")}},select:{get:function(e){for(var t,i,a=e.options,r=e.selectedIndex,n="select-one"===e.type||0>r,o=n?null:[],l=n?r+1:a.length,s=0>r?l:n?r:0;l>s;s++)if(i=a[s],(i.selected||s===r)&&(d.optDisabled?!i.disabled:null===i.getAttribute("disabled"))&&(!i.parentNode.disabled||!f.nodeName(i.parentNode,"optgroup"))){if(t=f(i).val(),n)return t;o.push(t)}return o},set:function(e,t){var i,a,r=e.options,n=f.makeArray(t),o=r.length;while(o--)a=r[o],(a.selected=f.inArray(f.valHooks.option.get(a),n)>-1)&&(i=!0);return i||(e.selectedIndex=-1),n}}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]={set:function(e,t){return f.isArray(t)?e.checked=f.inArray(f(e).val(),t)>-1:void 0}},d.checkOn||(f.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var st=/^(?:focusinfocus|focusoutblur)$/;f.extend(f.event,{trigger:function(t,i,r,n){var o,l,s,c,d,p,h,g=[r||a],m=u.call(t,"type")?t.type:t,v=u.call(t,"namespace")?t.namespace.split("."):[];if(l=s=r=r||a,3!==r.nodeType&&8!==r.nodeType&&!st.test(m+f.event.triggered)&&(m.indexOf(".")>-1&&(v=m.split("."),m=v.shift(),v.sort()),d=m.indexOf(":")<0&&"on"+m,t=t[f.expando]?t:new f.Event(m,"object"==typeof t&&t),t.isTrigger=n?2:3,t.namespace=v.join("."),t.rnamespace=t.namespace?new RegExp("(^|\\.)"+v.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=void 0,t.target||(t.target=r),i=null==i?[t]:f.makeArray(i,[t]),h=f.event.special[m]||{},n||!h.trigger||h.trigger.apply(r,i)!==!1)){if(!n&&!h.noBubble&&!f.isWindow(r)){for(c=h.delegateType||m,st.test(c+m)||(l=l.parentNode);l;l=l.parentNode)g.push(l),s=l;s===(r.ownerDocument||a)&&g.push(s.defaultView||s.parentWindow||e)}o=0;while((l=g[o++])&&!t.isPropagationStopped())t.type=o>1?c:h.bindType||m,p=(L.get(l,"events")||{})[t.type]&&L.get(l,"handle"),p&&p.apply(l,i),p=d&&l[d],p&&p.apply&&R(l)&&(t.result=p.apply(l,i),t.result===!1&&t.preventDefault());return t.type=m,n||t.isDefaultPrevented()||h._default&&h._default.apply(g.pop(),i)!==!1||!R(r)||d&&f.isFunction(r[m])&&!f.isWindow(r)&&(s=r[d],s&&(r[d]=null),f.event.triggered=m,r[m](),f.event.triggered=void 0,s&&(r[d]=s)),t.result}},simulate:function(e,t,i){var a=f.extend(new f.Event,i,{type:e,isSimulated:!0});f.event.trigger(a,null,t)}}),f.fn.extend({trigger:function(e,t){return this.each(function(){f.event.trigger(e,t,this)})},triggerHandler:function(e,t){var i=this[0];return i?f.event.trigger(e,t,i,!0):void 0}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(e,t){f.fn[t]=function(e,i){return arguments.length>0?this.on(t,null,e,i):this.trigger(t)}}),f.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),d.focusin="onfocusin"in e,d.focusin||f.each({focus:"focusin",blur:"focusout"},function(e,t){var i=function(e){f.event.simulate(t,e.target,f.event.fix(e))};f.event.special[t]={setup:function(){var a=this.ownerDocument||this,r=L.access(a,t);r||a.addEventListener(e,i,!0),L.access(a,t,(r||0)+1)},teardown:function(){var a=this.ownerDocument||this,r=L.access(a,t)-1;r?L.access(a,t,r):(a.removeEventListener(e,i,!0),L.remove(a,t))}}});var ct=e.location,ut=f.now(),dt=/\?/;f.parseJSON=function(e){return JSON.parse(e+"")},f.parseXML=function(t){var i;if(!t||"string"!=typeof t)return null;try{i=(new e.DOMParser).parseFromString(t,"text/xml")}catch(a){i=void 0}return i&&!i.getElementsByTagName("parsererror").length||f.error("Invalid XML: "+t),i};var pt=/#.*$/,ft=/([?&])_=[^&]*/,ht=/^(.*?):[ \t]*([^\r\n]*)$/gm,gt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,mt=/^(?:GET|HEAD)$/,vt=/^\/\//,bt={},_t={},yt="*/".concat("*"),wt=a.createElement("a");wt.href=ct.href;function xt(e){return function(t,i){"string"!=typeof t&&(i=t,t="*");var a,r=0,n=t.toLowerCase().match(I)||[];if(f.isFunction(i))while(a=n[r++])"+"===a[0]?(a=a.slice(1)||"*",(e[a]=e[a]||[]).unshift(i)):(e[a]=e[a]||[]).push(i)}}function kt(e,t,i,a){var r={},n=e===_t;function o(l){var s;return r[l]=!0,f.each(e[l]||[],function(e,l){var c=l(t,i,a);return"string"!=typeof c||n||r[c]?n?!(s=c):void 0:(t.dataTypes.unshift(c),o(c),!1)}),s}return o(t.dataTypes[0])||!r["*"]&&o("*")}function Ct(e,t){var i,a,r=f.ajaxSettings.flatOptions||{};for(i in t)void 0!==t[i]&&((r[i]?e:a||(a={}))[i]=t[i]);return a&&f.extend(!0,e,a),e}function At(e,t,i){var a,r,n,o,l=e.contents,s=e.dataTypes;while("*"===s[0])s.shift(),void 0===a&&(a=e.mimeType||t.getResponseHeader("Content-Type"));if(a)for(r in l)if(l[r]&&l[r].test(a)){s.unshift(r);break}if(s[0]in i)n=s[0];else{for(r in i){if(!s[0]||e.converters[r+" "+s[0]]){n=r;break}o||(o=r)}n=n||o}return n?(n!==s[0]&&s.unshift(n),i[n]):void 0}function Tt(e,t,i,a){var r,n,o,l,s,c={},u=e.dataTypes.slice();if(u[1])for(o in e.converters)c[o.toLowerCase()]=e.converters[o];n=u.shift();while(n)if(e.responseFields[n]&&(i[e.responseFields[n]]=t),!s&&a&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),s=n,n=u.shift())if("*"===n)n=s;else if("*"!==s&&s!==n){if(o=c[s+" "+n]||c["* "+n],!o)for(r in c)if(l=r.split(" "),l[1]===n&&(o=c[s+" "+l[0]]||c["* "+l[0]])){o===!0?o=c[r]:c[r]!==!0&&(n=l[0],u.unshift(l[1]));break}if(o!==!0)if(o&&e["throws"])t=o(t);else try{t=o(t)}catch(d){return{state:"parsererror",error:o?d:"No conversion from "+s+" to "+n}}}return{state:"success",data:t}}f.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:ct.href,type:"GET",isLocal:gt.test(ct.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":yt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Ct(Ct(e,f.ajaxSettings),t):Ct(f.ajaxSettings,e)},ajaxPrefilter:xt(bt),ajaxTransport:xt(_t),ajax:function(t,i){"object"==typeof t&&(i=t,t=void 0),i=i||{};var r,n,o,l,s,c,u,d,p=f.ajaxSetup({},i),h=p.context||p,g=p.context&&(h.nodeType||h.jquery)?f(h):f.event,m=f.Deferred(),v=f.Callbacks("once memory"),b=p.statusCode||{},_={},y={},w=0,x="canceled",k={readyState:0,getResponseHeader:function(e){var t;if(2===w){if(!l){l={};while(t=ht.exec(o))l[t[1].toLowerCase()]=t[2]}t=l[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return 2===w?o:null},setRequestHeader:function(e,t){var i=e.toLowerCase();return w||(e=y[i]=y[i]||e,
    _[e]=t),this},overrideMimeType:function(e){return w||(p.mimeType=e),this},statusCode:function(e){var t;if(e)if(2>w)for(t in e)b[t]=[b[t],e[t]];else k.always(e[k.status]);return this},abort:function(e){var t=e||x;return r&&r.abort(t),A(0,t),this}};if(m.promise(k).complete=v.add,k.success=k.done,k.error=k.fail,p.url=((t||p.url||ct.href)+"").replace(pt,"").replace(vt,ct.protocol+"//"),p.type=i.method||i.type||p.method||p.type,p.dataTypes=f.trim(p.dataType||"*").toLowerCase().match(I)||[""],null==p.crossDomain){c=a.createElement("a");try{c.href=p.url,c.href=c.href,p.crossDomain=wt.protocol+"//"+wt.host!=c.protocol+"//"+c.host}catch(C){p.crossDomain=!0}}if(p.data&&p.processData&&"string"!=typeof p.data&&(p.data=f.param(p.data,p.traditional)),kt(bt,p,i,k),2===w)return k;u=f.event&&p.global,u&&0===f.active++&&f.event.trigger("ajaxStart"),p.type=p.type.toUpperCase(),p.hasContent=!mt.test(p.type),n=p.url,p.hasContent||(p.data&&(n=p.url+=(dt.test(n)?"&":"?")+p.data,delete p.data),p.cache===!1&&(p.url=ft.test(n)?n.replace(ft,"$1_="+ut++):n+(dt.test(n)?"&":"?")+"_="+ut++)),p.ifModified&&(f.lastModified[n]&&k.setRequestHeader("If-Modified-Since",f.lastModified[n]),f.etag[n]&&k.setRequestHeader("If-None-Match",f.etag[n])),(p.data&&p.hasContent&&p.contentType!==!1||i.contentType)&&k.setRequestHeader("Content-Type",p.contentType),k.setRequestHeader("Accept",p.dataTypes[0]&&p.accepts[p.dataTypes[0]]?p.accepts[p.dataTypes[0]]+("*"!==p.dataTypes[0]?", "+yt+"; q=0.01":""):p.accepts["*"]);for(d in p.headers)k.setRequestHeader(d,p.headers[d]);if(p.beforeSend&&(p.beforeSend.call(h,k,p)===!1||2===w))return k.abort();x="abort";for(d in{success:1,error:1,complete:1})k[d](p[d]);if(r=kt(_t,p,i,k)){if(k.readyState=1,u&&g.trigger("ajaxSend",[k,p]),2===w)return k;p.async&&p.timeout>0&&(s=e.setTimeout(function(){k.abort("timeout")},p.timeout));try{w=1,r.send(_,A)}catch(C){if(!(2>w))throw C;A(-1,C)}}else A(-1,"No Transport");function A(t,i,a,l){var c,d,_,y,x,C=i;2!==w&&(w=2,s&&e.clearTimeout(s),r=void 0,o=l||"",k.readyState=t>0?4:0,c=t>=200&&300>t||304===t,a&&(y=At(p,k,a)),y=Tt(p,y,k,c),c?(p.ifModified&&(x=k.getResponseHeader("Last-Modified"),x&&(f.lastModified[n]=x),x=k.getResponseHeader("etag"),x&&(f.etag[n]=x)),204===t||"HEAD"===p.type?C="nocontent":304===t?C="notmodified":(C=y.state,d=y.data,_=y.error,c=!_)):(_=C,!t&&C||(C="error",0>t&&(t=0))),k.status=t,k.statusText=(i||C)+"",c?m.resolveWith(h,[d,C,k]):m.rejectWith(h,[k,C,_]),k.statusCode(b),b=void 0,u&&g.trigger(c?"ajaxSuccess":"ajaxError",[k,p,c?d:_]),v.fireWith(h,[k,C]),u&&(g.trigger("ajaxComplete",[k,p]),--f.active||f.event.trigger("ajaxStop")))}return k},getJSON:function(e,t,i){return f.get(e,t,i,"json")},getScript:function(e,t){return f.get(e,void 0,t,"script")}}),f.each(["get","post"],function(e,t){f[t]=function(e,i,a,r){return f.isFunction(i)&&(r=r||a,a=i,i=void 0),f.ajax(f.extend({url:e,type:t,dataType:r,data:i,success:a},f.isPlainObject(e)&&e))}}),f._evalUrl=function(e){return f.ajax({url:e,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},f.fn.extend({wrapAll:function(e){var t;return f.isFunction(e)?this.each(function(t){f(this).wrapAll(e.call(this,t))}):(this[0]&&(t=f(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this)},wrapInner:function(e){return f.isFunction(e)?this.each(function(t){f(this).wrapInner(e.call(this,t))}):this.each(function(){var t=f(this),i=t.contents();i.length?i.wrapAll(e):t.append(e)})},wrap:function(e){var t=f.isFunction(e);return this.each(function(i){f(this).wrapAll(t?e.call(this,i):e)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()}}),f.expr.filters.hidden=function(e){return!f.expr.filters.visible(e)},f.expr.filters.visible=function(e){return e.offsetWidth>0||e.offsetHeight>0||e.getClientRects().length>0};var St=/%20/g,zt=/\[\]$/,jt=/\r?\n/g,Ft=/^(?:submit|button|image|reset|file)$/i,Dt=/^(?:input|select|textarea|keygen)/i;function It(e,t,i,a){var r;if(f.isArray(t))f.each(t,function(t,r){i||zt.test(e)?a(e,r):It(e+"["+("object"==typeof r&&null!=r?t:"")+"]",r,i,a)});else if(i||"object"!==f.type(t))a(e,t);else for(r in t)It(e+"["+r+"]",t[r],i,a)}f.param=function(e,t){var i,a=[],r=function(e,t){t=f.isFunction(t)?t():null==t?"":t,a[a.length]=encodeURIComponent(e)+"="+encodeURIComponent(t)};if(void 0===t&&(t=f.ajaxSettings&&f.ajaxSettings.traditional),f.isArray(e)||e.jquery&&!f.isPlainObject(e))f.each(e,function(){r(this.name,this.value)});else for(i in e)It(i,e[i],t,r);return a.join("&").replace(St,"+")},f.fn.extend({serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=f.prop(this,"elements");return e?f.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!f(this).is(":disabled")&&Dt.test(this.nodeName)&&!Ft.test(e)&&(this.checked||!J.test(e))}).map(function(e,t){var i=f(this).val();return null==i?null:f.isArray(i)?f.map(i,function(e){return{name:t.name,value:e.replace(jt,"\r\n")}}):{name:t.name,value:i.replace(jt,"\r\n")}}).get()}}),f.ajaxSettings.xhr=function(){try{return new e.XMLHttpRequest}catch(t){}};var Et={0:200,1223:204},Pt=f.ajaxSettings.xhr();d.cors=!!Pt&&"withCredentials"in Pt,d.ajax=Pt=!!Pt,f.ajaxTransport(function(t){var i,a;return d.cors||Pt&&!t.crossDomain?{send:function(r,n){var o,l=t.xhr();if(l.open(t.type,t.url,t.async,t.username,t.password),t.xhrFields)for(o in t.xhrFields)l[o]=t.xhrFields[o];t.mimeType&&l.overrideMimeType&&l.overrideMimeType(t.mimeType),t.crossDomain||r["X-Requested-With"]||(r["X-Requested-With"]="XMLHttpRequest");for(o in r)l.setRequestHeader(o,r[o]);i=function(e){return function(){i&&(i=a=l.onload=l.onerror=l.onabort=l.onreadystatechange=null,"abort"===e?l.abort():"error"===e?"number"!=typeof l.status?n(0,"error"):n(l.status,l.statusText):n(Et[l.status]||l.status,l.statusText,"text"!==(l.responseType||"text")||"string"!=typeof l.responseText?{binary:l.response}:{text:l.responseText},l.getAllResponseHeaders()))}},l.onload=i(),a=l.onerror=i("error"),void 0!==l.onabort?l.onabort=a:l.onreadystatechange=function(){4===l.readyState&&e.setTimeout(function(){i&&a()})},i=i("abort");try{l.send(t.hasContent&&t.data||null)}catch(s){if(i)throw s}},abort:function(){i&&i()}}:void 0}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return f.globalEval(e),e}}}),f.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),f.ajaxTransport("script",function(e){if(e.crossDomain){var t,i;return{send:function(r,n){t=f("<script>").prop({charset:e.scriptCharset,src:e.url}).on("load error",i=function(e){t.remove(),i=null,e&&n("error"===e.type?404:200,e.type)}),a.head.appendChild(t[0])},abort:function(){i&&i()}}}});var Ot=[],Ut=/(=)\?(?=&|$)|\?\?/;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Ot.pop()||f.expando+"_"+ut++;return this[e]=!0,e}}),f.ajaxPrefilter("json jsonp",function(t,i,a){var r,n,o,l=t.jsonp!==!1&&(Ut.test(t.url)?"url":"string"==typeof t.data&&0===(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&Ut.test(t.data)&&"data");return l||"jsonp"===t.dataTypes[0]?(r=t.jsonpCallback=f.isFunction(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,l?t[l]=t[l].replace(Ut,"$1"+r):t.jsonp!==!1&&(t.url+=(dt.test(t.url)?"&":"?")+t.jsonp+"="+r),t.converters["script json"]=function(){return o||f.error(r+" was not called"),o[0]},t.dataTypes[0]="json",n=e[r],e[r]=function(){o=arguments},a.always(function(){void 0===n?f(e).removeProp(r):e[r]=n,t[r]&&(t.jsonpCallback=i.jsonpCallback,Ot.push(r)),o&&f.isFunction(n)&&n(o[0]),o=n=void 0}),"script"):void 0}),f.parseHTML=function(e,t,i){if(!e||"string"!=typeof e)return null;"boolean"==typeof t&&(i=t,t=!1),t=t||a;var r=k.exec(e),n=!i&&[];return r?[t.createElement(r[1])]:(r=ie([e],t,n),n&&n.length&&f(n).remove(),f.merge([],r.childNodes))};var Rt=f.fn.load;f.fn.load=function(e,t,i){if("string"!=typeof e&&Rt)return Rt.apply(this,arguments);
    var a,r,n,o=this,l=e.indexOf(" ");return l>-1&&(a=f.trim(e.slice(l)),e=e.slice(0,l)),f.isFunction(t)?(i=t,t=void 0):t&&"object"==typeof t&&(r="POST"),o.length>0&&f.ajax({url:e,type:r||"GET",dataType:"html",data:t}).done(function(e){n=arguments,o.html(a?f("<div>").append(f.parseHTML(e)).find(a):e)}).always(i&&function(e,t){o.each(function(){i.apply(this,n||[e.responseText,t,e])})}),this},f.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){f.fn[t]=function(e){return this.on(t,e)}}),f.expr.filters.animated=function(e){return f.grep(f.timers,function(t){return e===t.elem}).length};function Mt(e){return f.isWindow(e)?e:9===e.nodeType&&e.defaultView}f.offset={setOffset:function(e,t,i){var a,r,n,o,l,s,c,u=f.css(e,"position"),d=f(e),p={};"static"===u&&(e.style.position="relative"),l=d.offset(),n=f.css(e,"top"),s=f.css(e,"left"),c=("absolute"===u||"fixed"===u)&&(n+s).indexOf("auto")>-1,c?(a=d.position(),o=a.top,r=a.left):(o=parseFloat(n)||0,r=parseFloat(s)||0),f.isFunction(t)&&(t=t.call(e,i,f.extend({},l))),null!=t.top&&(p.top=t.top-l.top+o),null!=t.left&&(p.left=t.left-l.left+r),"using"in t?t.using.call(e,p):d.css(p)}},f.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each(function(t){f.offset.setOffset(this,e,t)});var t,i,a=this[0],r={top:0,left:0},n=a&&a.ownerDocument;return n?(t=n.documentElement,f.contains(t,a)?(r=a.getBoundingClientRect(),i=Mt(n),{top:r.top+i.pageYOffset-t.clientTop,left:r.left+i.pageXOffset-t.clientLeft}):r):void 0},position:function(){if(this[0]){var e,t,i=this[0],a={top:0,left:0};return"fixed"===f.css(i,"position")?t=i.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),f.nodeName(e[0],"html")||(a=e.offset()),a.top+=f.css(e[0],"borderTopWidth",!0),a.left+=f.css(e[0],"borderLeftWidth",!0)),{top:t.top-a.top-f.css(i,"marginTop",!0),left:t.left-a.left-f.css(i,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===f.css(e,"position"))e=e.offsetParent;return e||Fe})}}),f.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var i="pageYOffset"===t;f.fn[e]=function(a){return U(this,function(e,a,r){var n=Mt(e);return void 0===r?n?n[t]:e[a]:void(n?n.scrollTo(i?n.pageXOffset:r,i?r:n.pageYOffset):e[a]=r)},e,a,arguments.length)}}),f.each(["top","left"],function(e,t){f.cssHooks[t]=Ie(d.pixelPosition,function(e,i){return i?(i=De(e,t),Se.test(i)?f(e).position()[t]+"px":i):void 0})}),f.each({Height:"height",Width:"width"},function(e,t){f.each({padding:"inner"+e,content:t,"":"outer"+e},function(i,a){f.fn[a]=function(a,r){var n=arguments.length&&(i||"boolean"!=typeof a),o=i||(a===!0||r===!0?"margin":"border");return U(this,function(t,i,a){var r;return f.isWindow(t)?t.document.documentElement["client"+e]:9===t.nodeType?(r=t.documentElement,Math.max(t.body["scroll"+e],r["scroll"+e],t.body["offset"+e],r["offset"+e],r["client"+e])):void 0===a?f.css(t,i,o):f.style(t,i,a,o)},t,n?a:void 0,n,null)}})}),f.fn.extend({bind:function(e,t,i){return this.on(e,null,t,i)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,i,a){return this.on(t,e,i,a)},undelegate:function(e,t,i){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",i)},size:function(){return this.length}}),f.fn.andSelf=f.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return f});var Lt=e.jQuery,Bt=e.$;return f.noConflict=function(t){return e.$===f&&(e.$=Bt),t&&e.jQuery===f&&(e.jQuery=Lt),f},t||(e.jQuery=e.$=f),f}),function(){r={__exports:{}},r.namespace=function(e,t){var i,a,n,o,l;if(a=r,e)for(l=e.split("."),n=0,o=l.length;o>n;n++)i=l[n],a[i]||(a[i]={}),a=a[i];return t(a)},r.expose=function(e,t){var i,a,n,o,l,s,c;for(n=e.split("."),i=n.pop(),l=r.__exports,o=r,s=0,c=n.length;c>s;s++)a=n[s],l[a]||(l[a]={}),l=l[a],o=null!=o?o[a]:void 0;return l[i]=t||o[i]}}.call(this),function(){var t;if(r.version="2.10.4",r.jQuery=a||e.jQuery,"undefined"==typeof r.jQuery)throw new ReferenceError("jQuery is not defined");t=r.expose,t("version"),t("jQuery"),t("plugin",function(e){return e(r)})}.call(this),e.XDomainRequest&&r.jQuery.ajaxTransport(function(e){if(e.crossDomain&&e.async){e.timeout&&(e.xdrTimeout=e.timeout,delete e.timeout);var t;return{send:function(i,a){function r(e,i,r,n){t.onload=t.onerror=t.ontimeout=function(){},t=void 0,a(e,i,r,n)}t=new XDomainRequest,t.onload=function(){r(200,"OK",{text:t.responseText},"Content-Type: "+t.contentType)},t.onerror=function(){r(404,"Not Found")},t.onprogress=function(){},t.ontimeout=function(){r(0,"timeout")},t.timeout=e.xdrTimeout||Number.MAX_VALUE,t.open(e.type,e.url.replace(/^https?:/,"")),t.send(e.hasContent&&e.data||null)},abort:function(){t&&(t.onerror=function(){},t.abort())}}}}),function(){r.namespace("utils.abilities",function(t){var i,a,r,o;t.fileAPI=!!(e.File&&e.FileList&&e.FileReader),t.sendFileAPI=!(!e.FormData||!t.fileAPI),t.dragAndDrop=function(){var e;return e=n.createElement("div"),"draggable"in e||"ondragstart"in e&&"ondrop"in e}(),t.canvas=function(){var e;return e=n.createElement("canvas"),!(!e.getContext||!e.getContext("2d"))}(),t.fileDragAndDrop=t.fileAPI&&t.dragAndDrop,t.iOSVersion=null,(i=/^[^(]+\(iP(?:hone|od|ad);\s*(.+?)\)/.exec(navigator.userAgent))&&(r=/OS (\d)_(\d)/.exec(i[1]))&&(t.iOSVersion=+r[1]+r[2]/10),t.Blob=!1;try{new e.Blob&&(t.Blob=e.Blob)}catch(l){}return a=e.URL||e.webkitURL||!1,t.URL=a&&a.createObjectURL&&a,t.FileReader=(null!=(o=e.FileReader)?o.prototype.readAsArrayBuffer:void 0)&&e.FileReader})}.call(this),function(){var e,t={}.hasOwnProperty,i=function(e,i){for(var a in i)t.call(i,a)&&(e[a]=i[a]);function r(){this.constructor=e}return r.prototype=i.prototype,e.prototype=new r,e.__super__=i.prototype,e},a=[].indexOf||function(e){for(var t=0,i=this.length;i>t;t++)if(t in this&&this[t]===e)return t;return-1},n=function(e,t){return function(){return e.apply(t,arguments)}},o=[].slice;e=r.jQuery,r.namespace("utils",function(t){var r;return t.Collection=function(){function t(t){var i,a,r;for(null==t&&(t=[]),this.onAdd=e.Callbacks(),this.onRemove=e.Callbacks(),this.onSort=e.Callbacks(),this.onReplace=e.Callbacks(),this.__items=[],a=0,r=t.length;r>a;a++)i=t[a],this.add(i)}return t.prototype.add=function(e){return this.__add(e,this.__items.length)},t.prototype.__add=function(e,t){return this.__items.splice(t,0,e),this.onAdd.fire(e,t)},t.prototype.remove=function(t){var i;return i=e.inArray(t,this.__items),-1!==i?this.__remove(t,i):void 0},t.prototype.__remove=function(e,t){return this.__items.splice(t,1),this.onRemove.fire(e,t)},t.prototype.clear=function(){var e,t,i,a,r,n;for(i=this.get(),this.__items.length=0,n=[],e=a=0,r=i.length;r>a;e=++a)t=i[e],n.push(this.onRemove.fire(t,e));return n},t.prototype.replace=function(t,i){var a;return t!==i&&(a=e.inArray(t,this.__items),-1!==a)?this.__replace(t,i,a):void 0},t.prototype.__replace=function(e,t,i){return this.__items[i]=t,this.onReplace.fire(e,t,i)},t.prototype.sort=function(e){return this.__items.sort(e),this.onSort.fire()},t.prototype.get=function(e){return null!=e?this.__items[e]:this.__items.slice(0)},t.prototype.length=function(){return this.__items.length},t}(),t.UniqCollection=function(e){i(t,e);function t(){return r=t.__super__.constructor.apply(this,arguments)}return t.prototype.add=function(e){return a.call(this.__items,e)>=0?void 0:t.__super__.add.apply(this,arguments)},t.prototype.__replace=function(e,i,r){return a.call(this.__items,i)>=0?this.remove(e):t.__super__.__replace.apply(this,arguments)},t}(t.Collection),t.CollectionOfPromises=function(t){i(r,t);function r(){this.onAnyProgress=n(this.onAnyProgress,this),this.onAnyFail=n(this.onAnyFail,this),this.onAnyDone=n(this.onAnyDone,this),this.anyDoneList=e.Callbacks(),this.anyFailList=e.Callbacks(),this.anyProgressList=e.Callbacks(),this.anyProgressList.add(function(t,i){return e(t).data("lastProgress",i)}),r.__super__.constructor.apply(this,arguments)}return r.prototype.onAnyDone=function(e){var t,i,a,r,n;for(this.anyDoneList.add(e),r=this.__items,n=[],i=0,a=r.length;a>i;i++)t=r[i],"resolved"===t.state()?n.push(t.done(function(){return e.apply(null,[t].concat(o.call(arguments)))})):n.push(void 0);
    return n},r.prototype.onAnyFail=function(e){var t,i,a,r,n;for(this.anyFailList.add(e),r=this.__items,n=[],i=0,a=r.length;a>i;i++)t=r[i],"rejected"===t.state()?n.push(t.fail(function(){return e.apply(null,[t].concat(o.call(arguments)))})):n.push(void 0);return n},r.prototype.onAnyProgress=function(t){var i,a,r,n,o;for(this.anyProgressList.add(t),n=this.__items,o=[],a=0,r=n.length;r>a;a++)i=n[a],o.push(t(i,e(i).data("lastProgress")));return o},r.prototype.lastProgresses=function(){var t,i,a,r,n;for(r=this.__items,n=[],i=0,a=r.length;a>i;i++)t=r[i],n.push(e(t).data("lastProgress"));return n},r.prototype.add=function(e){return e&&e.then?(r.__super__.add.apply(this,arguments),this.__watchItem(e)):void 0},r.prototype.__replace=function(e,t,i){return t&&t.then?(r.__super__.__replace.apply(this,arguments),this.__watchItem(t)):this.remove(e)},r.prototype.__watchItem=function(e){var t,i=this;return t=function(t){return function(){return a.call(i.__items,e)>=0?t.fire.apply(t,[e].concat(o.call(arguments))):void 0}},e.then(t(this.anyDoneList),t(this.anyFailList),t(this.anyProgressList))},r}(t.UniqCollection)})}.call(this),function(){var e;e=r.jQuery,r.namespace("utils",function(t){var i;return i=function(t,i){var a,r=this;return a=e.Deferred(),i&&(t.src=i),t.complete?a.resolve(t):(e(t).one("load",function(){return a.resolve(t)}),e(t).one("error",function(){return a.reject(t)})),a.promise()},t.imageLoader=function(a){return e.isArray(a)?e.when.apply(null,e.map(a,t.imageLoader)):a.src?i(a):i(new Image,a)},t.videoLoader=function(t){var i;return i=e.Deferred(),e("<video/>").on("loadeddata",i.resolve).on("error",i.reject).attr("src",t).get(0).load(),i.promise()}})}.call(this),function(){var t=[].slice;r.namespace("utils",function(i){var a,r;return i.log=function(){var t;try{return null!=(t=e.console)&&"function"==typeof t.log?t.log.apply(t,arguments):void 0}catch(i){}},i.debug=function(){var a,r;if(null!=(a=e.console)?!a.debug:!0)return i.log.apply(i,["Debug:"].concat(t.call(arguments)));try{return(r=e.console).debug.apply(r,arguments)}catch(n){}},i.warn=function(){var a,r;if(null!=(a=e.console)?!a.warn:!0)return i.log.apply(i,["Warning:"].concat(t.call(arguments)));try{return(r=e.console).warn.apply(r,arguments)}catch(n){}},r={},i.warnOnce=function(e){return null==r[e]?(r[e]=!0,i.warn(e)):void 0},a={publicKey:"Global public key not set. Uploads may not work!\nAdd this to the <head> tag to set your key:\n\n<script>\nUPLOADCARE_PUBLIC_KEY = 'your_public_key';\n</script>"},i.commonWarning=function(e){return null!=a[e]?i.warnOnce(a[e]):void 0}})}.call(this),function(){var t;t=r.jQuery,r.namespace("utils",function(i){var a,r=this;return a={},t(e).on("message",function(e){var t,i,r,n,o,l,s;t=e.originalEvent;try{r=JSON.parse(t.data)}catch(c){return}if(r.type in a){for(l=a[r.type],s=[],n=0,o=l.length;o>n;n++)i=l[n],t.source===i[0]?s.push(i[1](r)):s.push(void 0);return s}}),i.registerMessage=function(e,t,i){return e in a||(a[e]=[]),a[e].push([t,i])},i.unregisterMessage=function(e,i){return e in a?a[e]=t.grep(a[e],function(e){return e[0]!==i}):void 0}})}.call(this),function(){var e,t=[].indexOf||function(e){for(var t=0,i=this.length;i>t;t++)if(t in this&&this[t]===e)return t;return-1},i=[].slice;e=r.jQuery,r.namespace("utils",function(a){var r;return a.unique=function(e){var i,a,r,n;for(a=[],r=0,n=e.length;n>r;r++)i=e[r],t.call(a,i)<0&&a.push(i);return a},a.defer=function(e){return setTimeout(e,0)},a.gcd=function(e,t){var i;while(t)i=e%t,e=t,t=i;return e},a.once=function(e){var t,i;return t=!1,i=null,function(){return t||(i=e.apply(this,arguments),t=!0),i}},a.wrapToPromise=function(t){return e.Deferred().resolve(t).promise()},a.then=function(t,i,a,r){var n,o;return o=e.Deferred(),n=function(e,t){return e&&t?function(){return t.call(this,e.apply(this,arguments))}:e||t},t.then(n(i,o.resolve),n(a,o.reject),n(r,o.notify)),o.promise()},a.bindAll=function(t,i){var a;return a={},e.each(i,function(i,r){var n;return n=t[r],e.isFunction(n)?a[r]=function(){var e;return e=n.apply(t,arguments),e===t?a:e}:a[r]=n}),a},a.upperCase=function(e){return e.replace(/([A-Z])/g,"_$1").toUpperCase()},a.publicCallbacks=function(e){var t;return t=e.add,t.add=e.add,t.remove=e.remove,t},a.uuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t,i;return t=16*Math.random()|0,i="x"===e?t:3&t|8,i.toString(16)})},a.splitUrlRegex=/^(?:([^:\/?#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)\??([^\#]*)\#?(.*)$/,a.uuidRegex=/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i,a.groupIdRegex=new RegExp(""+a.uuidRegex.source+"~[0-9]+","i"),a.cdnUrlRegex=new RegExp("^/?("+a.uuidRegex.source+")(?:/(-/(?:[^/]+/)+)?([^/]*))?$","i"),a.splitCdnUrl=function(e){return a.cdnUrlRegex.exec(a.splitUrlRegex.exec(e)[3])},a.escapeRegExp=function(e){return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},a.globRegexp=function(t,i){var r;return null==i&&(i="i"),r=e.map(t.split("*"),a.escapeRegExp),new RegExp("^"+r.join(".+")+"$",i)},a.normalizeUrl=function(e){var t;return t=n.location.protocol,"http:"!==t&&(t="https:"),e.replace(/^\/\//,t+"//").replace(/\/+$/,"")},a.fitText=function(e,t){var i,a;return e.length>t?(i=Math.ceil((t-3)/2),a=Math.floor((t-3)/2),e.slice(0,i)+"..."+e.slice(-a)):e},a.fitSizeInCdnLimit=function(e){return a.fitSize(e,[2048,2048])},a.fitSize=function(e,t,i){var a,r;return e[0]>t[0]||e[1]>t[1]||i?(r=t[0]/e[0],a=t[1]/e[1],!t[0]||t[1]&&r>a?[Math.round(a*e[0]),t[1]]:[t[0],Math.round(r*e[1])]):e.slice()},a.applyCropSelectionToFile=function(e,t,i,a){var r,n,o,l,s,c,u,d=this;return c=a.width,n=a.height,l=t.preferedSize,o="",u=c===i[0]&&n===i[1],u||(o+="-/crop/"+c+"x"+n+"/"+a.left+","+a.top+"/"),r=t.downscale&&(c>l[0]||n>l[1]),s=t.upscale&&(c<l[0]||n<l[1]),r||s?(a.sw=l[0],a.sh=l[1],o+="-/resize/"+l.join("x")+"/"):u||(o+="-/preview/"),e.then(function(e){return e.cdnUrlModifiers=o,e.cdnUrl=""+e.originalUrl+(o||""),e.crop=a,e})},a.fileInput=function(t,i,a){var r,n,o;return n=null,r=i.inputAcceptTypes,""===r&&(r=i.imagesOnly?"image/*":null),(o=function(){return n=e(i.multiple?'<input type="file" multiple>':'<input type="file">').attr("accept",r).css({position:"absolute",top:0,opacity:0,margin:0,padding:0,width:"auto",height:"auto",cursor:t.css("cursor")}).on("change",function(){return a(this),e(this).hide(),o()}),t.append(n)})(),t.css({position:"relative",overflow:"hidden"}).mousemove(function(t){var i,a,r,o;return o=e(this).offset(),i=o.left,a=o.top,r=n.width(),n.css({left:t.pageX-i-r+10,top:t.pageY-a-10})})},a.fileSelectDialog=function(t,i,a){var r;return r=i.inputAcceptTypes,""===r&&(r=i.imagesOnly?"image/*":null),e(i.multiple?'<input type="file" multiple>':'<input type="file">').attr("accept",r).css({position:"fixed",bottom:0,opacity:0}).on("change",function(){return a(this),e(this).remove()}).appendTo(t).focus().click().hide()},a.fileSizeLabels="B KB MB GB TB PB EB ZB YB".split(" "),a.readableFileSize=function(e,t,i,r){var n,o,l,s;if(null==t&&(t=""),null==i&&(i=""),null==r&&(r=""),e=parseInt(e,10),isNaN(e))return t;n=2,l=0,s=1e3-5*Math.pow(10,2-Math.max(n,3));while(e>s&&l<a.fileSizeLabels.length-1)l++,e/=1024;return e+=1e-15,o=Math.max(0,n-Math.floor(e).toFixed(0).length),e=Number(e.toFixed(o)),""+i+e+" "+a.fileSizeLabels[l]+r},a.ajaxDefaults={dataType:"json",crossDomain:!0,cache:!1},a.jsonp=function(t,i,r){return e.isPlainObject(i)&&(r=i,i="GET"),e.ajax(e.extend({url:t,type:i,data:r},a.ajaxDefaults)).then(function(t){var i;return t.error?(i=t.error.content||t.error,e.Deferred().reject(i)):t},function(e,i,r){var n;return n=""+i+" ("+r+")",a.warn("JSONP unexpected error: "+n+" while loading "+t),n})},a.canvasToBlob=function(e,t,i,a){var r,n,o,l,s,c;if(HTMLCanvasElement.prototype.toBlob)return e.toBlob(a,t,i);for(o=e.toDataURL(t,i),o=o.split(","),n=atob(o[1]),r=new Uint8Array(n.length),l=s=0,c=n.length;c>s;l=s+=1)r[l]=n.charCodeAt(l);return a(new Blob([r],{type:/:(.+\/.+);/.exec(o[0])[1]}))},a.taskRunner=function(e){var t,i,r,n;return n=0,t=[],i=function(){var e;return t.length?(e=t.shift(),a.defer(function(){return e(i)})):n-=1},r=function(r){return!e||e>n?(n+=1,a.defer(function(){return r(i)})):t.push(r)}},r=[["notify","progress",2],["resolve","done",0],["reject","fail",1]],
    a.fixedPipe=function(){var t,a;return a=arguments[0],t=2<=arguments.length?i.call(arguments,1):[],e.Deferred(function(i){return e.each(r,function(r,n){var o;return o=e.isFunction(t[n[2]])&&t[n[2]],a[n[1]](function(){var t;return t=o&&o.apply(this,arguments),t&&e.isFunction(t.promise)?t.promise().progress(i.notify).done(i.resolve).fail(i.reject):i[n[0]+"With"](this===a?i.promise():this,o?[t]:arguments)})})}).promise()}})}.call(this),function(){var t,i,a,n=[].indexOf||function(e){for(var t=0,i=this.length;i>t;t++)if(t in this&&this[t]===e)return t;return-1};i=r.expose,a=r.utils,t=r.jQuery,r.namespace("settings",function(o){var l,s,c,u,d,p,f,h,g,m;return s={live:!0,manualStart:!1,locale:null,localePluralize:null,localeTranslations:null,systemDialog:!1,crop:!1,previewStep:!1,imagesOnly:!1,clearable:!1,multiple:!1,multipleMax:0,multipleMin:1,multipleMaxStrict:!1,imageShrink:!1,pathValue:!0,tabs:"file camera url facebook gdrive gphotos dropbox instagram evernote flickr skydrive",preferredTypes:"",inputAcceptTypes:"",doNotStore:!1,publicKey:null,secureSignature:"",secureExpire:"",pusherKey:"79ae88bd931ea68464d9",cdnBase:"https://ucarecdn.com",urlBase:"https://upload.uploadcare.com",socialBase:"https://social.uploadcare.com",imagePreviewMaxSize:26214400,multipartMinSize:26214400,multipartPartSize:5242880,multipartMinLastPartSize:1048576,multipartConcurrency:4,multipartMaxAttempts:3,parallelDirectUploads:10,passWindowOpen:!1,scriptBase:"//ucarecdn.com/widget/"+r.version+"/uploadcare/",debugUploads:!1},h={tabs:{all:"file camera url facebook gdrive gphotos dropbox instagram evernote flickr skydrive box vk huddle","default":s.tabs}},g=function(e){return t.isArray(e)||(e=t.trim(e),e=e?e.split(" "):[]),e},l=function(e,t){var i,r,n,o,l,s,c,u;for(l=0,c=t.length;c>l;l++){if(r=t[l],o=n=g(e[r]),h.hasOwnProperty(r))for(o=[],s=0,u=n.length;u>s;s++)i=n[s],h[r].hasOwnProperty(i)?o=o.concat(g(h[r][i])):o.push(i);e[r]=a.unique(o)}return e},m=function(e,t){var i,r,n;for(r=0,n=t.length;n>r;r++)i=t[r],null!=e[i]&&(e[i]=a.normalizeUrl(e[i]));return e},c=function(e,i){var a,r,n,o;for(n=0,o=i.length;o>n;n++)a=i[n],null!=e[a]&&(r=e[a],"string"===t.type(r)?(r=t.trim(r).toLowerCase(),e[a]=!("false"===r||"disabled"===r)):e[a]=!!r);return e},u=function(e,t){var i,a,r;for(a=0,r=t.length;r>a;a++)i=t[a],null!=e[i]&&(e[i]=parseInt(e[i]));return e},p=function(e){var i,a;return a=/^([0-9]+)([x:])([0-9]+)\s*(|upscale|minimum)$/i,i=a.exec(t.trim(e.toLowerCase()))||[],{downscale:"x"===i[2],upscale:!!i[4],notLess:"minimum"===i[4],preferedSize:i.length?[+i[1],+i[3]]:void 0}},f=function(e){var i,r,n;return i=/^([0-9]+)x([0-9]+)(?:\s+(\d{1,2}|100)%)?$/i,r=i.exec(t.trim(e.toLowerCase()))||[],r.length?(n=r[1]*r[2],n>5e6?(a.warnOnce("Shrinked size can not be larger than 5MP. "+("You have set "+r[1]+"x"+r[2]+" (")+(""+Math.ceil(n/1e3/100)/10+"MP).")),!1):{quality:r[3]?r[3]/100:void 0,size:n}):!1},d=function(e){return l(e,["tabs","preferredTypes"]),m(e,["cdnBase","socialBase","urlBase","scriptBase"]),c(e,["doNotStore","imagesOnly","multiple","clearable","pathValue","previewStep","systemDialog","debugUploads","multipleMaxStrict"]),u(e,["multipleMax","multipleMin","multipartMinSize","multipartPartSize","multipartMinLastPartSize","multipartConcurrency","multipartMaxAttempts","parallelDirectUploads"]),e.crop===!1||t.isArray(e.crop)||(/^(disabled?|false|null)$/i.test(e.crop)?e.crop=!1:t.isPlainObject(e.crop)?e.crop=[e.crop]:e.crop=t.map((""+e.crop).split(","),p)),e.imageShrink&&!t.isPlainObject(e.imageShrink)&&(e.imageShrink=f(e.imageShrink)),(e.crop||e.multiple)&&(e.previewStep=!0),a.abilities.sendFileAPI||(e.systemDialog=!1),e.validators&&(e.validators=e.validators.slice()),e},i("defaults",t.extend({allTabs:h.tabs.all},s)),o.globals=function(){var t,i,r;r={};for(t in s)i=e["UPLOADCARE_"+a.upperCase(t)],void 0!==i&&(r[t]=i);return r},o.common=a.once(function(e,i){var r;return i||(s=t.extend(s,o.globals())),r=d(t.extend(s,e||{})),r.publicKey||a.commonWarning("publicKey"),o.waitForSettings.fire(r),r}),o.build=function(e){var i;return i=t.extend({},o.common()),t.isEmptyObject(e)||(i=d(t.extend(i,e))),i},o.waitForSettings=t.Callbacks("once memory"),o.CssCollector=function(){function e(){this.urls=[],this.styles=[]}return e.prototype.addUrl=function(e){if(!/^https?:\/\//i.test(e))throw new Error("Embedded urls should be absolute. "+e);return n.call(this.urls,e)>=0?void 0:this.urls.push(e)},e.prototype.addStyle=function(e){return this.styles.push(e)},e}(),r.tabsCss=new o.CssCollector,s._emptyKeyText='<div class="uploadcare-dialog-message-center">\n<div class="uploadcare-dialog-big-title">Hello!</div>\n<div class="uploadcare-dialog-large-text">\n  <div>Your <a class="uploadcare-link" href="https://uploadcare.com/dashboard/">public key</a> is not set.</div>\n  <div>Add this to the &lt;head&gt; tag to start uploading files:</div>\n  <div class="uploadcare-pre">&lt;script&gt;\nUPLOADCARE_PUBLIC_KEY = \'your_public_key\';\n&lt;/script&gt;</div>\n</div>\n</div>'})}.call(this),function(){r.namespace("locale.translations",function(e){return e.en={uploading:"Uploading... Please wait.",loadingInfo:"Loading info...",errors:{"default":"Error",baddata:"Incorrect value",size:"File too big",upload:"Can’t upload",user:"Upload canceled",info:"Can’t load info",image:"Only images allowed",createGroup:"Can’t create file group",deleted:"File was deleted"},draghere:"Drop a file here",file:{one:"%1 file",other:"%1 files"},buttons:{cancel:"Cancel",remove:"Remove",choose:{files:{one:"Choose a file",other:"Choose files"},images:{one:"Choose an image",other:"Choose images"}}},dialog:{done:"Done",showFiles:"Show files",tabs:{names:{"empty-pubkey":"Welcome",preview:"Preview",file:"Local Files",url:"Arbitrary Links",camera:"Camera",facebook:"Facebook",dropbox:"Dropbox",gdrive:"Google Drive",gphotos:"Google Photos",instagram:"Instagram",vk:"VK",evernote:"Evernote",box:"Box",skydrive:"OneDrive",flickr:"Flickr",huddle:"Huddle"},file:{drag:"Drop a file here",nodrop:"Upload files from your computer",cloudsTip:"Cloud storages<br>and social networks",or:"or",button:"Choose a local file",also:"You can also choose it from"},url:{title:"Files from the Web",line1:"Grab any file off the web.",line2:"Just provide the link.",input:"Paste your link here...",button:"Upload"},camera:{capture:"Take a photo",mirror:"Mirror",startRecord:"Record a video",stopRecord:"Stop",cancelRecord:"Cancel",retry:"Request permissions again",pleaseAllow:{title:"Please allow access to your camera",text:"You have been prompted to allow camera access from this site. In order to take pictures with your camera you must approve this request."},notFound:{title:"No camera detected",text:"Looks like you have no camera connected to this device."}},preview:{unknownName:"unknown",change:"Cancel",back:"Back",done:"Add",unknown:{title:"Uploading... Please wait for a preview.",done:"Skip preview and accept"},regular:{title:"Add this file?",line1:"You are about to add the file above.",line2:"Please confirm."},image:{title:"Add this image?",change:"Cancel"},crop:{title:"Crop and add this image",done:"Done",free:"free"},video:{title:"Add this video?",change:"Cancel"},error:{"default":{title:"Oops!",text:"Something went wrong during the upload.",back:"Please try again"},image:{title:"Only image files are accepted.",text:"Please try again with another file.",back:"Choose image"},size:{title:"The file you selected exceeds the limit.",text:"Please try again with another file."},loadImage:{title:"Error",text:"Can’t load image"}},multiple:{title:"You’ve chosen %files%",question:"Do you want to add all of these files?",tooManyFiles:"You’ve chosen too many files. %max% is maximum.",tooFewFiles:"You’ve chosen %files%. At least %min% required.",clear:"Remove all",done:"Done"}}},footer:{text:"powered by",link:"uploadcare"}}}}),r.namespace("locale.pluralize",function(e){return e.en=function(e){return 1===e?"one":"other"}})}.call(this),function(){var e,t,i;i=r.utils,t=r.settings,e=r.jQuery,r.namespace("locale",function(a){var r,n,o,l,s;return n="en",o={lang:n,translations:a.translations[n],pluralize:a.pluralize[n]},s=function(t){var i,r,n;return i=t.locale||o.lang,n=e.extend(!0,{},a.translations[i],t.localeTranslations),
    r=e.isFunction(t.localePluralize)?t.localePluralize:a.pluralize[i],{lang:i,translations:n,pluralize:r}},r=i.once(function(){return s(t.build())}),a.rebuild=function(e){var i;return i=s(t.build(e)),r=function(){return i}},l=function(e,t){var i,a,r,n;for(i=e.split("."),r=0,n=i.length;n>r;r++){if(a=i[r],null==t)return null;t=t[a]}return t},a.t=function(e,t){var i,a,n;return i=r(),a=l(e,i.translations),null==a&&i.lang!==o.lang&&(i=o,a=l(e,i.translations)),null!=t&&(a=null!=i.pluralize?(null!=(n=a[i.pluralize(t)])?n.replace("%1",t):void 0)||t:""),a||""}})}.call(this),function(){var e,t,i;t=r.locale,i=r.utils,e=r.jQuery,r.namespace("templates",function(a){return a.JST={},a.tpl=function(n,o){var l;return null==o&&(o={}),l=a.JST[n],null!=l?l(e.extend({t:t.t,utils:i,uploadcare:r},o)):""}})}.call(this),r.templates.JST["circle-text"]=function(e){var __p=[],t=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-widget-circle-back">\r\n  <div class="uploadcare-widget-circle-text"></div>\r\n</div>\r\n');return __p.join("")},r.templates.JST.dialog=function(e){var __p=[],t=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog uploadcare-responsive-panel"><!--\r\n--><div class="uploadcare-dialog-inner-wrap">\r\n    <div class="uploadcare-dialog-close">×</div>\r\n    <div class="uploadcare-dialog-placeholder"></div>\r\n  </div>\r\n</div>\r\n');return __p.join("")},r.templates.JST.panel=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-panel">\r\n  <div class="uploadcare-dialog-tabs"></div>\r\n\r\n  <div class="uploadcare-panel-footer uploadcare-panel-footer__summary">\r\n    <div class="uploadcare-dialog-button uploadcare-dialog-source-base-show-files"\r\n         tabindex="0" role="button">\r\n      ',(""+t("dialog.showFiles")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n      <div class="uploadcare-panel-footer-counter"></div>\r\n    </div>\r\n    <div class="uploadcare-dialog-button-success uploadcare-dialog-source-base-done"\r\n         tabindex="0" role="button">',(""+t("dialog.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n    <div class="uploadcare-panel-footer-text"></div>\r\n  </div>\r\n</div>\r\n<div class="uploadcare-dialog-footer">\r\n  ',(""+t("dialog.footer.text")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  <svg width="13" height="13" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><title>Uploadcare Logo</title><g fill="none" fill-rule="evenodd"><path d="M-1-1h32v32H-1z"/><path d="M15 29.452c7.98 0 14.452-6.47 14.452-14.452C29.452 7.02 22.982.548 15 .548 7.02.548.548 7.018.548 15c0 7.98 6.47 14.452 14.452 14.452zm0-12.846c.887 0 1.606-.72 1.606-1.606 0-.887-.72-1.606-1.606-1.606-.887 0-1.606.72-1.606 1.606 0 .887.72 1.606 1.606 1.606z" fill="#FFD800"/></g></svg>\r\n  <a href="https://uploadcare.com/?utm_campaign=widget&utm_source=copyright&utm_medium=desktop&utm_content=',(""+r.version).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'"\r\n     target="_blank">',(""+t("dialog.footer.link")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</a>\r\n</div>\r\n");return __p.join("")},r.templates.JST.styles=function(e){var __p=[],t=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('\n\n\n\n\n\n\n\n.uploadcare-dialog-disabled-tab:hover:before,.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before{background-image:url("',settings.scriptBase,'/images/tab-icons.png");background-size:50px}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',settings.scriptBase,'/images/tab-icons-active.png");background-size:50px}.uploadcare-dialog-file-sources:before{background-image:url("',settings.scriptBase,'/images/arrow.png")}.uploadcare-remove{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABM0lEQVQoz5VTvW7CMBC2kHivQsjrZGRjaB6lXWCJbWScIT8PYN0GQ7s6FUUKL8CA2suR2C4FlfqkyL77cuf7/B1jbp3GdmIW1VIVKq9ezMI+ncbs92omNeeQgYQ1msQdh5o30x+g82ibCAysr4yDgG1yHjngLhkyXVuXeZcMRSNJMI4mAwinGl2siaiFWncOAW/QgO4vwCGHD/QI2tca27LxEDrAF7QE5fg94ungfrMxM89ZXyqnYAsbtG53RM/lKhmYlJUr6XrUPbQlmHY8SChXTBUhHRsCXfKGdKmCKe2PApQDKmokAJavD5b2zei+hTvNDPQI+HR5PD3C0+MJf4c95vCE79ETEI5POPvzCWf/EwXJbH5XZvNAZqSh6U3hRjc0jqMQmxRHoVRltTSpjcNR+AZwwvykEau0BgAAAABJRU5ErkJggg==)}.uploadcare-file-item__error:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABIklEQVR42q3Vv2rCUBTHcaEQH825TdLl9hl0FsFdV7s5uXSpb+DoEziV6JCgATdR02D9E09/R64KF3NPbQx84BJOvgRyuSktK5VbHHiFDwhhCwl86Xu+nimZbsWeYQIkmMCLLfgELaA7tfSzRlCISVEz6AEV5J2DDszyBtNGg7L5/CSt123BGBwOKqA8WRzT+cqmU+kt3zj4aQ0myTW4WEjBPgcj29B+NLoE98OhFIw4+GMb2vR6l+Cm25WCWw6ubUPftRrR8XiSVKt/CgZADxKJH2XlurQbDBivxY8ibpu02SR98VrcNuLGXitFh/GYDkHAa2ljlznIfKCCfPNwaBeItfOOr84/Yu/m8WVy7zhgPfHE1hxQ0IcQdlqo76m8X8Avwkyxg4iIuCEAAAAASUVORK5CYII=)}.uploadcare-file-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABD0lEQVQoFQXBPa5OARQF0LXPvfKS9wo/hegMQUzEJESiUIpOoxOlRKJDIgqVUZiNqPGdba0AAPLj48Mn/8ApgEcPOAGArx/uPVvrEFVRA04A+PTu+vk1BlSwLuAE4Pubvy+vHGAFxABOgC+v/ryO24oYUVUDGODzi+PtjfuuXBBUxG8XASd8e3rz/o5rY60YwVjXKAj8/HXrblDFIAKCehxOOHcxCggWUTHghJYqIqIigoqCEyCKEcXFgAjghCAWi1EDIlgwABWxoIhYaxUMsIo4BEHBRR1ggMMogoqq4jCAgVo1VhGMgFjACQUjCKIqIigYqKiLILiogFULBkbUWhSDqKpYMFAFwaJGUVUH+A8ToG9OM8KqQQAAAABJRU5ErkJggg==)}.uploadcare-zoomable-icon:after{background-image:url("',settings.scriptBase,'/images/zoom@2x.png")}.uploadcare-dialog-error-tab-illustration{background-image:url("',settings.scriptBase,'/images/error-default.png")}.uploadcare-dialog-camera-holder .uploadcare-dialog-error-tab-illustration,.uploadcare-dialog-error-tab-image .uploadcare-dialog-error-tab-illustration{background-image:url("',settings.scriptBase,'/images/error-image.png")}.uploadcare-dialog{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIHWMw/AQAAVcBJCiBozgAAAAASUVORK5CYII=);background:rgba(48,48,48,.7)}@media (-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.uploadcare-dialog-disabled-tab:hover:before,.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before{background-image:url("',settings.scriptBase,'/images/tab-icons@2x.png")}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',settings.scriptBase,"/images/tab-icons-active@2x.png\")}}html.uploadcare-dialog-opened{overflow:hidden}.uploadcare-dialog{font-family:\"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;overflow:auto;white-space:nowrap;text-align:center}.uploadcare-dialog:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog *{margin:0;padding:0}.uploadcare-dialog .uploadcare-dialog-panel{border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.35)}.uploadcare-dialog{-webkit-transition:opacity .33s cubic-bezier(.05,.7,.25,1);transition:opacity .33s cubic-bezier(.05,.7,.25,1);opacity:0}.uploadcare-dialog .uploadcare-dialog-inner-wrap{-webkit-transition:-webkit-transform .33s cubic-bezier(.05,.7,.25,1);transition:transform .33s cubic-bezier(.05,.7,.25,1);transition:transform .33s cubic-bezier(.05,.7,.25,1),-webkit-transform .33s cubic-bezier(.05,.7,.25,1);-webkit-transform:scale(.8);-ms-transform:scale(.8);transform:scale(.8);-webkit-transform-origin:50% 100%;-ms-transform-origin:50% 100%;transform-origin:50% 100%}.uploadcare-dialog.uploadcare-active{opacity:1}.uploadcare-dialog.uploadcare-active .uploadcare-dialog-inner-wrap{-webkit-transform:none;-ms-transform:none;transform:none}.uploadcare-dialog-inner-wrap{display:inline-block;vertical-align:middle;white-space:normal;text-align:left;box-sizing:border-box;position:relative;width:100%;min-width:760px;max-width:944px;padding:0 33px 0 11px}.uploadcare-dialog-close{width:33px;height:33px;line-height:33px;font-size:29.7px;font-weight:700;color:#fff;cursor:pointer;position:absolute;text-align:center;right:0}.uploadcare-dialog-panel{overflow:hidden;position:relative;background:#efefef;font-weight:400;padding-left:75px;box-sizing:border-box}.uploadcare-dialog-panel :focus{outline:2px dotted #0094c0}.uploadcare-dialog-panel .uploadcare-mouse-focused:focus,.uploadcare-dialog-panel :active{outline:none}.uploadcare-dialog-panel.uploadcare-panel-hide-tabs{padding-left:0}.uploadcare-dialog-tabs{box-sizing:border-box;width:75px;height:616px;margin-left:-75px;float:left;background:#dee0e1;overflow:hidden}.uploadcare-panel-hide-tabs .uploadcare-dialog-tabs{display:none}.uploadcare-dialog-tab{box-sizing:border-box;height:56px;position:relative;border:1px solid #c5cace;border-width:0 1px 1px 0;cursor:pointer}.uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-dialog-tab:before{box-sizing:border-box;position:absolute;top:50%;left:50%;display:inline-block;width:50px;height:50px;margin:-25px;opacity:.66}.uploadcare-dialog-tab:before{content:''}.uploadcare-dialog-tab:hover{background-color:#e5e7e8}.uploadcare-dialog-tab:hover .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab:hover:before{opacity:1}.uploadcare-dialog-tab_current{border-right:1px solid #efefef;background-color:#efefef}.uploadcare-dialog-tab_current:hover{background-color:#efefef}.uploadcare-dialog-tab_current .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab_current:before{opacity:1}.uploadcare-dialog-tab_hidden{display:none!important}.uploadcare-dialog-disabled-tab{cursor:default}.uploadcare-dialog-disabled-tab:hover{background-color:#dee0e1}.uploadcare-dialog-tab-preview .uploadcare-widget-circle{padding:10px}.uploadcare-dialog-tab-preview .uploadcare-widget-circle--canvas{color:#828689;border-color:#bfbfbf}.uploadcare-dialog-tab-preview.uploadcare-dialog-tab_current .uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-dialog-tab-preview:before{display:none}.uploadcare-dialog-tab-file:before{background-position:0 -50px}.uploadcare-dialog-tab-url:before{background-position:0 -100px}.uploadcare-dialog-tab-facebook:before{background-position:0 -150px}.uploadcare-dialog-tab-dropbox:before{background-position:0 -200px}.uploadcare-dialog-tab-gdrive:before{background-position:0 -250px}.uploadcare-dialog-tab-instagram:before{background-position:0 -300px}.uploadcare-dialog-tab-vk:before{background-position:0 -350px}.uploadcare-dialog-tab-evernote:before{background-position:0 -400px}.uploadcare-dialog-tab-box:before{background-position:0 -450px}.uploadcare-dialog-tab-skydrive:before{background-position:0 -500px}.uploadcare-dialog-tab-flickr:before{background-position:0 -550px}.uploadcare-dialog-tab-camera:before{background-position:0 -600px}.uploadcare-dialog-tab-huddle:before{background-position:0 -650px}.uploadcare-dialog-tab-gphotos:before{background-position:0 -700px}.uploadcare-dialog-tabs-panel{position:relative;display:none;box-sizing:border-box;height:616px;line-height:22px;font-size:16px;color:#000}.uploadcare-dialog-multiple .uploadcare-dialog-tabs-panel{height:550px}.uploadcare-dialog-tabs-panel .uploadcare-dialog-input{box-sizing:border-box;width:100%;height:44px;margin-bottom:22px;padding:11px 12.5px;font-family:inherit;font-size:16px;border:1px solid #c5cace;background:#fff;color:#000}.uploadcare-dialog-tabs-panel_current{display:block}.uploadcare-pre{white-space:pre;font-family:monospace;margin:22px auto;padding:22px 25px;background-color:#fff;border:1px solid #c5cace;border-radius:3px;text-align:left;font-size:15px;line-height:22px}.uploadcare-dialog-footer{font-size:13px;line-height:1.4em;text-align:center;color:#fff;margin:15px}.uploadcare-dialog .uploadcare-dialog-footer svg{vertical-align:middle;padding:0 2px}.uploadcare-dialog .uploadcare-dialog-footer a{color:#fff;text-decoration:none}.uploadcare-dialog .uploadcare-dialog-footer a:hover{text-decoration:underline}.uploadcare-dialog-title{font-size:22px;line-height:1;margin-bottom:22px}.uploadcare-dialog-title.uploadcare-error{color:red}.uploadcare-dialog-title2{font-size:20px;line-height:1;padding-bottom:11px}.uploadcare-dialog-big-title{font-size:40px;font-weight:700;line-height:1em;margin-bottom:50px}.uploadcare-dialog-label{font-size:15px;line-height:25px;margin-bottom:12.5px;word-wrap:break-word}.uploadcare-dialog-large-text{font-size:20px;font-weight:400;line-height:1.5em}.uploadcare-dialog-large-text .uploadcare-pre{display:inline-block;font-size:18px}.uploadcare-dialog-section{margin-bottom:22px}.uploadcare-dialog-normal-text{font-size:13px;color:#545454}.uploadcare-dialog-button,.uploadcare-dialog-button-success{display:inline-block;font-size:13px;line-height:30px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer}.uploadcare-dialog-button{color:#444}.uploadcare-dialog-button,.uploadcare-dialog-button.uploadcare-disabled-el:active,.uploadcare-dialog-button.uploadcare-disabled-el:hover,.uploadcare-dialog-button[disabled]:active,.uploadcare-dialog-button[disabled]:hover{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);box-shadow:none;border-color:#dcdcdc}.uploadcare-dialog-button:hover{background:#f9f9f9;background:-webkit-linear-gradient(#fbfbfb,#f6f6f6);background:linear-gradient(#fbfbfb,#f6f6f6);box-shadow:inset 0 -1px 3px rgba(0,0,0,.05)}.uploadcare-dialog-button:active{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);box-shadow:inset 0 2px 2px rgba(0,0,0,.05)}.uploadcare-dialog-button.uploadcare-disabled-el,.uploadcare-dialog-button[disabled]{cursor:default;opacity:.6}.uploadcare-dialog-button:active,.uploadcare-dialog-button:hover{border-color:#cbcbcb}.uploadcare-dialog-button-success{color:#fff}.uploadcare-dialog-button-success,.uploadcare-dialog-button-success.uploadcare-disabled-el:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:hover,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success[disabled]:hover{background:#3886eb;background:-webkit-linear-gradient(#3b8df7,#347fdf);background:linear-gradient(#3b8df7,#347fdf);box-shadow:none;border-color:#266fcb}.uploadcare-dialog-button-success:hover{background:#337ad6;background:-webkit-linear-gradient(#3986ea,#2c6dc2);background:linear-gradient(#3986ea,#2c6dc2)}.uploadcare-dialog-button-success:active{background:#3178d3;background:-webkit-linear-gradient(#3680e1,#2c6fc5);background:linear-gradient(#3680e1,#2c6fc5)}.uploadcare-dialog-button-success.uploadcare-disabled-el,.uploadcare-dialog-button-success[disabled]{cursor:default;opacity:.6}.uploadcare-dialog-button-success:active,.uploadcare-dialog-button-success:hover{border-color:#266eca #1f62b7 #1753a1}.uploadcare-dialog-button-success:hover{box-shadow:inset 0 -1px 3px rgba(22,82,160,.5)}.uploadcare-dialog-button-success:active{box-shadow:inset 0 1px 3px rgba(22,82,160,.4)}.uploadcare-dialog-big-button{border-radius:100px;font-size:20px;font-weight:400;letter-spacing:1px;color:#fff;line-height:33px;border:solid 1px #276fcb;text-shadow:0 -1px #2a7ce5;display:inline-block;padding:16.5px 2em;cursor:pointer;box-shadow:inset 0 -2px #1f66c1;background:#458eee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-big-button:hover{box-shadow:inset 0 -2px #1652a0;background:#337ad7;background:-webkit-linear-gradient(#3986eb,#2c6dc2);background:linear-gradient(#3986eb,#2c6dc2)}.uploadcare-dialog-big-button:active{box-shadow:inset 0 2px #2561b9;background:#2c6ec3;background:-webkit-linear-gradient(#2c6ec3,#2c6ec3);background:linear-gradient(#2c6ec3,#2c6ec3)}.uploadcare-dialog-preview-image-wrap,.uploadcare-dialog-preview-video-wrap{white-space:nowrap;text-align:center;width:100%;height:462px}.uploadcare-dialog-preview-image-wrap:before,.uploadcare-dialog-preview-video-wrap:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog-preview--with-sizes .uploadcare-dialog-preview-image-wrap,.uploadcare-dialog-preview--with-sizes .uploadcare-dialog-preview-video-wrap{position:relative;top:-40px;height:422px}.uploadcare-dialog-preview-image,.uploadcare-dialog-preview-video{display:inline-block;vertical-align:middle;white-space:normal;max-width:100%;max-height:100%}.uploadcare-dialog-tabs-panel-preview.uploadcare-dialog-tabs-panel_current~.uploadcare-panel-footer{display:none}.uploadcare-panel-footer{box-sizing:border-box;background:#fff3be;border-top:1px solid #efe2a9;height:66px;padding:17px 25px 0}.uploadcare-panel-footer .uploadcare-dialog-button-success{float:right}.uploadcare-panel-footer .uploadcare-dialog-button{float:left}.uploadcare-panel-footer .uploadcare-dialog-button,.uploadcare-panel-footer .uploadcare-dialog-button-success{min-width:100px;text-align:center;margin-right:0}.uploadcare-panel-footer .uploadcare-error{color:red}.uploadcare-panel-footer-text{text-align:center;color:#85732c;font-size:15px;line-height:32px}.uploadcare-dialog-message-center{text-align:center;padding-top:110px}.uploadcare-dialog-preview-center{text-align:center;padding-top:176px}.uploadcare-dialog-preview-circle{width:66px;height:66px;display:inline-block;margin-bottom:22px}.uploadcare-dialog-error-tab-wrap{height:100%;text-align:center;white-space:nowrap}.uploadcare-dialog-error-tab-wrap:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-title{margin-bottom:12px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-button-success{margin:0}.uploadcare-dialog-error-tab-wrap2{display:inline-block;vertical-align:middle;white-space:normal;margin-top:-22px}.uploadcare-dialog-error-tab-illustration{display:inline-block;width:170px;height:120px;background-position:center;background-repeat:no-repeat;margin-bottom:38px}.uploadcare-draganddrop .uploadcare-if-no-draganddrop,.uploadcare-if-draganddrop{display:none}.uploadcare-draganddrop .uploadcare-if-draganddrop{display:block}.uploadcare-draganddrop .uploadcare-dialog-file-drop-area{border:dashed 3px #c5cacd;background:rgba(255,255,255,.64)}.uploadcare-draganddrop .uploadcare-dialog-file-title{color:#dee0e1;text-shadow:0 1px #fff;margin-top:0}.uploadcare-dialog-file-drop-area{width:100%;height:100%;box-sizing:border-box;border:none;text-align:center;border-radius:3px;padding-top:70px}.uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{margin-top:11px;margin-bottom:55px}.uploadcare-dialog-file-title{font-size:40px;line-height:1;color:#000;font-weight:700;margin:66px 0}.uploadcare-dialog-file-or{font-size:13px;color:#8f9498;margin-bottom:33px}.uploadcare-dialog-file-sources{position:relative;display:inline-block;padding:0 80px 0 100px;line-height:2em}.uploadcare-dialog-file-sources:before{background-repeat:no-repeat;content:'';display:block;position:absolute;width:67px;height:44px;padding:0;top:-30px;left:10px}.uploadcare-dialog-file-source{display:inline;font-size:15px;margin-right:.2em;cursor:pointer;font-weight:300;white-space:nowrap}.uploadcare-dialog-file-source:after{content:'\\00B7';color:#b7babc;margin-left:.5em}.uploadcare-dialog-file-source:last-child:after{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button,.uploadcare-dragging .uploadcare-dialog-file-or,.uploadcare-dragging .uploadcare-dialog-file-sources{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area{background-color:#f0f0f0;border-color:#b3b5b6;padding-top:264px}.uploadcare-dragging .uploadcare-dialog-file-title{color:#707478}.uploadcare-dragging.uploadcare-dialog-file-drop-area{background-color:#f2f7fe;border-color:#438ae7}.uploadcare-dragging.uploadcare-dialog-file-drop-area .uploadcare-dialog-file-title{color:#438ae7}.uploadcare-dialog-camera-holder{white-space:nowrap;text-align:center;height:528px}.uploadcare-dialog-camera-holder:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-dialog-camera-holder .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-multiple .uploadcare-dialog-camera-holder{height:462px}.uploadcare-dialog-camera-video{vertical-align:middle;white-space:normal;display:none;max-width:100%;max-height:528px;-webkit-transition:-webkit-transform .8s cubic-bezier(.23,1,.32,1);transition:transform .8s cubic-bezier(.23,1,.32,1);transition:transform .8s cubic-bezier(.23,1,.32,1),-webkit-transform .8s cubic-bezier(.23,1,.32,1)}.uploadcare-dialog-multiple .uploadcare-dialog-camera-video{max-height:462px}.uploadcare-dialog-camera--mirrored{-webkit-transform:scale(-1,1);-ms-transform:scale(-1,1);transform:scale(-1,1)}.uploadcare-dialog-camera-message{vertical-align:middle;white-space:normal;display:none;max-width:450px}.uploadcare-dialog-camera-controls{margin-top:17px;text-align:center}.uploadcare-dialog-camera-mirror{position:absolute;margin-right:0;right:25px}.uploadcare-dialog-camera-cancel-record,.uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-mirror,.uploadcare-dialog-camera-not-found,.uploadcare-dialog-camera-retry,.uploadcare-dialog-camera-start-record,.uploadcare-dialog-camera-stop-record{display:none}.uploadcare-dialog-camera-requested .uploadcare-dialog-camera-message{display:inline-block}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-please-allow{display:none}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-not-found{display:block}.uploadcare-dialog-camera-denied .uploadcare-dialog-camera-message,.uploadcare-dialog-camera-denied .uploadcare-dialog-camera-retry,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-mirror,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-start-record,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-video,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-cancel-record,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-stop-record,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-video{display:inline-block}.uploadcare-file-list{height:550px;overflow:auto;position:relative;margin:0 -25px -22px 0}.uploadcare-dialog-multiple .uploadcare-file-list{height:484px}.uploadcare-file-list_table .uploadcare-file-item{border-top:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3;margin-bottom:-1px;display:table;table-layout:fixed;width:100%;padding:10px 0;min-height:20px}.uploadcare-file-list_table .uploadcare-file-item>*{box-sizing:content-box;display:table-cell;vertical-align:middle;padding-right:20px}.uploadcare-file-list_table .uploadcare-file-item:last-child{margin-bottom:0}.uploadcare-file-list_table .uploadcare-file-item:hover{background:#ececec}.uploadcare-file-list_table .uploadcare-file-item__preview{width:55px;padding-right:10px}.uploadcare-file-list_table .uploadcare-file-item__preview>img{height:55px}.uploadcare-file-list_table .uploadcare-file-item__size{width:3.5em}.uploadcare-file-list_table .uploadcare-file-item__progressbar{width:80px}.uploadcare-file-list_table .uploadcare-zoomable-icon:after{width:55px}.uploadcare-file-list_tiles .uploadcare-file-item{text-align:left;position:relative;display:inline-block;vertical-align:top;width:170px;min-height:170px;padding:0 20px 10px 0}.uploadcare-file-list_tiles .uploadcare-file-item>*{padding-bottom:10px}.uploadcare-file-list_tiles .uploadcare-file-item__name{padding-top:10px}.uploadcare-file-list_tiles .uploadcare-file-item__remove{position:absolute;top:0;right:10px}.uploadcare-file-list_tiles .uploadcare-file-item__preview{white-space:nowrap;width:170px;height:170px;padding-bottom:0}.uploadcare-file-list_tiles .uploadcare-file-item__preview:before{display:inline-block;vertical-align:middle;content:'';height:100%;position:static;width:0}.uploadcare-file-list_tiles .uploadcare-file-item__preview img{display:inline-block;vertical-align:middle;white-space:normal}.uploadcare-file-list_tiles .uploadcare-file-item_error .uploadcare-file-item__preview,.uploadcare-file-list_tiles .uploadcare-file-item_uploaded .uploadcare-file-item__name,.uploadcare-file-list_tiles .uploadcare-file-item_uploaded .uploadcare-file-item__size,.uploadcare-file-list_tiles .uploadcare-file-item_uploading .uploadcare-file-item__preview{display:none}.uploadcare-file-icon,.uploadcare-file-item__error:before{content:'';display:inline-block;width:20px;height:20px;margin:-3.5px .7em -3.5px 0}.uploadcare-file-item{font-size:13px;line-height:1.2}.uploadcare-file-item:hover .uploadcare-file-item__remove{visibility:visible}.uploadcare-file-item:hover .uploadcare-zoomable-icon:after{display:block}.uploadcare-file-item_error .uploadcare-file-item__progressbar,.uploadcare-file-item_error .uploadcare-file-item__size,.uploadcare-file-item_uploaded .uploadcare-file-item__error,.uploadcare-file-item_uploaded .uploadcare-file-item__progressbar,.uploadcare-file-item_uploading .uploadcare-file-item__error{display:none}.uploadcare-file-item__preview{text-align:center;line-height:0}.uploadcare-file-item__preview>img{display:inline-block;width:auto;height:auto;max-width:100%;max-height:100%}.uploadcare-file-item__name{width:100%;word-wrap:break-word}.uploadcare-file-item__error{width:200px;color:#f5444b}.uploadcare-file-item__remove{visibility:hidden;width:20px;text-align:right;line-height:0}.uploadcare-remove{width:20px;height:20px;cursor:pointer}.uploadcare-zoomable-icon{position:relative;cursor:pointer}.uploadcare-zoomable-icon:after{content:'';position:absolute;top:0;left:0;display:none;width:100%;height:100%;background-size:45px 45px;background-repeat:no-repeat;background-position:center}.uploadcare-progressbar{width:100%;height:8px;background:#e0e0e0;border-radius:100px}.uploadcare-progressbar__value{height:100%;background:#d6b849;border-radius:100px}.uploadcare-file-icon{margin:0}.uploadcare-dialog-padding{padding:22px 25px}.uploadcare-dialog-remote-iframe-wrap{overflow:auto;-webkit-overflow-scrolling:touch}.uploadcare-dialog-remote-iframe{display:block;width:100%;height:100%;border:0;opacity:0}.uploadcare-hidden,.uploadcare-if-mobile,.uploadcare-panel-footer-counter,.uploadcare-panel-footer__summary{display:none}.uploadcare-dialog-multiple .uploadcare-panel-footer__summary{display:block}@media screen and (max-width:760px){.uploadcare-dialog-opened{overflow:visible!important;position:static!important;width:auto!important;height:auto!important;min-width:0!important;background:#efefef!important}body.uploadcare-dialog-opened>.uploadcare-inactive,body.uploadcare-dialog-opened>:not(.uploadcare-dialog){display:none!important}.uploadcare-if-mobile{display:block}.uploadcare-if-no-mobile{display:none}.uploadcare-dialog{position:absolute;overflow:visible;-webkit-text-size-adjust:100%}.uploadcare-dialog:before{display:none}.uploadcare-dialog-inner-wrap{padding:0;min-width:310px;height:100%}.uploadcare-dialog-close{position:fixed;z-index:2;color:#000;width:50px;height:50px;line-height:45px}.uploadcare-dialog-footer{display:none}.uploadcare-responsive-panel .uploadcare-dialog-panel{overflow:visible;height:100%;padding:50px 0 0;border-radius:0;box-shadow:none}.uploadcare-responsive-panel .uploadcare-dialog-panel.uploadcare-panel-hide-tabs{padding-top:0}.uploadcare-responsive-panel .uploadcare-dialog-tabs-panel{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-remote-iframe-wrap{overflow:visible;height:100%}.uploadcare-responsive-panel .uploadcare-dialog-padding{padding:22px 15px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image-wrap,.uploadcare-responsive-panel .uploadcare-dialog-preview-video-wrap{top:auto;height:auto;padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image,.uploadcare-responsive-panel .uploadcare-dialog-preview-video{max-height:450px}.uploadcare-responsive-panel .uploadcare-file-list{height:auto;margin:0 -15px 0 0}.uploadcare-responsive-panel .uploadcare-file-list_table .uploadcare-file-item>*{padding-right:10px}.uploadcare-responsive-panel .uploadcare-file-list_table .uploadcare-file-item__progressbar{width:40px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item{width:140px;min-height:140px;padding-right:10px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item__preview{width:140px;height:140px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item__remove{right:10px}.uploadcare-responsive-panel .uploadcare-file-item__remove{visibility:visible}.uploadcare-responsive-panel .uploadcare-dialog-file-or,.uploadcare-responsive-panel .uploadcare-dialog-file-sources,.uploadcare-responsive-panel .uploadcare-dialog-file-title{display:none}.uploadcare-responsive-panel .uploadcare-dialog-file-drop-area{padding-top:0;border:0;background:0 0}.uploadcare-responsive-panel .uploadcare-dialog-big-button{margin:110px 0 0}.uploadcare-responsive-panel .uploadcare-clouds-tip{color:#909498;font-size:.75em;line-height:1.4;text-align:left;padding:10px 0 0 50px}.uploadcare-responsive-panel .uploadcare-clouds-tip:before{background-image:url(\"",settings.scriptBase,"/images/arrow.png\");background-repeat:no-repeat;background-size:51px 33px;content:'';position:absolute;margin:-20px -36px;display:block;width:28px;height:30px}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-camera{display:none}.uploadcare-responsive-panel .uploadcare-dialog-camera-holder{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-camera-mirror{right:15px}.uploadcare-responsive-panel .uploadcare-panel-footer{position:fixed;left:0;bottom:0;width:100%;min-width:310px;height:50px;padding:9px 15px 0;background:rgba(255,243,190,.95)}.uploadcare-responsive-panel .uploadcare-panel-footer-text{display:none}.uploadcare-responsive-panel .uploadcare-panel-footer-counter{display:inline}.uploadcare-responsive-panel .uploadcare-dialog-multiple.uploadcare-dialog-panel{padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-remote-iframe-wrap:after{content:'';display:block;height:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-padding{padding-bottom:72px}.uploadcare-responsive-panel .uploadcare-dialog-tabs{position:fixed;top:0;left:0;width:100%;min-width:310px;height:auto;float:none;margin:0;z-index:1;background:0 0}.uploadcare-responsive-panel .uploadcare-dialog-tab{display:none;height:50px;white-space:nowrap;background:#dee0e1}.uploadcare-responsive-panel .uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-responsive-panel .uploadcare-dialog-tab:before{position:static;margin:0 6px;vertical-align:middle;opacity:1}.uploadcare-responsive-panel .uploadcare-dialog-tab_current{display:block;background:rgba(239,239,239,.95)}.uploadcare-responsive-panel .uploadcare-dialog-tab:after{content:attr(title);font-size:20px;vertical-align:middle}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs-panel_current,.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-panel-footer{display:none}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs{position:absolute;z-index:3}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab{display:block}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab_current{background:#efefef}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current{text-align:center}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current:after{content:'';position:absolute;top:16px;left:14px;display:block;width:22px;height:18px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAOCAQAAAD+6Ta3AAAARklEQVR4Ae3SsRFEIQhAwW1IR2s3s6zTGUN+AxdK5tucAIBmOuKSY2pQbHHZVhgiweAnEixW1uC0VdSU41Xo19+te73+9AGOg1FzTMH13gAAAABJRU5ErkJggg==);background-size:22px}.uploadcare-responsive-panel .uploadcare-crop-sizes{top:auto;margin-bottom:15px}.uploadcare-responsive-panel .uploadcare-crop-size{margin:0 10px}}.uploadcare-crop-widget.jcrop-holder{direction:ltr;text-align:left;z-index:0}.uploadcare-crop-widget .jcrop-hline,.uploadcare-crop-widget .jcrop-vline{z-index:320}.uploadcare-crop-widget .jcrop-handle,.uploadcare-crop-widget .jcrop-hline,.uploadcare-crop-widget .jcrop-vline{position:absolute;font-size:0;background-color:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.2)}.uploadcare-crop-widget .jcrop-vline{height:100%;width:1px!important}.uploadcare-crop-widget .jcrop-hline{height:1px!important;width:100%}.uploadcare-crop-widget .jcrop-vline.right{right:0}.uploadcare-crop-widget .jcrop-hline.bottom{bottom:0}.uploadcare-crop-widget .jcrop-tracker{height:100%;width:100%;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.uploadcare-crop-widget .jcrop-handle{border-radius:50%;width:13px;height:13px;z-index:330}.uploadcare-crop-widget .jcrop-handle:after,.uploadcare-crop-widget .jcrop-handle:before{content:\"\";position:absolute;display:block;width:1px;height:1px;background:#fff}.uploadcare-crop-widget .jcrop-handle:before{width:3px;top:6px}.uploadcare-crop-widget .jcrop-handle:after{height:3px;left:6px}.uploadcare-crop-widget .jcrop-handle.ord-nw:before,.uploadcare-crop-widget .jcrop-handle.ord-sw:before{left:12px}.uploadcare-crop-widget .jcrop-handle.ord-ne:before,.uploadcare-crop-widget .jcrop-handle.ord-se:before{left:-2px}.uploadcare-crop-widget .jcrop-handle.ord-ne:after,.uploadcare-crop-widget .jcrop-handle.ord-nw:after{top:12px}.uploadcare-crop-widget .jcrop-handle.ord-se:after,.uploadcare-crop-widget .jcrop-handle.ord-sw:after{top:-2px}.uploadcare-crop-widget .jcrop-handle.ord-nw{left:0;margin-left:-6px;margin-top:-6px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-ne{margin-right:-6px;margin-top:-6px;right:0;top:0}.uploadcare-crop-widget .jcrop-handle.ord-se{bottom:0;margin-bottom:-6px;margin-right:-6px;right:0}.uploadcare-crop-widget .jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-6px;margin-left:-6px}.uploadcare-crop-widget img.jcrop-preview,.uploadcare-crop-widget.jcrop-holder img{max-width:none}.uploadcare-crop-widget{display:inline-block;vertical-align:middle;white-space:normal}.uploadcare-crop-widget .jcrop-handle>div{width:35px;height:35px;margin:-11px;background-color:transparent}.uploadcare-crop-widget>div:first-child{-webkit-transform:translateZ(0);transform:translateZ(0)}.uploadcare-crop-widget>img{-webkit-filter:grayscale(50%);filter:grayscale(50%)}.uploadcare-crop-sizes{display:none;visibility:hidden;position:relative;top:433px;text-align:center}.uploadcare-dialog-preview--with-sizes .uploadcare-crop-sizes{display:block}.uploadcare-dialog-preview--loaded .uploadcare-crop-sizes{visibility:visible}.uploadcare-crop-size{position:relative;display:inline-block;width:40px;height:40px;line-height:40px;margin:0 20px;font-size:.55em;cursor:pointer;color:#444}.uploadcare-crop-size div{box-sizing:border-box;width:40px;height:30px;display:inline-block;vertical-align:middle;border:1px solid #ccc}.uploadcare-crop-size:after{content:attr(data-caption);position:absolute;top:1px;left:0;width:100%;text-align:center;margin:0}.uploadcare-crop-size--current div{background:#fff}.uploadcare-widget{position:relative;display:inline-block;vertical-align:baseline;line-height:2}.uploadcare-widget :focus{outline:2px dotted #0094c0}.uploadcare-widget .uploadcare-mouse-focused:focus,.uploadcare-widget :active{outline:none}.uploadcare-widget-status-error .uploadcare-widget-button-open,.uploadcare-widget-status-error .uploadcare-widget-text,.uploadcare-widget-status-loaded .uploadcare-widget-text,.uploadcare-widget-status-ready .uploadcare-widget-button-open,.uploadcare-widget-status-started .uploadcare-widget-button-cancel,.uploadcare-widget-status-started .uploadcare-widget-status,.uploadcare-widget-status-started .uploadcare-widget-text{display:inline-block!important}.uploadcare-widget-option-clearable.uploadcare-widget-status-error .uploadcare-widget-button-open{display:none!important}.uploadcare-widget-option-clearable.uploadcare-widget-status-error .uploadcare-widget-button-remove,.uploadcare-widget-option-clearable.uploadcare-widget-status-loaded .uploadcare-widget-button-remove{display:inline-block!important}.uploadcare-widget-status{display:none!important;width:1.8em;height:1.8em;margin:-1em 1ex -1em 0;line-height:0;vertical-align:middle}.uploadcare-widget-circle--text .uploadcare-widget-circle-back{width:100%;height:100%;display:table;white-space:normal}.uploadcare-widget-circle--text .uploadcare-widget-circle-text{display:table-cell;vertical-align:middle;text-align:center;font-size:60%;line-height:1}.uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-widget-circle--canvas canvas{width:100%;height:100%}.uploadcare-widget-text{display:none!important;margin-right:1ex;white-space:nowrap}.uploadcare-widget-file-name,.uploadcare-widget-file-size{display:inline}.uploadcare-link,.uploadcare-link:link,.uploadcare-link:visited{cursor:pointer;color:#1a85ad;text-decoration:none;border-bottom:1px dotted #1a85ad;border-color:initial}.uploadcare-link:hover{color:#176e8f}.uploadcare-widget-button{display:none!important;color:#fff;padding:.4em .6em;line-height:1;margin:-1em .5ex -1em 0;border-radius:.25em;background:#c3c3c3;cursor:default;white-space:nowrap}.uploadcare-widget-button:hover{background:#b3b3b3}.uploadcare-widget-button-open{padding:.5em .8em;background:#18a5d0}.uploadcare-widget-button-open:hover{background:#0094c0}.uploadcare-widget-dragndrop-area{box-sizing:content-box;display:none;position:absolute;white-space:nowrap;top:50%;margin-top:-1.3em;left:-1em;padding:0 1em;line-height:2.6;min-width:100%;text-align:center;background-color:#f0f0f0;color:#707478;border:1px dashed #b3b5b6;border-radius:100px}.uploadcare-widget.uploadcare-dragging .uploadcare-widget-dragndrop-area{background-color:#f2f7fe;border-color:#438ae7;color:#438ae7}.uploadcare-dragging .uploadcare-widget-dragndrop-area{display:block}.uploadcare-dialog-opened .uploadcare-widget-dragndrop-area{display:none}\r\n");
    return __p.join("")},r.templates.JST["tab-camera"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-camera-holder"><!--\r\n  --><video class="uploadcare-dialog-camera-video uploadcare-dialog-camera--mirrored"></video><!--\r\n  --><div class="uploadcare-dialog-camera-message">\r\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\r\n\r\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-please-allow">\r\n      ',(""+t("dialog.tabs.camera.pleaseAllow.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n    </div>\r\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-please-allow">\r\n      ',(""+t("dialog.tabs.camera.pleaseAllow.text")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n    </div>\r\n\r\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-not-found">\r\n      ',(""+t("dialog.tabs.camera.notFound.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n    </div>\r\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-not-found">\r\n      ',(""+t("dialog.tabs.camera.notFound.text")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n    </div>\r\n\r\n    <div class="uploadcare-dialog-camera-retry uploadcare-dialog-button"\r\n         tabindex="0" role="button">\r\n      ',(""+t("dialog.tabs.camera.retry")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n    </div>\r\n  </div><!--\r\n--></div>\r\n<div class="uploadcare-dialog-camera-controls">\r\n  <div class="uploadcare-dialog-camera-mirror uploadcare-dialog-button"\r\n       tabindex="0" role="button">\r\n    ',(""+t("dialog.tabs.camera.mirror")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-capture uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(""+t("dialog.tabs.camera.capture")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-start-record uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(""+t("dialog.tabs.camera.startRecord")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-cancel-record uploadcare-dialog-button"\r\n       tabindex="0" role="button">\r\n    ',(""+t("dialog.tabs.camera.cancelRecord")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-stop-record uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(""+t("dialog.tabs.camera.stopRecord")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"\r\n  </div>\r\n</div>\r\n");return __p.join("")},r.templates.JST["tab-file"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-file-drop-area">\r\n  <div class="uploadcare-dialog-file-title uploadcare-if-draganddrop">\r\n    ',(""+t("dialog.tabs.file.drag")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-title uploadcare-if-no-draganddrop">\r\n    ',(""+t("dialog.tabs.file.nodrop")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-or uploadcare-if-draganddrop">\r\n    ',(""+t("dialog.tabs.file.or")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-clouds-tip uploadcare-if-mobile">\r\n    ',t("dialog.tabs.file.cloudsTip"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-big-button needsclick">\r\n    ',(""+t("dialog.tabs.file.button")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-or uploadcare-dialog-file-source-or">\r\n    ',(""+t("dialog.tabs.file.also")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-sources">\r\n  </div>\r\n</div>\r\n');return __p.join("")},r.templates.JST["tab-preview-error"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-error-tab-wrap uloadcare-dialog-error-tab-',(""+error).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'"><!--\r\n  --><div class="uploadcare-dialog-error-tab-wrap2">\r\n\r\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\r\n\r\n    <div class="uploadcare-dialog-title">',(""+t("dialog.tabs.preview.error."+error+".title")||t("dialog.tabs.preview.error.default.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n\r\n    <div class="uploadcare-dialog-normal-text">',(""+t("dialog.tabs.preview.error."+error+".text")||t("dialog.tabs.preview.error.default.text")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n\r\n    <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-back"\r\n         tabindex="0" role="button"\r\n            >',(""+t("dialog.tabs.preview.error."+error+".back")||t("dialog.tabs.preview.error.default.back")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n  </div>\r\n</div>\r\n");return __p.join("")},r.templates.JST["tab-preview-image"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-padding uploadcare-dialog-preview-root">\r\n  <div class="uploadcare-dialog-title uploadcare-dialog-preview-title">\r\n    ',(""+t("dialog.tabs.preview.image.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n\r\n  <div class="uploadcare-crop-sizes uploadcare-dialog-preview-crop-sizes">\r\n    <div class="uploadcare-crop-size" data-caption="free"><div></div></div>\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-preview-image-wrap"><!--\r\n    --><img\r\n        src="',(""+src).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'"\r\n        title="',(""+(name||"")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'"\r\n        alt="',(""+(name||"")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'"\r\n      class="uploadcare-dialog-preview-image"\r\n    />\r\n  </div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.image.change")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n</div>\r\n");
    return __p.join("")},r.templates.JST["tab-preview-multiple-file"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-file-item uploadcare-file-item_uploading">\r\n  <div class="uploadcare-file-item__preview">\r\n    <div class="uploadcare-file-icon"></div>\r\n  </div>\r\n  <div class="uploadcare-file-item__name">\r\n    ',(""+t("dialog.tabs.preview.unknownName")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n  <div class="uploadcare-file-item__progressbar">\r\n    <div class="uploadcare-progressbar">\r\n      <div class="uploadcare-progressbar__value"></div>\r\n    </div>\r\n  </div>\r\n  <div class="uploadcare-file-item__size"></div>\r\n  <div class="uploadcare-file-item__error"></div>\r\n  <div class="uploadcare-file-item__remove">\r\n    <div class="uploadcare-remove"></div>\r\n  </div>\r\n</div>\r\n');return __p.join("")},r.templates.JST["tab-preview-multiple"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-padding">\r\n  <div class="uploadcare-dialog-title uploadcare-if-no-mobile uploadcare-dpm-title"></div>\r\n  <div class="uploadcare-dialog-title uploadcare-if-mobile uploadcare-dpm-mobile-title"></div>\r\n\r\n  <div class="uploadcare-file-list"></div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.multiple.clear")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.multiple.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n  <div class="uploadcare-panel-footer-text uploadcare-dpm-footer-text"></div>\r\n</div>\r\n');return __p.join("")},r.templates.JST["tab-preview-regular"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-padding">\r\n  <div class="uploadcare-dialog-title">',(""+t("dialog.tabs.preview.regular.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n\r\n  <div class="uploadcare-dialog-label">\r\n    ',(""+(file.name||t("dialog.tabs.preview.unknownName"))).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"",(""+utils.readableFileSize(file.size,"",", ")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\r\n    ',(""+t("dialog.tabs.preview.regular.line1")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"<br/>\r\n    ",(""+t("dialog.tabs.preview.regular.line2")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.change")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n</div>\r\n");return __p.join("")},r.templates.JST["tab-preview-unknown"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-padding">\r\n\r\n  <div class="uploadcare-dialog-title">',(""+t("dialog.tabs.preview.unknown.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n\r\n  <div class="uploadcare-dialog-label uploadcare-dialog-preview-label"></div>\r\n\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.unknown.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n</div>\r\n");return __p.join("")},r.templates.JST["tab-preview-video"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-padding uploadcare-dialog-preview-root">\r\n  <div class="uploadcare-dialog-title uploadcare-dialog-preview-title">\r\n    ',(""+t("dialog.tabs.preview.video.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div>\r\n\r\n  <div class="uploadcare-crop-sizes uploadcare-dialog-preview-crop-sizes">\r\n    <div class="uploadcare-crop-size" data-caption="free"><div></div></div>\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-preview-video-wrap">\r\n    <video controls class="uploadcare-dialog-preview-video"></video>\r\n  </div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.video.change")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(""+t("dialog.tabs.preview.done")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n</div>\r\n");return __p.join("")},r.templates.JST["tab-url"]=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-dialog-title">',(""+t("dialog.tabs.url.title")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\r\n  <div>',(""+t("dialog.tabs.url.line1")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n  <div>",(""+t("dialog.tabs.url.line2")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div>\r\n</div>\r\n<form class="uploadcare-dialog-url-form">\r\n  <input type="text" class="uploadcare-dialog-input" placeholder="',(""+t("dialog.tabs.url.input")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'">\r\n  <button class="uploadcare-dialog-button uploadcare-dialog-url-submit" type="submit">',(""+t("dialog.tabs.url.button")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</button>\r\n</form>\r\n");return __p.join("")},r.templates.JST["widget-button"]=function(e){var __p=[],t=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div tabindex="0" role="button"\r\n     class="uploadcare-widget-button uploadcare-widget-button-',name,'"\r\n>',(""+caption).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"</div>\r\n");
    return __p.join("")},r.templates.JST["widget-file-name"]=function(e){var __p=[],t=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-widget-file-name uploadcare-link"\r\n     tabindex="0" role="link">',(""+utils.fitText(name,20)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'</div><!--\r\n--><div class="uploadcare-widget-file-size">,\r\n    ',(""+utils.readableFileSize(size)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),"\r\n</div>\r\n");return __p.join("")},r.templates.JST.widget=function(e){var __p=[],i=function(){__p.push.apply(__p,arguments)};with(e||{})__p.push('<div class="uploadcare-widget">\r\n  <div class="uploadcare-widget-dragndrop-area">\r\n    ',(""+t("draghere")).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;"),'\r\n  </div><div class="uploadcare-widget-status">\r\n  </div><div class="uploadcare-widget-text">\r\n</div></div>\r\n');return __p.join("")},function(){var e,t;e=r.jQuery,t=r.templates.tpl,r.settings.waitForSettings.add(function(i){var a,r;return a=t("styles",{settings:i}),r=n.createElement("style"),r.setAttribute("type","text/css"),null!=r.styleSheet?r.styleSheet.cssText=a:r.appendChild(n.createTextNode(a)),e("head").prepend(r)})}.call(this),function(t){t.Jcrop=function(e,i){var a=t.extend({},t.Jcrop.defaults),r,o;function l(e){return Math.round(e)+"px"}function s(e){return a.baseClass+"-"+e}function c(){return t.fx.step.hasOwnProperty("backgroundColor")}function u(e){var i=t(e).offset();return[i.left,i.top]}function d(e){return[e.pageX-r[0],e.pageY-r[1]]}function p(e){"object"!=typeof e&&(e={}),a=t.extend(a,e),t.each(["onChange","onSelect","onRelease","onDblClick"],function(e,t){"function"!=typeof a[t]&&(a[t]=function(){})})}function f(e,t){if(r=u(S),"move"===e)return $.activateHandlers(g(t),y);var i=J.getFixed(),a=m(e),n=J.getCorner(m(a));J.setPressed(J.getCorner(a)),J.setCurrent(n),$.activateHandlers(h(e,i),y)}function h(e,t){return function(i){if(a.aspectRatio)switch(e){case"e":i[1]=t.y+1;break;case"w":i[1]=t.y+1;break;case"n":i[0]=t.x+1;break;case"s":i[0]=t.x+1}else switch(e){case"e":i[1]=t.y2;break;case"w":i[1]=t.y2;break;case"n":i[0]=t.x2;break;case"s":i[0]=t.x2}J.setCurrent(i),X.update()}}function g(e){var t=e;return Z.watchKeys(),function(e){J.moveOffset([e[0]-t[0],e[1]-t[1]]),t=e,X.update()}}function m(e){switch(e){case"n":return"sw";case"s":return"nw";case"e":return"nw";case"w":return"ne";case"ne":return"sw";case"nw":return"se";case"se":return"nw";case"sw":return"ne"}}function v(e){return function(t){return a.disabled?!1:"move"!==e||a.allowMove?(r=u(S),K=!0,f(e,d(t)),t.stopPropagation(),t.preventDefault(),!1):!1}}function b(e,t,i){var a=e.width(),r=e.height();a>t&&t>0&&(a=t,r=t/e.width()*e.height()),r>i&&i>0&&(r=i,a=i/e.height()*e.width()),q=e.width()/a,V=e.height()/r,e.width(a).height(r)}function _(e){return{x:e.x*q,y:e.y*V,x2:e.x2*q,y2:e.y2*V,w:e.w*q,h:e.h*V}}function y(e){var t=J.getFixed();X.enableHandles(),X.done()}function w(e){J.setCurrent(e),X.update()}function x(){var e=t("<div></div>").addClass(s("tracker"));return e.css({opacity:0,backgroundColor:"white"}),e}"object"!=typeof e&&(e=t(e)[0]),"object"!=typeof i&&(i={}),p(i);var k={border:"none",visibility:"visible",margin:0,padding:0,position:"absolute",top:0,left:0},C=t(e),A=!0;if("IMG"==e.tagName){if(0!=C[0].width&&0!=C[0].height)C.width(C[0].width),C.height(C[0].height);else{var T=new Image;T.src=C[0].src,C.width(T.width),C.height(T.height)}var S=C.clone().removeAttr("id").css(k).show();S.width(C.width()),S.height(C.height()),C.after(S).hide()}else S=C.css(k).show(),A=!1,null===a.shade&&(a.shade=!0);b(S,a.boxWidth,a.boxHeight);var z=S.width(),j=S.height(),F=t("<div />").width(z).height(j).addClass(s("holder")).css({position:"relative",backgroundColor:a.bgColor}).insertAfter(C).append(S);a.addClass&&F.addClass(a.addClass);var D=t("<div />"),I=t("<div />").width("100%").height("100%").css({zIndex:310,position:"absolute",overflow:"hidden"}),E=t("<div />").css({position:"absolute",zIndex:600}).dblclick(function(){var e=J.getFixed();a.onDblClick.call(pe,e)}).insertBefore(S).append(I);A&&(D=t("<img />").attr("src",S.attr("src")).css(k).width(z).height(j),I.append(D));var P=a.boundary,O=x().width(z+2*P).height(j+2*P).css({position:"absolute",top:l(-P),left:l(-P),zIndex:290}),U=a.bgColor,R=a.bgOpacity,M,L,B,N,q,V,W=!0,K,H,G;r=u(S);var Q=function(){function e(){var e={},t=["touchstart","touchmove","touchend"],i=n.createElement("div"),a;try{for(a=0;a<t.length;a++){var r=t[a];r="on"+r;var o=r in i;o||(i.setAttribute(r,"return;"),o="function"==typeof i[r]),e[t[a]]=o}return e.touchstart&&e.touchend&&e.touchmove}catch(l){return!1}}function t(){return a.touchSupport===!0||a.touchSupport===!1?a.touchSupport:e()}return{createDragger:function(e){return function(t){return t.pageX=t.originalEvent.changedTouches[0].pageX,t.pageY=t.originalEvent.changedTouches[0].pageY,a.disabled?!1:"move"!==e||a.allowMove?(K=!0,f(e,d(t)),t.stopPropagation(),t.preventDefault(),!1):!1}},isSupported:e,support:t()}}(),J=function(){var e=0,t=0,i=0,r=0,n,o;function l(a){a=f(a),i=e=a[0],r=t=a[1]}function s(e){e=f(e),n=e[0]-i,o=e[1]-r,i=e[0],r=e[1]}function c(){return[n,o]}function u(a){var n=a[0],o=a[1];0>e+n&&(n-=n+e),0>t+o&&(o-=o+t),r+o>j&&(o+=j-(r+o)),i+n>z&&(n+=z-(i+n)),e+=n,i+=n,t+=o,r+=o}function d(e){var t=p();switch(e){case"ne":return[t.x2,t.y];case"nw":return[t.x,t.y];case"se":return[t.x2,t.y2];case"sw":return[t.x,t.y2]}}function p(){if(!a.aspectRatio)return g();var n=a.aspectRatio,o=a.minSize[0]/q,l=a.maxSize[0]/q,s=a.maxSize[1]/V,c=i-e,u=r-t,d=Math.abs(c),p=Math.abs(u),f=d/p,v,b,_,y;return 0===l&&(l=10*z),0===s&&(s=10*j),n>f?(b=r,_=p*n,v=0>c?e-_:_+e,0>v?(v=0,y=Math.abs((v-e)/n),b=0>u?t-y:y+t):v>z&&(v=z,y=Math.abs((v-e)/n),b=0>u?t-y:y+t)):(v=i,y=d/n,b=0>u?t-y:t+y,0>b?(b=0,_=Math.abs((b-t)*n),v=0>c?e-_:_+e):b>j&&(b=j,_=Math.abs(b-t)*n,v=0>c?e-_:_+e)),v>e?(o>v-e?v=e+o:v-e>l&&(v=e+l),b=b>t?t+(v-e)/n:t-(v-e)/n):e>v&&(o>e-v?v=e-o:e-v>l&&(v=e-l),b=b>t?t+(e-v)/n:t-(e-v)/n),0>v?(e-=v,v=0):v>z&&(e-=v-z,v=z),0>b?(t-=b,b=0):b>j&&(t-=b-j,b=j),m(h(e,t,v,b))}function f(e){return e[0]<0&&(e[0]=0),e[1]<0&&(e[1]=0),e[0]>z&&(e[0]=z),e[1]>j&&(e[1]=j),[e[0],e[1]]}function h(e,t,i,a){var r=e,n=i,o=t,l=a;return e>i&&(r=i,n=e),t>a&&(o=a,l=t),[r,o,n,l]}function g(){var a=i-e,n=r-t,o;return M&&Math.abs(a)>M&&(i=a>0?e+M:e-M),L&&Math.abs(n)>L&&(r=n>0?t+L:t-L),N/V&&Math.abs(n)<N/V&&(r=n>0?t+N/V:t-N/V),B/q&&Math.abs(a)<B/q&&(i=a>0?e+B/q:e-B/q),0>e&&(i-=e,e-=e),0>t&&(r-=t,t-=t),0>i&&(e-=i,i-=i),0>r&&(t-=r,r-=r),i>z&&(o=i-z,e-=o,i-=o),r>j&&(o=r-j,t-=o,r-=o),e>z&&(o=e-j,r-=o,t-=o),t>j&&(o=t-j,r-=o,t-=o),m(h(e,t,i,r))}function m(e){return{x:e[0],y:e[1],x2:e[2],y2:e[3],w:e[2]-e[0],h:e[3]-e[1]}}return{flipCoords:h,setPressed:l,setCurrent:s,getOffset:c,moveOffset:u,getCorner:d,getFixed:p}}(),Y=function(){var e=!1,i=t("<div />").css({position:"absolute",zIndex:240,opacity:0}),r={top:c(),left:c().height(j),right:c().height(j),bottom:c()};function n(e,t){r.left.css({height:l(t)}),r.right.css({height:l(t)})}function o(){return s(J.getFixed())}function s(e){r.top.css({left:l(e.x),width:l(e.w),height:l(e.y)}),r.bottom.css({top:l(e.y2),left:l(e.x),width:l(e.w),height:l(j-e.y2)}),r.right.css({left:l(e.x2),width:l(z-e.x2)}),r.left.css({width:l(e.x)})}function c(){return t("<div />").css({position:"absolute",backgroundColor:a.shadeColor||a.bgColor}).appendTo(i)}function u(){e||(e=!0,i.insertBefore(S),o(),X.setBgOpacity(1,0,1),D.hide(),d(a.shadeColor||a.bgColor,1),X.isAwake()?f(a.bgOpacity,1):f(1,1))}function d(e,t){ue(g(),e,t)}function p(){e&&(i.remove(),D.show(),e=!1,X.isAwake()?X.setBgOpacity(a.bgOpacity,1,1):(X.setBgOpacity(1,1,1),X.disableHandles()),ue(F,0,1))}function f(t,r){e&&(a.bgFade&&!r?i.animate({opacity:1-t},{queue:!1,duration:a.fadeTime}):i.css({opacity:1-t}))}function h(){a.shade?u():p(),X.isAwake()&&f(a.bgOpacity)}function g(){return i.children()}return{update:o,updateRaw:s,getShades:g,setBgColor:d,enable:u,disable:p,
    resize:n,refresh:h,opacity:f}}(),X=function(){var e,i={},r={},o={},c=!1;function u(e){var i=t("<div />").css({position:"absolute"}).addClass(s(e));return E.append(i),i}function d(e){var i=t("<div />").mousedown(v(e)).css({cursor:e+"-resize",position:"absolute"}).append("<div/>").addClass("ord-"+e);return Q.support&&i.on("touchstart.jcrop",Q.createDragger(e)),E.append(i),i}function p(e){return d(e).addClass(s("handle"))}function f(e){var t,a;for(a=0;a<e.length;a++){switch(e[a]){case"n":t="hline";break;case"s":t="hline bottom";break;case"e":t="vline right";break;case"w":t="vline"}i[e[a]]=u(t)}}function h(e){var t;for(t=0;t<e.length;t++)r[e[t]]=p(e[t])}function g(e,t){a.shade||D.css({top:l(-t),left:l(-e)}),E.css({top:l(t),left:l(e)})}function m(e,t){E.width(Math.round(e)).height(Math.round(t))}function b(){var e=J.getFixed();J.setPressed([e.x,e.y]),J.setCurrent([e.x2,e.y2]),y()}function y(t){return e?w(t):void 0}function w(t){var i=J.getFixed();m(i.w,i.h),g(i.x,i.y),a.shade&&Y.updateRaw(i),e||C(),t?a.onSelect.call(pe,_(i)):a.onChange.call(pe,_(i))}function k(t,i,r){(e||i)&&(a.bgFade&&!r?S.animate({opacity:t},{queue:!1,duration:a.fadeTime}):S.css("opacity",t))}function C(){E.show(),a.shade?Y.opacity(R):k(R,!0),e=!0}function A(){z(),E.hide(),a.shade?Y.opacity(1):k(1),e=!1,a.onRelease.call(pe)}function T(){return c=!0,a.allowResize?!0:void 0}function z(){c=!1}function j(e){e?(H=!0,z()):(H=!1,T())}function F(){j(!1),b()}t.isArray(a.createHandles)&&h(a.createHandles),a.drawBorders&&t.isArray(a.createBorders)&&f(a.createBorders),t(n).on("touchstart.jcrop-ios",function(e){t(e.currentTarget).hasClass("jcrop-tracker")&&e.stopPropagation()});var P=x().mousedown(v("move")).css({cursor:"move",position:"absolute",zIndex:360});return Q.support&&P.on("touchstart.jcrop",Q.createDragger("move")),I.append(P),z(),{updateVisible:y,update:w,release:A,refresh:b,isAwake:function(){return e},setCursor:function(e){P.css("cursor",e)},enableHandles:T,enableOnly:function(){c=!0},disableHandles:z,animMode:j,setBgOpacity:k,done:F}}(),$=function(){var e=function(){},i=function(){},r=a.trackDocument;function o(){O.css({zIndex:450}),Q.support&&t(n).on("touchmove.jcrop",p).on("touchend.jcrop",f),r&&t(n).on("mousemove.jcrop",s).on("mouseup.jcrop",c)}function l(){O.css({zIndex:290}),t(n).off(".jcrop")}function s(t){return e(d(t)),!1}function c(t){return t.preventDefault(),t.stopPropagation(),K&&(K=!1,i(d(t)),X.isAwake()&&a.onSelect.call(pe,_(J.getFixed())),l(),e=function(){},i=function(){}),!1}function u(t,a){return K=!0,e=t,i=a,o(),!1}function p(e){return e.pageX=e.originalEvent.changedTouches[0].pageX,e.pageY=e.originalEvent.changedTouches[0].pageY,s(e)}function f(e){return e.pageX=e.originalEvent.changedTouches[0].pageX,e.pageY=e.originalEvent.changedTouches[0].pageY,c(e)}return r||O.mousemove(s).mouseup(c).mouseout(c),S.before(O),{activateHandlers:u}}(),Z=function(){var e=t('<input type="radio" />').css({position:"fixed",left:"-120px",width:"12px"}).addClass("jcrop-keymgr"),i=t("<div />").css({position:"absolute",overflow:"hidden"}).append(e);function r(){a.keySupport&&(e.show(),e.focus())}function n(t){e.hide()}function o(e,t,i){a.allowMove&&(J.moveOffset([t,i]),X.updateVisible(!0)),e.preventDefault(),e.stopPropagation()}function l(e){if(e.ctrlKey||e.metaKey)return!0;G=e.shiftKey?!0:!1;var t=G?10:1;switch(e.keyCode){case 37:o(e,-t,0);break;case 39:o(e,t,0);break;case 38:o(e,0,-t);break;case 40:o(e,0,t);break;case 9:return!0}return!1}return a.keySupport&&(e.keydown(l).blur(n),e.css({position:"absolute",left:"-20px"}),i.append(e).insertBefore(S)),{watchKeys:r}}();function ee(e){F.removeClass().addClass(s("holder")).addClass(e)}function te(e){ie([e[0]/q,e[1]/V,e[2]/q,e[3]/V]),a.onSelect.call(pe,_(J.getFixed())),X.enableHandles()}function ie(e){J.setPressed([e[0],e[1]]),J.setCurrent([e[2],e[3]]),X.update()}function ae(){return _(J.getFixed())}function re(){return J.getFixed()}function ne(e){p(e),de()}function oe(){a.disabled=!0,X.disableHandles(),X.setCursor("default")}function le(){a.disabled=!1,de()}function se(){X.done(),$.activateHandlers(null,null)}function ce(){F.remove(),C.show(),C.css("visibility","visible"),t(e).removeData("Jcrop")}function ue(e,t,i){var r=t||a.bgColor;a.bgFade&&c()&&a.fadeTime&&!i?e.animate({backgroundColor:r},{queue:!1,duration:a.fadeTime}):e.css("backgroundColor",r)}function de(e){a.allowResize?e?X.enableOnly():X.enableHandles():X.disableHandles(),X.setCursor(a.allowMove?"move":"default"),a.hasOwnProperty("trueSize")&&(q=a.trueSize[0]/z,V=a.trueSize[1]/j),a.hasOwnProperty("setSelect")&&(te(a.setSelect),X.done(),delete a.setSelect),Y.refresh(),a.bgColor!=U&&(ue(a.shade?Y.getShades():F,a.shade?a.shadeColor||a.bgColor:a.bgColor),U=a.bgColor),R!=a.bgOpacity&&(R=a.bgOpacity,a.shade?Y.refresh():X.setBgOpacity(R)),M=a.maxSize[0]||0,L=a.maxSize[1]||0,B=a.minSize[0]||0,N=a.minSize[1]||0,a.hasOwnProperty("outerImage")&&(S.attr("src",a.outerImage),delete a.outerImage),X.refresh()}de(!0);var pe={setSelect:te,setOptions:ne,tellSelect:ae,tellScaled:re,setClass:ee,disable:oe,enable:le,cancel:se,release:X.release,destroy:ce,focus:Z.watchKeys,getBounds:function(){return[z*q,j*V]},getWidgetSize:function(){return[z,j]},getScaleFactor:function(){return[q,V]},getOptions:function(){return a},ui:{holder:F,selection:E}};return C.data("Jcrop",pe),pe},t.fn.Jcrop=function(e,i){var a;return this.each(function(){if(t(this).data("Jcrop")){if("api"===e)return t(this).data("Jcrop");t(this).data("Jcrop").setOptions(e)}else"IMG"==this.tagName?t.Jcrop.Loader(this,function(){t(this).css({display:"block",visibility:"hidden"}),a=t.Jcrop(this,e),t.isFunction(i)&&i.call(a)}):(t(this).css({display:"block",visibility:"hidden"}),a=t.Jcrop(this,e),t.isFunction(i)&&i.call(a))}),this},t.Jcrop.Loader=function(i,a,r){var n=t(i),o=n[0];function l(){o.complete?(n.off(".jcloader"),t.isFunction(a)&&a.call(o)):e.setTimeout(l,50)}n.on("load.jcloader",l).on("error.jcloader",function(e){n.off(".jcloader"),t.isFunction(r)&&r.call(o)}),o.complete&&t.isFunction(a)&&(n.off(".jcloader"),a.call(o))},t.Jcrop.defaults={allowMove:!0,allowResize:!0,trackDocument:!0,baseClass:"jcrop",addClass:null,bgColor:"black",bgOpacity:.6,bgFade:!1,aspectRatio:0,keySupport:!0,createHandles:["n","s","e","w","nw","ne","se","sw"],createBorders:["n","s","e","w"],drawBorders:!0,dragEdges:!0,fixedSupport:!0,touchSupport:null,shade:null,boxWidth:0,boxHeight:0,boundary:2,fadeTime:400,animationDelay:20,swingSpeed:3,maxSize:[0,0],minSize:[0,0],onChange:function(){},onSelect:function(){},onDblClick:function(){},onRelease:function(){}}}(r.jQuery),function(){var e,t;e=r.jQuery,t=r.utils,r.namespace("crop",function(i){return i.CropWidget=function(){var i;function a(t,i,a){this.element=t,this.originalSize=i,null==a&&(a={}),this.__api=e.Jcrop(this.element[0],{trueSize:this.originalSize,addClass:"uploadcare-crop-widget",createHandles:["nw","ne","se","sw"],bgColor:"transparent",bgOpacity:.8}),this.setCrop(a),this.setSelection()}return a.prototype.setCrop=function(e){return this.crop=e,this.__api.setOptions({aspectRatio:e.preferedSize?e.preferedSize[0]/e.preferedSize[1]:0,minSize:e.notLess?t.fitSize(e.preferedSize,this.originalSize):[0,0]})},a.prototype.setSelection=function(e){var i,a,r,n;return e?(i=e.center,r=[e.width,e.height]):(i=!0,r=this.originalSize),this.crop.preferedSize&&(r=t.fitSize(this.crop.preferedSize,r,!0)),i?(a=(this.originalSize[0]-r[0])/2,n=(this.originalSize[1]-r[1])/2):(a=e.left||0,n=e.top||0),this.__api.setSelect([a,n,r[0]+a,r[1]+n])},i=/-\/crop\/([0-9]+)x([0-9]+)(\/(center|([0-9]+),([0-9]+)))?\//i,a.prototype.__parseModifiers=function(e){var t;return(t=null!=e?e.match(i):void 0)?{width:parseInt(t[1],10),height:parseInt(t[2],10),center:"center"===t[4],left:parseInt(t[5],10)||void 0,top:parseInt(t[6],10)||void 0}:void 0},a.prototype.setSelectionFromModifiers=function(e){return this.setSelection(this.__parseModifiers(e))},a.prototype.getSelection=function(){var e,t,i;return e=this.__api.tellSelect(),t=Math.round(Math.max(0,e.x)),i=Math.round(Math.max(0,e.y)),{left:t,top:i,width:Math.round(Math.min(this.originalSize[0],e.x2))-t,height:Math.round(Math.min(this.originalSize[1],e.y2))-i}},a.prototype.applySelectionToFile=function(e){
    return t.applyCropSelectionToFile(e,this.crop,this.originalSize,this.getSelection())},a}()})}.call(this),function(){var e,t,i,a,n=function(e,t){return function(){return e.apply(t,arguments)}},o=[].slice;t=r.namespace,i=r.settings,e=r.jQuery,a=r.utils,t("files",function(t){return t.BaseFile=function(){function t(t,i,a){var r;this.settings=i,this.sourceInfo=null!=a?a:{},this.__extendApi=n(this.__extendApi,this),this.__cancel=n(this.__cancel,this),this.__resolveApi=n(this.__resolveApi,this),this.__rejectApi=n(this.__rejectApi,this),this.__runValidators=n(this.__runValidators,this),this.__fileInfo=n(this.__fileInfo,this),this.__handleFileData=n(this.__handleFileData,this),this.__updateInfo=n(this.__updateInfo,this),this.__completeUpload=n(this.__completeUpload,this),this.fileId=null,this.fileName=null,this.sanitizedName=null,this.fileSize=null,this.isStored=null,this.cdnUrlModifiers=null,this.isImage=null,this.imageInfo=null,this.mimeType=null,this.s3Bucket=null,(r=this.sourceInfo).source||(r.source=this.sourceName),this.onInfoReady=e.Callbacks("once memory"),this.__setupValidation(),this.__initApi()}return t.prototype.__startUpload=function(){return e.Deferred().resolve()},t.prototype.__completeUpload=function(){var e,t,i,r,n=this;return i=0,this.settings.debugUploads&&(a.debug("Load file info.",this.fileId,this.settings.publicKey),t=setInterval(function(){return a.debug("Still waiting for file ready.",i,n.fileId,n.settings.publicKey)},5e3),this.apiDeferred.done(function(){return a.debug("File uploaded.",i,n.fileId,n.settings.publicKey)}).always(function(){return clearInterval(t)})),r=100,(e=function(){return"pending"===n.apiDeferred.state()?(i+=1,n.__updateInfo().done(function(){return setTimeout(e,r),r+=50})):void 0})()},t.prototype.__updateInfo=function(){var e=this;return a.jsonp(""+this.settings.urlBase+"/info/",{jsonerrors:1,file_id:this.fileId,pub_key:this.settings.publicKey,wait_is_ready:+this.onInfoReady.fired()}).fail(function(t){return e.settings.debugUploads&&a.log("Can't load file info. Probably removed.",e.fileId,e.settings.publicKey,t),e.__rejectApi("info")}).done(this.__handleFileData)},t.prototype.__handleFileData=function(e){return this.fileName=e.original_filename,this.sanitizedName=e.filename,this.fileSize=e.size,this.isImage=e.is_image,this.imageInfo=e.image_info,this.mimeType=e.mime_type,this.isStored=e.is_stored,this.s3Bucket=e.s3_bucket,e.default_effects&&(this.cdnUrlModifiers="-/"+e.default_effects),this.s3Bucket&&this.cdnUrlModifiers&&this.__rejectApi("baddata"),this.onInfoReady.fired()||this.onInfoReady.fire(this.__fileInfo()),e.is_ready?this.__resolveApi():void 0},t.prototype.__progressInfo=function(){var e;return{state:this.__progressState,uploadProgress:this.__progress,progress:"ready"===(e=this.__progressState)||"error"===e?1:.9*this.__progress,incompleteFileInfo:this.__fileInfo()}},t.prototype.__fileInfo=function(){var e;return e=this.s3Bucket?"https://"+this.s3Bucket+".s3.amazonaws.com/"+this.fileId+"/"+this.sanitizedName:""+this.settings.cdnBase+"/"+this.fileId+"/",{uuid:this.fileId,name:this.fileName,size:this.fileSize,isStored:this.isStored,isImage:!this.s3Bucket&&this.isImage,originalImageInfo:this.imageInfo,mimeType:this.mimeType,originalUrl:this.fileId?e:null,cdnUrl:this.fileId?""+e+(this.cdnUrlModifiers||""):null,cdnUrlModifiers:this.cdnUrlModifiers,sourceInfo:this.sourceInfo}},t.prototype.__setupValidation=function(){return this.validators=this.settings.validators||this.settings.__validators||[],this.settings.imagesOnly&&this.validators.push(function(e){if(e.isImage===!1)throw new Error("image")}),this.onInfoReady.add(this.__runValidators)},t.prototype.__runValidators=function(e){var t,i,a,r,n,o;e=e||this.__fileInfo();try{for(n=this.validators,o=[],a=0,r=n.length;r>a;a++)i=n[a],o.push(i(e));return o}catch(l){return t=l,this.__rejectApi(t.message)}},t.prototype.__initApi=function(){return this.apiDeferred=e.Deferred(),this.__progressState="uploading",this.__progress=0,this.__notifyApi()},t.prototype.__notifyApi=function(){return this.apiDeferred.notify(this.__progressInfo())},t.prototype.__rejectApi=function(e){return this.__progressState="error",this.__notifyApi(),this.apiDeferred.reject(e,this.__fileInfo())},t.prototype.__resolveApi=function(){return this.__progressState="ready",this.__notifyApi(),this.apiDeferred.resolve(this.__fileInfo())},t.prototype.__cancel=function(){return this.__rejectApi("user")},t.prototype.__extendApi=function(e){var t=this;return e.cancel=this.__cancel,e.pipe=e.then=function(){return t.__extendApi(a.fixedPipe.apply(a,[e].concat(o.call(arguments))))},e},t.prototype.promise=function(){var e,t=this;return this.__apiPromise||(this.__apiPromise=this.__extendApi(this.apiDeferred.promise()),this.__runValidators(),"pending"===this.apiDeferred.state()&&(e=this.__startUpload(),e.done(function(){return t.__progressState="uploaded",t.__progress=1,t.__notifyApi(),t.__completeUpload()}),e.progress(function(e){return e>t.__progress?(t.__progress=e,t.__notifyApi()):void 0}),e.fail(function(){return t.__rejectApi("upload")}),this.apiDeferred.always(e.reject))),this.__apiPromise},t}()}),t("utils",function(e){return e.isFile=function(e){return e&&e.done&&e.fail&&e.cancel},e.valueToFile=function(t,i){return t&&!e.isFile(t)&&(t=r.fileFrom("uploaded",t,i)),t||null}})}.call(this),function(){var t,i,a,o,l,s,c;t=r.jQuery,l=r.utils,s=r.utils,c=s.abilities,i=c.Blob,a=c.FileReader,o=c.URL,r.namespace("utils.image",function(r){var s,c;return s=e.DataView,c=l.taskRunner(1),r.shrinkFile=function(e,a){var n,u=this;return n=t.Deferred(),o&&s&&i?(c(function(t){var i;return n.always(t),i=l.imageLoader(o.createObjectURL(e)),i.always(function(e){return o.revokeObjectURL(e.src)}),i.fail(function(){return n.reject("not image")}),i.done(function(t){return n.notify(.1),r.getExif(e).always(function(e){var o,s;return n.notify(.2),s="resolved"===this.state(),i=r.shrinkImage(t,a),i.progress(function(e){return n.notify(.2+.6*e)}),i.fail(n.reject),i.done(function(t){var o,c;return o="image/jpeg",c=a.quality||.8,!s&&r.hasTransparency(t)&&(o="image/png",c=void 0),l.canvasToBlob(t,o,c,function(a){return t.width=t.height=1,n.notify(.9),e?(i=r.replaceJpegChunk(a,225,[e.buffer]),i.done(n.resolve),i.fail(function(){return n.resolve(a)})):n.resolve(a)})}),o=null})})}),n.promise()):n.reject("support")},r.shrinkImage=function(e,i){var a,r,o,s,c,u,d,p,f,h,g,m,v,b;return r=t.Deferred(),v=.71,e.width*v*e.height*v<i.size?r.reject("not required"):(m=d=e.width,g=e.height,p=m/g,b=Math.floor(Math.sqrt(i.size*p)),o=Math.floor(i.size/Math.sqrt(i.size*p)),u=5e6,c=4096,f=function(){return b>=m?void r.resolve(e):l.defer(function(){var t;return m=Math.round(m*v),g=Math.round(g*v),b>m*v&&(m=b,g=o),m*g>u&&(m=Math.floor(Math.sqrt(u*p)),g=Math.floor(u/Math.sqrt(u*p))),m>c&&(m=c,g=Math.round(m/p)),g>c&&(g=c,m=Math.round(p*g)),t=n.createElement("canvas"),t.width=m,t.height=g,t.getContext("2d").drawImage(e,0,0,m,g),e.src="//:0",e.width=e.height=1,e=t,r.notify((d-m)/(d-b)),f()})},h=function(){var t,i;return t=n.createElement("canvas"),t.width=b,t.height=o,i=t.getContext("2d"),i.imageSmoothingQuality="high",i.drawImage(e,0,0,b,o),e.src="//:0",e.width=e.height=1,r.resolve(t)},a=n.createElement("canvas").getContext("2d"),s=navigator.userAgent.match(/\ Chrome\//),"imageSmoothingQuality"in a&&!s?h():f(),r.promise())},r.drawFileToCanvas=function(e,i,a,s,c){var u,d;return u=t.Deferred(),o?(d=l.imageLoader(o.createObjectURL(e)),d.always(function(e){return o.revokeObjectURL(e.src)}),d.fail(function(){return u.reject("not image")}),d.done(function(t){return u.always(function(){return t.src="//:0"}),c&&t.width*t.height>c?u.reject("max source"):r.getExif(e).always(function(e){var o,c,d,p,f,h,g,m,v,b;return f=r.parseExifOrientation(e)||1,g=f>4,h=g?[t.height,t.width]:[t.width,t.height],v=l.fitSize(h,[i,a]),p=v[0],d=v[1],(m=[[1,0,0,1,0,0],[-1,0,0,1,p,0],[-1,0,0,-1,p,d],[1,0,0,-1,0,d],[0,1,1,0,0,0],[0,1,-1,0,p,0],[0,-1,-1,0,p,d],[0,-1,1,0,0,d]][f-1])?(o=n.createElement("canvas"),o.width=p,o.height=d,c=o.getContext("2d"),c.transform.apply(c,m),g&&(b=[d,p],p=b[0],d=b[1]),s&&(c.fillStyle=s,c.fillRect(0,0,p,d)),c.drawImage(t,0,0,p,d),u.resolve(o,h)):u.reject("bad image");
    })}),u.promise()):u.reject("support")},r.readJpegChunks=function(e){var i,r,n,o,l;return l=function(e,t){var r;return r=new a,r.onload=function(){return t(new s(r.result))},r.onerror=function(e){return i.reject("reader",e)},r.readAsArrayBuffer(e)},n=function(){return l(e.slice(r,r+128),function(e){var t,i,a;for(t=i=0,a=e.byteLength;a>=0?a>i:i>a;t=a>=0?++i:--i)if(255===e.getUint8(t)){r+=t;break}return o()})},o=function(){var t;return t=r,l(e.slice(r,r+=4),function(a){var o,s;return 4!==a.byteLength||255!==a.getUint8(0)?i.reject("corrupted"):(s=a.getUint8(1),218===s?i.resolve():(o=a.getUint16(2)-2,l(e.slice(r,r+=o),function(e){return e.byteLength!==o?i.reject("corrupted"):(i.notify(t,o,s,e),n())})))})},i=t.Deferred(),a&&s?(r=2,l(e.slice(0,2),function(e){return 65496!==e.getUint16(0)?i.reject("not jpeg"):n()}),i.promise()):i.reject("support")},r.replaceJpegChunk=function(e,a,n){var o,l,c,u;return o=t.Deferred(),c=[],l=[],u=r.readJpegChunks(e),u.fail(o.reject),u.progress(function(e,t,i){return i===a?(c.push(e),l.push(t)):void 0}),u.done(function(){var t,r,u,d,p,f,h,g,m;for(d=[e.slice(0,2)],f=0,g=n.length;g>f;f++)t=n[f],u=new s(new ArrayBuffer(4)),u.setUint16(0,65280+a),u.setUint16(2,t.byteLength+2),d.push(u.buffer),d.push(t);for(p=2,r=h=0,m=c.length;m>=0?m>h:h>m;r=m>=0?++h:--h)c[r]>p&&d.push(e.slice(p,c[r])),p=c[r]+l[r]+4;return d.push(e.slice(p,e.size)),o.resolve(new i(d,{type:e.type}))}),o.promise()},r.getExif=function(e){var i,a;return i=null,a=r.readJpegChunks(e),a.progress(function(e,t,a,r){return!i&&225===a&&r.byteLength>=14&&1165519206===r.getUint32(0)&&0===r.getUint16(4)?i=r:void 0}),a.then(function(){return i},function(e){return t.Deferred().reject(i,e)})},r.parseExifOrientation=function(e){var t,i,a,r,n;if(!e||e.byteLength<14||1165519206!==e.getUint32(0)||0!==e.getUint16(4))return null;if(18761===e.getUint16(6))a=!0;else{if(19789!==e.getUint16(6))return null;a=!1}if(42!==e.getUint16(8,a))return null;for(r=8+e.getUint32(10,a),t=e.getUint16(r-2,a),i=n=0;t>=0?t>n:n>t;i=t>=0?++n:--n){if(e.byteLength<r+10)return null;if(274===e.getUint16(r,a))return e.getUint16(r+8,a);r+=12}return null},r.hasTransparency=function(e){var t,i,a,r,o,l,s;for(o=50,t=n.createElement("canvas"),t.width=t.height=o,i=t.getContext("2d"),i.drawImage(e,0,0,o,o),a=i.getImageData(0,0,o,o).data,t.width=t.height=1,r=l=3,s=a.length;s>l;r=l+=4)if(a[r]<254)return!0;return!1}})}.call(this),function(){var e,t,i=function(e,t){return function(){return e.apply(t,arguments)}},a={}.hasOwnProperty,n=function(e,t){for(var i in t)a.call(t,i)&&(e[i]=t[i]);function r(){this.constructor=e}return r.prototype=t.prototype,e.prototype=new r,e.__super__=t.prototype,e};e=r.jQuery,t=r.utils,r.namespace("files",function(a){return a.ObjectFile=function(a){var r;n(o,a),r=null,o.prototype.sourceName="local";function o(e){this.__file=e,this.setFile=i(this.setFile,this),o.__super__.constructor.apply(this,arguments),this.fileName=this.__file.name||"original",this.__notifyApi()}return o.prototype.setFile=function(e){return e&&(this.__file=e),this.sourceInfo.file=this.__file,this.__file?(this.fileSize=this.__file.size,this.fileType=this.__file.type||"application/octet-stream",this.settings.debugUploads&&t.debug("Use local file.",this.fileName,this.fileType,this.fileSize),this.__runValidators(),this.__notifyApi()):void 0},o.prototype.__startUpload=function(){var i,a,r,n=this;return this.apiDeferred.always(function(){return n.__file=null}),this.__file.size>=this.settings.multipartMinSize&&t.abilities.Blob?(this.setFile(),this.multipartUpload()):(a=t.abilities.iOSVersion,!this.settings.imageShrink||a&&8>a?(this.setFile(),this.directUpload()):(i=e.Deferred(),r=.4,t.image.shrinkFile(this.__file,this.settings.imageShrink).progress(function(e){return i.notify(e*r)}).done(this.setFile).fail(function(){return n.setFile(),r=.1*r}).always(function(){return i.notify(r),n.directUpload().done(i.resolve).fail(i.reject).progress(function(e){return i.notify(r+e*(1-r))})}),i))},o.prototype.__autoAbort=function(e){return this.apiDeferred.fail(e.abort),e},o.prototype.directRunner=function(e){return r||(r=t.taskRunner(this.settings.parallelDirectUploads)),r(e)},o.prototype.directUpload=function(){var t,i=this;return t=e.Deferred(),this.__file?this.fileSize>104857600?(this.__rejectApi("size"),t):(this.directRunner(function(a){var r;return t.always(a),"pending"===i.apiDeferred.state()?(r=new FormData,r.append("UPLOADCARE_PUB_KEY",i.settings.publicKey),r.append("signature",i.settings.secureSignature),r.append("expire",i.settings.secureExpire),r.append("UPLOADCARE_STORE",i.settings.doNotStore?"":"auto"),r.append("file",i.__file,i.fileName),r.append("file_name",i.fileName),r.append("source",i.sourceInfo.source),i.__autoAbort(e.ajax({xhr:function(){var i;return i=e.ajaxSettings.xhr(),i.upload&&i.upload.addEventListener("progress",function(e){return t.notify(e.loaded/e.total)},!1),i},crossDomain:!0,type:"POST",url:""+i.settings.urlBase+"/base/?jsonerrors=1",headers:{"X-PINGOTHER":"pingpong"},contentType:!1,processData:!1,data:r,dataType:"json",error:t.reject,success:function(e){return(null!=e?e.file:void 0)?(i.fileId=e.file,t.resolve()):t.reject()}}))):void 0}),t):(this.__rejectApi("baddata"),t)},o.prototype.multipartUpload=function(){var t,i=this;return t=e.Deferred(),this.__file?this.settings.imagesOnly?(this.__rejectApi("image"),t):(this.multipartStart().done(function(e){return i.uploadParts(e.parts,e.uuid).done(function(){return i.multipartComplete(e.uuid).done(function(e){return i.fileId=e.uuid,i.__handleFileData(e),t.resolve()}).fail(t.reject)}).progress(t.notify).fail(t.reject)}).fail(t.reject),t):t},o.prototype.multipartStart=function(){var e,i=this;return e={UPLOADCARE_PUB_KEY:this.settings.publicKey,signature:this.settings.secureSignature,expire:this.settings.secureExpire,filename:this.fileName,source:this.sourceInfo.source,size:this.fileSize,content_type:this.fileType,part_size:this.settings.multipartPartSize,UPLOADCARE_STORE:this.settings.doNotStore?"":"auto"},this.__autoAbort(t.jsonp(""+this.settings.urlBase+"/multipart/start/?jsonerrors=1","POST",e).fail(function(a){return i.settings.debugUploads?t.log("Can't start multipart upload.",a,e):void 0}))},o.prototype.uploadParts=function(i,a){var r,n,o,l,s,c,u,d,p,f,h,g=this;for(s=[],l=e.now(),p=function(t,i){var a,n,o;if(s[t]=i,!(e.now()-l<250)){for(l=e.now(),a=0,n=0,o=s.length;o>n;n++)i=s[n],a+=i;return r.notify(a/g.fileSize)}},r=e.Deferred(),o=0,d=0,u=0,c=function(){var n,l,f,h,m;if(!(u>=g.fileSize))return f=u+g.settings.multipartPartSize,g.fileSize<f+g.settings.multipartMinLastPartSize&&(f=g.fileSize),l=g.__file.slice(u,f),u=f,h=d,o+=1,d+=1,n=0,(m=function(){return"pending"===g.apiDeferred.state()?(s[h]=0,g.__autoAbort(e.ajax({xhr:function(){var t;return t=e.ajaxSettings.xhr(),t.upload&&t.upload.addEventListener("progress",function(e){return p(h,e.loaded)},!1),t},url:i[h],crossDomain:!0,type:"PUT",processData:!1,contentType:g.fileType,data:l,error:function(){return n+=1,n>g.settings.multipartMaxAttempts?(g.settings.debugUploads&&t.info("Part #"+h+" and file upload is failed.",a),r.reject()):(g.settings.debugUploads&&t.debug("Part #"+h+"("+n+") upload is failed.",a),m())},success:function(){return o-=1,c(),o?void 0:r.resolve()}}))):void 0})()},n=f=0,h=this.settings.multipartConcurrency;h>=0?h>f:f>h;n=h>=0?++f:--f)c();return r},o.prototype.multipartComplete=function(e){var i,a=this;return i={UPLOADCARE_PUB_KEY:this.settings.publicKey,uuid:e},this.__autoAbort(t.jsonp(""+this.settings.urlBase+"/multipart/complete/?jsonerrors=1","POST",i).fail(function(i){return a.settings.debugUploads?t.log("Can't complete multipart upload.",e,a.settings.publicKey,i):void 0}))},o}(a.BaseFile)})}.call(this),function(){var e,t,i=function(e,t){return function(){return e.apply(t,arguments)}},a={}.hasOwnProperty,n=function(e,t){for(var i in t)a.call(t,i)&&(e[i]=t[i]);function r(){this.constructor=e}return r.prototype=t.prototype,e.prototype=new r,e.__super__=t.prototype,e};e=r.jQuery,t=r.utils,r.namespace("files",function(a){return a.InputFile=function(a){n(r,a),r.prototype.sourceName="local-compat";function r(a){this.__input=a,this.__cleanUp=i(this.__cleanUp,this),r.__super__.constructor.apply(this,arguments),
    this.fileId=t.uuid(),this.fileName=e(this.__input).val().split("\\").pop(),this.__notifyApi()}return r.prototype.__startUpload=function(){var t,i,a,r;return t=e.Deferred(),r=""+this.settings.urlBase+"/iframe/",a="uploadcare-iframe-"+this.fileId,this.__iframe=e("<iframe>").attr({id:a,name:a}).css("display","none").appendTo("body").on("load",t.resolve).on("error",t.reject),i=function(t,i){return e("<input/>",{type:"hidden",name:t,value:i})},e(this.__input).attr("name","file"),this.__iframeForm=e("<form>").attr({method:"POST",action:r,enctype:"multipart/form-data",target:a}).append(i("UPLOADCARE_PUB_KEY",this.settings.publicKey)).append(i("UPLOADCARE_SIGNATURE",this.settings.secureSignature)).append(i("UPLOADCARE_EXPIRE",this.settings.secureExpire)).append(i("UPLOADCARE_FILE_ID",this.fileId)).append(i("UPLOADCARE_STORE",this.settings.doNotStore?"":"auto")).append(i("UPLOADCARE_SOURCE",this.sourceInfo.source)).append(this.__input).css("display","none").appendTo("body").submit(),t.always(this.__cleanUp)},r.prototype.__cleanUp=function(){var e,t;return null!=(e=this.__iframe)&&e.off("load error").remove(),null!=(t=this.__iframeForm)&&t.remove(),this.__iframe=null,this.__iframeForm=null},r}(a.BaseFile)})}.call(this),function(){var t,a;!function(){void 0===Function.prototype.scopedTo&&(Function.prototype.scopedTo=function(e,t){var i=this;return function(){return i.apply(e,Array.prototype.slice.call(t||[]).concat(Array.prototype.slice.call(arguments)))}}),t=function(e,i){this.options=i||{},this.key=e,this.channels=new t.Channels,this.global_emitter=new t.EventsDispatcher;var a=this;this.checkAppKey(),this.connection=new t.Connection(this.key,this.options),this.connection.bind("connected",function(){a.subscribeAll()}).bind("message",function(e){var t=0===e.event.indexOf("pusher_internal:");if(e.channel){var i;(i=a.channel(e.channel))&&i.emit(e.event,e.data)}t||a.global_emitter.emit(e.event,e.data)}).bind("disconnected",function(){a.channels.disconnect()}).bind("error",function(e){t.warn("Error",e)}),t.instances.push(this),t.isReady&&a.connect()},t.instances=[],t.prototype={channel:function(e){return this.channels.find(e)},connect:function(){this.connection.connect()},disconnect:function(){this.connection.disconnect()},bind:function(e,t){return this.global_emitter.bind(e,t),this},bind_all:function(e){return this.global_emitter.bind_all(e),this},subscribeAll:function(){var e;for(channelName in this.channels.channels)this.channels.channels.hasOwnProperty(channelName)&&this.subscribe(channelName)},subscribe:function(e){var t=this,i=this.channels.add(e,this);return"connected"===this.connection.state&&i.authorize(this.connection.socket_id,this.options,function(a,r){a?i.emit("pusher:subscription_error",r):t.send_event("pusher:subscribe",{channel:e,auth:r.auth,channel_data:r.channel_data})}),i},unsubscribe:function(e){this.channels.remove(e),"connected"===this.connection.state&&this.send_event("pusher:unsubscribe",{channel:e})},send_event:function(e,t,i){return this.connection.send_event(e,t,i)},checkAppKey:function(){(null===this.key||void 0===this.key)&&t.warn("Warning","You must pass your app key when you instantiate Pusher.")}},t.Util={extend:function a(e,t){for(var i in t)t[i]&&t[i].constructor&&t[i].constructor===Object?e[i]=a(e[i]||{},t[i]):e[i]=t[i];return e},stringify:function r(){for(var t=["Pusher"],i=0;i<arguments.length;i++)"string"==typeof arguments[i]?t.push(arguments[i]):void 0==e.JSON?t.push(arguments[i].toString()):t.push(JSON.stringify(arguments[i]));return t.join(" : ")},arrayIndexOf:function(e,t){var a=Array.prototype.indexOf;if(null==e)return-1;if(a&&e.indexOf===a)return e.indexOf(t);for(i=0,l=e.length;i<l;i++)if(e[i]===t)return i;return-1}},t.debug=function(){t.log&&t.log(t.Util.stringify.apply(this,arguments))},t.warn=function(){if(e.console&&e.console.warn)e.console.warn(t.Util.stringify.apply(this,arguments));else{if(!t.log)return;t.log(t.Util.stringify.apply(this,arguments))}},t.VERSION="1.12.2",t.host="ws.pusherapp.com",t.ws_port=80,t.wss_port=443,t.channel_auth_endpoint="/pusher/auth",t.cdn_http="http://js.pusher.com/",t.cdn_https="https://d3dy5gmtp8yhk7.cloudfront.net/",t.dependency_suffix=".min",t.channel_auth_transport="ajax",t.activity_timeout=12e4,t.pong_timeout=3e4,t.isReady=!1,t.ready=function(){t.isReady=!0;for(var e=0,i=t.instances.length;i>e;e++)t.instances[e].connect()}}(),function(){function e(){this._callbacks={}}e.prototype.get=function(e){return this._callbacks[this._prefix(e)]},e.prototype.add=function(e,t){var i=this._prefix(e);this._callbacks[i]=this._callbacks[i]||[],this._callbacks[i].push(t)},e.prototype.remove=function(e,i){if(this.get(e)){var a=t.Util.arrayIndexOf(this.get(e),i);this._callbacks[this._prefix(e)].splice(a,1)}},e.prototype._prefix=function(e){return"_"+e};function i(t){this.callbacks=new e,this.global_callbacks=[],this.failThrough=t}i.prototype.bind=function(e,t){return this.callbacks.add(e,t),this},i.prototype.unbind=function(e,t){return this.callbacks.remove(e,t),this},i.prototype.emit=function(e,t){for(var i=0;i<this.global_callbacks.length;i++)this.global_callbacks[i](e,t);var a=this.callbacks.get(e);if(a)for(var i=0;i<a.length;i++)a[i](t);else this.failThrough&&this.failThrough(e,t);return this},i.prototype.bind_all=function(e){return this.global_callbacks.push(e),this},t.EventsDispatcher=i}(),function(){function e(e){return e.substr(0,1).toUpperCase()+e.substr(1)}function i(e,t,i){void 0!==t[e]&&t[e](i)}function a(e,i,a){t.EventsDispatcher.call(this),this.state=void 0,this.errors=[],this.stateActions=a,this.transitions=i,this.transition(e)}a.prototype.transition=function(a,r){var n=this.state,o=this.stateActions;if(n&&-1==t.Util.arrayIndexOf(this.transitions[n],a))throw this.emit("invalid_transition_attempt",{oldState:n,newState:a}),new Error("Invalid transition ["+n+" to "+a+"]");i(n+"Exit",o,r),i(n+"To"+e(a),o,r),i(a+"Pre",o,r),this.state=a,this.emit("state_change",{oldState:n,newState:a}),i(a+"Post",o,r)},a.prototype.is=function(e){return this.state===e},a.prototype.isNot=function(e){return this.state!==e},t.Util.extend(a.prototype,t.EventsDispatcher.prototype),t.Machine=a}(),function(){var i=function(){var i=this;t.EventsDispatcher.call(this),void 0!==e.addEventListener&&(e.addEventListener("online",function(){i.emit("online",null)},!1),e.addEventListener("offline",function(){i.emit("offline",null)},!1))};i.prototype.isOnLine=function(){return void 0===e.navigator.onLine?!0:e.navigator.onLine},t.Util.extend(i.prototype,t.EventsDispatcher.prototype),t.NetInfo=i}(),function(){var e={initialized:["waiting","failed"],waiting:["connecting","permanentlyClosed"],connecting:["open","permanentlyClosing","impermanentlyClosing","waiting"],open:["connected","permanentlyClosing","impermanentlyClosing","waiting"],connected:["permanentlyClosing","waiting"],impermanentlyClosing:["waiting","permanentlyClosing"],permanentlyClosing:["permanentlyClosed"],permanentlyClosed:["waiting","failed"],failed:["permanentlyClosed"]},i=2e3,a=2e3,r=2e3,o=5*i,l=5*a,s=5*r;function c(e){e.connectionWait=0,"flash"===t.TransportType?e.openTimeout=5e3:e.openTimeout=2e3,e.connectedTimeout=2e3,e.connectionSecure=e.compulsorySecure,e.connectionAttempts=0}function u(u,d){var p=this;t.EventsDispatcher.call(this),this.options=t.Util.extend({encrypted:!1},d),this.netInfo=new t.NetInfo,this.netInfo.bind("online",function(){p._machine.is("waiting")&&(p._machine.transition("connecting"),T("connecting"))}),this.netInfo.bind("offline",function(){p._machine.is("connected")&&(p.socket.onclose=void 0,p.socket.onmessage=void 0,p.socket.onerror=void 0,p.socket.onopen=void 0,p.socket.close(),p.socket=void 0,p._machine.transition("waiting"))}),this._machine=new t.Machine("initialized",e,{initializedPre:function(){p.compulsorySecure=p.options.encrypted,p.key=u,p.socket=null,p.socket_id=null,p.state="initialized"},waitingPre:function(){p.connectionWait>0&&p.emit("connecting_in",p.connectionWait),T(p.netInfo.isOnLine()&&p.connectionAttempts<=4?"connecting":"unavailable"),p.netInfo.isOnLine()&&(p._waitingTimer=setTimeout(function(){p._machine.transition("connecting")},b()))},waitingExit:function(){clearTimeout(p._waitingTimer)},connectingPre:function(){
    if(p.netInfo.isOnLine()===!1)return p._machine.transition("waiting"),void T("unavailable");var e=h(p.key,p.connectionSecure);t.debug("Connecting",e),p.socket=new t.Transport(e),p.socket.onopen=_,p.socket.onclose=C,p.socket.onerror=A,p._connectingTimer=setTimeout(g,p.openTimeout)},connectingExit:function(){clearTimeout(p._connectingTimer),p.socket.onopen=void 0},connectingToWaiting:function(){f()},connectingToImpermanentlyClosing:function(){f()},openPre:function(){p.socket.onmessage=w,p.socket.onerror=A,p.socket.onclose=C,p._openTimer=setTimeout(g,p.connectedTimeout)},openExit:function(){clearTimeout(p._openTimer),p.socket.onmessage=void 0},openToWaiting:function(){f()},openToImpermanentlyClosing:function(){f()},connectedPre:function(e){p.socket_id=e,p.socket.onmessage=x,p.socket.onerror=A,p.socket.onclose=C,c(p),p.connectedAt=(new Date).getTime(),m()},connectedPost:function(){T("connected")},connectedExit:function(){v(),T("disconnected")},impermanentlyClosingPost:function(){p.socket&&(p.socket.onclose=C,p.socket.close())},permanentlyClosingPost:function(){p.socket?(p.socket.onclose=function(){c(p),p._machine.transition("permanentlyClosed")},p.socket.close()):(c(p),p._machine.transition("permanentlyClosed"))},failedPre:function(){T("failed"),t.debug("WebSockets are not available in this browser.")},permanentlyClosedPost:function(){T("disconnected")}});function f(){p.connectionWait<o&&(p.connectionWait+=i),p.openTimeout<l&&(p.openTimeout+=a),p.connectedTimeout<s&&(p.connectedTimeout+=r),p.compulsorySecure!==!0&&(p.connectionSecure=!p.connectionSecure),p.connectionAttempts++}function h(e,i){var a=t.ws_port,r="ws://";(i||"https:"===n.location.protocol)&&(a=t.wss_port,r="wss://");var o="flash"===t.TransportType?"true":"false";return r+t.host+":"+a+"/app/"+e+"?protocol=5&client=js&version="+t.VERSION+"&flash="+o}function g(){p._machine.transition("impermanentlyClosing")}function m(){p._activityTimer&&clearTimeout(p._activityTimer),p._activityTimer=setTimeout(function(){p.send_event("pusher:ping",{}),p._activityTimer=setTimeout(function(){p.socket.close()},p.options.pong_timeout||t.pong_timeout)},p.options.activity_timeout||t.activity_timeout)}function v(){p._activityTimer&&clearTimeout(p._activityTimer)}function b(){var e=p.connectionWait;if(0===e&&p.connectedAt){var t=1e3,i=(new Date).getTime()-p.connectedAt;t>i&&(e=t-i)}return e}function _(){p._machine.transition("open")}function y(e,t){p.emit("error",{type:"PusherError",data:{code:e,message:t}}),4e3===e?(p.compulsorySecure=!0,p.connectionSecure=!0,p.options.encrypted=!0,g()):4100>e?p._machine.transition("permanentlyClosing"):4200>e?(p.connectionWait=1e3,p._machine.transition("waiting")):4300>e?g():p._machine.transition("permanentlyClosing")}function w(e){var t=k(e);void 0!==t&&("pusher:connection_established"===t.event?p._machine.transition("connected",t.data.socket_id):"pusher:error"===t.event&&y(t.data.code,t.data.message))}function x(e){m();var i=k(e);if(void 0!==i){switch(t.debug("Event recd",i),i.event){case"pusher:error":p.emit("error",{type:"PusherError",data:i.data});break;case"pusher:ping":p.send_event("pusher:pong",{})}p.emit("message",i)}}function k(e){try{var t=JSON.parse(e.data);if("string"==typeof t.data)try{t.data=JSON.parse(t.data)}catch(i){if(!(i instanceof SyntaxError))throw i}return t}catch(i){p.emit("error",{type:"MessageParseError",error:i,data:e.data})}}function C(){p._machine.transition("waiting")}function A(e){p.emit("error",{type:"WebSocketError",error:e})}function T(e,i){var a=p.state;p.state=e,a!==e&&(t.debug("State changed",a+" -> "+e),p.emit("state_change",{previous:a,current:e}),p.emit(e,i))}}u.prototype.connect=function(){this._machine.is("failed")||t.Transport?this._machine.is("initialized")?(c(this),this._machine.transition("waiting")):this._machine.is("waiting")&&this.netInfo.isOnLine()===!0?this._machine.transition("connecting"):this._machine.is("permanentlyClosed")&&(c(this),this._machine.transition("waiting")):this._machine.transition("failed")},u.prototype.send=function(e){if(this._machine.is("connected")){var t=this;return setTimeout(function(){t.socket.send(e)},0),!0}return!1},u.prototype.send_event=function(e,i,a){var r={event:e,data:i};return a&&(r.channel=a),t.debug("Event sent",r),this.send(JSON.stringify(r))},u.prototype.disconnect=function(){this._machine.is("permanentlyClosed")||(this._machine.is("waiting")||this._machine.is("failed")?this._machine.transition("permanentlyClosed"):this._machine.transition("permanentlyClosing"))},t.Util.extend(u.prototype,t.EventsDispatcher.prototype),t.Connection=u}(),function(){t.Channels=function(){this.channels={}},t.Channels.prototype={add:function(e,i){var a=this.find(e);if(a)return a;var r=t.Channel.factory(e,i);return this.channels[e]=r,r},find:function(e){return this.channels[e]},remove:function(e){delete this.channels[e]},disconnect:function(){for(var e in this.channels)this.channels[e].disconnect()}},t.Channel=function(e,i){var a=this;t.EventsDispatcher.call(this,function(i,a){t.debug("No callbacks on "+e+" for "+i)}),this.pusher=i,this.name=e,this.subscribed=!1,this.bind("pusher_internal:subscription_succeeded",function(e){a.onSubscriptionSucceeded(e)})},t.Channel.prototype={init:function(){},disconnect:function(){this.subscribed=!1,this.emit("pusher_internal:disconnected")},onSubscriptionSucceeded:function(e){this.subscribed=!0,this.emit("pusher:subscription_succeeded")},authorize:function(e,t,i){return i(!1,{})},trigger:function(e,t){return this.pusher.send_event(e,t,this.name)}},t.Util.extend(t.Channel.prototype,t.EventsDispatcher.prototype),t.Channel.PrivateChannel={authorize:function(e,i,a){var r=this,n=new t.Channel.Authorizer(this,t.channel_auth_transport,i);return n.authorize(e,function(e,t){e||r.emit("pusher_internal:authorized",t),a(e,t)})}},t.Channel.PresenceChannel={init:function(){this.members=new e(this)},onSubscriptionSucceeded:function(e){this.subscribed=!0}};var e=function(e){var t=this,i=function(){this._members_map={},this.count=0,this.me=null};i.call(this),e.bind("pusher_internal:authorized",function(i){var a=JSON.parse(i.channel_data);e.bind("pusher_internal:subscription_succeeded",function(i){t._members_map=i.presence.hash,t.count=i.presence.count,t.me=t.get(a.user_id),e.emit("pusher:subscription_succeeded",t)})}),e.bind("pusher_internal:member_added",function(i){null===t.get(i.user_id)&&t.count++,t._members_map[i.user_id]=i.user_info,e.emit("pusher:member_added",t.get(i.user_id))}),e.bind("pusher_internal:member_removed",function(i){var a=t.get(i.user_id);a&&(delete t._members_map[i.user_id],t.count--,e.emit("pusher:member_removed",a))}),e.bind("pusher_internal:disconnected",function(){i.call(t)})};e.prototype={each:function(e){for(var t in this._members_map)e(this.get(t))},get:function(e){return this._members_map.hasOwnProperty(e)?{id:e,info:this._members_map[e]}:null}},t.Channel.factory=function(e,i){var a=new t.Channel(e,i);return 0===e.indexOf("private-")?t.Util.extend(a,t.Channel.PrivateChannel):0===e.indexOf("presence-")&&(t.Util.extend(a,t.Channel.PrivateChannel),t.Util.extend(a,t.Channel.PresenceChannel)),a.init(),a}}(),function(){t.Channel.Authorizer=function(e,t,i){this.channel=e,this.type=t,this.authOptions=(i||{}).auth||{}},t.Channel.Authorizer.prototype={composeQuery:function(e){var t="&socket_id="+encodeURIComponent(e)+"&channel_name="+encodeURIComponent(this.channel.name);for(var i in this.authOptions.params)t+="&"+encodeURIComponent(i)+"="+encodeURIComponent(this.authOptions.params[i]);return t},authorize:function(e,i){return t.authorizers[this.type].call(this,e,i)}},t.auth_callbacks={},t.authorizers={ajax:function(i,a){var r=this,n;n=t.XHR?new t.XHR:e.XMLHttpRequest?new e.XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),n.open("POST",t.channel_auth_endpoint,!0),n.setRequestHeader("Content-Type","application/x-www-form-urlencoded");for(var o in this.authOptions.headers)n.setRequestHeader(o,this.authOptions.headers[o]);return n.onreadystatechange=function(){if(4==n.readyState)if(200==n.status){var e,i=!1;try{e=JSON.parse(n.responseText),i=!0}catch(r){a(!0,"JSON returned from webapp was invalid, yet status code was 200. Data was: "+n.responseText)}i&&a(!1,e)}else t.warn("Couldn't get auth info from your webapp",n.status),
    a(!0,n.status)},n.send(this.composeQuery(i)),n},jsonp:function(e,i){void 0!==this.authOptions.headers&&t.warn("Warn","To send headers with the auth request, you must use AJAX, rather than JSONP.");var a=n.createElement("script");t.auth_callbacks[this.channel.name]=function(e){i(!1,e)};var r="Pusher.auth_callbacks['"+this.channel.name+"']";a.src=t.channel_auth_endpoint+"?callback="+encodeURIComponent(r)+this.composeQuery(e);var o=n.getElementsByTagName("head")[0]||n.documentElement;o.insertBefore(a,o.firstChild)}}}();var a=function(){function e(e,t){n.addEventListener?e.addEventListener("load",t,!1):e.attachEvent("onreadystatechange",function(){("loaded"==e.readyState||"complete"==e.readyState)&&t()})}function t(t,i){var a=n.getElementsByTagName("head")[0],r=n.createElement("script");r.setAttribute("src",t),r.setAttribute("type","text/javascript"),r.setAttribute("async",!0),e(r,function(){i()}),a.appendChild(r)}return function(e,i){for(var a=0,r=0;r<e.length;r++)t(e[r],function(){e.length==++a&&setTimeout(i,0)})}}();!function(){!e.WebSocket&&e.MozWebSocket&&(e.WebSocket=e.MozWebSocket),e.WebSocket&&(t.Transport=e.WebSocket,t.TransportType="native");var i="http:"==n.location.protocol?t.cdn_http:t.cdn_https,r=i+t.VERSION,o=[];e.JSON||o.push(r+"/json2"+t.dependency_suffix+".js"),e.WebSocket||(e.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION=!0,o.push(r+"/flashfallback"+t.dependency_suffix+".js"));var l=function(){return e.WebSocket?function(){t.ready()}:function(){e.WebSocket?(t.Transport=e.WebSocket,t.TransportType="flash",e.WEB_SOCKET_SWF_LOCATION="https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf",WebSocket.__addTask(function(){t.ready()}),WebSocket.__initialize()):(t.Transport=null,t.TransportType="none",t.ready())}}(),s=function(e){var t=function(){n.body?e():setTimeout(t,0)};t()},c=function(){s(l)};o.length>0?a(o,c):c()}(),this.Pusher=t}.call(r),function(){var e,t={}.hasOwnProperty,i=function(e,i){for(var a in i)t.call(i,a)&&(e[a]=i[a]);function r(){this.constructor=e}return r.prototype=i.prototype,e.prototype=new r,e.__super__=i.prototype,e};e=r.jQuery,r.namespace("utils.pusher",function(t){var a,n,o;return n={},r.Pusher.prototype.constructor=r.Pusher,a=function(t){i(a,t);function a(){return o=a.__super__.constructor.apply(this,arguments)}return a.prototype.subscribe=function(e){return this.disconnectTimeout&&(clearTimeout(this.disconnectTimeout),this.disconnectTimeout=null),this.connect(),a.__super__.subscribe.apply(this,arguments)},a.prototype.unsubscribe=function(t){var i=this;return a.__super__.unsubscribe.apply(this,arguments),e.isEmptyObject(this.channels.channels)?this.disconnectTimeout=setTimeout(function(){return i.disconnectTimeout=null,i.disconnect()},5e3):void 0},a}(r.Pusher),t.getPusher=function(e){return null==n[e]&&(n[e]=new a(e)),n[e].connect(),n[e]}})}.call(this),function(){var e,t,i,a=function(e,t){return function(){return e.apply(t,arguments)}},n={}.hasOwnProperty,o=function(e,t){for(var i in t)n.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};e=r.jQuery,i=r.utils,t=r.utils.pusher,r.namespace("files",function(r){var n,l;return r.UrlFile=function(t){o(r,t),r.prototype.sourceName="url",r.prototype.allEvents="progress success error fail";function r(e){var t,n;if(this.__url=e,this.__listenWatcher=a(this.__listenWatcher,this),r.__super__.constructor.apply(this,arguments),n=i.splitUrlRegex.exec(this.__url)[3].split("/").pop())try{this.fileName=decodeURIComponent(n)}catch(o){t=o,this.fileName=n}this.__notifyApi()}return r.prototype.setName=function(e){return this.fileName=e,this.__realFileName=e,this.__notifyApi()},r.prototype.setIsImage=function(e){return this.isImage=e,this.__notifyApi()},r.prototype.__startUpload=function(){var t,a,r,o,s=this;return a=e.Deferred(),o=new l(this.settings),r=new n(this.settings),t={pub_key:this.settings.publicKey,signature:this.settings.secureSignature,expire:this.settings.secureExpire,source_url:this.__url,filename:this.__realFileName||"",source:this.sourceInfo.source,store:this.settings.doNotStore?"":"auto",jsonerrors:1},i.defer(function(){return"pending"===s.apiDeferred.state()?i.jsonp(""+s.settings.urlBase+"/from_url/",t).fail(function(e){return s.settings.debugUploads&&i.debug("Can't start upload from URL.",e,t),a.reject()}).done(function(t){var n;if("pending"===s.apiDeferred.state())return s.settings.debugUploads&&(i.debug("Start watchers.",t.token),n=setInterval(function(){return i.debug("Still watching.",t.token)},5e3),a.done(function(){return i.debug("Stop watchers.",t.token)}).always(function(){return clearInterval(n)})),s.__listenWatcher(a,e([o,r])),a.always(function(){return e([o,r]).off(s.allEvents),o.stopWatching(),r.stopWatching()}),e(o).one(s.allEvents,function(){return r.interval?(s.settings.debugUploads&&i.debug("Start using pusher.",t.token),r.stopWatching()):void 0}),o.watch(t.token),r.watch(t.token)}):void 0}),a},r.prototype.__listenWatcher=function(t,i){var a=this;return i.on("progress",function(e,i){return a.fileSize=i.total,t.notify(i.done/i.total)}).on("success",function(i,r){return e(i.target).trigger("progress",r),a.fileId=r.uuid,a.__handleFileData(r),t.resolve()}).on("error fail",t.reject)},r}(r.BaseFile),l=function(){function i(e){this.settings=e;try{this.pusher=t.getPusher(this.settings.pusherKey)}catch(i){this.pusher=null}}return i.prototype.watch=function(t){var i,a=this;return this.token=t,this.pusher?(i=this.pusher.subscribe("task-status-"+this.token),i.bind_all(function(t,i){return e(a).trigger(t,i)})):void 0},i.prototype.stopWatching=function(){return this.pusher?this.pusher.unsubscribe("task-status-"+this.token):void 0},i}(),n=function(){function t(e){this.settings=e,this.poolUrl=""+this.settings.urlBase+"/from_url/status/"}return t.prototype.watch=function(e){var t,i=this;return this.token=e,(t=function(){return i.interval=setTimeout(function(){return i.__updateStatus().done(function(){return i.interval?t():void 0})},333)})()},t.prototype.stopWatching=function(){return this.interval&&clearTimeout(this.interval),this.interval=null},t.prototype.__updateStatus=function(){var t=this;return i.jsonp(this.poolUrl,{token:this.token}).fail(function(i){return e(t).trigger("error")}).done(function(i){return e(t).trigger(i.status,i)})},t}()})}.call(this),function(){var e,t,i={}.hasOwnProperty,a=function(e,t){for(var a in t)i.call(t,a)&&(e[a]=t[a]);function r(){this.constructor=e}return r.prototype=t.prototype,e.prototype=new r,e.__super__=t.prototype,e};e=r.jQuery,t=r.utils,r.namespace("files",function(e){return e.UploadedFile=function(e){a(i,e),i.prototype.sourceName="uploaded";function i(e){var a;i.__super__.constructor.apply(this,arguments),a=t.splitCdnUrl(e),a?(this.fileId=a[1],a[2]&&(this.cdnUrlModifiers=a[2])):this.__rejectApi("baddata")}return i}(e.BaseFile),e.ReadyFile=function(e){a(t,e),t.prototype.sourceName="uploaded";function t(e){t.__super__.constructor.apply(this,arguments),e?(this.fileId=e.uuid,this.__handleFileData(e)):this.__rejectApi("deleted")}return t}(e.BaseFile)})}.call(this),function(){var e,t,i,a,n,o,l,s=[].slice,c={}.hasOwnProperty,u=function(e,t){for(var i in t)c.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};t=r.namespace,e=r.jQuery,o=r.utils,l=r.locale,a=l.t,i=r.settings,n=r.files,t("files",function(t){return t.FileGroup=function(){function t(t,a){var r=this;this.__uuid=null,this.settings=i.build(a),this.__fileColl=new o.CollectionOfPromises(t),this.__allFilesDf=e.when.apply(e,this.files()),this.__fileInfosDf=function(){var i;return t=function(){var t,a,r,n;for(r=this.files(),n=[],t=0,a=r.length;a>t;t++)i=r[t],n.push(i.then(null,function(t,i){return e.when(i)}));return n}.call(r),e.when.apply(e,t)}(),this.__createGroupDf=e.Deferred(),this.__initApiDeferred()}return t.prototype.files=function(){return this.__fileColl.get()},t.prototype.__save=function(){var e=this;return this.__saved?void 0:(this.__saved=!0,this.__allFilesDf.done(function(){return e.__createGroup().done(function(t){return e.__uuid=t.id,e.__buildInfo(function(t){return e.settings.imagesOnly&&!t.isImage?e.__createGroupDf.reject("image",t):e.__createGroupDf.resolve(t);
    })}).fail(function(){return e.__createGroupDf.reject("createGroup")})}))},t.prototype.promise=function(){return this.__save(),this.__apiDf.promise()},t.prototype.__initApiDeferred=function(){var t,i,a,r=this;return this.__apiDf=e.Deferred(),this.__progressState="uploading",i=function(e){return r.__buildInfo(function(t){return r.__apiDf.reject(e,t)})},a=function(e){return r.__apiDf.resolve(e)},t=function(){return r.__apiDf.notify(r.__progressInfo())},t(),this.__fileColl.onAnyProgress(t),this.__allFilesDf.done(function(){return r.__progressState="uploaded",t()}).fail(i),this.__createGroupDf.done(function(e){return r.__progressState="ready",t(),a(e)}).fail(i)},t.prototype.__progressInfo=function(){var e,t,i,a,r;for(e=0,i=this.__fileColl.lastProgresses(),a=0,r=i.length;r>a;a++)t=i[a],e+=((null!=t?t.progress:void 0)||0)/i.length;return{state:this.__progressState,uploadProgress:e,progress:"ready"===this.__progressState?1:.9*e}},t.prototype.__buildInfo=function(e){var t;return t={uuid:this.__uuid,cdnUrl:this.__uuid?""+this.settings.cdnBase+"/"+this.__uuid+"/":null,name:a("file",this.__fileColl.length()),count:this.__fileColl.length(),size:0,isImage:!0,isStored:!0},this.__fileInfosDf.done(function(){var i,a,r,n;for(i=1<=arguments.length?s.call(arguments,0):[],a=0,n=i.length;n>a;a++)r=i[a],t.size+=r.size,r.isImage||(t.isImage=!1),r.isStored||(t.isStored=!1);return e(t)})},t.prototype.__createGroup=function(){var t,i=this;return t=e.Deferred(),this.__fileColl.length()?this.__fileInfosDf.done(function(){var e,a;return a=1<=arguments.length?s.call(arguments,0):[],o.jsonp(""+i.settings.urlBase+"/group/","POST",{pub_key:i.settings.publicKey,signature:i.settings.secureSignature,expire:i.settings.secureExpire,files:function(){var t,i,r;for(r=[],t=0,i=a.length;i>t;t++)e=a[t],r.push("/"+e.uuid+"/"+(e.cdnUrlModifiers||""));return r}()}).fail(function(e){return i.settings.debugUploads&&o.log("Can't create group.",i.settings.publicKey,e),t.reject()}).done(t.resolve)}):t.reject(),t.promise()},t.prototype.api=function(){return this.__api||(this.__api=o.bindAll(this,["promise","files"])),this.__api},t}(),t.SavedFileGroup=function(e){u(t,e);function t(e,i){var a;this.__data=e,a=r.filesFrom("ready",this.__data.files,i),t.__super__.constructor.call(this,a,i)}return t.prototype.__createGroup=function(){return o.wrapToPromise(this.__data)},t}(t.FileGroup)}),t("",function(t){return t.FileGroup=function(e,t){var i,a,r,l,s,c,u,d;for(null==e&&(e=[]),a=[],l=0,c=e.length;c>l;l++)if(r=e[l],o.isFile(r))a.push(r);else if(o.isFileGroup(r))for(d=r.files(),s=0,u=d.length;u>s;s++)i=d[s],a.push(i);return new n.FileGroup(a,t).api()},t.loadFileGroup=function(t,a){var r,l,s=this;return a=i.build(a),r=e.Deferred(),l=o.groupIdRegex.exec(t),l?o.jsonp(""+a.urlBase+"/group/info/",{jsonerrors:1,pub_key:a.publicKey,group_id:l[0]}).fail(function(e){return a.debugUploads&&o.log("Can't load group info. Probably removed.",l[0],a.publicKey,e),r.reject()}).done(function(e){var t;return t=new n.SavedFileGroup(e,a),r.resolve(t.api())}):r.reject(),r.promise()}}),t("utils",function(t){return t.isFileGroup=function(e){return e&&e.files&&e.promise},t.valueToGroup=function(i,a){var n,o;if(i)if(e.isArray(i))n=function(){var e,r,n;for(n=[],e=0,r=i.length;r>e;e++)o=i[e],n.push(t.valueToFile(o,a));return n}(),i=r.FileGroup(n,a);else if(!t.isFileGroup(i))return r.loadFileGroup(i,a);return t.wrapToPromise(i||null)},t.isFileGroupsEqual=function(e,i){var a,r,n,o,l,s;if(e===i)return!0;if(!t.isFileGroup(e)||!t.isFileGroup(i))return!1;if(r=e.files(),n=i.files(),r.length!==n.length)return!1;for(o=l=0,s=r.length;s>l;o=++l)if(a=r[o],a!==n[o])return!1;return!0}})}.call(this),function(){var e,t,i,a;a=r.utils,e=r.jQuery,t=r.files,i=r.settings,r.namespace("",function(a){var r;return a.fileFrom=function(e,t,i){return a.filesFrom(e,[t],i)[0]},a.filesFrom=function(t,a,n){var o,l,s,c,u;for(n=i.build(n||{}),u=[],s=0,c=a.length;c>s;s++)l=a[s],o=null,e.isArray(l)&&(o=l[1],l=l[0]),u.push(new r[t](l,n,o).promise());return u},r={object:t.ObjectFile,input:t.InputFile,url:t.UrlFile,uploaded:t.UploadedFile,ready:t.ReadyFile}})}.call(this),function(){var e,t,i;i=r.utils,t=r.settings,e=r.jQuery,r.namespace("dragdrop",function(a){return a.support=i.abilities.fileDragAndDrop,a.uploadDrop=function(e,i,n){return n=t.build(n),a.receiveDrop(e,function(e,t){return i(n.multiple?r.filesFrom(e,t,n):r.fileFrom(e,t[0],n))})},a.support?(a.receiveDrop=function(t,i){return a.watchDragging(t),e(t).on({dragover:function(e){return e.preventDefault(),e.originalEvent.dataTransfer.dropEffect="copy"},drop:function(t){var a,r,n,o,l,s;if(t.preventDefault(),a=t.originalEvent.dataTransfer){if(a.files.length)return i("object",a.files);for(n=[],s=a.getData("text/uri-list").split(),o=0,l=s.length;l>o;o++)r=s[o],r=e.trim(r),r&&"#"!==r[0]&&n.push(r);return n?i("url",n):void 0}}})},a.watchDragging=function(t,a){var r,n,o;return o=!1,r=!1,n=function(i){return r!==i?e(t).toggleClass("uploadcare-dragging",r=i):void 0},e(a||t).on({dragenter:function(){return o=i.defer(function(){return o=!1,n(!0)})},dragleave:function(){return o?void 0:n(!1)},"drop mouseenter":function(){return o&&clearTimeout(o),i.defer(function(){return n(!1)})}})},a.watchDragging("body",n)):a.receiveDrop=function(){}})}.call(this),function(){var e,t,i,a,n,o,l=function(e,t){return function(){return e.apply(t,arguments)}},s={}.hasOwnProperty,c=function(e,t){for(var i in t)s.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};i=r.files,e=r.jQuery,n=r.utils,t=n.abilities,o=r.templates,a=o.tpl,r.namespace("ui.progress",function(i){return i.Circle=function(){function e(e){this.update=l(this.update,this),t.canvas?this.renderer=new i.CanvasRenderer(e):this.renderer=new i.TextRenderer(e),this.observed=null}return e.prototype.listen=function(e,t){var i,a=this;return this.reset(),i=null!=t?function(e){return e[t]}:function(e){return e},this.observed=e,"resolved"===this.observed.state()?this.renderer.setValue(1,!0):this.observed.progress(function(t){return e===a.observed?a.renderer.setValue(i(t)):void 0}).always(function(t){return e===a.observed?a.renderer.setValue(1,!1):void 0}),this},e.prototype.reset=function(e){return null==e&&(e=!1),this.observed=null,this.renderer.setValue(e?1:0,!0)},e.prototype.update=function(){return this.renderer.update()},e}(),i.BaseRenderer=function(){function t(t){this.element=e(t),this.element.data("uploadcare-progress-renderer",this),this.element.addClass("uploadcare-widget-circle")}return t.prototype.update=function(){},t}(),i.TextRenderer=function(e){c(t,e);function t(){t.__super__.constructor.apply(this,arguments),this.element.addClass("uploadcare-widget-circle--text"),this.element.html(a("circle-text")),this.text=this.element.find(".uploadcare-widget-circle-text")}return t.prototype.setValue=function(e){return e=Math.round(100*e),this.text.html(""+e+" %")},t}(i.BaseRenderer),i.CanvasRenderer=function(t){c(i,t);function i(){i.__super__.constructor.apply(this,arguments),this.canvasEl=e("<canvas>").get(0),this.element.addClass("uploadcare-widget-circle--canvas"),this.element.html(this.canvasEl),this.setValue(0,!0)}return i.prototype.update=function(){var e,t,i,a;return i=Math.floor(Math.min(this.element.width(),this.element.height())),a=2*i,i?((this.canvasEl.width!==a||this.canvasEl.height!==a)&&(this.canvasEl.width=a,this.canvasEl.height=a),t=this.canvasEl.getContext("2d"),e=function(e,a){var r;return r=-Math.PI/2,t.beginPath(),t.moveTo(i,i),t.arc(i,i,e,r,r+2*Math.PI*a,!1),t.fill()},t.clearRect(0,0,a,a),t.globalCompositeOperation="source-over",t.fillStyle=this.element.css("border-left-color"),e(i-.5,1),t.fillStyle=this.element.css("color"),e(i,this.val),t.globalCompositeOperation="destination-out",e(i/7,1)):void 0},i.prototype.__animateValue=function(e){var t,i,a,r=this;return a=this.val,i=new Date,t=e>a?2:-2,this.__animIntervalId=setInterval(function(){var n;return n=a+(new Date-i)/1e3*t,n=(t>0?Math.min:Math.max)(n,e),n===e&&r.__stopAnimation(),r.__setValue(n)},15)},i.prototype.__stopAnimation=function(){return this.__animIntervalId&&clearInterval(this.__animIntervalId),this.__animIntervalId=null},i.prototype.__setValue=function(e){
    return this.val=e,this.update()},i.prototype.setValue=function(e,t){return null==t&&(t=!1),this.__stopAnimation(),t?this.__setValue(e):this.__animateValue(e)},i}(i.BaseRenderer)})}.call(this),function(){var e,t,i,a,n,o,l,s;e=r.jQuery,n=r.utils,o=r.ui,t=o.progress,l=r.locale,i=l.t,s=r.templates,a=s.tpl,r.namespace("widget",function(r){return r.Template=function(){function r(i,r){this.settings=i,this.element=r,this.content=e(a("widget")),this.element.after(this.content),this.circle=new t.Circle(this.content.find(".uploadcare-widget-status")),this.statusText=this.content.find(".uploadcare-widget-text"),this.content.toggleClass("uploadcare-widget-option-clearable",this.settings.clearable)}return r.prototype.addButton=function(t,i){return null==i&&(i=""),e(a("widget-button",{name:t,caption:i})).appendTo(this.content)},r.prototype.setStatus=function(e){var t;return t="uploadcare-widget-status-",this.content.removeClass(t+this.content.attr("data-status")),this.content.attr("data-status",e),this.content.addClass(t+e),this.element.trigger(""+e+".uploadcare")},r.prototype.reset=function(){return this.circle.reset(),this.setStatus("ready"),this.__file=null},r.prototype.loaded=function(){return this.setStatus("loaded"),this.circle.reset(!0)},r.prototype.listen=function(e){var t=this;return this.__file=e,this.circle.listen(e,"uploadProgress"),this.setStatus("started"),e.progress(function(a){if(e===t.__file)switch(a.state){case"uploading":return t.statusText.text(i("uploading"));case"uploaded":return t.statusText.text(i("loadingInfo"))}})},r.prototype.error=function(e){return this.statusText.text(i("errors."+(e||"default"))),this.setStatus("error")},r.prototype.setFileInfo=function(e){return this.statusText.html(a("widget-file-name",e)).find(".uploadcare-widget-file-name").toggleClass("needsclick",this.settings.systemDialog)},r}()})}.call(this),function(){var e,t,i,a,n,o,l,s=function(e,t){return function(){return e.apply(t,arguments)}};n=r.utils,t=r.dragdrop,o=r.locale,i=o.t,e=r.jQuery,l=r.templates,a=l.tpl,r.namespace("widget.tabs",function(r){return r.FileTab=function(){function r(t,i,r,n,o){var l=this;this.container=t,this.tabButton=i,this.dialogApi=r,this.settings=n,this.name=o,this.__updateTabsList=s(this.__updateTabsList,this),this.container.append(a("tab-file")),this.container.addClass("uploadcare-dialog-padding"),this.container.on("click",".uploadcare-dialog-file-source",function(t){return l.dialogApi.switchTab(e(t.target).data("tab"))}),this.__setupFileButton(),this.__initDragNDrop(),this.__updateTabsList(),this.dialogApi.onTabVisibility(this.__updateTabsList)}return r.prototype.__initDragNDrop=function(){var e,i=this;return e=this.container.find(".uploadcare-dialog-file-drop-area"),n.abilities.fileDragAndDrop?(t.receiveDrop(e,function(e,t){return i.dialogApi.addFiles(e,t),i.dialogApi.switchTab("preview")}),this.container.addClass("uploadcare-draganddrop")):void 0},r.prototype.__setupFileButton=function(){var e,t=this;return e=this.container.find(".uploadcare-dialog-big-button"),n.abilities.sendFileAPI?e.on("click",function(){return n.fileSelectDialog(t.container,t.settings,function(e){return t.dialogApi.addFiles("object",e.files),t.dialogApi.switchTab("preview")}),!1}):n.fileInput(e,this.settings,function(e){return t.dialogApi.addFiles("input",[e]),t.dialogApi.switchTab("preview")})},r.prototype.__updateTabsList=function(){var t,a,r,n,o,l;for(t=this.container.find(".uploadcare-dialog-file-sources").empty(),a=0,l=this.settings.tabs,n=0,o=l.length;o>n;n++)r=l[n],r!==this.name&&this.dialogApi.isTabVisible(r)&&(a+=1,t.append([e("<div/>",{"class":"uploadcare-dialog-file-source","data-tab":r,html:i("dialog.tabs.names."+r)})," "]));return t.toggleClass("uploadcare-hidden",0===a),this.container.find(".uploadcare-dialog-file-source-or").toggleClass("uploadcare-hidden",0===a)},r}()})}.call(this),function(){var e,t,i,a;e=r.jQuery,a=r.templates,i=a.tpl,t=r.locale.t,r.namespace("widget.tabs",function(t){return t.UrlTab=function(){var t,a;a=/^[a-z][a-z0-9+\-.]*:?\/\//,t=function(t){return t=e.trim(t),a.test(t)?t:"http://"+t};function r(a,r,n,o,l){var s,c,u=this;this.container=a,this.tabButton=r,this.dialogApi=n,this.settings=o,this.name=l,this.container.append(i("tab-url")),this.container.addClass("uploadcare-dialog-padding"),c=this.container.find(".uploadcare-dialog-input"),c.on("change keyup input",function(){return s.prop("disabled",!e.trim(this.value))}),s=this.container.find(".uploadcare-dialog-url-submit").prop("disabled",!0),this.container.find(".uploadcare-dialog-url-form").on("submit",function(){var e;return(e=t(c.val()))&&(u.dialogApi.addFiles("url",[[e,{source:"url-tab"}]]),c.val("")),!1})}return r}()})}.call(this),function(){var t,i,a,o,l=function(e,t){return function(){return e.apply(t,arguments)}};a=r.utils,t=r.jQuery,o=r.templates,i=o.tpl,r.namespace("widget.tabs",function(r){var o;return o="https:"===n.location.protocol,r.CameraTab=function(){function r(e,t,a,r,n){var s,c=this;return this.container=e,this.tabButton=t,this.dialogApi=a,this.settings=r,this.name=n,this.__cancelRecording=l(this.__cancelRecording,this),this.__stopRecording=l(this.__stopRecording,this),this.__startRecording=l(this.__startRecording,this),this.__capture=l(this.__capture,this),this.__mirror=l(this.__mirror,this),this.__revoke=l(this.__revoke,this),this.__requestCamera=l(this.__requestCamera,this),this.__setState=l(this.__setState,this),this.__checkCompatibility()?(this.__loaded=!1,this.mirrored=!0,this.container.append(i("tab-camera")),this.container.addClass("uploadcare-dialog-padding uploadcare-dialog-camera-requested"),this.container.find(".uploadcare-dialog-camera-capture").on("click",this.__capture),s=this.container.find(".uploadcare-dialog-camera-start-record").on("click",this.__startRecording),this.container.find(".uploadcare-dialog-camera-stop-record").on("click",this.__stopRecording),this.container.find(".uploadcare-dialog-camera-cancel-record").on("click",this.__cancelRecording),this.container.find(".uploadcare-dialog-camera-mirror").on("click",this.__mirror),this.container.find(".uploadcare-dialog-camera-retry").on("click",this.__requestCamera),(!this.MediaRecorder||this.settings.imagesOnly)&&s.hide(),this.video=this.container.find("video"),this.video.on("loadeddata",function(){return this.play()}),this.dialogApi.progress(function(e){if(e===c.name){if(!c.__loaded)return c.__requestCamera()}else if(c.__loaded&&o)return c.__revoke()}),void this.dialogApi.always(this.__revoke)):void this.dialogApi.hideTab(this.name)}return r.prototype.__checkCompatibility=function(){var t;return this.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia,this.URL=e.URL||e.webkitURL,this.MediaRecorder=e.MediaRecorder,o||a.warn("Camera is not allowed for HTTP. Please use HTTPS connection."),t="localhost"===n.location.hostname,!!this.getUserMedia&&Uint8Array&&(o||t)},r.prototype.__setState=function(e){var t;return t=["","ready","requested","denied","not-founded","recording"].join(" uploadcare-dialog-camera-"),this.container.removeClass(t).addClass("uploadcare-dialog-camera-"+e)},r.prototype.__requestCamera=function(){var e=this;return this.__loaded=!0,this.getUserMedia.call(navigator,{audio:!0,video:{optional:[{minWidth:320},{minWidth:640},{minWidth:1024},{minWidth:1280},{minWidth:1920}]}},function(t){return e.__setState("ready"),e.__stream=t,e.URL?e.video.prop("src",e.URL.createObjectURL(t)):e.video.prop("src",t),e.video[0].volume=0,e.video[0].play()},function(t){return"NO_DEVICES_FOUND"===t||"DevicesNotFoundError"===t.name?e.__setState("not-founded"):e.__setState("denied"),e.__loaded=!1})},r.prototype.__revoke=function(){var e;return this.__setState("requested"),this.__loaded=!1,this.__stream?(this.URL&&this.URL.revokeObjectURL(this.video.prop("src")),this.__stream.getTracks&&t.each(this.__stream.getTracks(),function(){return"function"==typeof this.stop?this.stop():void 0}),"function"==typeof(e=this.__stream).stop&&e.stop(),this.__stream=null):void 0},r.prototype.__mirror=function(){return this.mirrored=!this.mirrored,this.video.toggleClass("uploadcare-dialog-camera--mirrored",this.mirrored)},r.prototype.__capture=function(){var e,t,i,r,o,l=this;
    return r=this.video[0],o=r.videoWidth,i=r.videoHeight,e=n.createElement("canvas"),e.width=o,e.height=i,t=e.getContext("2d"),this.mirrored&&(t.translate(o,0),t.scale(-1,1)),t.drawImage(r,0,0,o,i),a.canvasToBlob(e,"image/jpeg",.9,function(t){return e.width=e.height=1,t.name="camera.jpg",l.dialogApi.addFiles("object",[[t,{source:"camera"}]]),l.dialogApi.switchTab("preview")})},r.prototype.__startRecording=function(){var e=this;return this.__setState("recording"),this.__chunks=[],this.__recorder=new this.MediaRecorder(this.__stream),this.__recorder.start(),this.__recorder.ondataavailable=function(t){return e.__chunks.push(t.data)}},r.prototype.__stopRecording=function(){var e=this;return this.__setState("ready"),this.__recorder.onstop=function(){var t,i;return i=e.__recorder.mimeType,i=i?i.split("/")[1]:"webm",t=new Blob(e.__chunks,{type:"video/"+i}),t.name="record."+i,e.dialogApi.addFiles("object",[[t,{source:"camera"}]]),e.dialogApi.switchTab("preview"),e.__chunks=[]},this.__recorder.stop()},r.prototype.__cancelRecording=function(){return this.__setState("ready"),this.__recorder.stop(),this.__chunks=[]},r}()})}.call(this),function(){var t,i,a,n,o,l,s,c=function(e,t){return function(){return e.apply(t,arguments)}};a=r.locale,l=r.utils,o=r.tabsCss,t=r.jQuery,s=r.locale,n=s.t,i=r.files,r.namespace("widget.tabs",function(a){return a.RemoteTab=function(){function a(e,t,i,a,r){var n=this;this.container=e,this.tabButton=t,this.dialogApi=i,this.settings=a,this.name=r,this.__createIframe=c(this.__createIframe,this),this.container.addClass("uploadcare-dialog-remote-iframe-wrap"),this.dialogApi.progress(function(e){return e===n.name&&n.__createIframe(),n.__sendMessage({type:"visibility-changed",visible:e===n.name})})}return a.prototype.remoteUrl=function(){return""+this.settings.socialBase+"/window/"+this.name+"?"+t.param({lang:this.settings.locale,public_key:this.settings.publicKey,widget_version:r.version,images_only:this.settings.imagesOnly,pass_window_open:this.settings.passWindowOpen})},a.prototype.__sendMessage=function(e){var t,i;return null!=(t=this.iframe)&&null!=(i=t[0].contentWindow)?i.postMessage(JSON.stringify(e),"*"):void 0},a.prototype.__createIframe=function(){var a,r=this;if(!this.iframe)return this.iframe=t("<iframe>",{src:this.remoteUrl(),marginheight:0,marginwidth:0,frameborder:0,allowTransparency:"true"}).addClass("uploadcare-dialog-remote-iframe").appendTo(this.container).on("load",function(){var e,t,i,a,n,l,s,c;for(r.iframe.css("opacity","1"),s=o.urls,i=0,n=s.length;n>i;i++)t=s[i],r.__sendMessage({type:"embed-css",url:t});for(c=o.styles,a=0,l=c.length;l>a;a++)e=c[a],r.__sendMessage({type:"embed-css",style:e})}),a=this.iframe[0].contentWindow,l.registerMessage("file-selected",a,function(e){var a,n,o;return o=function(){var t,i,a,n,o;if(e.alternatives)for(o=r.settings.preferredTypes,a=0,n=o.length;n>a;a++){i=o[a],i=l.globRegexp(i);for(t in e.alternatives)if(i.test(t))return e.alternatives[t]}return e.url}(),n=t.extend({source:r.name},e.info||{}),a=new i.UrlFile(o,r.settings,n),e.filename&&a.setName(e.filename),null!=e.is_image&&a.setIsImage(e.is_image),r.dialogApi.addFiles([a.promise()])}),l.registerMessage("open-new-window",a,function(t){var i,a,n;return r.settings.debugUploads&&l.debug("Open new window message.",r.name),(a=e.open(t.url,"_blank"))?(n=function(){return r.settings.debugUploads&&l.debug("Window is closed.",r.name),r.__sendMessage({type:"navigate",fragment:""})},"closed"in a?i=setInterval(function(){return a.closed?(clearInterval(i),n()):void 0},100):a.addEventListener("exit",n)):void l.warn("Can't open new window. Possible blocked.",r.name)}),this.dialogApi.done(function(){return l.unregisterMessage("file-selected",a),l.unregisterMessage("open-new-window",a)})},a}()})}.call(this),function(){var e,t,i,a;i=r.ui,a=i.progress,t=a.Circle,e=r.jQuery,r.namespace("widget.tabs",function(i){return i.BasePreviewTab=function(){var i;i=".uploadcare-dialog-preview-";function a(e,t,a,r,n){var o,l=this;this.container=e,this.tabButton=t,this.dialogApi=a,this.settings=r,this.name=n,this.__initTabButtonCircle(),o=":not(.uploadcare-disabled-el)",this.container.on("click",i+"back"+o,function(){return l.dialogApi.fileColl.clear()}),this.container.on("click",i+"done"+o,this.dialogApi.resolve)}return a.prototype.__initTabButtonCircle=function(){var i,a,r,n,o=this;return r=e('<div class="uploadcare-dialog-icon">').appendTo(this.tabButton),a=e.Deferred(),n=function(){var e,t,i,r,n;for(e=o.dialogApi.fileColl.lastProgresses(),t=0,r=0,n=e.length;n>r;r++)i=e[r],t+=((null!=i?i.progress:void 0)||0)/e.length;return a.notify(t)},this.dialogApi.fileColl.onAnyProgress(n),this.dialogApi.fileColl.onAdd.add(n),this.dialogApi.fileColl.onRemove.add(n),n(),i=new t(r).listen(a.promise()),this.dialogApi.progress(i.update)},a}()})}.call(this),function(){var e,t,i,a,n,o,l,s,c,u,d,p,f,h=function(e,t){return function(){return e.apply(t,arguments)}},g={}.hasOwnProperty,m=function(e,t){for(var i in t)g.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};l=r.utils,s=r.utils,c=s.abilities,i=c.URL,u=r.ui,a=u.progress,d=r.templates,o=d.tpl,e=r.jQuery,p=r.crop,t=p.CropWidget,f=r.locale,n=f.t,r.namespace("widget.tabs",function(a){return a.PreviewTab=function(a){m(r,a);function r(){this.__tryToLoadVideoPreview=h(this.__tryToLoadVideoPreview,this),this.__tryToLoadImagePreview=h(this.__tryToLoadImagePreview,this),this.__setFile=h(this.__setFile,this);var t=this;r.__super__.constructor.apply(this,arguments),e.each(this.dialogApi.fileColl.get(),function(e,i){return t.__setFile(i)}),this.dialogApi.fileColl.onAdd.add(this.__setFile),this.widget=null,this.__state=null}return r.prototype.__setFile=function(e){var t,i,a,r=this;return this.file=e,t=function(t){return function(){return e===r.file?t.apply(null,arguments):void 0}},i=l.once(this.__tryToLoadImagePreview),a=l.once(this.__tryToLoadVideoPreview),this.__setState("unknown",{}),this.file.progress(t(function(t){var n,o,s;return t=t.incompleteFileInfo,o=(t.name||"")+l.readableFileSize(t.size,"",", "),r.element("label").text(o),s=t.sourceInfo,n=l.abilities.Blob,s.file&&n&&s.file instanceof n?i(e,s.file).fail(function(){return a(e,s.file)}):void 0})),this.file.done(t(function(e){var t,i;if("video"!==r.__state)return e.isImage?"image"!==r.__state?(i=e.originalUrl,i+="-/preview/1162x693/-/setfill/efefef/-/format/jpeg/-/progressive/yes/",t=e.originalImageInfo,r.__setState("image",{src:i,name:e.name}),r.initImage([t.width,t.height],e.cdnUrlModifiers)):void 0:r.__setState("regular",{file:e})})),this.file.fail(t(function(e,t){return r.__setState("error",{error:e,file:t})}))},r.prototype.__tryToLoadImagePreview=function(t,a){var r,n=this;return r=e.Deferred(),"pending"!==t.state()||!a.size||a.size>=this.settings.multipartMinSize?r.reject().promise():(l.image.drawFileToCanvas(a,1550,924,"#efefef",this.settings.imagePreviewMaxSize).done(function(e,a){return l.canvasToBlob(e,"image/jpeg",.95,function(o){var l;return r.resolve(),e.width=e.height=1,"pending"===t.state()&&"pending"===n.dialogApi.state()&&n.file===t?(l=i.createObjectURL(o),n.dialogApi.always(function(){return i.revokeObjectURL(l)}),"image"!==n.__state?(n.__setState("image",{src:l,name:""}),n.initImage(a)):void 0):void 0})}).fail(r.reject),r.promise())},r.prototype.__tryToLoadVideoPreview=function(t,a){var r,n,o,s=this;return r=e.Deferred(),i&&a.size?(o=i.createObjectURL(a),n=l.videoLoader(o),n.fail(function(){return i.revokeObjectURL(o),r.reject()}).done(function(){return r.resolve(),s.dialogApi.always(function(){return i.revokeObjectURL(o)}),s.__setState("video"),s.element("video").attr("src",o)}),r.promise()):r.reject().promise()},r.prototype.element=function(e){return this.container.find(".uploadcare-dialog-preview-"+e)},r.prototype.__setState=function(e,t){return this.__state=e,this.container.empty().append(o("tab-preview-"+e,t)),"unknown"===e&&this.settings.crop?this.element("done").hide():void 0},r.prototype.initImage=function(e,i){var a,r,o,s,c=this;return r=this.element("image"),a=this.element("done"),o=l.imageLoader(r[0]).done(function(){return c.element("root").addClass("uploadcare-dialog-preview--loaded");
    }).fail(function(){return c.file=null,c.__setState("error",{error:"loadImage"})}),s=function(){return a.removeClass("uploadcare-disabled-el"),c.widget=new t(r,e,c.settings.crop[0]),i&&c.widget.setSelectionFromModifiers(i),a.on("click",function(){var e;return e=c.widget.applySelectionToFile(c.file),c.dialogApi.fileColl.replace(c.file,e),!0})},this.settings.crop?(this.element("title").text(n("dialog.tabs.preview.crop.title")),a.addClass("uploadcare-disabled-el"),a.text(n("dialog.tabs.preview.crop.done")),this.populateCropSizes(),o.done(function(){return l.defer(s)})):void 0},r.prototype.populateCropSizes=function(){var t,i,a,r=this;if(!(this.settings.crop.length<=1))return this.element("root").addClass("uploadcare-dialog-preview--with-sizes"),t=this.element("crop-sizes"),a=t.children(),i="uploadcare-crop-size--current",e.each(this.settings.crop,function(e,o){var s,c,u,d,p;return d=o.preferedSize,d?(c=l.gcd(d[0],d[1]),s=""+d[0]/c+":"+d[1]/c):s=n("dialog.tabs.preview.crop.free"),u=a.clone().appendTo(t).attr("data-caption",s).on("click",function(e){return r.widget?(r.widget.setCrop(o),t.find(">*").removeClass(i),u.addClass(i)):void 0}),d?(p=l.fitSize(d,[40,40],!0),u.children().css({width:Math.max(20,p[0]),height:Math.max(12,p[1])})):void 0}),a.remove(),t.find(">*").eq(0).addClass(i)},r}(a.BasePreviewTab)})}.call(this),function(e){function t(e){this.targets=e,this.last=null,this.update()}t.prototype={update:function(){var t={};this.targets.each(function(i){var a=e(this).offset();a.top in t||(t[a.top]=[]),t[a.top].push([a.left+this.offsetWidth/2,this])}),this.rows=t},find:function(e,t){var i=1/0,a=this.rows,r,n,o;for(n in a){var l=Math.abs(n-t);i>l&&(i=l,r=a[n])}i=Math.abs(r[0][0]-e),o=r[0][1];for(var s=1;s<r.length;s++){var l=Math.abs(r[s][0]-e);i>l&&(i=l,o=r[s][1])}return o},findNotLast:function(e,t){var i=this.find(e,t);return this.last&&i&&this.last==i?null:this.last=i}};var i="uploadcareMovable",a="uploadcareSortable",r={};r[i]=function(t){t=e.extend({distance:4,anyButton:!1,axis:!1,zIndex:1e3,start:e.noop,move:e.noop,finish:e.noop,items:null,keepFake:!1,touch:!0},t);function a(e){if(t.touch){var i,a;if(a=e.originalEvent.touches,a&&a.length)i=a[0];else{if(a=e.originalEvent.changedTouches,!a||!a.length)return;i=a[0]}e.pageX=i.pageX,e.pageY=i.pageY,e.which=1}}var r="mousedown.{} touchstart.{}".replace(/\{}/g,i);this.on(r,t.items,null,function(r){if(a(r),t.anyButton||1==r.which){r.preventDefault();var o=!1,l=e(this),s=!1,c=l.position();c.top+=l.offsetParent().scrollTop(),c.left+=l.offsetParent().scrollLeft();var u="mousemove.{} touchmove.{}".replace(/\{}/g,i);e(n).on(u,function(e){if(a(e),!o&&(Math.abs(e.pageX-r.pageX)>t.distance||Math.abs(e.pageY-r.pageY)>t.distance)&&(o=!0,s=l.clone().css({position:"absolute",zIndex:t.zIndex,width:l.width()}).appendTo(l.offsetParent()),t.start({event:e,dragged:l,fake:s})),o){e.preventDefault();var i="y"==t.axis?0:e.pageX-r.pageX,n="x"==t.axis?0:e.pageY-r.pageY;s.css({left:i+c.left,top:n+c.top}),t.move({event:e,dragged:l,fake:s,dx:i,dy:n})}});var u="mouseup.{} touchend.{} touchcancel.{} touchleave.{}";e(n).on(u.replace(/\{}/g,i),function(c){a(c);var u="mousemove.{} touchmove.{} mouseup.{} touchend.{} touchcancel.{} touchleave.{}";if(e(n).off(u.replace(/\{}/g,i)),o){c.preventDefault();var d=c.pageX-r.pageX,p=c.pageY-r.pageY;o=!1,t.finish({event:c,dragged:l,fake:s,dx:d,dy:p}),t.keepFake||s.remove()}})}})},r[a]=function(a){var r=e.extend({items:">*"},a),a=e.extend({checkBounds:function(){return!0},start:e.noop,attach:e.noop,move:e.noop,finish:e.noop},a),n,o=!1,l=this;return r.start=function(e){a.start(e),n=new t(l.find(r.items).not(e.fake)),o=e.dragged.next()},r.move=function(t){if(t.nearest=null,a.checkBounds(t)){var i=t.fake.offset(),r=n.findNotLast(i.left+t.dragged.width()/2,i.top);t.nearest=e(r),r&&r!=t.dragged[0]&&(t.dragged.nextAll().filter(r).length>0?t.dragged.insertAfter(r):t.dragged.insertBefore(r),a.attach(t),n.last=null,n.update())}else null!==n.last&&(n.last=null,o.length?t.dragged.insertBefore(o):t.dragged.parent().append(t.dragged),a.attach(t),n.update());a.move(t)},r.finish=function(t){var i=t.fake.offset();t.nearest=null,a.checkBounds(t)&&(t.nearest=e(n.find(i.left+t.dragged.width()/2,i.top))),a.finish(t),n=null},this[i](r)},e.fn.extend(r)}(r.jQuery),function(){var e,t,i,a,n,o,l,s,c=function(e,t){return function(){return e.apply(t,arguments)}},u={}.hasOwnProperty,d=function(e,t){for(var i in t)u.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};n=r.utils,o=r.ui,t=o.progress,l=r.templates,a=l.tpl,e=r.jQuery,s=r.locale,i=s.t,r.namespace("widget.tabs",function(t){return t.PreviewTabMultiple=function(t){d(o,t);function o(){this.__fileReplaced=c(this.__fileReplaced,this),this.__fileRemoved=c(this.__fileRemoved,this),this.__fileAdded=c(this.__fileAdded,this),this.__fileFailed=c(this.__fileFailed,this),this.__fileDone=c(this.__fileDone,this),this.__fileProgress=c(this.__fileProgress,this),this.__updateContainerView=c(this.__updateContainerView,this);var t=this;o.__super__.constructor.apply(this,arguments),this.container.append(a("tab-preview-multiple")),this.__fileTpl=e(a("tab-preview-multiple-file")),this.fileListEl=this.container.find(".uploadcare-file-list"),this.titleEl=this.__find("title"),this.mobileTitleEl=this.__find("mobile-title"),this.footerTextEl=this.__find("footer-text"),this.doneBtnEl=this.container.find(".uploadcare-dialog-preview-done"),e.each(this.dialogApi.fileColl.get(),function(e,i){return t.__fileAdded(i)}),this.__updateContainerView(),this.dialogApi.fileColl.onAdd.add(this.__fileAdded,this.__updateContainerView),this.dialogApi.fileColl.onRemove.add(this.__fileRemoved,this.__updateContainerView),this.dialogApi.fileColl.onReplace.add(this.__fileReplaced,this.__updateContainerView),this.dialogApi.fileColl.onAnyProgress(this.__fileProgress),this.dialogApi.fileColl.onAnyDone(this.__fileDone),this.dialogApi.fileColl.onAnyFail(this.__fileFailed),this.fileListEl.addClass(this.settings.imagesOnly?"uploadcare-file-list_tiles":"uploadcare-file-list_table"),this.__setupSorting()}return o.prototype.__setupSorting=function(){var e=this;return this.fileListEl.uploadcareSortable({touch:!1,axis:this.settings.imagesOnly?"xy":"y",start:function(e){return e.dragged.css("visibility","hidden")},finish:function(t){var i,a;return t.dragged.css("visibility","visible"),i=e.container.find(".uploadcare-file-item"),a=function(t){return i.index(e.__fileToEl(t))},e.dialogApi.fileColl.sort(function(e,t){return a(e)-a(t)})}})},o.prototype.__find=function(t,i){return null==i&&(i=this.container),e(".uploadcare-dpm-"+t,i)},o.prototype.__updateContainerView=function(){var e,t,a,r,n;return e=this.dialogApi.fileColl.length(),n=0!==this.settings.multipleMax&&e>this.settings.multipleMax,r=e<this.settings.multipleMin,this.doneBtnEl.toggleClass("uploadcare-disabled-el",n||r),a=i("dialog.tabs.preview.multiple.title").replace("%files%",i("file",e)),this.titleEl.text(a),t=n?i("dialog.tabs.preview.multiple.tooManyFiles").replace("%max%",this.settings.multipleMax):e&&r?i("dialog.tabs.preview.multiple.tooFewFiles").replace("%min%",this.settings.multipleMin).replace("%files%",i("file",e)):i("dialog.tabs.preview.multiple.question"),this.footerTextEl.toggleClass("uploadcare-error",n||r).text(t),this.mobileTitleEl.toggleClass("uploadcare-error",n||r).text(n||r?t:a)},o.prototype.__updateFileInfo=function(e,t){return e.find(".uploadcare-file-item__name").text(t.name||i("dialog.tabs.preview.unknownName")),e.find(".uploadcare-file-item__size").text(n.readableFileSize(t.size,"–"))},o.prototype.__fileProgress=function(e,t){var i;return i=this.__fileToEl(e),i.find(".uploadcare-progressbar__value").css("width",Math.round(100*t.progress)+"%"),this.__updateFileInfo(i,t.incompleteFileInfo)},o.prototype.__fileDone=function(t,i){var a,n,o=this;return n=this.__fileToEl(t).removeClass("uploadcare-file-item_uploading").addClass("uploadcare-file-item_uploaded"),n.find(".uploadcare-progressbar__value").css("width","100%"),this.__updateFileInfo(n,i),i.isImage?(a=""+i.cdnUrl+"-/quality/lightest/"+(this.settings.imagesOnly?"-/preview/340x340/":"-/scale_crop/110x110/center/"),
    n.find(".uploadcare-file-item__preview").addClass("uploadcare-zoomable-icon").html(e("<img>").attr("src",a)).on("click",function(){return r.openPreviewDialog(t,o.settings).done(function(e){return o.dialogApi.fileColl.replace(t,e)})})):void 0},o.prototype.__fileFailed=function(e,t,a){return this.__fileToEl(e).removeClass("uploadcare-file-item_uploading").addClass("uploadcare-file-item_error").find(".uploadcare-file-item__error").text(i("errors."+t))},o.prototype.__fileAdded=function(e){var t;return t=this.__createFileEl(e),t.appendTo(this.fileListEl)},o.prototype.__fileRemoved=function(t){return this.__fileToEl(t).remove(),e(t).removeData()},o.prototype.__fileReplaced=function(e,t){var i;return i=this.__createFileEl(t),i.insertAfter(this.__fileToEl(e)),this.__fileRemoved(e)},o.prototype.__fileToEl=function(t){return e(t).data("dpm-el")||e()},o.prototype.__createFileEl=function(t){var i,a=this;return i=this.__fileTpl.clone().on("click",".uploadcare-remove",function(){return a.dialogApi.fileColl.remove(t)}),e(t).data("dpm-el",i),i},o}(t.BasePreviewTab)})}.call(this),function(){var t,i,a,o,l,s,c,u,d,p,f=function(e,t){return function(){return e.apply(t,arguments)}};c=r.utils,u=r.locale,o=u.t,d=r.templates,s=d.tpl,i=r.files,p=r.widget,l=p.tabs,a=r.settings,t=r.jQuery,r.namespace("",function(u){var d,p,h,g,m,v=this;return h=function(e,t){var i,a;return a=e.scrollTop(),i=e.scrollLeft(),t&&e.scrollTop(0).scrollLeft(0),function(){return e.scrollTop(a).scrollLeft(i)}},t(e).on("keydown",function(e){return u.isDialogOpened()&&27===e.which?(e.stopImmediatePropagation(),"undefined"!=typeof p&&null!==p?p.reject():void 0):void 0}),p=null,g="uploadcare-dialog-opened",u.isDialogOpened=function(){return null!==p},u.closeDialog=function(){var e;e=[];while(p)e.push(p.reject());return e},u.openDialog=function(i,a,r){var o,l,c;return u.closeDialog(),l=t(s("dialog")).appendTo("body"),c=u.openPanel(l.find(".uploadcare-dialog-placeholder"),i,a,r),l.addClass("uploadcare-active"),c.dialogElement=l,o=h(t(e),"absolute"===l.css("position")),t("html, body").addClass(g),l.on("click",".uploadcare-dialog-close",c.reject),l.on("dblclick",function(e){var i;if(t.contains(n.documentElement,e.target)&&(i=".uploadcare-dialog-panel, a",!t(e.target).is(i)&&!t(e.target).parents(i).length))return c.reject()}),p=c.always(function(){return t("html, body").removeClass(g),p=null,l.remove(),o()})},u.openPreviewDialog=function(e,i){var a,n,o=this;return n=p,p=null,i=t.extend({},i,{multiple:!1,tabs:""}),a=r.openDialog(e,"preview",i),n.dialogElement.addClass("uploadcare-inactive"),a.always(function(){return p=n,t("html, body").addClass(g),n.dialogElement.removeClass("uploadcare-inactive")}),a.onTabVisibility(function(e,t){return"preview"!==e||t?void 0:a.reject()}),a},u.openPanel=function(e,i,n,o){var l,s;return t.isPlainObject(n)&&(o=n,n=null),i?c.isFileGroup(i)?i=i.files():t.isArray(i)||(i=[i]):i=[],o=a.build(o),s=new d(o,e,i,n).publicPromise(),l=function(e){return o.multiple?r.FileGroup(e,o):e[0]},c.then(s,l,l).promise(s)},m={},u.registerTab=function(e,t){return m[e]=t},u.registerTab("file",l.FileTab),u.registerTab("url",l.UrlTab),u.registerTab("camera",l.CameraTab),u.registerTab("facebook",l.RemoteTab),u.registerTab("dropbox",l.RemoteTab),u.registerTab("gdrive",l.RemoteTab),u.registerTab("gphotos",l.RemoteTab),u.registerTab("instagram",l.RemoteTab),u.registerTab("flickr",l.RemoteTab),u.registerTab("vk",l.RemoteTab),u.registerTab("evernote",l.RemoteTab),u.registerTab("box",l.RemoteTab),u.registerTab("skydrive",l.RemoteTab),u.registerTab("huddle",l.RemoteTab),u.registerTab("empty-pubkey",function(e,t,i,a){return e.append(a._emptyKeyText)}),u.registerTab("preview",function(e,t,i,a,r){var n;return new(n=a.multiple?l.PreviewTabMultiple:l.PreviewTab)(e,t,i,a,r)}),d=function(){var e;e="uploadcare-dialog-tab";function a(i,a,r,n){var o,l=this;this.settings=i,this.isTabVisible=f(this.isTabVisible,this),this.hideTab=f(this.hideTab,this),this.showTab=f(this.showTab,this),this.switchTab=f(this.switchTab,this),this.__closePanel=f(this.__closePanel,this),this.__updateFooter=f(this.__updateFooter,this),this.__reject=f(this.__reject,this),this.__resolve=f(this.__resolve,this),this.addFiles=f(this.addFiles,this),this.dfd=t.Deferred(),this.dfd.always(this.__closePanel),o=".uploadcare-dialog-panel",this.content=t(s("panel")),this.panel=this.content.find(o).add(this.content.filter(o)),this.placeholder=t(a),this.placeholder.replaceWith(this.content),this.settings.multiple&&this.panel.addClass("uploadcare-dialog-multiple"),this.files=new c.CollectionOfPromises(r),this.files.onRemove.add(function(){return 0===l.files.length()?l.hideTab("preview"):void 0}),this.__autoCrop(this.files),this.tabs={},this.__prepareFooter(),this.onTabVisibility=t.Callbacks().add(function(t,i){return l.panel.find("."+e+"-"+t).toggleClass(""+e+"_hidden",!i)}),this.settings.publicKey?this.__prepareTabs(n):this.__welcome()}return a.prototype.publicPromise=function(){return this.promise||(this.promise=this.dfd.promise({reject:this.__reject,resolve:this.__resolve,fileColl:this.files,addFiles:this.addFiles,switchTab:this.switchTab,hideTab:this.hideTab,showTab:this.showTab,isTabVisible:this.isTabVisible,onTabVisibility:c.publicCallbacks(this.onTabVisibility)})),this.promise},a.prototype.addFiles=function(e,t){var i,a,r;for(t&&(e=u.filesFrom(e,t,this.settings)),this.settings.multiple||this.files.clear(),a=0,r=e.length;r>a;a++)i=e[a],this.settings.multipleMaxStrict&&0!==this.settings.multipleMax&&this.files.length()>=this.settings.multipleMax?i.cancel():this.files.add(i);return this.settings.previewStep?(this.showTab("preview"),this.settings.multiple?void 0:this.switchTab("preview")):this.__resolve()},a.prototype.__autoCrop=function(e){var t,i,a,n,o=this;if(this.settings.crop&&this.settings.multiple){for(n=this.settings.crop,i=0,a=n.length;a>i;i++)if(t=n[i],!t.preferedSize)return;return e.onAnyDone(function(t,i){var a,n,l;if(i.isImage&&!i.cdnUrlModifiers&&!i.crop)return a=i.originalImageInfo,l=r.utils.fitSize(o.settings.crop[0].preferedSize,[a.width,a.height],!0),n=c.applyCropSelectionToFile(t,o.settings.crop[0],[a.width,a.height],{width:l[0],height:l[1],left:Math.round((a.width-l[0])/2),top:Math.round((a.height-l[1])/2)}),e.replace(t,n)})}},a.prototype.__resolve=function(){return this.dfd.resolve(this.files.get())},a.prototype.__reject=function(){return this.dfd.reject(this.files.get())},a.prototype.__prepareTabs=function(e){var t,i,a,r;for(this.addTab("preview"),r=this.settings.tabs,i=0,a=r.length;a>i;i++)t=r[i],this.addTab(t);return this.files.length()?(this.showTab("preview"),this.switchTab("preview")):(this.hideTab("preview"),this.switchTab(e||this.__firstVisibleTab())),0===this.settings.tabs.length?this.panel.addClass("uploadcare-panel-hide-tabs"):void 0},a.prototype.__prepareFooter=function(){var e,t=this;return this.footer=this.panel.find(".uploadcare-panel-footer"),e=":not(.uploadcare-disabled-el)",this.footer.on("click",".uploadcare-dialog-button"+e,function(){return t.switchTab("preview")}),this.footer.on("click",".uploadcare-dialog-button-success"+e,this.__resolve),this.__updateFooter(),this.files.onAdd.add(this.__updateFooter),this.files.onRemove.add(this.__updateFooter)},a.prototype.__updateFooter=function(){var e,t,a;return i=this.files.length(),a=0!==this.settings.multipleMax&&i>this.settings.multipleMax,t=i<this.settings.multipleMin,this.footer.find(".uploadcare-dialog-button-success").toggleClass("uploadcare-disabled-el",a||t),this.footer.find(".uploadcare-dialog-button").toggleClass("uploadcare-disabled-el",0===i),e=a?o("dialog.tabs.preview.multiple.tooManyFiles").replace("%max%",this.settings.multipleMax):i&&t?o("dialog.tabs.preview.multiple.tooFewFiles").replace("%min%",this.settings.multipleMin):o("dialog.tabs.preview.multiple.title"),this.footer.find(".uploadcare-panel-footer-text").toggleClass("uploadcare-error",a).text(e.replace("%files%",o("file",i))),this.footer.find(".uploadcare-panel-footer-counter").toggleClass("uploadcare-error",a).text(i?"("+i+")":"")},a.prototype.__closePanel=function(){return this.panel.replaceWith(this.placeholder),this.content.remove()},a.prototype.addTab=function(i){var a,r,n,l=this;if(!(i in this.tabs)){
    if(a=m[i],!a)throw new Error("No such tab: "+i);return n=t("<div>").addClass(""+e+"s-panel").addClass(""+e+"s-panel-"+i).insertBefore(this.footer),r=t("<div>",{role:"button",tabindex:"0"}).addClass(e).addClass(""+e+"-"+i).attr("title",o("dialog.tabs.names."+i)).appendTo(this.panel.find("."+e+"s")).on("click",function(){return i===l.currentTab?l.panel.toggleClass("uploadcare-dialog-opened-tabs"):l.switchTab(i)}),this.tabs[i]=new a(n,r,this.publicPromise(),this.settings,i)}},a.prototype.switchTab=function(t){var i;if(t)return this.currentTab=t,this.panel.removeClass("uploadcare-dialog-opened-tabs"),this.panel.find("."+e).removeClass(""+e+"_current").filter("."+e+"-"+t).addClass(""+e+"_current"),i=""+e+"s-panel",this.panel.find("."+i).removeClass(""+i+"_current").filter("."+i+"-"+t).addClass(""+i+"_current"),this.dfd.notify(t)},a.prototype.showTab=function(e){return this.onTabVisibility.fire(e,!0)},a.prototype.hideTab=function(e){return this.onTabVisibility.fire(e,!1),this.currentTab===e?this.switchTab(this.__firstVisibleTab()):void 0},a.prototype.isTabVisible=function(t){return!this.panel.find("."+e+"-"+t).is("."+e+"_hidden")},a.prototype.__firstVisibleTab=function(){var e,t,i,a;for(a=this.settings.tabs,t=0,i=a.length;i>t;t++)if(e=a[t],this.isTabVisible(e))return e},a.prototype.__welcome=function(){var e,t,i,a;for(this.addTab("empty-pubkey"),this.switchTab("empty-pubkey"),a=this.settings.tabs,t=0,i=a.length;i>t;t++)e=a[t],this.__addFakeTab(e);return null},a.prototype.__addFakeTab=function(i){return t("<div>").addClass(""+e+" "+e+"-"+i).addClass("uploadcare-dialog-disabled-tab").attr("title",o("dialog.tabs.names."+i)).appendTo(this.panel.find("."+e+"s"))},a}()})}.call(this),function(){var e,t,i,a,n,o=function(e,t){return function(){return e.apply(t,arguments)}};a=r.utils,e=r.jQuery,t=r.dragdrop,n=r.locale,i=n.t,r.namespace("widget",function(n){return n.BaseWidget=function(){function l(t,i){var r=this;this.element=t,this.settings=i,this.reloadInfo=o(this.reloadInfo,this),this.__setObject=o(this.__setObject,this),this.__reset=o(this.__reset,this),this.validators=this.settings.validators=[],this.currentObject=null,this.__onDialogOpen=e.Callbacks(),this.__onUploadComplete=e.Callbacks(),this.__onChange=e.Callbacks().add(function(e){return null!=e?e.promise().done(function(e){return r.__onUploadComplete.fire(e)}):void 0}),this.__setupWidget(),this.element.on("change.uploadcare",this.reloadInfo),this.__hasValue=!1,a.defer(function(){return r.__hasValue?void 0:r.reloadInfo()})}return l.prototype.__setupWidget=function(){var e,a=this;return this.template=new n.Template(this.settings,this.element),e=["buttons.choose"],e.push(this.settings.imagesOnly?"images":"files"),e.push(this.settings.multiple?"other":"one"),this.template.addButton("open",i(e.join("."))).toggleClass("needsclick",this.settings.systemDialog).on("click",function(){return a.openDialog()}),this.template.addButton("cancel",i("buttons.cancel")).on("click",function(){return a.__setObject(null)}),this.template.addButton("remove",i("buttons.remove")).on("click",function(){return a.__setObject(null)}),this.template.content.on("click",".uploadcare-widget-file-name",function(){return a.openDialog()}),t.receiveDrop(this.template.content,this.__handleDirectSelection),this.template.reset()},l.prototype.__infoToValue=function(e){return e.cdnUrlModifiers||this.settings.pathValue?e.cdnUrl:e.uuid},l.prototype.__reset=function(){var e;return e=this.currentObject,this.currentObject=null,null!=e&&"function"==typeof e.cancel&&e.cancel(),this.template.reset()},l.prototype.__setObject=function(e){return e!==this.currentObject?(this.__reset(),e?(this.currentObject=e,this.__watchCurrentObject()):this.element.val(""),this.__onChange.fire(this.currentObject)):void 0},l.prototype.__watchCurrentObject=function(){var e,t=this;return e=this.__currentFile(),e?(this.template.listen(e),e.done(function(i){return e===t.__currentFile()?t.__onUploadingDone(i):void 0}).fail(function(i){return e===t.__currentFile()?t.__onUploadingFailed(i):void 0})):void 0},l.prototype.__onUploadingDone=function(e){return this.element.val(this.__infoToValue(e)),this.template.setFileInfo(e),this.template.loaded()},l.prototype.__onUploadingFailed=function(e){return this.template.reset(),this.template.error(e)},l.prototype.__setExternalValue=function(e){return this.__setObject(a.valueToFile(e,this.settings))},l.prototype.value=function(e){return void 0!==e?(this.__hasValue=!0,this.__setExternalValue(e),this):this.currentObject},l.prototype.reloadInfo=function(){return this.value(this.element.val())},l.prototype.openDialog=function(e){var t=this;return this.settings.systemDialog?a.fileSelectDialog(this.template.content,this.settings,function(e){return t.__handleDirectSelection("object",e.files)}):this.__openDialog(e)},l.prototype.__openDialog=function(e){var t;return t=r.openDialog(this.currentObject,e,this.settings),this.__onDialogOpen.fire(t),t.done(this.__setObject)},l.prototype.api=function(){return this.__api||(this.__api=a.bindAll(this,["openDialog","reloadInfo","value","validators"]),this.__api.onChange=a.publicCallbacks(this.__onChange),this.__api.onUploadComplete=a.publicCallbacks(this.__onUploadComplete),this.__api.onDialogOpen=a.publicCallbacks(this.__onDialogOpen),this.__api.inputElement=this.element.get(0)),this.__api},l}()})}.call(this),function(){var e,t,i,a=function(e,t){return function(){return e.apply(t,arguments)}},n={}.hasOwnProperty,o=function(e,t){for(var i in t)n.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};i=r.utils,t=r.files,e=r.jQuery,r.namespace("widget",function(e){var t;return e.Widget=function(e){o(i,e);function i(){return this.__handleDirectSelection=a(this.__handleDirectSelection,this),t=i.__super__.constructor.apply(this,arguments)}return i.prototype.__currentFile=function(){return this.currentObject},i.prototype.__handleDirectSelection=function(e,t){var i;return i=r.fileFrom(e,t[0],this.settings),this.settings.systemDialog||!this.settings.previewStep?this.__setObject(i):this.__openDialog("preview").addFiles([i])},i}(e.BaseWidget),e.Widget._name="SingleWidget"})}.call(this),function(){var e,t,i,a,n=function(e,t){return function(){return e.apply(t,arguments)}},o={}.hasOwnProperty,l=function(e,t){for(var i in t)o.call(t,i)&&(e[i]=t[i]);function a(){this.constructor=e}return a.prototype=t.prototype,e.prototype=new a,e.__super__=t.prototype,e};i=r.utils,e=r.jQuery,a=r.locale,t=a.t,r.namespace("widget",function(e){var a;return e.MultipleWidget=function(e){l(o,e);function o(){return this.__handleDirectSelection=n(this.__handleDirectSelection,this),this.__setObject=n(this.__setObject,this),a=o.__super__.constructor.apply(this,arguments)}return o.prototype.__currentFile=function(){var e;return null!=(e=this.currentObject)?e.promise():void 0},o.prototype.__setObject=function(e){return i.isFileGroupsEqual(this.currentObject,e)?e?void 0:(this.__reset(),this.element.val("")):o.__super__.__setObject.apply(this,arguments)},o.prototype.__setExternalValue=function(e){var a,r=this;return this.__lastGroupPr=a=i.valueToGroup(e,this.settings),e&&(this.template.setStatus("started"),this.template.statusText.text(t("loadingInfo"))),a.done(function(e){return r.__lastGroupPr===a?r.__setObject(e):void 0}).fail(function(){return r.__lastGroupPr===a?r.__onUploadingFailed("createGroup"):void 0})},o.prototype.__handleDirectSelection=function(e,t){var i;return i=r.filesFrom(e,t,this.settings),this.settings.systemDialog?this.__setObject(r.FileGroup(i,this.settings)):this.__openDialog("preview").addFiles(i)},o}(e.BaseWidget),e.MultipleWidget._name="MultipleWidget"})}.call(this),function(){var t,i,a;a=r.utils,i=r.settings,t=r.jQuery,r.namespace("",function(r){var n,o,l,s,c;return o="uploadcareWidget",c='[role~="uploadcare-uploader"]',r.initialize=function(e){return null==e&&(e=":root"),l(t(e).find(c))},l=function(e){var i,a,r,n,l;for(l=[],r=0,n=e.length;n>r;r++)i=e[r],a=t(i).data(o),a&&a.inputElement===i||l.push(s(i));return l},r.SingleWidget=function(e){return s(e,r.widget.Widget)},r.MultipleWidget=function(e){return s(e,r.widget.MultipleWidget)},r.Widget=function(e){
    return s(e)},s=function(e,l){var s,c,u,d,p;if(u=t(e),0===u.length)throw new Error("No DOM elements found matching selector");if(u.length>1&&a.warn("There are multiple DOM elements matching selector"),e=u.eq(0),d=i.build(e.data()),s=d.multiple?r.widget.MultipleWidget:r.widget.Widget,l&&s!==l)throw new Error("This element should be processed using "+s._name);return c=e.data(o),c&&c.inputElement===e[0]||(n(e),p=new s(e,d),c=p.api(),e.data(o,c),p.template.content.data(o,c)),c},n=function(e){return e.off(".uploadcare").each(function(){var e,i;return i=t(this).next(".uploadcare-widget"),e=i.data(o),e&&e.inputElement===this?i.remove():void 0})},r.start=a.once(function(e,t){return e=i.common(e,t),t?void 0:(e.live&&setInterval(r.initialize,100),r.initialize())}),t(function(){return e.UPLOADCARE_MANUAL_START?void 0:r.start()})})}.call(this),function(){var e,t,i,a,o,l;e=r.jQuery,t=function(e){var t;return t="[data-status=started], [data-status=error]",!e.find(".uploadcare-widget").is(t)},a=function(e,t){return e.attr("data-uploadcare-submitted",t),e.find(":submit").attr("disabled",t)},l='[role~="uploadcare-upload-form"]',o=l+"[data-uploadcare-submitted]",e(n).on("submit",l,function(){var i;return i=e(this),t(i)?!0:(a(i,!0),!1)}),e(n).on("loaded.uploadcare",o,function(){return e(this).submit()}),i="ready.uploadcare error.uploadcare",e(n).on(i,o,function(){var i;return i=e(this),t(i)?a(i,!1):void 0})}.call(this),function(){var e,t,i,a;a=r.utils,e=r.jQuery,t=["div.uploadcare-link","div.uploadcare-widget-button","div.uploadcare-dialog-tab","div.uploadcare-dialog-button","div.uploadcare-dialog-button-success"].join(", "),i="uploadcare-mouse-focused",e(n.documentElement).on("mousedown",t,function(t){return a.defer(function(){var t;return t=n.activeElement,t&&t!==n.body?e(t).addClass(i).one("blur",function(){return e(t).removeClass(i)}):void 0})}).on("keypress",t,function(t){return 13===t.which||32===t.which?(e(this).click(),t.preventDefault(),t.stopPropagation()):void 0})}.call(this),function(){var e;e=r.expose,e("globals",r.settings.common),e("start"),e("initialize"),e("fileFrom"),e("filesFrom"),e("FileGroup"),e("loadFileGroup"),e("openDialog"),e("closeDialog"),e("openPanel"),e("registerTab"),e("Circle",r.ui.progress.Circle),e("SingleWidget"),e("MultipleWidget"),e("Widget"),e("tabsCss"),e("dragdrop.support"),e("dragdrop.receiveDrop"),e("dragdrop.uploadDrop")}.call(this),function(){r.namespace("locale.translations",function(e){return e.ar={uploading:"الرجاء الإنتظار.... يتم الرفع",loadingInfo:"...تحميل المعلومات",errors:{"default":"خطأ",baddata:"قيمة غير صحيحة",size:"ملف كبير جدا",upload:"لا يمكن تحميل",user:" إلغاء التحميل",info:"لا يمكن تحميل معلومات",image:"مسموح بالصور فقط",createGroup:"لا يمكن إنشاء مجموعة ملفات",deleted:"تم حذف ملف"},draghere:"إفلت الملف هنا",file:{zero:"%1 ملفات",one:"%1 ملف",two:"%1 ملفات",few:"%1 ملفات",many:"%1 ملفات",other:"%1 ملفات"},buttons:{cancel:"إلغاء",remove:"إزالة",choose:{files:{one:"اختر ملف",other:"اختر ملفات"},images:{one:"اختر صورة",other:"اختر صور"}}},dialog:{done:"منجز",showFiles:"إظهار الملفات",tabs:{names:{preview:"معاينة",file:"الملفات المحلية",url:"روابط التعسفية",camera:"كاميرا"},file:{drag:"إفلات الملف هنا",nodrop:"تحميل الملفات من جهاز الكمبيوتر الخاص بك",cloudsTip:"المخازن السحابية<br>والخدمات الاجتماعية",or:"أو",button:"اختر ملف محلي",also:"يمكنك أيضا اختيار من"},url:{title:"الملفات من الويب",line1:"اختر على أي ملف من الويب",line2:"قم بتقديم الارتباط",input:"الصق الرابط الخاص بك هنا ...",button:"تحميل"},camera:{capture:"إلتقط صورة",mirror:"مرآة",retry:"إعادة طلب الأذونات",pleaseAllow:{title:"الرجاء السماح بتشغيل كميرتك ",text:"لقد تم السماح للكاميرا بالوصول لهذا الموقع. لكي تلتقط الصور بكاميرتك، يجب السماح لهذا الطلب "},notFound:{title:"لم يتم العثور على كاميرا ",text:"يبدو أنه لا يوجد كاميرا موصولة بهذا الجهاز"}},preview:{unknownName:"غير معروف",change:"إلغاء",back:"العودة",done:"إضافة",unknown:{title:"جاري التحميل .. الرجاء الانتظار للمعاينة.",done:"تخطي المعاينة، واقبل"},regular:{title:"إضافة هذا الملف؟",line1:"أنت على وشك إضافة الملف أعلاه.",line2:"يرجى تأكيد."},image:{title:"إضافة هذه الصورة؟",change:"إلغاء"},crop:{title:"قص وإضافة هذه الصورة",done:"تم",free:"حرر"},error:{"default":{title:"عفوا!",text:"حدث خطأ أثناء تحميل.",back:"يرجى المحاولة مرة أخرى"},image:{title:"فقط ملفات الصور مقبولة.",text:"يرجى المحاولة مرة أخرى مع ملف آخر.",back:"اختيار صورة"},size:{title:"الملف الذي حددته يتجاوز الحد.",text:"يرجى المحاولة مرة أخرى مع ملف آخر."},loadImage:{title:"خطأ",text:"لا يمكن تحميل صورة"}},multiple:{title:"لقد أخترت %files%",question:"هل ترغب في إضافة كل من هذه الملفات?",tooManyFiles:"لقد اخترت العديد من الملفات. %max% is الحد الأقصى.",tooFewFiles:"لقد أخترت %files%. على الأقل %min% مطلوب.",clear:"إزالة جميع",done:"تم"}}}}}}),r.namespace("locale.pluralize",function(e){return e.ar=function(e){var t;return 0===e?"zero":1===e?"one":2===e?"two":(t=e%100,t>=3&&10>=t?"few":t>=11&&99>=t?"many":"other")}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.az={uploading:"Yüklənilir... Lütfən, gözləyin.",loadingInfo:"İnfo yüklənilir...",errors:{"default":"Xəta",baddata:"Yanlış dəyər",size:"Fayl çox böyükdür",upload:"Yüklənilə bilmədi",user:"Yükləmə ləğv edildi",info:"İnfo yüklənə bilmədi",image:"Yalnız təsvirlərə icazə verilir",createGroup:"Fayl qrupu yaradıla bilmir",deleted:"Fayl silindi"},draghere:"Faylı bura atın",file:{one:"%1 fayl",other:"%1 fayl"},buttons:{cancel:"Ləğv edin",remove:"Silin",choose:{files:{one:"Fayl seçin",other:"Fayllar seçin"},images:{one:"Təsvir seçin",other:"Təsvirlər seçin"}}},dialog:{done:"Hazırdır",showFiles:"Faylları göstərin",tabs:{names:{"empty-pubkey":"Xoş gəlmisiniz",preview:"Önbaxış",file:"Lokal Fayllar",url:"İxtiyari linklər",camera:"Kamera",gdrive:"Google Disk"},file:{drag:"Faylı bura atın",nodrop:"Kompüterinizdən faylları yükləyin",cloudsTip:"Bulud yaddaşlar <br>və sosial xidmətlər",or:"or",button:"Lokal fayl seçin",also:"Həmçinin, buradan seçə bilərsiniz"},url:{title:"Vebdən fayllar",line1:"Vebdən istənilən faylı götürün.",line2:"Sadəcə, link verin.",input:"Linkinizi bura yerləşdirin...",button:"Yükləyin"},camera:{capture:"Şəkil çəkin",mirror:"Güzgü",retry:"Yenidən icazə sorğusu göndərin.",pleaseAllow:{title:"Lütfən, kameranıza giriş hüququ verin",text:"Bu saytdan kameranıza daxil olmaq icazəsi verildi. Kameranız ilə şəkil çəkmək üçün bu sorğunu təsdiq etməlisiniz."},notFound:{title:"Kamera aşkar edilmədi",text:"Görünür, bu cihaza kamera qoşulmayıb."}},preview:{unknownName:"naməlum",change:"Ləğv edin",back:"Geri",done:"Əlavə edin",unknown:{title:"Yüklənilir... Lütfən, önbaxış üçün gözləyin.",done:"Önbaxışı ötürün və qəbul edin"},regular:{title:"Bu fayl əlavə edilsin?",line1:"Yuxarıdakı faylı əlavə etmək üzrəsiniz.",line2:"Lütfən, təsdiq edin."},image:{title:"Bu təsvir əlavə edilsin?",change:"Ləğv edin"},crop:{title:"Bu təsviri kəsin və əlavə edin",done:"Hazırdır",free:"pulsuz"},error:{"default":{title:"Ups!",text:"Yükləmə zamanı nəsə xəta baş verdi.",back:"Lütfən, y enidən cəhd edin."},image:{title:"Yaınız təsvir faylları qəbul olunur.",text:"Lütfən, başqa fayl ilə cəhd edin.",back:"Təsvir seçin"},size:{title:"Seçdiyiniz fayl limiti keçir.",text:"Lütfən, başqa fayl ilə cəhd edin."},loadImage:{title:"Xəta",text:"Təsvir yüklənilə bilmir"}},multiple:{title:"%files% fayl seçdiniz.",question:"Bütün bu faylları əlavə etmək istəyirsiniz?",tooManyFiles:"Həddindən çox fayl seçdiniz. %max% maksimumdur.",tooFewFiles:"%files% fayl seçdiniz. Ən azı %min% tələb olunur.",clear:"Hamısını silin",done:"Hazırdır"}}}}}}),r.namespace("locale.pluralize",function(e){return e.az=function(e){return"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.ca={uploading:"Carregant... Si us plau esperi.",loadingInfo:"Carregant informació...",errors:{"default":"Error",baddata:"Valor incorrecte",size:"Massa gran",upload:"No s'ha pogut carregar",user:"Carrega cancel·lada",info:"No s'ha pogut carregar la informació",image:"Només es permeten imatges",createGroup:"No es pot crear el grup d'arxius",deleted:"Fitxer eliminat"},draghere:"Arrossega els fitxers fins aquí",file:{one:"%1 fitxer",other:"%1 fitxers"},buttons:{cancel:"Cancel·lar",remove:"Eliminar",
    choose:{files:{one:"Escull un fitxer",other:"Escull fitxers"},images:{one:"Escull una imatge",other:"Escull imatges"}}},dialog:{done:"Fet",showFiles:"Mostra fitxers",tabs:{names:{"empty-pubkey":"Benvingut",preview:"Avanci",file:"Ordinador",url:"Enllaços arbitraris",camera:"Càmera"},file:{drag:"Arrossega un fitxer aquí",nodrop:"Carrega fitxers des del teu ordinador",cloudsTip:"Emmagatzematge al núvol<br>i xarxes socials",or:"o",button:"Escull un fitxer des del teu ordinador",also:"També pots seleccionar-lo de"},url:{title:"Fitxers de la web",line1:"Selecciona qualsevol fitxer de la web.",line2:"Només proporcioni el link.",input:"Copiï el link aquí...",button:"Pujar"},camera:{capture:"Realitza una foto",mirror:"Mirall",retry:"Demanar permisos una altra vegada",pleaseAllow:{title:"Si us plau, permet accés a la teva càmera",text:"Aquest lloc t'ha demanat de permetre accés a la càmera. Per tal de realitzar imatges amb la teva càmera has d'acceptar aquesta petició."},notFound:{title:"No s'ha detectat cap càmera",text:"Sembla que no tens cap càmera connectada a aquest dispositiu."}},preview:{unknownName:"desconegut",change:"Cancel·lar",back:"Endarrere",done:"Pujar",unknown:{title:"Carregant. Si us plau esperi per la visualització prèvia.",done:"Saltar visualització prèvia i acceptar"},regular:{title:"Vols pujar aquest fitxer?",line1:"Estàs a punt de pujar el fitxer superior.",line2:"Confirmi, si us plau."},image:{title:"Vols pujar aquesta imatge?",change:"Cancel·lar"},crop:{title:"Tallar i pujar aquesta imatge",done:"Fet",free:"lliure"},error:{"default":{title:"La pujada ha fallat!",text:"S'ha produït un error durant la pujada.",back:"Si us plau, provi-ho de nou."},image:{title:"Només s'accepten fitxers d'imatges.",text:"Si us plau, provi-ho de nou amb un altre fitxer.",back:"Escull imatge"},size:{title:"La mida del fitxer que has seleccionat sobrepassa el límit.",text:"Si us plau, provi-ho de nou amb un altre fitxer."},loadImage:{title:"Error",text:"No s'ha pogut carregar la imatge"}},multiple:{title:"N'has escollit %files%",question:"Vols afegir tots aquests fitxers?",tooManyFiles:"Has escollit massa fitxers. %max% és el màxim.",tooFewFiles:"Has escollit %files%. Com a mínim en calen %min%.",clear:"Eliminar-los tots",done:"Fet"}}}}}}),r.namespace("locale.pluralize",function(e){return e.ca=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.cs={uploading:"Nahrávám... Malý moment.",loadingInfo:"Nahrávám informace...",errors:{"default":"Chyba",baddata:"Neplatná hodnota",size:"Soubor je příliš velký",upload:"Nelze nahrát",user:"Nahrávání zrušeno",info:"Nelze nahrát informace",image:"Lze nahrát pouze obrázky",createGroup:"Nelze vytvořit adresář",deleted:"Soubor byl smazán"},draghere:"Přetáhněte soubor sem",file:{one:"%1 soubor",few:"%1 soubory",many:"%1 souborů"},buttons:{cancel:"Zrušit",remove:"Odstranit",choose:{files:{one:"Vyberte soubor",other:"Vyberte soubory"},images:{one:"Vyberte obrázek",other:"Vyberte obrázky"}}},dialog:{done:"Hotovo",showFiles:"Zobrazit soubory",tabs:{names:{"empty-pubkey":"Vítejte",preview:"Náhled",file:"Soubor z počítače",url:"Soubor z internetu",camera:"Webkamera",facebook:"Facebook",dropbox:"Dropbox",gdrive:"Google Drive",instagram:"Instagram",vk:"VK",evernote:"Evernote",box:"Box",skydrive:"OneDrive",flickr:"Flickr",huddle:"Huddle"},file:{drag:"Přetáhněte soubor sem",nodrop:"Nahrajte soubory z vašeho počítače",cloudsTip:"Cloudové úložiště<br>a sociální sítě",or:"nebo",button:"Vyberte soubor z počítače",also:"Můžete také nahrát soubor z"},url:{title:"Soubory z internetu",line1:"Nahrajte jakýkoliv soubor z internetu.",line2:"Stačí vložit odkaz.",input:"Odkaz vložte zde...",button:"Nahrát"},camera:{capture:"Pořídit fotografii",mirror:"Zrcadlo",retry:"Znovu požádat o povolení",pleaseAllow:{title:"Prosím povolte přístup k webkameře",text:"Byl(a) jste požádán(a) o přístup k webkameře. Abyste mohl(a) pořídit fotografii, musíte přístup povolit."},notFound:{title:"Nebyla nalezena webkamera",text:"Zdá se, že k tomuto zařízení není připojena žádná webkamera."}},preview:{unknownName:"neznámý",change:"Zrušit",back:"Zpět",done:"Přidat",unknown:{title:"Nahrávám... Prosím vyčkejte na náhled.",done:"Přeskočit náhled a odeslat"},regular:{title:"Přidat tento soubor?",line1:"Tímto přidáte výše vybraný soubor.",line2:"Prosím potvrďte."},image:{title:"Přidat tento obrázek?",change:"Zrušit"},crop:{title:"Oříznout a přidat tento obrázek",done:"Hotovo",free:"zdarma"},error:{"default":{title:"Jejda!",text:"Něco se v průběhu nahrávání nepodařilo.",back:"Zkuste to prosím znovu."},image:{title:"Lze nahrávat pouze obrázky.",text:"Zkuste to prosím s jiným souborem.",back:"Vyberte obrázek"},size:{title:"Soubor přesahuje povolenou velikost.",text:"Prosím zkuste to s jiným souborem."},loadImage:{title:"Chyba",text:"Nelze nahrát obrázek"}},multiple:{title:"Bylo vybráno %files% souborů",question:"Chcete přidat všechny tyto soubory?",tooManyFiles:"Bylo vybráno moc souborů. Maximum je %max%",tooFewFiles:"Bylo vybráno %files% souborů. Musíte vybrat minimálně %min%",clear:"Odstranit vše",done:"Hotovo"}}}}}}),r.namespace("locale.pluralize",function(e){return e.cs=function(e){return 1===e?"one":e>=2&&4>=e?"few":"many"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.da={uploading:"Uploader... Vent venligst.",loadingInfo:"Henter information...",errors:{"default":"Fejl",baddata:"Forkert værdi",size:"Filen er for stor",upload:"Kan ikke uploade / sende fil",user:"Upload fortrudt",info:"Kan ikke hente information",image:"Kun billeder er tilladt",createGroup:"Kan ikke oprette fil gruppe",deleted:"Filen blev slettet"},draghere:"Drop en fil her",file:{one:"%1 fil",other:"%1 filer"},buttons:{cancel:"Annuller",remove:"Fjern",choose:{files:{one:"Vælg en fil",other:"Vælg filer"},images:{one:"Vælg et billede",other:"Vælg billeder"}}},dialog:{done:"Færdig",showFiles:"Vis filer",tabs:{names:{preview:"Vis",file:"Computer",gdrive:"Google Drev",url:"Direkte link"},file:{drag:"Drop en fil her",nodrop:"Hent filer fra din computer",or:"eller",button:"Hent fil fra din computer",also:"Du kan også hente fra"},url:{title:"Filer fra en Web adresse",line1:"Vælg en fil fra en web adresse.",line2:"Skriv bare linket til filen.",input:"Indsæt link her...",button:"Upload / Send"},preview:{unknownName:"ukendt",change:"Annuller",back:"Tilbage",done:"Fortsæt",unknown:{title:"Uploader / sender... Vent for at se mere.",done:"Fortsæt uden at vente på resultat"},regular:{title:"Tilføje fil?",line1:"Du er ved at tilføje filen ovenfor.",line2:"Venligst accepter."},image:{title:"Tilføj billede?",change:"Annuller"},crop:{title:"Beskær og tilføj dette billede",done:"Udfør"},error:{"default":{title:"Hov!",text:"Noget gik galt under upload.",back:"Venligst prøv igen"},image:{title:"Du kan kun vælge billeder.",text:"Prøv igen med en billedfil.",back:"Vælg billede"},size:{title:"Den fil du valgte, er desværre større end tilladt.",text:"Venligst prøv med en mindre fil."},loadImage:{title:"Fejl",text:"Kan ikke åbne billede"}},multiple:{title:"Du har valgt %files% filer",question:"Vil du tilføje alle disse filer?",tooManyFiles:"Du har valgt for mange filer. %max% er maximum.",tooFewFiles:"Du har valgt %files% filer. Men du skal vælge mindst %min%.",clear:"Fjern alle",done:"Fortsæt"}}}}}}),r.namespace("locale.pluralize",function(e){return e.da=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.de={uploading:"Hochladen... Bitte warten.",loadingInfo:"Laden der Informationen...",errors:{"default":"Error",baddata:"Falscher Wert",size:"Datei zu groß",upload:"Kann nicht hochgeladen werden",user:"Hochladen abgebrochen",info:"Informationen können nicht geladen werden",image:"Nur Bilder sind erlaubt",createGroup:"Datei-Gruppe kann nicht erstellt werden",deleted:"Datei wurde gelöscht"},draghere:"Ziehen Sie eine Datei hier hinein",file:{one:"%1 Datei",other:"%1 Dateien"},buttons:{cancel:"Abbrechen",remove:"Löschen",choose:{files:{one:"Wählen Sie eine Datei",other:"Wählen Sie die Dateien"},images:{one:"Wählen Sie ein Bild",other:"Wählen Sie Bilder"}}},dialog:{
    done:"Fertig",showFiles:"Dateien anzeigen",tabs:{names:{"empty-pubkey":"Willkommen",preview:"Vorschau",file:"Lokale Dateien",url:"Web-Links",camera:"Kamera"},file:{drag:"Ziehen Sie eine Datei hier hinein",nodrop:"Laden Sie Dateien von Ihrem PC hoch",cloudsTip:"Cloud Speicher<br>und soziale Dienste",or:"oder",button:"Wählen Sie eine lokale Datei",also:"Sie können sie auch wählen von"},url:{title:"Dateien vom Web",line1:"Holen Sie sich irgendeine Datei vom Web.",line2:"Geben Sie einfach den Link an.",input:"Bitte geben Sie den Link hier an...",button:"Hochladen"},camera:{capture:"Machen Sie ein Foto",mirror:"Spiegel",retry:"Berechtigungen erneut anfordern",pleaseAllow:{title:"Bitte erlauben Sie den Zugriff auf Ihre Kamera",text:"Sie wurden gebeten, dieser Website den Zugriff auf Ihre Kamera zu erlauben. Um mit Ihrer Kamera Fotos machen zu können, müssen Sie diese Erlaubnis erteilen."},notFound:{title:"Keine Kamera festgestellt",text:"Es sieht so aus, als hätten Sie keine Kamera an dieses Gerät angeschlossen."}},preview:{unknownName:"nicht bekannt",change:"Abbrechen",back:"Zurück",done:"Hinzufügen",unknown:{title:"Hochladen... Bitte warten Sie auf die Vorschau.",done:"Vorschau überspringen und Datei annehmen"},regular:{title:"Diese Datei hinzufügen?",line1:"Diese Datei wird nun hinzugefügt.",line2:"Bitte bestätigen Sie."},image:{title:"Dieses Bild hinzufügen?",change:"Abbrechen"},crop:{title:"Dieses Bild beschneiden und hinzufügen",done:"Fertig",free:"frei"},error:{"default":{title:"Oops!",text:"Etwas ist während dem Hochladen schief gelaufen.",back:"Bitte versuchen Sie es erneut"},image:{title:"Nur Bilder sind akzeptiert.",text:"Bitte veruschen Sie es erneut mit einer anderen Datei.",back:"Bild wählen"},size:{title:"Die gewählte Datei überschreitet das Limit.",text:"Bitte veruschen Sie es erneut mit einer anderen Datei."},loadImage:{title:"Fehler",text:"Das Bild kann nicht geladen werden"}},multiple:{title:"Sie haben %files% Dateien gewählt",question:"Möchten Sie all diese Datein hinzufügen?",tooManyFiles:"Sie haben zu viele Dateien gewählt. %max% ist das Maximum.",tooFewFiles:"Sie haben %files% Dateien. Es sind mindestens %min% nötig.",clear:"Alle löschen",done:"Fertig"}}}}}}),r.namespace("locale.pluralize",function(e){return e.de=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.es={uploading:"Subiendo... Por favor espere.",loadingInfo:"Cargando información...",errors:{"default":"Error",baddata:"Valor incorrecto",size:"Archivo demasiado grande",upload:"No se puede subir",user:"Subida cancelada",info:"No se puede cargar la información",image:"Solo se permiten imágenes",createGroup:"No se puede crear el grupo de archivos",deleted:"El archivo fue eliminado"},draghere:"Arrastra un archivo aquí",file:{one:"%1 archivo",other:"%1 archivos"},buttons:{cancel:"Cancelar",remove:"Eliminar",choose:{files:{one:"Escoge un archivo",other:"Escoge archivos"},images:{one:"Escoge una imagen",other:"Escoge imágenes"}}},dialog:{done:"Hecho",showFiles:"Mostrar archivos",tabs:{names:{"empty-pubkey":"Bienvenido",preview:"Previsualización",file:"Archivos locales",url:"Enlaces arbitrarios",camera:"Cámara"},file:{drag:"Arrastra una archivo aquí",nodrop:"Sube fotos desde tu ordenador",cloudsTip:"Almacenamiento en la nube<br>y redes sociales",or:"o",button:"Elige un archivo de tu ordenador",also:"Tambien puedes seleccionarlo de"},url:{title:"Archivos de la Web",line1:"Coge cualquier archivo de la web.",line2:"Solo danos el link.",input:"Pega tu link aquí...",button:"Subir"},camera:{capture:"Hacer una foto",mirror:"Espejo",retry:"Solicitar permisos de nuevo",pleaseAllow:{title:"Por favor, permite el acceso a tu cámara",text:"Este sitio ha pedido permiso para acceder a la cámara. Para tomar imágenes con tu cámara debes aceptar esta petición."},notFound:{title:"No se ha detectado ninguna cámara",text:"Parece que no tienes ninguna cámara conectada a este dispositivo."}},preview:{unknownName:"desconocido",change:"Cancelar",back:"Atrás",done:"Añadir",unknown:{title:"Subiendo. Por favor espera para una vista previa.",done:"Saltar vista previa y aceptar"},regular:{title:"¿Quieres subir este archivo?",line1:"Estás a punto de subir el archivo de arriba.",line2:"Confírmalo por favor."},image:{title:"¿Quieres subir esta imagen?",change:"Cancelar"},crop:{title:"Cortar y añadir esta imagen",done:"Listo",free:"libre"},error:{"default":{title:"Ups!",text:"Algo salió mal durante la subida.",back:"Por favor, inténtalo de nuevo."},image:{title:"Solo se aceptan archivos de imagen.",text:"Por favor, inténtalo de nuevo con otro archivo.",back:"Escoger imagen"},size:{title:"El archivo que has seleccinado excede el límite.",text:"Por favor, inténtalo de nuevo con otro archivo."},loadImage:{title:"Error",text:"No puede cargar la imagen"}},multiple:{title:"Has escogido %files%",question:"¿Quieres añadir todos estos archivos?",tooManyFiles:"Has escogido demasiados archivos. %max% es el máximo.",tooFewFiles:"Has escogido %files%. Hacen falta al menos %min%.",clear:"Eliminar todo",done:"Hecho"}}}}}}),r.namespace("locale.pluralize",function(e){return e.es=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.et={uploading:"Üleslaadimine… Palun oota.",loadingInfo:"Info laadimine...",errors:{"default":"Viga",baddata:"Incorrect value",size:"Fail on liiga suur",upload:"Ei saa üles laadida",user:"Üleslaadimine tühistatud",info:"Ei saa infot laadida",image:"Ainult pildid lubatud",createGroup:"Ei saa luua failigruppi",deleted:"Fail on kustutatud"},draghere:"Tiri fail siia",file:{one:"%1 fail",other:"%1 failid"},buttons:{cancel:"Tühista",remove:"Kustuta",choose:{files:{one:"Vali fail",other:"Vali failid"},images:{one:"Vali pilt",other:"Vali pildid"}}},dialog:{done:"Valmis",showFiles:"Näita faile",tabs:{names:{"empty-pubkey":"Tere",preview:"Eelvaade",file:"Failid Kõvakettalt",url:"Veebilink",camera:"Kaamera"},file:{drag:"Tiri failid siia",nodrop:"Lae failid arvutist",cloudsTip:"Pilv<br>ja sotsiaalmeedia",or:"või",button:"Vali fail kõvakettalt",also:"Saad samuti valida"},url:{title:"Failid veebist",line1:"Ükskõik mis fail otse veebist.",line2:"Lihtsalt sisesta URL.",input:"Kleebi link siia...",button:"Lae üles"},camera:{capture:"Take a photo",mirror:"Mirror",startRecord:"Record a video",stopRecord:"Stop",cancelRecord:"Cancel",retry:"Request permissions again",pleaseAllow:{title:"Please allow access to your camera",text:"You have been prompted to allow camera access from this site. In order to take pictures with your camera you must approve this request."},notFound:{title:"No camera detected",text:"Looks like you have no camera connected to this device."}},preview:{unknownName:"teadmata",change:"Tühista",back:"Tagasi",done:"Lisa",unknown:{title:"Üleslaadimine... Palun oota eelvaadet.",done:"Jäta eelvaade vahele ja nõustu"},regular:{title:"Lisa see fail?",line1:"Oled lisamas ülaltoodud faili.",line2:"Palun kinnita."},image:{title:"Lisa pilt?",change:"Tühista"},crop:{title:"Lõika ja lisa pilt",done:"Valmis",free:"vaba"},video:{title:"Lisa video?",change:"Tühista"},error:{"default":{title:"Oihh!",text:"Midagi läks üleslaadimisel valesti.",back:"Palun proovi uuesti"},image:{title:"Ainult pildifailid on lubatud.",text:"Palun proovi uuesti teise failiga.",back:"Vali pilt"},size:{title:"Valitud fail ületab maksimaalse suuruse.",text:"Palun proovi uuesti teise failiga."},loadImage:{title:"Viga",text:"Ei saa pilti laadida"}},multiple:{title:"Oled valinud %files%",question:"Kas sa soovid lisada kõik failid?",tooManyFiles:"Oled valinud liiga suure hulga faile. %max% on maksimaalne.",tooFewFiles:"Oled valinud %files%. Vähemalt %min% nõutud.",clear:"Eemalda kõik",done:"Valmis"}}}}}}),r.namespace("locale.pluralize",function(e){return e.et=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.fr={uploading:"Envoi en cours... Merci de patienter.",loadingInfo:"Chargement des informations...",errors:{"default":"Erreur",baddata:"Valeur incorrecte",size:"Fichier trop volumineux",upload:"Envoi impossible",user:"Envoi annulé",info:"Impossible de charger les informations",
    image:"Seules les images sont autorisées",createGroup:"Création d'1 groupe impossible",deleted:"Le fichier a été supprimé"},draghere:"Glissez-déposez un fichier ici",file:{one:"%1 fichier",other:"%1 fichiers"},buttons:{cancel:"Annuler",remove:"Supprimer",choose:{files:{one:"Sélectionner un fichier",other:"Sélectionner des fichiers"},images:{one:"Sélectionner une image",other:"Sélectionner des images"}}},dialog:{done:"Terminer",showFiles:"Voir les fichiers",tabs:{names:{preview:"Avant-première",file:"Fichier en local",url:"Une adresse web","empty-pubkey":"Bienvenue",camera:"Appareil photo"},file:{drag:"Glissez-déposez un fichier ici",nodrop:"Envoyez des fichiers depuis votre ordinateur",cloudsTip:"Stockage sur le cloud<br>et réseaux sociaux",or:"ou",button:"Choisir un fichier local",also:"Vous pouvez également le sélectionner depuis"},url:{title:"Fichiers depuis le Web",line1:"Prenez n'importe quel fichier depuis un site web.",line2:"Saisissez simplement son adresse.",input:"Collez le lien ici...",button:"Envoi"},camera:{capture:"Prendre une photo",mirror:"Miroir",retry:"Envoyer une nouvelle demande de permission",pleaseAllow:{title:"Autorisez l'accès à votre appareil photo",text:"Vous avez été invité à autoriser l'accès à votre appareil photo. Pour prendre des photos avec votre appareil photo vous devez approuver cette demande."},notFound:{title:"Aucun appareil photo détecté",text:"Il semblerait que vous n'ayez pas d'appareil photo connecté à cet appareil."}},preview:{unknownName:"inconnu",change:"Annuler",back:"Retour",done:"Ajouter",unknown:{title:"Envoi en cours... Merci de patienter pour prévisualiser.",done:"Passer la prévisualisation et accepter"},regular:{title:"Ajouter ce fichier ?",line1:"Vous êtes sur le point d'ajouter le fichier ci-dessus.",line2:"Merci de confirmer."},image:{title:"Ajouter cette image ?",change:"Annuler"},crop:{title:"Recadrer et ajouter cette image",done:"Terminer",free:"libre"},error:{"default":{title:"Oups!",text:"Quelque chose n'a pas fonctionné pendant l'envoi.",back:"Merci de bien vouloir recommencer"},image:{title:"Seules les images sont acceptées.",text:"Merci de bien vouloir recommencer avec un autre fichier.",back:"Choisir une image"},size:{title:"Le fichier sélectionné est trop volumineux.",text:"Merci de bien vouloir recommencer avec un autre fichier."},loadImage:{title:"Erreur",text:"Impossible de charger l'image"}},multiple:{title:"Vous avez choisi %files%",question:"Voulez vous ajouter tous ces fichiers ?",clear:"Tout retirer",done:"Terminer",tooManyFiles:"Vous avez choisi trop de fichiers. %max% est le maximum.",tooFewFiles:"Vous avez choisi %fichiers%. %min% est le minimum."}}}}}}),r.namespace("locale.pluralize",function(e){return e.fr=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.he={uploading:"טוען... אנא המתן.",loadingInfo:"טוען מידע...",errors:{"default":"שגיאה",baddata:"ערך שגוי",size:"קובץ גדול מידי",upload:"לא ניתן להעלות",user:"העלאה בוטלה",info:"לא ניתן לטעון מידע",image:"ניתן להעלות רק תמונות",createGroup:"לא ניתן ליצור קבוצה",deleted:"הקובץ נמחק"},draghere:"שחרר כאן קובץ",file:{one:"קובץ %1",other:"%1 קבצים"},buttons:{cancel:"ביטול",remove:"הסר",choose:{files:{one:"בחר קובץ",other:"בחר קבצים"},images:{one:"בחר תמונה",other:"בחר תמונות"}}},dialog:{done:"סיום",showFiles:"הצג קבצים",tabs:{names:{facebook:"פייסבוק",dropbox:"דרופבוקס",gdrive:"כונן גוגל",instagram:"אינסטגרם",url:"לינק מהאינטרנט"},file:{drag:"שחרר כאן קובץ",nodrop:"העלה קבצים מהמחשב",or:"או",button:"בחר קובץ מהמחשב",also:"ניתן לבחור גם מ"},url:{title:"קובץ מהאינטרנט",line1:"גרור קובץ מהאינטרנט",line2:"ספק את כתובת הקובץ",input:"הדבק את כתובת הקובץ...",button:"העלה"},preview:{unknownName:"לא ידוע",change:"ביטול",back:"חזרה",done:"הוסף",unknown:{title:"מעלה... נא המתן לתצוגה מקדימה.",done:"דלג על תצוגה מקדימה"},regular:{title:"להוסיף קובץ זה?",line1:"קובץ זה יועלה",line2:"נא אשר."},image:{title:"להוסיף תמונה זו?",change:"ביטול"},crop:{title:"חתוך והוסף תמונה זו",done:"סיום"},error:{"default":{title:"אופס!",text:"משהו השתבש בזמן ההעלאה.",back:"נא נסה שוב"},image:{title:"ניתן לקבל רק קבצי תמונות.",text:"נא נסה שוב עם קובץ אחר.",back:"בחר תמונה"},size:{title:"הקובץ שבחרת חורג מהגבול.",text:"נא נסה שוב עם קובץ אחר."},loadImage:{title:"שגיאה",text:"טעינת התמונה נכשלה"}},multiple:{title:"בחרת %files%",question:"אתה מעוניין להוסיף את כל הקבצים האלו?",tooManyFiles:"בחרת יותר מידי קבצים. יש לבחור מקסימום %max% קבצים.",tooFewFiles:"בחרת %files%. יש לבחור לפחות %min%.",clear:"הסר הכל",done:"סיום"}}}}}}),r.namespace("locale.pluralize",function(e){return e.he=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.it={uploading:"Caricamento in corso... Si prega di attendere.",loadingInfo:"Caricamento informazioni in corso...",errors:{"default":"Errore",baddata:"Valore errato",size:"Il file è troppo grande",upload:"Impossibile fare l’upload",user:"Upload cancellato",info:"Impossibile caricare le informazioni",image:"Sono ammesse solo immagini",createGroup:"Impossibile creare gruppo di file",deleted:"Il file è stato eliminato"},draghere:"Trascina un file qui",file:{one:"file %1",other:"file %1"},buttons:{cancel:"Cancella",remove:"Rimuovi",choose:{files:{one:"Seleziona un file",other:"Seleziona file"},images:{one:"Seleziona un’immagine",other:"Seleziona immagini"}}},dialog:{done:"Fatto",showFiles:"Mostra file",tabs:{names:{"empty-pubkey":"Benvenuto",preview:"Anteprima",file:"File locali",url:"Link arbitrari",camera:"Fotocamera"},file:{drag:"Trascina un file qui",nodrop:"Carica file dal tuo computer",cloudsTip:"Salvataggi nel cloud<br>e servizi sociali",or:"o",button:"Seleziona un file locale",also:"Puoi anche scegliere da"},url:{title:"File dal web",line1:"Preleva un file dal web.",line2:"È sufficiente fornire il link.",input:"Incolla il tuo link qui...",button:"Carica"},camera:{capture:"Scatta una foto",mirror:"Specchio",retry:"Richiedi di nuovo le autorizzazioni",pleaseAllow:{title:"Consenti l’accesso alla tua fotocamera",text:"Ti è stato richiesto di consentire l’accesso alla fotocamera da questo sito. Per scattare le foto con la tua fotocamera devi accettare questa richiesta."},notFound:{title:"Nessuna fotocamera rilevata",text:"Non risulta che tu non abbia una fotocamera collegata a questo dispositivo."}},preview:{unknownName:"sconosciuto",change:"Cancella",back:"Indietro",done:"Aggiungi",unknown:{title:"Caricamento in corso... Attendi l’anteprima.",done:"Salta l’anteprima e accetta"},regular:{title:"Vuoi aggiungere questo file?",line1:"Stai per aggiungere il file sopra.",line2:"Conferma."},image:{title:"Vuoi aggiungere questa immagine?",change:"Cancella"},crop:{title:"Ritaglia e aggiungi questa immagine",done:"Fatto",free:"gratis"},error:{"default":{title:"Ops!",text:"Si è verificato un problema durante l’upload.",back:"Si prega di riprovare"},image:{title:"Sono accettati solo file immagine.",text:"Riprova con un altro file.",back:"Scegli immagine"},size:{title:"Il file selezionato supera il limite.",text:"Riprova con un altro file."},loadImage:{title:"Errore",text:"Impossibile caricare l’immagine"}},multiple:{title:"Hai selezionato %files%",question:"Vuoi aggiungere tutti questi file?",tooManyFiles:"Hai selezionato troppi file. %max% è il massimo.",tooFewFiles:"Hai selezionato %files%. È richiesto almeno %min%.",clear:"Rimuovi tutto",done:"Fatto"}}}}}}),r.namespace("locale.pluralize",function(e){return e.it=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.ja={uploading:"アップロードしています… 完了までお待ち下さい。",loadingInfo:"読み込み中…",errors:{"default":"エラー",baddata:"間違った値",size:"ファイルが大きすぎます",upload:"アップロードできませんでした",user:"アップロードがキャンセルされました",info:"読み込みに失敗しました",image:"アップロードできるのは画像ファイルのみです",createGroup:"グループの作成に失敗しました",deleted:"削除されたファイルです"},draghere:"ここにファイルをドロップ",file:{other:"%1ファイル"},buttons:{cancel:"キャンセル",remove:"削除",choose:{files:{one:"ファイルを選択",other:"ファイルを選択"},images:{one:"画像を選択",other:"画像を選択"}}},dialog:{done:"完了",showFiles:"ファイルを表示",tabs:{names:{preview:"プレビュー",file:"ローカルファイル",url:"URLを直接入力"},file:{drag:"ここにファイルをドロップ",nodrop:"ファイルを選択してアップロード",
    cloudsTip:"クラウドストレージ<br>およびソーシャルサービス",or:"もしくは",button:"ローカルのファイルを選択",also:"次からも選択可能です："},url:{title:"ウェブ上のファイル",line1:"ウェブ上からファイルを取得します。",line2:"URLを入力してください。",input:"ここにURLを貼り付けしてください…",button:"アップロード"},preview:{unknownName:"不明なファイル",change:"キャンセル",back:"戻る",done:"追加",unknown:{title:"アップロードしています… プレビューの表示をお待ちください。",done:"プレビューの確認をスキップして完了"},regular:{title:"このファイルを追加しますか？",line1:"こちらのファイルを追加しようとしています。",line2:"確認してください。"},image:{title:"この画像を追加しますか？",change:"キャンセル"},crop:{title:"画像の切り取りと追加",done:"完了",free:"リセット"},error:{"default":{title:"失敗しました",text:"アップロード中に不明なエラーが発生しました。",back:"もう一度お試し下さい"},image:{title:"画像ファイルのみ許可されています",text:"他のファイルで再度お試し下さい。",back:"画像を選択"},size:{title:"ファイルサイズが大きすぎます。",text:"他のファイルで再度お試し下さい。"},loadImage:{title:"エラー",text:"画像のロードに失敗しました。"}},multiple:{title:"%files%つのファイルを選択中",question:"これら全てのファイルを追加しますか？",tooManyFiles:"選択ファイルが多すぎます。%max%つ以下にしてください。",tooFewFiles:"選択ファイルが少なすぎます。%files%つ選択中です。少なくとも%min%つ選択してください。",clear:"全て削除",done:"完了"}}}}}}),r.namespace("locale.pluralize",function(e){return e.ja=function(e){return"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.lv={uploading:"Augšupielādē... Lūdzu, gaidiet.",errors:{"default":"Kļūda",image:"Atļauti tikai attēli"},draghere:"Velciet failus šeit",file:{zero:"%1 failu",one:"%1 fails",other:"%1 faili"},buttons:{cancel:"Atcelt",remove:"Dzēst"},dialog:{title:"Ielādēt jebko no jebkurienes",poweredby:"Darbināts ar",support:{images:"Attēli",audio:"Audio",video:"Video",documents:"Dokumenti"},tabs:{file:{title:"Mans dators",line1:"Paņemiet jebkuru failu no jūsu datora.",line2:"Izvēlēties ar dialogu vai ievelciet iekšā.",button:"Meklēt failus"},url:{title:"Faili no tīmekļa",line1:"Paņemiet jebkuru failu no tīmekļa.",line2:"Tikai uzrādiet linku.",input:"Ielīmējiet linku šeit...",button:"Ielādēt"}}}}}),r.namespace("locale.pluralize",function(e){return e.lv=function(e){return 0===e?"zero":e%10===1&&e%100!==11?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.nb={uploading:"Laster opp... Vennligst vent.",loadingInfo:"Laster inn info...",errors:{"default":"Feil",baddata:"Ugyldig verdi",size:"Filen er for stor",upload:"Kan ikke laste opp",user:"Opplasting avbrutt",info:"Kan ikke laste inn info",image:"Kun bilder er tillatt",createGroup:"Kan ikke opprette filgruppe",deleted:"Filen er slettet"},draghere:"Dra en fil hit",file:{one:"%1 fil",other:"%1 filer"},buttons:{cancel:"Avbryt",remove:"Fjern",choose:{files:{one:"Velg en fil",other:"Velg filer"},images:{one:"Velg et bilde",other:"Velg bilder"}}},dialog:{done:"Ferdig",showFiles:"Vis filer",tabs:{names:{preview:"Forhåndsvising",file:"Lokale filer",url:"Direktelink"},file:{drag:"Dra og slipp en fil her",nodrop:"Last opp filer fra datamaskinen",cloudsTip:"Skylagring<br>og sosiale tjenester",or:"eller",button:"Velg en lokal fil",also:"Du kan også velge det fra"},url:{title:"Filer fra internett",line1:"Velg hvilken som helst fil fra internett.",line2:"Bare gi oss linken.",input:"Lim inn linken her...",button:"Last opp"},preview:{unknownName:"ukjent",change:"Avbryt",back:"Tilbake",done:"Legg til",unknown:{title:"Laster opp... Vennligst vent på forhåndsvisning.",done:"Hopp over forhåndsvisning og godkjenn"},regular:{title:"Legge til denne filen?",line1:"Filen legges nå til.",line2:"Vennligst bekreft."},image:{title:"Legge til dette bildet?",change:"Avbryt"},crop:{title:"Kutt og legg til dette bildet",done:"Ferdig",free:"frigjør"},error:{"default":{title:"Ops!",text:"Noe gikk galt under opplastingen.",back:"Vennligst prøv igjen"},image:{title:"Kun bilder er akseptert.",text:"Prøv igjen med en annen fil.",back:"Velg bilde"},size:{title:"Den valgte filen overskrider tilatt størrelse.",text:"Vennligst prøv igjen med en annen fil."},loadImage:{title:"Feil",text:"Kan ikke laste bildet"}},multiple:{title:"Du har valgt %files%",question:"Ønsker du å legge til alle filene?",tooManyFiles:"Du har valgt for mange filer. %max% er maksimum.",tooFewFiles:"Du har valgt %files%. Minimum %min% er påkrevd.",clear:"Fjern alle",done:"Ferdig"}}}}}}),r.namespace("locale.pluralize",function(e){return e.nb=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.nl={uploading:"Uploaden... Even geduld.",loadingInfo:"Laden informatie...",errors:{"default":"Fout",baddata:"Ongeldige waarde",size:"Bestand is te groot",upload:"Kan niet uploaden",user:"Upload geannulleerd",info:"Kan informatie niet laden",image:"Alleen afbeeldingen toegestaan",createGroup:"Kan bestandsgroep niet maken",deleted:"Bestand is verwijderd"},draghere:"Drop hier een bestand",file:{one:"%1 bestand",other:"%1 bestanden"},buttons:{cancel:"Annuleren",remove:"Verwijderen",choose:{files:{one:"Kies een bestand",other:"Kies bestanden"},images:{one:"Kies een afbeelding",other:"Kies afbeeldingen"}}},dialog:{done:"Klaar",showFiles:"Toon bestanden",tabs:{names:{preview:"Voorvertoning",file:"Computer",url:"Directe links"},file:{drag:"Drop hier een bestand",nodrop:"Upload bestanden van je computer",or:"of",button:"Selecteer een bestand van je computer",also:"Je kan ook selecteren van"},url:{title:"Bestanden van het web",line1:"Selecteer een bestand van het web.",line2:"Voer de link in.",input:"Plak de link hier...",button:"Upload"},preview:{unknownName:"onbekend",change:"Annuleren",back:"Terug",done:"Toevoegen",unknown:{title:"Uploaden... Wacht op de voorvertoning.",done:"Voorvertoning overslaan an accepteren"},regular:{title:"Dit bestand toevoegen?",line1:"Je staat op het punt bovenstaand bestand toe te voegen.",line2:"Bevestig."},image:{title:"Voeg deze afbeelding toe?",change:"Annuleren"},crop:{title:"Afbeelding bijknippen en toevoegen",done:"Klaar"},error:{"default":{title:"Oeps!",text:"Er is een fout opgetreden tijdens het uploaden.",back:"Probeer het nog eens"},image:{title:"Alleen afbeeldingen worden geaccepteerd.",text:"Probeer het nog eens met een andere bestand.",back:"Selecteer afbeelding"},size:{title:"Het geselecteerd bestand is groter dan de limiet.",text:"Probeer het nog eens met een andere bestand."},loadImage:{title:"Fout",text:"Kan afbeelding niet laden"}},multiple:{title:"Je hebt de volgende bestanden geselecteerd %files%",question:"Wil je al deze bestanden toevoegen?",tooManyFiles:"Je hebt teveel bestanden geselecteerd. %max% is het maximum.",tooFewFiles:"Je hebt de volgende bestanden geselecteerd %files%. Minimaal %min% is verplicht.",clear:"Verwijder alle bestanden",done:"Klaar"}}}}}}),r.namespace("locale.pluralize",function(e){return e.nl=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.pl={uploading:"Przesyłanie... Proszę czekać.",loadingInfo:"Loading info...",errors:{"default":"Błąd",baddata:"Niepoprawna wartość",size:"Plik zbyt duży",upload:"Nie udało się przesłać",user:"Przesyłanie anulowane",info:"Nie udało się załadować informacji",image:"Dozwolone są tylko obrazy",createGroup:"Nie udało się utworzyć grupy plików",deleted:"Plik został usunięty"},draghere:"Upuść plik tutaj",file:{one:"%1 plik",few:"%1 pliki",many:"%1 plików"},buttons:{cancel:"Anuluj",remove:"Usuń",choose:{files:{one:"Wybierz plik",other:"Wybierz pliki"},images:{one:"Wybierz obraz",other:"Wybierz obrazy"}}},dialog:{done:"Wykonano",showFiles:"Pokaż pliki",tabs:{names:{"empty-pubkey":"Witaj",preview:"Podgląd",file:"Pliki lokalne",url:"Plik z Sieci",camera:"Aparat"},file:{drag:"Upuść plik tutaj",nodrop:"Prześlij pliki z Twojego komputera",cloudsTip:"Dane w chmurze<br>i sieci społecznościowe",or:"lub",button:"Wybierz plik lokalny",also:"Możesz również wybrać z"},url:{title:"Pliki z Sieci",line1:"Złap jakikolwiej plik z sieci.",line2:"Podaj adres.",input:"Wklej link...",button:"Prześlij"},camera:{capture:"Zrób zdjęcie",mirror:"Lustro",retry:"Poproś ponownie o dostęp",pleaseAllow:{title:"Prośba o udostępnienie aparatu",text:"Zostałeś poproszony przez tę stronę o dostęp do aparatu. Aby robić zdjecia, musisz zaakceptować tę prośbę."},notFound:{title:"Nie wykryto aparatu.",text:"Wygląda na to, że nie masz podłączonego aparatu do tego urządzenia."}},preview:{unknownName:"nieznany",change:"Anuluj",back:"Wstecz",done:"Dodaj",
    unknown:{title:"Przesyłanie... Proszę czekać na podgląd.",done:"Omiń podgląd i zaakceptuj."},regular:{title:"Dodać ten plik?",line1:"Zamierzasz dodać nowy plik.",line2:"Potwierdź, proszę."},image:{title:"Dodać ten obraz?",change:"Anuluj"},crop:{title:"Przytnij i dodaj ten obraz",done:"Wykonano",free:"wolny"},error:{"default":{title:"Oops!",text:"Coś poszło nie tak podczas przesyłania.",back:"Spróbuj ponownie"},image:{title:"Akceptowane są tylko obrazy.",text:"Spróbuj ponownie z innym plikiem.",back:"Wybierz obraz"},size:{title:"Plik, który wybrałeś, przekracza dopuszczalny rozmiar",text:"Spróbuj ponownie z innym plikiem."},loadImage:{title:"Błąd",text:"Nie udało się załadować obrazu"}},multiple:{title:"Wybrałeś %files%",question:"Czy chcesz dodać wszystkie te pliki?",tooManyFiles:"Wybrałeś zbyt wiele plików. Maksimum to %max%.",tooFewFiles:"Wybrałeś %files%. Wymagane jest co najmniej %min%.",clear:"Usuń wszystkie",done:"Wykonano"}}}}}}),r.namespace("locale.pluralize",function(e){return e.pl=function(e){var t;return 1===e?"one":2<=(t=e%10)&&4>=t&&1!==(e/10%10|0)?"few":"many"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.pt={uploading:"Fazendo upload... Aguarde.",loadingInfo:"Carregando informações...",errors:{"default":"Erro",baddata:"Valor incorreto",size:"Arquivo muito grande",upload:"Não foi possível fazer o upload",user:"Upload cancelado",info:"Não foi possível carregar as informações",image:"Apenas imagens são permitidas",createGroup:"Não foi possível criar o grupo de arquivos",deleted:"O arquivo foi excluído"},draghere:"Arraste um arquivo para cá",file:{one:"%1 arquivo",other:"%1 arquivos"},buttons:{cancel:"Cancelar",remove:"Excluir",choose:{files:{one:"Escolha um arquivo",other:"Escolha arquivos"},images:{one:"Escolha um imagem",other:"Escolha imagens"}}},dialog:{done:"OK",showFiles:"Mostrar arquivos",tabs:{names:{preview:"Pré-estréia",file:"Computador",url:"Link da web"},file:{drag:"Arraste um arquivo para cá",nodrop:"Faça upload de arquivos do seu computador",or:"ou",button:"Escolha um arquivo do computador",also:"Você também pode escolher arquivos de"},url:{title:"Arquivos da web",line1:"Faça upload de qualquer arquivo da web.",line2:"Apenas informe o link.",input:"Cole seu link aqui...",button:"Upload"},camera:{capture:"Tirar uma foto",mirror:"Espelhar",startRecord:"Gravar um vídeo",stopRecord:"Parar",cancelRecord:"Cancelar",retry:"Requisitar permissão novamente",pleaseAllow:{title:"Por favor permita o acesso a sua câmera",text:"Você foi solicitado a permitir o acesso à câmera a partir deste site. Para tirar fotos com sua câmera, você deve aprovar este pedido."},notFoud:{title:"Câmera não detectada",text:"Parece que você não tem uma câmera conectada a este dispositivo"}},preview:{unknownName:"desconhecido",change:"Cancelar",back:"Voltar",done:"Adicionar",unknown:{title:"Fazendo upload... Aguarde o preview.",done:"Pular preview e aceitar"},regular:{title:"Adicionar esse arquivo?",line1:"Você está prestes a adicionar o arquivo acima.",line2:"Por favor, confirme."},image:{title:"Adicionar essa imagem?",change:"Cancelar"},crop:{title:"Cortar e adicionar essa imagem",done:"OK",free:"livre"},error:{"default":{title:"Oops!",text:"Alguma coisa deu errado durante o upload.",back:"Por favor, tente novamente"},image:{title:"Apenas arquivos de imagem são aceitos.",text:"Por favor, tente novamente com outro arquivo.",back:"Escolher a imagem"},size:{title:"O arquivo que você escolheu excede o limite.",text:"Por favor, tente novamente com outro arquivo."},loadImage:{title:"Erro",text:"Não foi possível carregar a imagem"}},multiple:{title:"Você escolheu",question:"Você quer adicionar todos esses arquivos?",clear:"Excluir todos",done:"OK"}}}}}}),r.namespace("locale.pluralize",function(e){return e.pt=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.ru={uploading:"Идет загрузка",loadingInfo:"Загрузка информации...",errors:{"default":"Ошибка",baddata:"Некорректные данные",size:"Слишком большой файл",upload:"Ошибка при загрузке",user:"Загрузка прервана",info:"Ошибка при загрузке информации",image:"Разрешены только изображения",createGroup:"Не удалось создать группу файлов",deleted:"Файл удалён"},draghere:"Перетащите файл сюда",file:{one:"%1 файл",few:"%1 файла",many:"%1 файлов"},buttons:{cancel:"Отмена",remove:"Удалить",choose:{files:{one:"Выбрать файл",other:"Выбрать файлы"},images:{one:"Выбрать изображение",other:"Выбрать изображения"}}},dialog:{done:"Готово",showFiles:"Показать файлы",tabs:{names:{preview:"Предпросмотр","empty-pubkey":"Приветствие",file:"Локальные файлы",vk:"ВКонтакте",url:"Произвольная ссылка",camera:"Камера"},file:{drag:"Перетащите файл сюда",nodrop:"Загрузка файлов с вашего компьютера",cloudsTip:"Облачные хранилища<br>и социальные сети",or:"или",button:"Выберите локальный файл",also:"Вы также можете загрузить файлы, используя:"},url:{title:"Файлы с других сайтов",line1:"Загрузите любой файл из сети.",line2:"",input:"Укажите здесь ссылку...",button:"Загрузить"},camera:{capture:"Сделать снимок",mirror:"Отразить",retry:"Повторно запросить разрешение",pleaseAllow:{title:"Пожалуйста, разрешите доступ к камере",text:"Для того, чтобы сделать снимок, мы запросили разрешение на доступ к камере с этого сайта."},notFound:{title:"Камера не найдена",text:"Скорее всего камера не подключена или не настроена."}},preview:{unknownName:"неизвестно",change:"Отмена",back:"Назад",done:"Добавить",unknown:{title:"Загрузка... Пожалуйста подождите.",done:"Пропустить предварительный просмотр"},regular:{title:"Загрузить этот файл?",line1:"Вы собираетесь добавить этот файл:",line2:"Пожалуйста, подтвердите."},image:{title:"Добавить это изображение?",change:"Отмена"},video:{title:"Добавить это видео?",change:"Отмена"},crop:{title:"Обрезать и добавить это изображение",done:"Готово",free:"произв."},error:{"default":{title:"Ой!",text:"Что-то пошло не так во время загрузки.",back:"Пожалуйста, попробуйте ещё раз"},image:{title:"Можно загружать только изображения.",text:"Попробуйте загрузить другой файл.",back:"Выберите изображение"},size:{title:"Размер выбранного файла превышает лимит.",text:"Попробуйте загрузить другой файл."},loadImage:{title:"Ошибка",text:"Изображение не удалось загрузить"}},multiple:{title:"Вы выбрали %files%",question:"Вы хотите добавить все эти файлы?",tooManyFiles:"Вы выбрали слишком много файлов. %max% максимум.",tooFewFiles:"Вы выбрали %files%. Нужно не меньше %min%.",clear:"Удалить все",done:"Готово"}}}}}}),r.namespace("locale.pluralize",function(e){return e.ru=function(e){return 1===(e/10%10|0)||e%10===0||e%10>4?"many":e%10===1?"one":"few"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.sv={uploading:"Laddar... Var god vänta.",loadingInfo:"Laddar info...",errors:{"default":"Error",baddata:"Felaktigt värde",size:"Filen är för stor",upload:"Kan inte ladda upp",user:"Uppladdning avbruten",info:"Kan inte ladda informationen",image:"Endast bilder tillåtna",createGroup:"Kan inte skapa filgrupp",deleted:"Fil raderad"},draghere:"Dra filen hit",file:{one:"%1 fil",other:"%1 filer"},buttons:{cancel:"Avbryt",remove:"Ta bort",choose:{files:{one:"Välj fil",other:"Välj filer"},images:{one:"Välj en fil",other:"Välj filer"}}},dialog:{done:"Klar",showFiles:"Visa filer",tabs:{names:{"empty-pubkey":"Välkommen",preview:"Förhandsgranskning",file:"Lokala filer",url:"Direkta länkar",camera:"Kamera"},file:{drag:"Släpp filen här",nodrop:"Ladda upp filer från din dator",cloudsTip:"Cloud storages<br>och sociala nätverk",or:"eller",button:"Välj en lokal fil",also:"Du kan också välja den från"},url:{title:"Filer från webben",line1:"Välj en fil från en web adress.",line2:"Agge bara länken til filen.",input:"Klistra in din länk här...",button:"Ladda upp"},camera:{capture:"Ta ett foto",mirror:"Spegel",retry:"Begär tillstånd igen",pleaseAllow:{title:"Vänligen ge tillgång till din kamera",text:"Du har uppmanats att tillåta att denna webbplats får tillgång till din kamera.För att ta bilder med din kamera måste du godkänna denna begäran."},notFound:{title:"Ingen kamera funnen",text:"Det varkar som att du inte har något kamera ansluten till denna enheten."
    }},preview:{unknownName:"okänd",change:"Avbryt",back:"Tillbaka",done:"Lägg till",unknown:{title:"Laddar... Vänligen vänta på förhandsgranskning.",done:"Skippa förhandsgranskning och acceptera"},regular:{title:"Lägg till denna filen?",line1:"Du håller på att lägga till filen ovan.",line2:"Vänligen bekräfta."},image:{title:"Lägg till denna bilden?",change:"Avbryt"},crop:{title:"Beskär och lägg till denna bild",done:"Klar",free:"free"},error:{"default":{title:"Oops!",text:"Någonting gick fel under uppladdningen.",back:"Vänligen försök igen"},image:{title:"Endast bildfiler accepteras.",text:"Vänligen försök igen med en annan fil.",back:"Välj bild"},size:{title:"Filen du har valt är för stor.",text:"Vänligen försök igen med en annan fil."},loadImage:{title:"Error",text:"Kan inte ladda bild"}},multiple:{title:"Du har valt %files%",question:"Vill du lägga till alla dessa filer?",tooManyFiles:"Du har valt för många filer. %max% är max.",tooFewFiles:"Du har valt %files%. Minst %min% krävs.",clear:"Ta bort alla",done:"Klar"}}}}}}),r.namespace("locale.pluralize",function(e){return e.sv=function(e){return 1===e?"one":"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.tr={uploading:"Yükleniyor... Lütfen bekleyin.",loadingInfo:"Bilgiler yükleniyor...",errors:{"default":"Hata",baddata:"Geçersiz değer",size:"Dosya çok büyük",upload:"Yüklenemedi",user:"Yükleme iptal edildi",info:"Bilgiler getirilemedi",image:"Sadece resim dosyası yüklenebilir",createGroup:"Dosya grubu yaratılamıyor",deleted:"Dosya silinmiş"},draghere:"Buraya bir dosya bırakın",file:{other:"%1 dosya"},buttons:{cancel:"İptal",remove:"Kaldır",choose:{files:{one:"Dosya Seçin",other:"Dosya Seçin"},images:{one:"Resim Dosyası Seçin",other:"Resim Dosyası Seçin"}}},dialog:{done:"Bitti",showFiles:"Dosyaları Göster",tabs:{names:{"empty-pubkey":"Hoş geldiniz",preview:"Önizleme",file:"Bilgisayar",url:"Dış Bağlantılar",camera:"Kamera"},file:{drag:"Buraya bir dosya bırakın",nodrop:"Bilgisayarınızdan dosya yükleyin",or:"ya da",button:"Bilgisayardan bir dosya seç",also:"Diğer yükleme seçenekleri",cloudsTip:"Bulut depolamalar<br>ve sosyal hizmetler"},url:{title:"Webden dosyalar",line1:"Webden herhangi bir dosya seçin.",line2:"Dosya bağlantısını sağlayın.",input:"Bağlantınızı buraya yapıştırın...",button:"Yükle"},camera:{capture:"Fotoğraf çek",mirror:"Ayna",retry:"Tekrar izin iste",pleaseAllow:{title:"Lütfen kameranıza erişilmesine izin verin",text:"Bu siteden kamera erişimine izin vermeniz talep ediliyor. Kameranızla fotoğraf çekmek için bu isteği onaylamanız gerekmektedir."},notFound:{title:"Kamera algılanamadı",text:"Bu cihaza kamera bağlantısının olmadığı görünüyor."}},preview:{unknownName:"bilinmeyen",change:"İptal",back:"Geri",done:"Ekle",unknown:{title:"Yükleniyor... Önizleme için lütfen bekleyin.",done:"Önizlemeyi geç ve kabul et"},regular:{title:"Bu dosya eklensin mi?",line1:"Yukarıdaki dosyayı eklemek üzeresiniz.",line2:"Lütfen onaylayın."},image:{title:"Bu görsel eklensin mi?",change:"İptal"},crop:{title:"Bu görseli kes ve ekle",done:"Bitti"},error:{"default":{title:"Aman!",text:"Yükleme sırasında bir hata oluştu.",back:"Lütfen tekrar deneyin."},image:{title:"Sadece resim dosyaları kabul edilmektedir.",text:"Lütfen başka bir dosya ile tekrar deneyin.",back:"Resim dosyası seç"},size:{title:"Seçtiğiniz dosya limitleri aşıyor.",text:"Lütfen başka bir dosya ile tekrar deneyin."},loadImage:{title:"Hata",text:"Resim dosyası yüklenemedi"}},multiple:{title:"%files% dosya seçtiniz",question:"Bu dosyaların hepsini eklemek istiyor musunuz?",tooManyFiles:"Fazla sayıda dosya seçtiniz, en fazla %max% dosya olabilir.",tooFewFiles:"%files% dosya seçtiniz, en az %min% dosya olmalıdır.",clear:"Hepsini kaldır",done:"Bitti"}}}}}}),r.namespace("locale.pluralize",function(e){return e.tr=function(e){return"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.zhTW={uploading:"上傳中...請等待",loadingInfo:"正在讀取資訊...",errors:{"default":"錯誤",baddata:"錯誤資料",size:"檔案太大",upload:"無法上傳",user:"上傳被取消",info:"無法讀取資訊",image:"只允許圖片檔案",createGroup:"無法建立檔案群組",deleted:"檔案已被刪除"},draghere:"拖放檔案到這裡",file:{other:"%1 個檔案"},buttons:{cancel:"取消",remove:"刪除",choose:{files:{one:"選擇檔案",other:"選擇檔案"},images:{one:"選擇圖片",other:"選擇圖片"}}},dialog:{done:"完成",showFiles:"顯示檔案",tabs:{names:{"empty-pubkey":"歡迎",preview:"預覽",file:"從本機上傳",url:"任意圖片連結",camera:"相機"},file:{drag:"拖放檔案到這裡",nodrop:"從你的本機中上傳",cloudsTip:"雲端硬碟<br>與社群網站",or:"或者",button:"從本機中選取檔案",also:"你也可以選自"},url:{title:"來自網際網路的檔案",line1:"從網際網路選取檔案",line2:"只需提供連結",input:"將連結複製至此...",button:"上傳"},camera:{capture:"拍照",mirror:"鏡像",retry:"重新取得相機權限",pleaseAllow:{title:"請允許使存取您的相機",text:"你一直在提示允許來自這個網站的訪問攝像頭。為了拍照用你的相機，你必須批准這一請求。"},notFound:{title:"沒有找到相機",text:"看起來你有沒有將連接相機。"}},preview:{unknownName:"未知",change:"取消",back:"返回",done:"加入",unknown:{title:"上傳中...請等待預覽",done:"跳過預覽，直接接受"},regular:{title:"加入這個檔案？",line1:"你將加入上面的檔案。",line2:"請確認。"},image:{title:"加入這個圖片？",change:"取消"},crop:{title:"裁切並加入這個圖片",done:"完成",free:"自由裁切"},error:{"default":{title:"錯誤！",text:"上傳過程中出錯。",back:"請重試"},image:{title:"只允許上傳圖片檔案。",text:"請選擇其他檔案重新上傳。",back:"選擇圖片"},size:{title:"你選取的檔案超過了100MB的上限",text:"請用另一個檔案再試一次。"},loadImage:{title:"錯誤",text:"無法讀取圖片"}},multiple:{title:"你已經選擇 %files%",question:"你要加入所有檔案嗎？",tooManyFiles:"你選了太多的檔案. 最多可選擇%max%. 請刪除一些。",tooFewFiles:"你所選擇的檔案 %files%. 至少要 %min% .",clear:"清空",done:"完成"}}}}}}),r.namespace("locale.pluralize",function(e){return e.zhTW=function(e){return"other"}})}.call(this),function(){r.namespace("locale.translations",function(e){return e.zh={uploading:"上传中...请等待",loadingInfo:"正在读取信息...",errors:{"default":"错误",baddata:"错误数据",size:"文件太大",upload:"无法上传",user:"上传被取消",info:"无法读取信息",image:"只允许图形文件",createGroup:"无法建立文件组",deleted:"文件已被删除"},draghere:"拖放文件到这里",file:{other:"%1 个文件"},buttons:{cancel:"取消",remove:"删除"},dialog:{done:"完成",showFiles:"显示文件",tabs:{names:{url:"任意图片链接"},file:{drag:"拖放文件到这里",nodrop:"从你的电脑中上传",or:"或者",button:"从电脑中选取文件",also:"你也可以选自"},url:{title:"来自互联网的文件",line1:"从互联网选取文件",line2:"只需提供链接",input:"将链接拷贝至此...",button:"上传"},preview:{unknownName:"未知",change:"取消",back:"返回",done:"添加",unknown:{title:"上传中...请等待预览",done:"跳过预览，直接接受"},regular:{title:"添加这个文件?",line1:"你将添加上面的文件。",line2:"请确认。"},image:{title:"添加这个图片?",change:"取消"},crop:{title:"剪裁并添加这个图片",done:"完成"},error:{"default":{title:"错误!",text:"上传过程中出错。",back:"请重试"},image:{title:"只允许上传图片文件。",text:"请选择其他文件重新上传。",back:"选择图片"},size:{title:"你选取的文件超过了100MB的上限",text:"请用另一个文件再试一次。"},loadImage:{title:"错误",text:"无法读取图片"}},multiple:{title:"你已经选择 %files%",question:"你要添加所有文件吗？",tooManyFiles:"你选了太多的文件. 最多可选择%max%. 请删除一些。",clear:"清空",done:"完成"}}}}}}),r.namespace("locale.pluralize",function(e){return e.zh=function(){return"other"}})}.call(this),function(){var e;r.jQuery.noConflict(!0),r.expose("locales",function(){var t;t=[];for(e in r.locale.translations)t.push(e);return t}())}.call(this),r.__exports});
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//






;
