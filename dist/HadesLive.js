(function () {
  'use strict';

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (isPlainObject(result[key]) && isPlainObject(val)) {
        result[key] = merge(result[key], val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code
      };
    };
    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  var cookies = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
        function resolveURL(url) {
          var href = url;

          if (msie) {
          // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;

      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      // Listen for ready state
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }

      if (!requestData) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');
      if (utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { /* Ignore */ }
      }
      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };

  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );

    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};

    var valueFromConfig2Keys = ['url', 'method', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
    var defaultToConfig2Keys = [
      'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
      'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
      'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
      'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
      'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
    ];
    var directMergeKeys = ['validateStatus'];

    function getMergedValue(target, source) {
      if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
        return utils.merge(target, source);
      } else if (utils.isPlainObject(source)) {
        return utils.merge({}, source);
      } else if (utils.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    function mergeDeepProperties(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    }

    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      }
    });

    utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });

    utils.forEach(directMergeKeys, function merge(prop) {
      if (prop in config2) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });

    var axiosKeys = valueFromConfig2Keys
      .concat(mergeDeepPropertiesKeys)
      .concat(defaultToConfig2Keys)
      .concat(directMergeKeys);

    var otherKeys = Object
      .keys(config1)
      .concat(Object.keys(config2))
      .filter(function filterAxiosKeys(key) {
        return axiosKeys.indexOf(key) === -1;
      });

    utils.forEach(otherKeys, mergeDeepProperties);

    return config;
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }

    config = mergeConfig(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data
      }));
    };
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Factory for creating new instances
  axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var _default = axios;
  axios_1.default = _default;

  var axios$1 = axios_1;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  function concat(...buffers) {
      const size = buffers.reduce((acc, { length }) => acc + length, 0);
      const buf = new Uint8Array(size);
      let i = 0;
      buffers.forEach((buffer) => {
          buf.set(buffer, i);
          i += buffer.length;
      });
      return buf;
  }

  function getGlobal() {
      if (typeof globalThis !== 'undefined')
          return globalThis;
      if (typeof self !== 'undefined')
          return self;
      if (typeof window !== 'undefined')
          return window;
      throw new Error('unable to locate global object');
  }
  var globalThis$1 = getGlobal();

  const encode$1 = (input) => {
      let unencoded = input;
      if (typeof unencoded === 'string') {
          unencoded = encoder.encode(unencoded);
      }
      const base64string = globalThis$1.btoa(String.fromCharCode.apply(0, [...unencoded]));
      return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  const decode = (input) => {
      let encoded = input;
      if (encoded instanceof Uint8Array) {
          encoded = decoder.decode(encoded);
      }
      encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
      return new Uint8Array(globalThis$1
          .atob(encoded)
          .split('')
          .map((c) => c.charCodeAt(0)));
  };

  class JOSEError extends Error {
      constructor(message) {
          super(message);
          this.code = 'ERR_JOSE_GENERIC';
          this.name = this.constructor.name;
          if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
          }
      }
  }
  class JOSENotSupported extends JOSEError {
      constructor() {
          super(...arguments);
          this.code = 'ERR_JOSE_NOT_SUPPORTED';
      }
  }
  class JWSInvalid extends JOSEError {
      constructor() {
          super(...arguments);
          this.code = 'ERR_JWS_INVALID';
      }
  }
  class JWTInvalid extends JOSEError {
      constructor() {
          super(...arguments);
          this.code = 'ERR_JWT_INVALID';
      }
  }

  var crypto = globalThis$1.crypto;
  function ensureSecureContext() {
      if (!globalThis$1.isSecureContext && !globalThis$1.crypto.subtle) {
          throw new JOSEError('Web Cryptography API is available only in Secure Contexts. See: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts');
      }
  }

  function subtleMapping(jwk) {
      let algorithm;
      let keyUsages;
      switch (jwk.kty) {
          case 'oct': {
              switch (jwk.alg) {
                  case 'HS256':
                  case 'HS384':
                  case 'HS512':
                      algorithm = { name: 'HMAC', hash: `SHA-${jwk.alg.substr(-3)}` };
                      keyUsages = ['sign', 'verify'];
                      break;
                  case 'A128CBC-HS256':
                  case 'A192CBC-HS384':
                  case 'A256CBC-HS512':
                      throw new JOSENotSupported(`${jwk.alg} keys cannot be imported as CryptoKey instances`);
                  case 'A128GCM':
                  case 'A192GCM':
                  case 'A256GCM':
                  case 'A128GCMKW':
                  case 'A192GCMKW':
                  case 'A256GCMKW':
                      algorithm = { name: 'AES-GCM' };
                      keyUsages = ['encrypt', 'decrypt'];
                      break;
                  case 'A128KW':
                  case 'A192KW':
                  case 'A256KW':
                      algorithm = { name: 'AES-KW' };
                      keyUsages = ['wrapKey', 'unwrapKey'];
                      break;
                  case 'PBES2-HS256+A128KW':
                  case 'PBES2-HS384+A192KW':
                  case 'PBES2-HS512+A256KW':
                      algorithm = { name: 'PBKDF2' };
                      keyUsages = ['deriveBits'];
                      break;
                  default:
                      throw new JOSENotSupported('unsupported or invalid JWK "alg" (Algorithm) Parameter value');
              }
              break;
          }
          case 'RSA': {
              switch (jwk.alg) {
                  case 'PS256':
                  case 'PS384':
                  case 'PS512':
                      algorithm = { name: 'RSA-PSS', hash: `SHA-${jwk.alg.substr(-3)}` };
                      keyUsages = jwk.d ? ['sign'] : ['verify'];
                      break;
                  case 'RS256':
                  case 'RS384':
                  case 'RS512':
                      algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${jwk.alg.substr(-3)}` };
                      keyUsages = jwk.d ? ['sign'] : ['verify'];
                      break;
                  case 'RSA-OAEP':
                  case 'RSA-OAEP-256':
                  case 'RSA-OAEP-384':
                  case 'RSA-OAEP-512':
                      algorithm = { name: 'RSA-OAEP', hash: `SHA-${parseInt(jwk.alg.substr(-3), 10) || 1}` };
                      keyUsages = jwk.d ? ['decrypt', 'unwrapKey'] : ['encrypt', 'wrapKey'];
                      break;
                  default:
                      throw new JOSENotSupported('unsupported or invalid JWK "alg" (Algorithm) Parameter value');
              }
              break;
          }
          case 'EC': {
              switch (jwk.alg) {
                  case 'ES256':
                  case 'ES384':
                  case 'ES512':
                      algorithm = { name: 'ECDSA', namedCurve: jwk.crv };
                      keyUsages = jwk.d ? ['sign'] : ['verify'];
                      break;
                  case 'ECDH-ES':
                  case 'ECDH-ES+A128KW':
                  case 'ECDH-ES+A192KW':
                  case 'ECDH-ES+A256KW':
                      algorithm = { name: 'ECDH', namedCurve: jwk.crv };
                      keyUsages = jwk.d ? ['deriveBits'] : [];
                      break;
                  default:
                      throw new JOSENotSupported('unsupported or invalid JWK "alg" (Algorithm) Parameter value');
              }
              break;
          }
          default:
              throw new JOSENotSupported('unsupported or invalid JWK "kty" (Key Type) Parameter value');
      }
      return { algorithm, keyUsages };
  }
  const parse = async (jwk) => {
      var _a, _b;
      const { algorithm, keyUsages } = subtleMapping(jwk);
      let format = 'jwk';
      let keyData = { ...jwk };
      delete keyData.alg;
      if (algorithm.name === 'PBKDF2') {
          format = 'raw';
          keyData = decode(jwk.k);
      }
      ensureSecureContext();
      return crypto.subtle.importKey(format, keyData, algorithm, (_a = jwk.ext) !== null && _a !== void 0 ? _a : false, (_b = jwk.key_ops) !== null && _b !== void 0 ? _b : keyUsages);
  };

  function isObject$1(input) {
      return !!input && input.constructor === Object;
  }

  async function parseJwk(jwk, alg, octAsKeyObject) {
      if (!isObject$1(jwk)) {
          throw new TypeError('JWK must be an object');
      }
      alg || (alg = jwk.alg);
      if (typeof alg !== 'string' || !alg) {
          throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
      }
      switch (jwk.kty) {
          case 'oct':
              if (typeof jwk.k !== 'string' || !jwk.k) {
                  throw new TypeError('missing "k" (Key Value) Parameter value');
              }
              octAsKeyObject !== null && octAsKeyObject !== void 0 ? octAsKeyObject : (octAsKeyObject = jwk.ext !== true);
              if (octAsKeyObject) {
                  return parse({ ...jwk, alg, ext: false });
              }
              return decode(jwk.k);
          case 'RSA':
              if (jwk.oth !== undefined) {
                  throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is unsupported');
              }
          case 'EC':
          case 'OKP':
              return parse({ ...jwk, alg });
          default:
              throw new JOSENotSupported('unsupported "kty" (Key Type) Parameter value');
      }
  }

  const isDisjoint = (...headers) => {
      const sources = headers.filter(Boolean);
      if (sources.length === 0 || sources.length === 1) {
          return true;
      }
      let acc;
      for (const header of sources) {
          const parameters = Object.keys(header);
          if (!acc || acc.size === 0) {
              acc = new Set(parameters);
              continue;
          }
          for (const parameter of parameters) {
              if (acc.has(parameter)) {
                  return false;
              }
              acc.add(parameter);
          }
      }
      return true;
  };

  function subtleDsa(alg) {
      switch (alg) {
          case 'HS256':
              return { hash: 'SHA-256', name: 'HMAC' };
          case 'HS384':
              return { hash: 'SHA-384', name: 'HMAC' };
          case 'HS512':
              return { hash: 'SHA-512', name: 'HMAC' };
          case 'PS256':
              return {
                  hash: 'SHA-256',
                  name: 'RSA-PSS',
                  saltLength: 256 >> 3,
              };
          case 'PS384':
              return {
                  hash: 'SHA-384',
                  name: 'RSA-PSS',
                  saltLength: 384 >> 3,
              };
          case 'PS512':
              return {
                  hash: 'SHA-512',
                  name: 'RSA-PSS',
                  saltLength: 512 >> 3,
              };
          case 'RS256':
              return { hash: 'SHA-256', name: 'RSASSA-PKCS1-v1_5' };
          case 'RS384':
              return { hash: 'SHA-384', name: 'RSASSA-PKCS1-v1_5' };
          case 'RS512':
              return { hash: 'SHA-512', name: 'RSASSA-PKCS1-v1_5' };
          case 'ES256':
              return { hash: 'SHA-256', name: 'ECDSA', namedCurve: 'P-256' };
          case 'ES384':
              return { hash: 'SHA-384', name: 'ECDSA', namedCurve: 'P-384' };
          case 'ES512':
              return { hash: 'SHA-512', name: 'ECDSA', namedCurve: 'P-521' };
          default:
              throw new JOSENotSupported(`alg ${alg} is unsupported either by JOSE or your javascript runtime`);
      }
  }

  var checkKeyLength = (alg, key) => {
      if (alg.startsWith('HS')) {
          const bitlen = parseInt(alg.substr(-3), 10);
          const { length } = key.algorithm;
          if (typeof length !== 'number' || length < bitlen) {
              throw new TypeError(`${alg} requires symmetric keys to be ${bitlen} bits or larger`);
          }
      }
      if (alg.startsWith('RS') || alg.startsWith('PS')) {
          const { modulusLength } = key.algorithm;
          if (typeof modulusLength !== 'number' || modulusLength < 2048) {
              throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
          }
      }
  };

  const sign = async (alg, key, data) => {
      ensureSecureContext();
      let cryptoKey;
      if (key instanceof Uint8Array) {
          if (!alg.startsWith('HS')) {
              throw new TypeError('symmetric keys are only applicable for HMAC-based algorithms');
          }
          cryptoKey = await crypto.subtle.importKey('raw', key, { hash: `SHA-${alg.substr(-3)}`, name: 'HMAC' }, false, ['sign']);
      }
      else {
          cryptoKey = key;
      }
      checkKeyLength(alg, cryptoKey);
      const signature = await crypto.subtle.sign(subtleDsa(alg), cryptoKey, data);
      return new Uint8Array(signature);
  };

  const checkKeyType = (alg, key) => {
      if (alg.startsWith('HS') ||
          alg === 'dir' ||
          alg.startsWith('PBES2') ||
          alg.match(/^A\d{3}(?:GCM)KW$/)) {
          if (key instanceof Uint8Array || key.type === 'secret') {
              return;
          }
          throw new TypeError('CryptoKey or KeyObject instances for symmetric algorithms must be of type "secret"');
      }
      if (key instanceof Uint8Array) {
          throw new TypeError('CryptoKey or KeyObject instances must be used for asymmetric algorithms');
      }
      if (key.type === 'secret') {
          throw new TypeError('CryptoKey or KeyObject instances for asymmetric algorithms must not be of type "secret"');
      }
  };

  function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
      if (joseHeader.crit !== undefined && protectedHeader.crit === undefined) {
          throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
      }
      if (!protectedHeader || protectedHeader.crit === undefined) {
          return new Set();
      }
      if (!Array.isArray(protectedHeader.crit) ||
          protectedHeader.crit.length === 0 ||
          protectedHeader.crit.some((input) => typeof input !== 'string' || input.length === 0)) {
          throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
      }
      let recognized;
      if (recognizedOption !== undefined) {
          recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
      }
      else {
          recognized = recognizedDefault;
      }
      for (const parameter of protectedHeader.crit) {
          if (!recognized.has(parameter)) {
              throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
          }
          if (joseHeader[parameter] === undefined) {
              throw new Err(`Extension Header Parameter "${parameter}" is missing`);
          }
          else if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
              throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
          }
      }
      return new Set(protectedHeader.crit);
  }

  const checkExtensions = validateCrit.bind(undefined, JWSInvalid, new Map([['b64', true]]));
  class FlattenedSign {
      constructor(payload) {
          this._payload = payload;
      }
      setProtectedHeader(protectedHeader) {
          if (this._protectedHeader) {
              throw new TypeError('setProtectedHeader can only be called once');
          }
          this._protectedHeader = protectedHeader;
          return this;
      }
      setUnprotectedHeader(unprotectedHeader) {
          if (this._unprotectedHeader) {
              throw new TypeError('setUnprotectedHeader can only be called once');
          }
          this._unprotectedHeader = unprotectedHeader;
          return this;
      }
      async sign(key, options) {
          if (!this._protectedHeader && !this._unprotectedHeader) {
              throw new JWSInvalid('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
          }
          if (!isDisjoint(this._protectedHeader, this._unprotectedHeader)) {
              throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
          }
          const joseHeader = {
              ...this._protectedHeader,
              ...this._unprotectedHeader,
          };
          const extensions = checkExtensions(options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
          let b64 = true;
          if (extensions.has('b64')) {
              b64 = this._protectedHeader.b64;
              if (typeof b64 !== 'boolean') {
                  throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
              }
          }
          const { alg } = joseHeader;
          if (typeof alg !== 'string' || !alg) {
              throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
          }
          checkKeyType(alg, key);
          let payload = this._payload;
          if (b64) {
              payload = encoder.encode(encode$1(payload));
          }
          let protectedHeader;
          if (this._protectedHeader) {
              protectedHeader = encoder.encode(encode$1(JSON.stringify(this._protectedHeader)));
          }
          else {
              protectedHeader = encoder.encode('');
          }
          const data = concat(protectedHeader, encoder.encode('.'), payload);
          const signature = await sign(alg, key, data);
          const jws = {
              signature: encode$1(signature),
          };
          if (b64) {
              jws.payload = decoder.decode(payload);
          }
          if (this._unprotectedHeader) {
              jws.header = this._unprotectedHeader;
          }
          if (this._protectedHeader) {
              jws.protected = decoder.decode(protectedHeader);
          }
          return jws;
      }
  }

  class CompactSign {
      constructor(payload) {
          this._flattened = new FlattenedSign(payload);
      }
      setProtectedHeader(protectedHeader) {
          this._flattened.setProtectedHeader(protectedHeader);
          return this;
      }
      async sign(key, options) {
          const jws = await this._flattened.sign(key, options);
          if (jws.payload === undefined) {
              throw new TypeError('use the flattened module for creating JWS with b64: false');
          }
          return `${jws.protected}.${jws.payload}.${jws.signature}`;
      }
  }

  var epoch = (date) => Math.floor(date.getTime() / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const year = day * 365.25;
  const REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;
  var secs = (str) => {
      const matched = REGEX.exec(str);
      if (!matched) {
          throw new TypeError('invalid time period format');
      }
      const value = parseFloat(matched[1]);
      const unit = matched[2].toLowerCase();
      switch (unit) {
          case 'sec':
          case 'secs':
          case 'second':
          case 'seconds':
          case 's':
              return Math.round(value);
          case 'minute':
          case 'minutes':
          case 'min':
          case 'mins':
          case 'm':
              return Math.round(value * minute);
          case 'hour':
          case 'hours':
          case 'hr':
          case 'hrs':
          case 'h':
              return Math.round(value * hour);
          case 'day':
          case 'days':
          case 'd':
              return Math.round(value * day);
          case 'week':
          case 'weeks':
          case 'w':
              return Math.round(value * week);
          default:
              return Math.round(value * year);
      }
  };

  class ProduceJWT {
      constructor(payload) {
          if (!isObject$1(payload)) {
              throw new TypeError('JWT Claims Set MUST be an object');
          }
          this._payload = payload;
      }
      setIssuer(issuer) {
          this._payload = { ...this._payload, iss: issuer };
          return this;
      }
      setSubject(subject) {
          this._payload = { ...this._payload, sub: subject };
          return this;
      }
      setAudience(audience) {
          this._payload = { ...this._payload, aud: audience };
          return this;
      }
      setJti(jwtId) {
          this._payload = { ...this._payload, jti: jwtId };
          return this;
      }
      setNotBefore(input) {
          if (typeof input === 'number') {
              this._payload = { ...this._payload, nbf: input };
          }
          else {
              this._payload = { ...this._payload, nbf: epoch(new Date()) + secs(input) };
          }
          return this;
      }
      setExpirationTime(input) {
          if (typeof input === 'number') {
              this._payload = { ...this._payload, exp: input };
          }
          else {
              this._payload = { ...this._payload, exp: epoch(new Date()) + secs(input) };
          }
          return this;
      }
      setIssuedAt(input) {
          if (typeof input === 'undefined') {
              this._payload = { ...this._payload, iat: epoch(new Date()) };
          }
          else {
              this._payload = { ...this._payload, iat: input };
          }
          return this;
      }
  }

  class SignJWT extends ProduceJWT {
      setProtectedHeader(protectedHeader) {
          this._protectedHeader = protectedHeader;
          return this;
      }
      async sign(key, options) {
          var _a;
          const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
          sig.setProtectedHeader(this._protectedHeader);
          if (((_a = this._protectedHeader.crit) === null || _a === void 0 ? void 0 : _a.includes('b64')) && this._protectedHeader.b64 === false) {
              throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
          }
          return sig.sign(key, options);
      }
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function commonjsRequire (target) {
  	throw new Error('Could not dynamically require "' + target + '". Please configure the dynamicRequireTargets option of @rollup/plugin-commonjs appropriately for this require call to behave properly.');
  }

  !function(){function e(t,s,n){function i(r,a){if(!s[r]){if(!t[r]){var c="function"==typeof commonjsRequire&&commonjsRequire;if(!a&&c)return c(r,!0);if(o)return o(r,!0);var l=new Error("Cannot find module '"+r+"'");throw l.code="MODULE_NOT_FOUND",l}var u=s[r]={exports:{}};t[r][0].call(u.exports,function(e){var s=t[r][1][e];return i(s||e)},u,u.exports,e,t,s,n);}return s[r].exports}for(var o="function"==typeof commonjsRequire&&commonjsRequire,r=0;r<n.length;r++)i(n[r]);return i}return e}()({1:[function(e,t,s){t.exports={client:e("./lib/client"),Client:e("./lib/client")};},{"./lib/client":3}],2:[function(e,t,s){var n=e("request"),i=e("./utils"),o=function(e,t){var s=null===i.get(e.url,null)?i.get(e.uri,null):i.get(e.url,null);if(i.isURL(s)||(s="https://api.twitch.tv/kraken"+("/"===s[0]?s:"/"+s)),i.isNode())n(i.merge({method:"GET",json:!0},e,{url:s}),t);else if(i.isExtension()||i.isReactNative()){e=i.merge({url:s,method:"GET",headers:{}},e);var o=new XMLHttpRequest;o.open(e.method,e.url,!0);for(var r in e.headers)o.setRequestHeader(r,e.headers[r]);o.responseType="json",o.addEventListener("load",function(e){4==o.readyState&&(200!=o.status?t(o.status,null,null):t(null,null,o.response));}),o.send();}else {var a="jsonp_callback_"+Math.round(1e5*Math.random());window[a]=function(e){delete window[a],document.body.removeChild(c),t(null,null,e);};var c=document.createElement("script");c.src=""+s+(s.includes("?")?"&":"?")+"callback="+a,document.body.appendChild(c);}};t.exports=o;},{"./utils":9,request:10}],3:[function(e,t,s){(function(s){var n=e("./api"),i=e("./commands"),o=e("./events").EventEmitter,r=e("./logger"),a=e("./parser"),c=e("./timer"),l=s.WebSocket||s.MozWebSocket||e("ws"),u=e("./utils"),h=function f(e){if(this instanceof f==!1)return new f(e);this.setMaxListeners(0),this.opts=u.get(e,{}),this.opts.channels=this.opts.channels||[],this.opts.connection=this.opts.connection||{},this.opts.identity=this.opts.identity||{},this.opts.options=this.opts.options||{},this.clientId=u.get(this.opts.options.clientId,null),this.maxReconnectAttempts=u.get(this.opts.connection.maxReconnectAttempts,1/0),this.maxReconnectInterval=u.get(this.opts.connection.maxReconnectInterval,3e4),this.reconnect=u.get(this.opts.connection.reconnect,!1),this.reconnectDecay=u.get(this.opts.connection.reconnectDecay,1.5),this.reconnectInterval=u.get(this.opts.connection.reconnectInterval,1e3),this.reconnecting=!1,this.reconnections=0,this.reconnectTimer=this.reconnectInterval,this.secure=u.get(this.opts.connection.secure,!1),this.emotes="",this.emotesets={},this.channels=[],this.currentLatency=0,this.globaluserstate={},this.lastJoined="",this.latency=new Date,this.moderators={},this.pingLoop=null,this.pingTimeout=null,this.reason="",this.username="",this.userstate={},this.wasCloseCalled=!1,this.ws=null;var t="error";this.opts.options.debug&&(t="info"),this.log=this.opts.logger||r;try{r.setLevel(t);}catch(s){}this.opts.channels.forEach(function(e,t,s){s[t]=u.channel(e);}),o.call(this);};u.inherits(h,o),h.prototype.api=n;for(var m in i)h.prototype[m]=i[m];h.prototype.handleMessage=function(e){var t=this;if(!u.isNull(e)){this.emit("raw_message",JSON.parse(JSON.stringify(e)),e);var s=u.channel(u.get(e.params[0],null)),n=u.get(e.params[1],null),i=u.get(e.tags["msg-id"],null);if(e.tags=a.badges(a.badgeInfo(a.emotes(e.tags))),e.tags){var o=e.tags;for(var r in o)if("emote-sets"!==r&&"ban-duration"!==r&&"bits"!==r){var l=o[r];u.isBoolean(l)?l=null:"1"===l?l=!0:"0"===l?l=!1:u.isString(l)&&(l=u.unescapeIRC(l)),o[r]=l;}}if(u.isNull(e.prefix))switch(e.command){case"PING":this.emit("ping"),u.isNull(this.ws)||1!==this.ws.readyState||this.ws.send("PONG");break;case"PONG":var h=new Date;this.currentLatency=(h.getTime()-this.latency.getTime())/1e3,this.emits(["pong","_promisePing"],[[this.currentLatency]]),clearTimeout(this.pingTimeout);break;default:this.log.warn("Could not parse message with no prefix:\n"+JSON.stringify(e,null,4));}else if("tmi.twitch.tv"===e.prefix)switch(e.command){case"002":case"003":case"004":case"375":case"376":case"CAP":break;case"001":this.username=e.params[0];break;case"372":this.log.info("Connected to server."),this.userstate["#tmijs"]={},this.emits(["connected","_promiseConnect"],[[this.server,this.port],[null]]),this.reconnections=0,this.reconnectTimer=this.reconnectInterval,this.pingLoop=setInterval(function(){u.isNull(t.ws)||1!==t.ws.readyState||t.ws.send("PING"),t.latency=new Date,t.pingTimeout=setTimeout(function(){u.isNull(t.ws)||(t.wasCloseCalled=!1,t.log.error("Ping timeout."),t.ws.close(),clearInterval(t.pingLoop),clearTimeout(t.pingTimeout));},u.get(t.opts.connection.timeout,9999));},6e4);var m=new c.queue(2e3),f=u.union(this.opts.channels,this.channels);this.channels=[];for(var p=function(){var e=f[d];m.add(function(){u.isNull(t.ws)||1!==t.ws.readyState||t.join(e)["catch"](function(e){t.log.error(e);});});},d=0;d<f.length;d++)p();m.run();break;case"NOTICE":var g=[null],_=[s,i,n],v=[i],b=[s,!0],y=[s,!1],w=[_,g],C=[_,v],k="["+s+"] "+n;switch(i){case"subs_on":this.log.info("["+s+"] This room is now in subscribers-only mode."),this.emits(["subscriber","subscribers","_promiseSubscribers"],[b,b,g]);break;case"subs_off":this.log.info("["+s+"] This room is no longer in subscribers-only mode."),this.emits(["subscriber","subscribers","_promiseSubscribersoff"],[y,y,g]);break;case"emote_only_on":this.log.info("["+s+"] This room is now in emote-only mode."),this.emits(["emoteonly","_promiseEmoteonly"],[b,g]);break;case"emote_only_off":this.log.info("["+s+"] This room is no longer in emote-only mode."),this.emits(["emoteonly","_promiseEmoteonlyoff"],[y,g]);break;case"slow_on":case"slow_off":break;case"followers_on_zero":case"followers_on":case"followers_off":break;case"r9k_on":this.log.info("["+s+"] This room is now in r9k mode."),this.emits(["r9kmode","r9kbeta","_promiseR9kbeta"],[b,b,g]);break;case"r9k_off":this.log.info("["+s+"] This room is no longer in r9k mode."),this.emits(["r9kmode","r9kbeta","_promiseR9kbetaoff"],[y,y,g]);break;case"room_mods":var T=n.split(": ")[1].toLowerCase().split(", ").filter(function(e){return e});this.emits(["_promiseMods","mods"],[[null,T],[s,T]]);break;case"no_mods":this.emits(["_promiseMods","mods"],[[null,[]],[s,[]]]);break;case"vips_success":n.endsWith(".")&&(n=n.slice(0,-1));var x=n.split(": ")[1].toLowerCase().split(", ").filter(function(e){return e});this.emits(["_promiseVips","vips"],[[null,x],[s,x]]);break;case"no_vips":this.emits(["_promiseVips","vips"],[[null,[]],[s,[]]]);break;case"already_banned":case"bad_ban_admin":case"bad_ban_broadcaster":case"bad_ban_global_mod":case"bad_ban_self":case"bad_ban_staff":case"usage_ban":this.log.info(k),this.emits(["notice","_promiseBan"],C);break;case"ban_success":this.log.info(k),this.emits(["notice","_promiseBan"],w);break;case"usage_clear":this.log.info(k),this.emits(["notice","_promiseClear"],C);break;case"usage_mods":this.log.info(k),this.emits(["notice","_promiseMods"],[_,[i,[]]]);break;case"mod_success":this.log.info(k),this.emits(["notice","_promiseMod"],w);break;case"usage_vips":this.log.info(k),this.emits(["notice","_promiseVips"],[_,[i,[]]]);break;case"usage_vip":case"bad_vip_grantee_banned":case"bad_vip_grantee_already_vip":this.log.info(k),this.emits(["notice","_promiseVip"],[_,[i,[]]]);break;case"vip_success":this.log.info(k),this.emits(["notice","_promiseVip"],w);break;case"usage_mod":case"bad_mod_banned":case"bad_mod_mod":this.log.info(k),this.emits(["notice","_promiseMod"],C);break;case"unmod_success":this.log.info(k),this.emits(["notice","_promiseUnmod"],w);break;case"unvip_success":this.log.info(k),this.emits(["notice","_promiseUnvip"],w);break;case"usage_unmod":case"bad_unmod_mod":this.log.info(k),this.emits(["notice","_promiseUnmod"],C);break;case"usage_unvip":case"bad_unvip_grantee_not_vip":this.log.info(k),this.emits(["notice","_promiseUnvip"],C);break;case"color_changed":this.log.info(k),this.emits(["notice","_promiseColor"],w);break;case"usage_color":case"turbo_only_color":this.log.info(k),this.emits(["notice","_promiseColor"],C);break;case"commercial_success":this.log.info(k),this.emits(["notice","_promiseCommercial"],w);break;case"usage_commercial":case"bad_commercial_error":this.log.info(k),this.emits(["notice","_promiseCommercial"],C);break;case"hosts_remaining":this.log.info(k);var E=isNaN(n[0])?0:parseInt(n[0]);this.emits(["notice","_promiseHost"],[_,[null,~~E]]);break;case"bad_host_hosting":case"bad_host_rate_exceeded":case"bad_host_error":case"usage_host":this.log.info(k),this.emits(["notice","_promiseHost"],[_,[i,null]]);break;case"already_r9k_on":case"usage_r9k_on":this.log.info(k),this.emits(["notice","_promiseR9kbeta"],C);break;case"already_r9k_off":case"usage_r9k_off":this.log.info(k),this.emits(["notice","_promiseR9kbetaoff"],C);break;case"timeout_success":this.log.info(k),this.emits(["notice","_promiseTimeout"],w);break;case"delete_message_success":this.log.info("["+s+" "+n+"]"),this.emits(["notice","_promiseDeletemessage"],w);case"already_subs_off":case"usage_subs_off":this.log.info(k),this.emits(["notice","_promiseSubscribersoff"],C);break;case"already_subs_on":case"usage_subs_on":this.log.info(k),this.emits(["notice","_promiseSubscribers"],C);break;case"already_emote_only_off":case"usage_emote_only_off":this.log.info(k),this.emits(["notice","_promiseEmoteonlyoff"],C);break;case"already_emote_only_on":case"usage_emote_only_on":this.log.info(k),this.emits(["notice","_promiseEmoteonly"],C);break;case"usage_slow_on":this.log.info(k),this.emits(["notice","_promiseSlow"],C);break;case"usage_slow_off":this.log.info(k),this.emits(["notice","_promiseSlowoff"],C);break;case"usage_timeout":case"bad_timeout_admin":case"bad_timeout_broadcaster":case"bad_timeout_duration":case"bad_timeout_global_mod":case"bad_timeout_self":case"bad_timeout_staff":this.log.info(k),this.emits(["notice","_promiseTimeout"],C);break;case"untimeout_success":case"unban_success":this.log.info(k),this.emits(["notice","_promiseUnban"],w);break;case"usage_unban":case"bad_unban_no_ban":this.log.info(k),this.emits(["notice","_promiseUnban"],C);break;case"usage_delete":case"bad_delete_message_error":case"bad_delete_message_broadcaster":case"bad_delete_message_mod":this.log.info(k),this.emits(["notice","_promiseDeletemessage"],C);break;case"usage_unhost":case"not_hosting":this.log.info(k),this.emits(["notice","_promiseUnhost"],C);break;case"whisper_invalid_login":case"whisper_invalid_self":case"whisper_limit_per_min":case"whisper_limit_per_sec":case"whisper_restricted_recipient":this.log.info(k),this.emits(["notice","_promiseWhisper"],C);break;case"no_permission":case"msg_banned":case"msg_room_not_found":case"msg_channel_suspended":case"tos_ban":this.log.info(k),this.emits(["notice","_promiseBan","_promiseClear","_promiseUnban","_promiseTimeout","_promiseDeletemessage","_promiseMods","_promiseMod","_promiseUnmod","_promiseVips","_promiseVip","_promiseUnvip","_promiseCommercial","_promiseHost","_promiseUnhost","_promiseJoin","_promisePart","_promiseR9kbeta","_promiseR9kbetaoff","_promiseSlow","_promiseSlowoff","_promiseFollowers","_promiseFollowersoff","_promiseSubscribers","_promiseSubscribersoff","_promiseEmoteonly","_promiseEmoteonlyoff"],[_,[i,s]]);break;case"msg_rejected":case"msg_rejected_mandatory":this.log.info(k),this.emit("automod",s,i,n);break;case"unrecognized_cmd":this.log.info(k),this.emit("notice",s,i,n);break;case"cmds_available":case"host_target_went_offline":case"msg_censored_broadcaster":case"msg_duplicate":case"msg_emoteonly":case"msg_verified_email":case"msg_ratelimit":case"msg_subsonly":case"msg_timedout":case"msg_bad_characters":case"msg_channel_blocked":case"msg_facebook":case"msg_followersonly":case"msg_followersonly_followed":case"msg_followersonly_zero":case"msg_slowmode":case"msg_suspended":case"no_help":case"usage_disconnect":case"usage_help":case"usage_me":this.log.info(k),this.emit("notice",s,i,n);break;case"host_on":case"host_off":break;default:n.includes("Login unsuccessful")||n.includes("Login authentication failed")?(this.wasCloseCalled=!1,this.reconnect=!1,this.reason=n,this.log.error(this.reason),this.ws.close()):n.includes("Error logging in")||n.includes("Improperly formatted auth")?(this.wasCloseCalled=!1,this.reconnect=!1,this.reason=n,this.log.error(this.reason),this.ws.close()):n.includes("Invalid NICK")?(this.wasCloseCalled=!1,this.reconnect=!1,this.reason="Invalid NICK.",this.log.error(this.reason),this.ws.close()):this.log.warn("Could not parse NOTICE from tmi.twitch.tv:\n"+JSON.stringify(e,null,4));}break;case"USERNOTICE":var S=e.tags["display-name"]||e.tags.login,N=e.tags["msg-param-sub-plan"]||"",P=u.unescapeIRC(u.get(e.tags["msg-param-sub-plan-name"],""))||null,L=N.includes("Prime"),O={prime:L,plan:N,planName:P},I=e.tags,D=~~(e.tags["msg-param-streak-months"]||0),R=e.tags["msg-param-recipient-display-name"]||e.tags["msg-param-recipient-user-name"],M=~~e.tags["msg-param-mass-gift-count"];switch(I["message-type"]=i,i){case"resub":this.emits(["resub","subanniversary"],[[s,S,D,n,I,O]]);break;case"sub":this.emit("subscription",s,S,O,n,I);break;case"subgift":this.emit("subgift",s,S,D,R,O,I);break;case"anonsubgift":this.emit("anonsubgift",s,D,R,O,I);break;case"submysterygift":this.emit("submysterygift",s,S,M,O,I);break;case"anonsubmysterygift":this.emit("anonsubmysterygift",s,M,O,I);break;case"primepaidupgrade":this.emit("primepaidupgrade",s,S,O,I);break;case"giftpaidupgrade":var A=e.tags["msg-param-sender-name"]||e.tags["msg-param-sender-login"];this.emit("giftpaidupgrade",s,S,A,I);break;case"anongiftpaidupgrade":this.emit("anongiftpaidupgrade",s,S,I);break;case"raid":var S=e.tags["msg-param-displayName"]||e.tags["msg-param-login"],U=e.tags["msg-param-viewerCount"];this.emit("raided",s,S,U);}break;case"HOSTTARGET":var j=n.split(" "),U=~~j[1]||0;"-"===j[0]?(this.log.info("["+s+"] Exited host mode."),this.emits(["unhost","_promiseUnhost"],[[s,U],[null]])):(this.log.info("["+s+"] Now hosting "+j[0]+" for "+U+" viewer(s)."),this.emit("hosting",s,j[0],U));break;case"CLEARCHAT":if(e.params.length>1){var J=u.get(e.tags["ban-duration"],null);u.isNull(J)?(this.log.info("["+s+"] "+n+" has been banned."),this.emit("ban",s,n,null,e.tags)):(this.log.info("["+s+"] "+n+" has been timed out for "+J+" seconds."),this.emit("timeout",s,n,null,~~J,e.tags));}else this.log.info("["+s+"] Chat was cleared by a moderator."),this.emits(["clearchat","_promiseClear"],[[s],[null]]);break;case"CLEARMSG":if(e.params.length>1){var S=e.tags.login,H=n,I=e.tags;I["message-type"]="messagedeleted",this.log.info("["+s+"] "+S+"'s message has been deleted."),this.emit("messagedeleted",s,S,H,I);}break;case"RECONNECT":this.log.info("Received RECONNECT request from Twitch.."),this.log.info("Disconnecting and reconnecting in "+Math.round(this.reconnectTimer/1e3)+" seconds.."),this.disconnect(),setTimeout(function(){t.connect();},this.reconnectTimer);break;case"USERSTATE":e.tags.username=this.username,"mod"===e.tags["user-type"]&&(this.moderators[this.lastJoined]||(this.moderators[this.lastJoined]=[]),this.moderators[this.lastJoined].includes(this.username)||this.moderators[this.lastJoined].push(this.username)),u.isJustinfan(this.getUsername())||this.userstate[s]||(this.userstate[s]=e.tags,this.lastJoined=s,this.channels.push(s),this.log.info("Joined "+s),this.emit("join",s,u.username(this.getUsername()),!0)),e.tags["emote-sets"]!==this.emotes&&this._updateEmoteset(e.tags["emote-sets"]),this.userstate[s]=e.tags;break;case"GLOBALUSERSTATE":this.globaluserstate=e.tags,"undefined"!=typeof e.tags["emote-sets"]&&this._updateEmoteset(e.tags["emote-sets"]);break;case"ROOMSTATE":if(u.channel(this.lastJoined)===s&&this.emit("_promiseJoin",null,s),e.tags.channel=s,this.emit("roomstate",s,e.tags),!e.tags.hasOwnProperty("subs-only")){if(e.tags.hasOwnProperty("slow"))if("boolean"!=typeof e.tags.slow||e.tags.slow){var q=~~e.tags.slow,G=[s,!0,q];this.log.info("["+s+"] This room is now in slow mode."),this.emits(["slow","slowmode","_promiseSlow"],[G,G,[null]]);}else {var W=[s,!1,0];this.log.info("["+s+"] This room is no longer in slow mode."),this.emits(["slow","slowmode","_promiseSlowoff"],[W,W,[null]]);}if(e.tags.hasOwnProperty("followers-only"))if("-1"===e.tags["followers-only"]){var W=[s,!1,0];this.log.info("["+s+"] This room is no longer in followers-only mode."),this.emits(["followersonly","followersmode","_promiseFollowersoff"],[W,W,[null]]);}else {var q=~~e.tags["followers-only"],G=[s,!0,q];this.log.info("["+s+"] This room is now in follower-only mode."),this.emits(["followersonly","followersmode","_promiseFollowers"],[G,G,[null]]);}}break;case"SERVERCHANGE":break;default:this.log.warn("Could not parse message from tmi.twitch.tv:\n"+JSON.stringify(e,null,4));}else if("jtv"===e.prefix)switch(e.command){case"MODE":"+o"===n?(this.moderators[s]||(this.moderators[s]=[]),this.moderators[s].includes(e.params[2])||this.moderators[s].push(e.params[2]),this.emit("mod",s,e.params[2])):"-o"===n&&(this.moderators[s]||(this.moderators[s]=[]),this.moderators[s].filter(function(t){return t!=e.params[2]}),this.emit("unmod",s,e.params[2]));break;default:this.log.warn("Could not parse message from jtv:\n"+JSON.stringify(e,null,4));}else switch(e.command){case"353":this.emit("names",e.params[2],e.params[3].split(" "));break;case"366":break;case"JOIN":var V=e.prefix.split("!")[0];u.isJustinfan(this.getUsername())&&this.username===V&&(this.lastJoined=s,this.channels.push(s),this.log.info("Joined "+s),this.emit("join",s,V,!0)),this.username!==V&&this.emit("join",s,V,!1);break;case"PART":var F=!1,V=e.prefix.split("!")[0];if(this.username===V){F=!0,this.userstate[s]&&delete this.userstate[s];var z=this.channels.indexOf(s);-1!==z&&this.channels.splice(z,1);var z=this.opts.channels.indexOf(s);-1!==z&&this.opts.channels.splice(z,1),this.log.info("Left "+s),this.emit("_promisePart",null);}this.emit("part",s,V,F);break;case"WHISPER":var V=e.prefix.split("!")[0];this.log.info("[WHISPER] <"+V+">: "+n),e.tags.hasOwnProperty("username")||(e.tags.username=V),e.tags["message-type"]="whisper";var B=u.channel(e.tags.username);this.emits(["whisper","message"],[[B,e.tags,n,!1]]);break;case"PRIVMSG":if(e.tags.username=e.prefix.split("!")[0],"jtv"===e.tags.username){var $=u.username(n.split(" ")[0]),K=n.includes("auto");if(n.includes("hosting you for")){var Q=u.extractNumber(n);this.emit("hosted",s,$,Q,K);}else n.includes("hosting you")&&this.emit("hosted",s,$,0,K);}else {var X=u.actionMessage(n);X?(e.tags["message-type"]="action",this.log.info("["+s+"] *<"+e.tags.username+">: "+X[1]),this.emits(["action","message"],[[s,e.tags,X[1],!1]])):e.tags.hasOwnProperty("bits")?this.emit("cheer",s,e.tags,n):(e.tags["message-type"]="chat",this.log.info("["+s+"] <"+e.tags.username+">: "+n),this.emits(["chat","message"],[[s,e.tags,n,!1]]));}break;default:this.log.warn("Could not parse message:\n"+JSON.stringify(e,null,4));}}},h.prototype.connect=function(){var e=this;return new Promise(function(t,s){e.server=u.get(e.opts.connection.server,"irc-ws.chat.twitch.tv"),e.port=u.get(e.opts.connection.port,80),e.secure&&(e.port=443),443===e.port&&(e.secure=!0),e.reconnectTimer=e.reconnectTimer*e.reconnectDecay,e.reconnectTimer>=e.maxReconnectInterval&&(e.reconnectTimer=e.maxReconnectInterval),e._openConnection(),e.once("_promiseConnect",function(n){n?s(n):t([e.server,~~e.port]);});})},h.prototype._openConnection=function(){this.ws=new l((this.secure?"wss":"ws")+"://"+this.server+":"+this.port+"/","irc"),this.ws.onmessage=this._onMessage.bind(this),this.ws.onerror=this._onError.bind(this),this.ws.onclose=this._onClose.bind(this),this.ws.onopen=this._onOpen.bind(this);},h.prototype._onOpen=function(){u.isNull(this.ws)||1!==this.ws.readyState||(this.log.info("Connecting to "+this.server+" on port "+this.port+".."),this.emit("connecting",this.server,~~this.port),this.username=u.get(this.opts.identity.username,u.justinfan()),this.password=u.password(u.get(this.opts.identity.password,"SCHMOOPIIE")),this.log.info("Sending authentication to server.."),this.emit("logon"),this.ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership"),this.ws.send("PASS "+this.password),this.ws.send("NICK "+this.username));},h.prototype._onMessage=function(e){var t=this,s=e.data.split("\r\n");s.forEach(function(e){u.isNull(e)||t.handleMessage(a.msg(e));});},h.prototype._onError=function(){var e=this;this.moderators={},this.userstate={},this.globaluserstate={},clearInterval(this.pingLoop),clearTimeout(this.pingTimeout),this.reason=u.isNull(this.ws)?"Connection closed.":"Unable to connect.",this.emits(["_promiseConnect","disconnected"],[[this.reason]]),this.reconnect&&this.reconnections===this.maxReconnectAttempts&&(this.emit("maxreconnect"),this.log.error("Maximum reconnection attempts reached.")),this.reconnect&&!this.reconnecting&&this.reconnections<=this.maxReconnectAttempts-1&&(this.reconnecting=!0,this.reconnections=this.reconnections+1,this.log.error("Reconnecting in "+Math.round(this.reconnectTimer/1e3)+" seconds.."),this.emit("reconnect"),setTimeout(function(){e.reconnecting=!1,e.connect();},this.reconnectTimer)),this.ws=null;},h.prototype._onClose=function(){var e=this;this.moderators={},this.userstate={},this.globaluserstate={},clearInterval(this.pingLoop),clearTimeout(this.pingTimeout),this.wasCloseCalled?(this.wasCloseCalled=!1,this.reason="Connection closed.",this.log.info(this.reason),this.emits(["_promiseConnect","_promiseDisconnect","disconnected"],[[this.reason],[null],[this.reason]])):(this.emits(["_promiseConnect","disconnected"],[[this.reason]]),this.reconnect&&this.reconnections===this.maxReconnectAttempts&&(this.emit("maxreconnect"),this.log.error("Maximum reconnection attempts reached.")),this.reconnect&&!this.reconnecting&&this.reconnections<=this.maxReconnectAttempts-1&&(this.reconnecting=!0,this.reconnections=this.reconnections+1,this.log.error("Could not connect to server. Reconnecting in "+Math.round(this.reconnectTimer/1e3)+" seconds.."),this.emit("reconnect"),setTimeout(function(){e.reconnecting=!1,e.connect();},this.reconnectTimer))),this.ws=null;},h.prototype._getPromiseDelay=function(){return this.currentLatency<=600?600:this.currentLatency+100},h.prototype._sendCommand=function(e,t,s,n){var i=this;return new Promise(function(o,r){if(u.isNull(i.ws)||1!==i.ws.readyState)return r("Not connected to server.");if("number"==typeof e&&u.promiseDelay(e).then(function(){r("No response from Twitch.");}),u.isNull(t))i.log.info("Executing command: "+s),i.ws.send(s);else {var a=u.channel(t);i.log.info("["+a+"] Executing command: "+s),i.ws.send("PRIVMSG "+a+" :"+s);}n(o,r);})},h.prototype._sendMessage=function(e,t,s,n){var i=this;return new Promise(function(o,r){if(u.isNull(i.ws)||1!==i.ws.readyState)return r("Not connected to server.");if(u.isJustinfan(i.getUsername()))return r("Cannot send anonymous messages.");var c=u.channel(t);if(i.userstate[c]||(i.userstate[c]={}),s.length>=500){var l=u.splitLine(s,500);s=l[0],setTimeout(function(){i._sendMessage(e,t,l[1],function(){});},350);}i.ws.send("PRIVMSG "+c+" :"+s);var h={};Object.keys(i.emotesets).forEach(function(e){i.emotesets[e].forEach(function(e){return u.isRegex(e.code)?a.emoteRegex(s,e.code,e.id,h):void a.emoteString(s,e.code,e.id,h)});});var m=u.merge(i.userstate[c],a.emotes({emotes:a.transformEmotes(h)||null})),f=u.actionMessage(s);f?(m["message-type"]="action",i.log.info("["+c+"] *<"+i.getUsername()+">: "+f[1]),i.emits(["action","message"],[[c,m,f[1],!0]])):(m["message-type"]="chat",i.log.info("["+c+"] <"+i.getUsername()+">: "+s),i.emits(["chat","message"],[[c,m,s,!0]])),n(o,r);})},h.prototype._updateEmoteset=function(e){var t=this;this.emotes=e,this.api({url:"/chat/emoticon_images?emotesets="+e,headers:{Authorization:"OAuth "+u.password(u.get(this.opts.identity.password,"")).replace("oauth:",""),"Client-ID":this.clientId}},function(s,n,i){return s?void setTimeout(function(){t._updateEmoteset(e);},6e4):(t.emotesets=i.emoticon_sets||{},t.emit("emotesets",e,t.emotesets))});},h.prototype.getUsername=function(){return this.username},h.prototype.getOptions=function(){return this.opts},h.prototype.getChannels=function(){return this.channels},h.prototype.isMod=function(e,t){var s=u.channel(e);return this.moderators[s]||(this.moderators[s]=[]),this.moderators[s].includes(u.username(t))},h.prototype.readyState=function(){return u.isNull(this.ws)?"CLOSED":["CONNECTING","OPEN","CLOSING","CLOSED"][this.ws.readyState]},h.prototype.disconnect=function(){var e=this;return new Promise(function(t,s){u.isNull(e.ws)||3===e.ws.readyState?(e.log.error("Cannot disconnect from server. Socket is not opened or connection is already closing."),s("Cannot disconnect from server. Socket is not opened or connection is already closing.")):(e.wasCloseCalled=!0,e.log.info("Disconnecting from server.."),e.ws.close(),e.once("_promiseDisconnect",function(){t([e.server,~~e.port]);}));})},"undefined"!=typeof t&&t.exports&&(t.exports=h),"undefined"!=typeof window&&(window.tmi={},window.tmi.client=h,window.tmi.Client=h);}).call(this,"undefined"!=typeof commonjsGlobal?commonjsGlobal:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{"./api":2,"./commands":4,"./events":5,"./logger":6,"./parser":7,"./timer":8,"./utils":9,ws:10}],4:[function(e,t,s){function n(e,t){var s=this;return e=u.channel(e),t=u.get(t,30),this._sendCommand(this._getPromiseDelay(),e,"/followers "+t,function(n,i){s.once("_promiseFollowers",function(s){s?i(s):n([e,~~t]);});})}function i(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/followersoff",function(s,n){t.once("_promiseFollowersoff",function(t){t?n(t):s([e]);});})}function o(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),null,"PART "+e,function(s,n){t.once("_promisePart",function(t){t?n(t):s([e]);});})}function r(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/r9kbeta",function(s,n){t.once("_promiseR9kbeta",function(t){t?n(t):s([e]);});})}function a(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/r9kbetaoff",function(s,n){t.once("_promiseR9kbetaoff",function(t){t?n(t):s([e]);});})}function c(e,t){var s=this;return e=u.channel(e),t=u.get(t,300),this._sendCommand(this._getPromiseDelay(),e,"/slow "+t,function(n,i){s.once("_promiseSlow",function(s){s?i(s):n([e,~~t]);});})}function l(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/slowoff",function(s,n){t.once("_promiseSlowoff",function(t){t?n(t):s([e]);});})}var u=e("./utils");t.exports={action:function(e,t){return e=u.channel(e),t="ACTION "+t+"",this._sendMessage(this._getPromiseDelay(),e,t,function(s,n){s([e,t]);})},ban:function(e,t,s){var n=this;return e=u.channel(e),t=u.username(t),s=u.get(s,""),this._sendCommand(this._getPromiseDelay(),e,"/ban "+t+" "+s,function(i,o){n.once("_promiseBan",function(n){n?o(n):i([e,t,s]);});})},clear:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/clear",function(s,n){t.once("_promiseClear",function(t){t?n(t):s([e]);});})},color:function(e,t){var s=this;return t=u.get(t,e),this._sendCommand(this._getPromiseDelay(),"#tmijs","/color "+t,function(e,n){s.once("_promiseColor",function(s){s?n(s):e([t]);});})},commercial:function(e,t){var s=this;return e=u.channel(e),t=u.get(t,30),this._sendCommand(this._getPromiseDelay(),e,"/commercial "+t,function(n,i){s.once("_promiseCommercial",function(s){s?i(s):n([e,~~t]);});})},deletemessage:function(e,t){var s=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/delete "+t,function(t,n){s.once("_promiseDeletemessage",function(s){s?n(s):t([e]);});})},emoteonly:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/emoteonly",function(s,n){t.once("_promiseEmoteonly",function(t){t?n(t):s([e]);});})},emoteonlyoff:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/emoteonlyoff",function(s,n){t.once("_promiseEmoteonlyoff",function(t){t?n(t):s([e]);});})},followersonly:n,followersmode:n,followersonlyoff:i,followersmodeoff:i,host:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(2e3,e,"/host "+t,function(n,i){s.once("_promiseHost",function(s,o){s?i(s):n([e,t,~~o]);});})},join:function(e){var t=this;return e=u.channel(e),this._sendCommand(null,null,"JOIN "+e,function(s,n){var i="_promiseJoin",o=!1,r=function c(r,a){e===u.channel(a)&&(t.removeListener(i,c),o=!0,r?n(r):s([e]));};t.on(i,r);var a=t._getPromiseDelay();u.promiseDelay(a).then(function(){o||t.emit(i,"No response from Twitch.",e);});})},mod:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(this._getPromiseDelay(),e,"/mod "+t,function(n,i){s.once("_promiseMod",function(s){s?i(s):n([e,t]);});})},mods:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/mods",function(s,n){t.once("_promiseMods",function(i,o){i?n(i):(o.forEach(function(s){t.moderators[e]||(t.moderators[e]=[]),t.moderators[e].includes(s)||t.moderators[e].push(s);}),s(o));});})},part:o,leave:o,ping:function(){var e=this;return this._sendCommand(this._getPromiseDelay(),null,"PING",function(t,s){e.latency=new Date,e.pingTimeout=setTimeout(function(){null!==e.ws&&(e.wasCloseCalled=!1,e.log.error("Ping timeout."),e.ws.close(),clearInterval(e.pingLoop),clearTimeout(e.pingTimeout));},u.get(e.opts.connection.timeout,9999)),e.once("_promisePing",function(e){t([parseFloat(e)]);});})},r9kbeta:r,r9kmode:r,r9kbetaoff:a,r9kmodeoff:a,raw:function(e){return this._sendCommand(this._getPromiseDelay(),null,e,function(t,s){t([e]);})},say:function(e,t){return e=u.channel(e),t.startsWith(".")&&!t.startsWith("..")||t.startsWith("/")||t.startsWith("\\")?"me "===t.substr(1,3)?this.action(e,t.substr(4)):this._sendCommand(this._getPromiseDelay(),e,t,function(s,n){s([e,t]);}):this._sendMessage(this._getPromiseDelay(),e,t,function(s,n){s([e,t]);})},slow:c,slowmode:c,slowoff:l,slowmodeoff:l,subscribers:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/subscribers",function(s,n){t.once("_promiseSubscribers",function(t){t?n(t):s([e]);});})},subscribersoff:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/subscribersoff",function(s,n){t.once("_promiseSubscribersoff",function(t){t?n(t):s([e]);});})},timeout:function(e,t,s,n){var i=this;return e=u.channel(e),t=u.username(t),u.isNull(s)||u.isInteger(s)||(n=s,s=300),s=u.get(s,300),n=u.get(n,""),this._sendCommand(this._getPromiseDelay(),e,"/timeout "+t+" "+s+" "+n,function(o,r){i.once("_promiseTimeout",function(i){i?r(i):o([e,t,~~s,n]);});})},unban:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(this._getPromiseDelay(),e,"/unban "+t,function(n,i){s.once("_promiseUnban",function(s){s?i(s):n([e,t]);});})},unhost:function(e){var t=this;return e=u.channel(e),this._sendCommand(2e3,e,"/unhost",function(s,n){t.once("_promiseUnhost",function(t){t?n(t):s([e]);});})},unmod:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(this._getPromiseDelay(),e,"/unmod "+t,function(n,i){s.once("_promiseUnmod",function(s){s?i(s):n([e,t]);});})},unvip:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(this._getPromiseDelay(),e,"/unvip "+t,function(n,i){s.once("_promiseUnvip",function(s){s?i(s):n([e,t]);});})},vip:function(e,t){var s=this;return e=u.channel(e),t=u.username(t),this._sendCommand(this._getPromiseDelay(),e,"/vip "+t,function(n,i){s.once("_promiseVip",function(s){s?i(s):n([e,t]);});})},vips:function(e){var t=this;return e=u.channel(e),this._sendCommand(this._getPromiseDelay(),e,"/vips",function(e,s){t.once("_promiseVips",function(t,n){t?s(t):e(n);});})},whisper:function(e,t){var s=this;return e=u.username(e),e===this.getUsername()?Promise.reject("Cannot send a whisper to the same account."):this._sendCommand(this._getPromiseDelay(),"#tmijs","/w "+e+" "+t,function(n,i){var o=u.channel(e),r=u.merge({"message-type":"whisper","message-id":null,"thread-id":null,username:s.getUsername()
  },s.globaluserstate);s.emits(["whisper","message"],[[o,r,t,!0],[o,r,t,!0]]),n([e,t]);})}};},{"./utils":9}],5:[function(e,t,s){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0;}function i(e){return "function"==typeof e}function o(e){return "number"==typeof e}function r(e){return "object"===("undefined"==typeof e?"undefined":c(e))&&null!==e}function a(e){return void 0===e}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};String.prototype.startsWith||(String.prototype.startsWith=function(e,t){return t=t||0,this.indexOf(e,t)===t}),t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!o(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emits=function(e,t){for(var s=0;s<e.length;s++){var n=s<t.length?t[s]:t[t.length-1];this.emit.apply(this,[e[s]].concat(n));}},n.prototype.emit=function(e){var t,s,n,o,c,l;if(this._events||(this._events={}),"error"===e&&(!this._events.error||r(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t;throw TypeError('Uncaught, unspecified "error" event.')}if(s=this._events[e],a(s))return !1;if(i(s))switch(arguments.length){case 1:s.call(this);break;case 2:s.call(this,arguments[1]);break;case 3:s.call(this,arguments[1],arguments[2]);break;default:o=Array.prototype.slice.call(arguments,1),s.apply(this,o);}else if(r(s))for(o=Array.prototype.slice.call(arguments,1),l=s.slice(),n=l.length,c=0;n>c;c++)l[c].apply(this,o);return !0},n.prototype.addListener=function(e,t){var s;if(!i(t))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,i(t.listener)?t.listener:t),this._events[e]?r(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,r(this._events[e])&&!this._events[e].warned&&(s=a(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,s&&s>0&&this._events[e].length>s&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())),this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function s(){"_"!==e.charAt(0)||isNaN(e.substr(e.length-1))||(e=e.substring(0,e.length-1)),this.removeListener(e,s),n||(n=!0,t.apply(this,arguments));}if(!i(t))throw TypeError("listener must be a function");var n=!1;if(this._events.hasOwnProperty(e)&&"_"===e.charAt(0)){var o=1,r=e;for(var a in this._events)this._events.hasOwnProperty(a)&&a.startsWith(r)&&o++;e+=o;}return s.listener=t,this.on(e,s),this},n.prototype.removeListener=function(e,t){var s,n,o,a;if(!i(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(s=this._events[e],o=s.length,n=-1,s===t||i(s.listener)&&s.listener===t){if(delete this._events[e],this._events.hasOwnProperty(e+"2")&&"_"===e.charAt(0)){var c=e;for(var l in this._events)this._events.hasOwnProperty(l)&&l.startsWith(c)&&(isNaN(parseInt(l.substr(l.length-1)))||(this._events[e+parseInt(l.substr(l.length-1)-1)]=this._events[l],delete this._events[l]));this._events[e]=this._events[e+"1"],delete this._events[e+"1"];}this._events.removeListener&&this.emit("removeListener",e,t);}else if(r(s)){for(a=o;a-- >0;)if(s[a]===t||s[a].listener&&s[a].listener===t){n=a;break}if(0>n)return this;1===s.length?(s.length=0,delete this._events[e]):s.splice(n,1),this._events.removeListener&&this.emit("removeListener",e,t);}return this},n.prototype.removeAllListeners=function(e){var t,s;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(s=this._events[e],i(s))this.removeListener(e,s);else if(s)for(;s.length;)this.removeListener(e,s[s.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?i(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.prototype.listenerCount=function(e){if(this._events){var t=this._events[e];if(i(t))return 1;if(t)return t.length}return 0},n.listenerCount=function(e,t){return e.listenerCount(t)};},{}],6:[function(e,t,s){function n(e){return function(t){r[e]>=r[o]&&console.log("["+i.formatDate(new Date)+"] "+e+": "+t);}}var i=e("./utils"),o="info",r={trace:0,debug:1,info:2,warn:3,error:4,fatal:5};t.exports={setLevel:function(e){o=e;},trace:n("trace"),debug:n("debug"),info:n("info"),warn:n("warn"),error:n("error"),fatal:n("fatal")};},{"./utils":9}],7:[function(e,t,s){function n(e,t){var s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:",",n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"/",o=arguments[4],r=e[t];if(void 0===r)return e;var a=i.isString(r);if(e[t+"-raw"]=a?r:null,r===!0)return e[t]=null,e;if(e[t]={},a)for(var c=r.split(s),l=0;l<c.length;l++){var u=c[l].split(n),h=u[1];void 0!==o&&h&&(h=h.split(o)),e[t][u[0]]=h||null;}return e}var i=e("./utils"),o=/\S+/g;t.exports={badges:function(e){return n(e,"badges")},badgeInfo:function(e){return n(e,"badge-info")},emotes:function(e){return n(e,"emotes","/",":",",")},emoteRegex:function(e,t,s,n){o.lastIndex=0;for(var r,a=new RegExp("(\\b|^|s)"+i.unescapeHtml(t)+"(\\b|$|s)");null!==(r=o.exec(e));)a.test(r[0])&&(n[s]=n[s]||[],n[s].push([r.index,o.lastIndex-1]));},emoteString:function(e,t,s,n){o.lastIndex=0;for(var r;null!==(r=o.exec(e));)r[0]===i.unescapeHtml(t)&&(n[s]=n[s]||[],n[s].push([r.index,o.lastIndex-1]));},transformEmotes:function(e){var t="";return Object.keys(e).forEach(function(s){t=t+s+":",e[s].forEach(function(e){t=t+e.join("-")+",";}),t=t.slice(0,-1)+"/";}),t.slice(0,-1)},msg:function(e){var t={raw:e,tags:{},prefix:null,command:null,params:[]},s=0,n=0;if(64===e.charCodeAt(0)){var n=e.indexOf(" ");if(-1===n)return null;for(var i=e.slice(1,n).split(";"),o=0;o<i.length;o++){var r=i[o],a=r.split("=");t.tags[a[0]]=r.substring(r.indexOf("=")+1)||!0;}s=n+1;}for(;32===e.charCodeAt(s);)s++;if(58===e.charCodeAt(s)){if(n=e.indexOf(" ",s),-1===n)return null;for(t.prefix=e.slice(s+1,n),s=n+1;32===e.charCodeAt(s);)s++;}if(n=e.indexOf(" ",s),-1===n)return e.length>s?(t.command=e.slice(s),t):null;for(t.command=e.slice(s,n),s=n+1;32===e.charCodeAt(s);)s++;for(;s<e.length;){if(n=e.indexOf(" ",s),58===e.charCodeAt(s)){t.params.push(e.slice(s+1));break}if(-1===n){if(-1===n){t.params.push(e.slice(s));break}}else for(t.params.push(e.slice(s,n)),s=n+1;32===e.charCodeAt(s);)s++;}return t}};},{"./utils":9}],8:[function(e,t,s){function n(e){this.queue=[],this.index=0,this.defaultDelay=e||3e3;}n.prototype.add=function(e,t){this.queue.push({fn:e,delay:t});},n.prototype.run=function(e){(e||0===e)&&(this.index=e),this.next();},n.prototype.next=function i(){var e=this,t=this.index++,s=this.queue[t],i=this.queue[this.index];s&&(s.fn(),i&&setTimeout(function(){e.next();},i.delay||this.defaultDelay));},n.prototype.reset=function(){this.index=0;},n.prototype.clear=function(){this.index=0,this.queue=[];},s.queue=n;},{}],9:[function(e,t,s){(function(e){var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=/^\u0001ACTION ([^\u0001]+)\u0001$/,i=/^(justinfan)(\d+$)/,o=/\\([sn:r\\])/g,r={s:" ",n:"",":":";",r:""},a=t.exports={get:function(e,t){return "undefined"==typeof e?t:e},isBoolean:function(e){return "boolean"==typeof e},isFinite:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(e){return isFinite(e)&&!isNaN(parseFloat(e))}),isInteger:function(e){return !isNaN(a.toNumber(e,0))},isJustinfan:function(e){return i.test(e)},isNull:function(e){return null===e},isRegex:function(e){return /[\|\\\^\$\*\+\?\:\#]/.test(e)},isString:function(e){return "string"==typeof e},isURL:function(e){return RegExp("^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$","i").test(e)},justinfan:function(){return "justinfan"+Math.floor(8e4*Math.random()+1e3)},password:function(e){return ["SCHMOOPIIE","",null].includes(e)?"SCHMOOPIIE":"oauth:"+e.toLowerCase().replace("oauth:","")},promiseDelay:function(e){return new Promise(function(t){setTimeout(t,e);})},replaceAll:function(e,t){if(null===e||"undefined"==typeof e)return null;for(var s in t)e=e.replace(new RegExp(s,"g"),t[s]);return e},unescapeHtml:function(e){return e.replace(/\\&amp\\;/g,"&").replace(/\\&lt\\;/g,"<").replace(/\\&gt\\;/g,">").replace(/\\&quot\\;/g,'"').replace(/\\&#039\\;/g,"'")},unescapeIRC:function(e){return e&&e.includes("\\")?e.replace(o,function(e,t){return t in r?r[t]:t}):e},actionMessage:function(e){return e.match(n)},addWord:function(e,t){return e.length?e+" "+t:e+t},channel:function c(e){var c=(e?e:"").toLowerCase();return "#"===c[0]?c:"#"+c},extractNumber:function(e){for(var t=e.split(" "),s=0;s<t.length;s++)if(a.isInteger(t[s]))return ~~t[s];return 0},formatDate:function(e){var t=e.getHours(),s=e.getMinutes();return t=(10>t?"0":"")+t,s=(10>s?"0":"")+s,t+":"+s},inherits:function(e,t){e.super_=t;var s=function(){};s.prototype=t.prototype,e.prototype=new s,e.prototype.constructor=e;},isNode:function(){try{return "object"===("undefined"==typeof e?"undefined":s(e))&&"[object process]"===Object.prototype.toString.call(e)}catch(t){}return !1},isExtension:function(){try{return window.chrome&&chrome.runtime&&chrome.runtime.id}catch(e){}return !1},isReactNative:function(){try{return navigator&&"ReactNative"==navigator.product}catch(e){}return !1},merge:Object.assign,splitLine:function(e,t){var s=e.substring(0,t).lastIndexOf(" ");return -1===s&&(s=t-1),[e.substring(0,s),e.substring(s+1)]},toNumber:function(e,t){if(null===e)return 0;var s=Math.pow(10,a.isFinite(t)?t:0);return Math.round(e*s)/s},union:function(e,t){for(var s={},n=[],i=0;i<e.length;i++){var o=e[i];s[o]||(s[o]=!0,n.push(o));}for(var i=0;i<t.length;i++){var o=t[i];s[o]||(s[o]=!0,n.push(o));}return n},username:function l(e){var l=(e?e:"").toLowerCase();return "#"===l[0]?l.slice(1):l}};}).call(this,e("_process"));},{_process:11}],10:[function(e,t,s){},{}],11:[function(e,t,s){function n(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function o(e){if(h===setTimeout)return setTimeout(e,0);if((h===n||!h)&&setTimeout)return h=setTimeout,setTimeout(e,0);try{return h(e,0)}catch(t){try{return h.call(null,e,0)}catch(t){return h.call(this,e,0)}}}function r(e){if(m===clearTimeout)return clearTimeout(e);if((m===i||!m)&&clearTimeout)return m=clearTimeout,clearTimeout(e);try{return m(e)}catch(t){try{return m.call(null,e)}catch(t){return m.call(this,e)}}}function a(){g&&p&&(g=!1,p.length?d=p.concat(d):_=-1,d.length&&c());}function c(){if(!g){var e=o(a);g=!0;for(var t=d.length;t;){for(p=d,d=[];++_<t;)p&&p[_].run();_=-1,t=d.length;}p=null,g=!1,r(e);}}function l(e,t){this.fun=e,this.array=t;}function u(){}var h,m,f=t.exports={};!function(){try{h="function"==typeof setTimeout?setTimeout:n;}catch(e){h=n;}try{m="function"==typeof clearTimeout?clearTimeout:i;}catch(e){m=i;}}();var p,d=[],g=!1,_=-1;f.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var s=1;s<arguments.length;s++)t[s-1]=arguments[s];d.push(new l(e,t)),1!==d.length||g||o(c);},l.prototype.run=function(){this.fun.apply(null,this.array);},f.title="browser",f.browser=!0,f.env={},f.argv=[],f.version="",f.versions={},f.on=u,f.addListener=u,f.once=u,f.off=u,f.removeListener=u,f.removeAllListeners=u,f.emit=u,f.prependListener=u,f.prependOnceListener=u,f.listeners=function(e){return []},f.binding=function(e){throw new Error("process.binding is not supported")},f.cwd=function(){return "/"},f.chdir=function(e){throw new Error("process.chdir is not supported")},f.umask=function(){return 0};},{}]},{},[1]);

  const Hades = (function () {
    const Hades = {};
    const _cb_arrs = {};
    
    let _socket = null;
    let _searching = false;
    
    const _dot = document.getElementById('hades__dot');
    const _status = document.getElementById('hades__status');
    const _connection = document.getElementById('hades__connection');
    
    _connection.onclick = () => {
      _searching = !_searching;
      if (_searching) search();
      else _socket && _socket.close() && (_socket = null);
    };
    
    function error_cb (e) {
      _socket = null;
      _status.textContent = 'Error';
      _dot.className = 'connection__dot connection__dot--disconnected';
    }
    
    function open_cb () {
      _status.textContent = 'Connected';
      _dot.className = 'connection__dot connection__dot--connected';
    }
    
    function close_cb () {
      _socket = null;
      _status.textContent = 'Disconnected';
      _dot.className = 'connection__dot connection__dot--disconnected';
      if (_searching) search();
    }
    
    function message_cb (event) {
      const data = JSON.parse(event.data);
      if (!data.target) {
        console.warn('HadesLive: target property missing from message.');
        return
      }
      const cb_arr = _cb_arrs[data.target];
      if (cb_arr === undefined) return
      for (const cb of cb_arr) {
        cb(data);
      }
    }
    
    function search () {
      if (_socket) return
      _status.textContent = 'Scanning...';
      _dot.className = 'connection__dot connection__dot--scanning';
      _socket = new WebSocket("ws://localhost:55666", 'HadesLive');
      _socket.addEventListener('open', open_cb);
      _socket.addEventListener('close', close_cb);
      _socket.addEventListener('message', message_cb);
      _socket.addEventListener('error', error_cb);
    }
    
    Hades.send = function (config) {
      if (_socket && _socket.readyState === WebSocket.OPEN) {
        _socket.send(JSON.stringify(config));
      }
    };

    Hades.on = function (target, callback) {
      const cb_arr = _cb_arrs[target] || (_cb_arrs[target] = []);
      cb_arr.push(callback);
      return () => {
        const i = cb_arr.indexOf(callback);
        if (i !== -1) cb_arr.splice(i, 1);
      }
    };

    return Hades
  })();


  const Twitch = (function() {
    const Twitch = {};
    const tmi = window.tmi;
    const twitch__channel_name = document.getElementById('twitch__channel_name');
    twitch__channel_name.addEventListener('focus', () => twitch__channel_name.select());
    twitch__channel_name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        twitch__channel_name.blur();
        e.stopPropagation();
      }
    });

    const _dot = document.getElementById('twitch__dot');
    const _status = document.getElementById('twitch__status');
    const _connection = document.getElementById('twitch__connection');
    const _twitch_error = document.getElementById('twitch__error');
    const message_cbs = [];
    const raw_message_cbs = [];
    
    Twitch.onMessage = function (callback) {
      message_cbs.push(callback);
      return () => {
        const i = message_cbs.indexOf(callback);
        if (i !== -1) message_cbs.splice(i, 1);
      }
    };
    function message_cb () {
      for (const cb of message_cbs)
        cb(...arguments);
    }

    Twitch.onRawMessage = function (callback) {
      raw_message_cbs.push(callback);
      return () => {
        const i = raw_message_cbs.indexOf(callback);
        if (i !== -1) raw_message_cbs.splice(i, 1);
      }
    };
    function raw_message_cb () {
      for (const cb of raw_message_cbs)
        cb(...arguments);
    }
    
    // const _client_id = "5yjdlxjg4nkz8cuw7youghmfi3s2gp"
    // const oauth_secret = "1pway03aps2dnnwkodad51qvisdmyl"
    // let oauth_token = null
    // let _nonce = null
    let _client = null;
    let _channel_name = null;
    let _channel_id = null;
    
    _connection.onclick = () => {
      if (_client) {
        _client.disconnect();
        _client = null;
        _status.textContent = 'Disconnected';
        _dot.className = 'connection__dot connection__dot--disconnected';
        return
      }

      _twitch_error.textContent = '';
      _status.textContent = 'Connecting...';
      _dot.className = 'connection__dot connection__dot--scanning';
      _channel_name = twitch__channel_name.value;

      axios$1({
        method: 'GET',
        url: `https://api.twitch.tv/kraken/users?login=${ _channel_name }`,
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Client-ID': '5yjdlxjg4nkz8cuw7youghmfi3s2gp',
        }
      })
      .then((res) => {
        console.log(res);
        _channel_id = res.data.users[0]._id;

        _client = new tmi.Client({
          options: { debug: true },
          connection: { reconnect: true },
          channels: [ _channel_name ],
        });
        _client.connect();
        _client.on('message', message_cb);
        _client.on('raw_message', raw_message_cb);
        _status.textContent = 'Connected';
        _dot.className = 'connection__dot connection__dot--connected';
        window.client = _client;
      })
      .catch((err) => {
        _twitch_error.textContent = err.res.data.message;
        _status.textContent = 'Disconnected';
        _dot.className = 'connection__dot connection__dot--disconnected';
      });
    };

    // -owner-id "190203785"
    const kty = 'oct';
    const alg = 'HS256';
    const replaceB64URL = (ch) => (ch === '+') ? '-' : '_';

    Twitch.send = async function (config) {
      if (!config.client_id || !config.secret) {
        _twitch_error.textContent = 'Twitch.send requires a client_id and secret.';
        return
      }
      
      try {
        const k = config.secret.replace(/(\+|\.)/g, replaceB64URL);
        const jwk = await parseJwk({ kty, alg, k });
        const jwt = await new SignJWT({
          exp: Math.floor(Date.now() / 1000) + 30,
          channel_id: _channel_id,
          role: 'external',
          pubsub_perms: { send: ['broadcast'] },
        })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(jwk).catch(console.log);
        
        return await axios$1({
          url: `https://api.twitch.tv/extensions/message/${_channel_id}`,
          method: 'post',
          headers: {
            'Client-Id': config.client_id,
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt, 
          },
          data: {
            content_type: 'application/json',
            targets: [ 'broadcast' ],
            message: JSON.stringify(message),
          },
        })
      } catch (err) {
        if (err.response)
          _twitch_error.textContent = `${e.response.status} ${e.response.data}`;
        else
          _twitch_error.textContent = err;

        for (const k in err)
          console.log(k, err[k]);
      }   
    };

    // Acquires extension oauth token
    // const oauth_secret = "1pway03aps2dnnwkodad51qvisdmyl"
    // const testToken = document.getElementById('twitch_token')
    // testToken.addEventListener('click', (e) => {
    //   const url = `https://id.twitch.tv/oauth2/token?_client_id=${_client_id}&client_secret=${oauth_secret}&grant_type=client_credentials`
    //   axios({
    //     url,
    //     method: 'post',
    //     // headers,
    //     // data: body,
    //   }).then((res) => {
    //     console.log(res)
    //   }).catch((e) => {
    //     for (const k in e) {
    //       console.log(k, e[k])
    //     }
    //   })
    // })

    return Twitch
  })();


  Twitch.onMessage((channel, tags, message, self) => {
    console.log('forwarding message', channel, tags, message);
    Hades.send({ target: 'twitch', channel, tags, message });
  });
  Twitch.onRawMessage((messageCloned, message) => {
    if (messageCloned.command === "PONG") return
    console.log('forwarding raw message:', messageCloned);
    Hades.send({ target: 'twitch_raw', message: messageCloned });
  });
  Hades.on('twitch', (data) => {
    Twitch.send(message);
  });

}());
