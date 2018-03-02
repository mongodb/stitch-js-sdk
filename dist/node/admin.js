'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StitchAdminClient = exports.StitchAdminClientFactory = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window, fetch */
/* eslint no-labels: ['error', { 'allowLoop': true }] */


require('fetch-everywhere');

var _client = require('./client');

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

var _common3 = require('./auth/common');

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var v2 = 2;
var v3 = 3;

/** @private **/

var StitchAdminClientFactory = exports.StitchAdminClientFactory = function () {
  function StitchAdminClientFactory() {
    _classCallCheck(this, StitchAdminClientFactory);

    throw new _errors.StitchError('StitchAdminClient can only be made from the StitchAdminClientFactory.create function');
  }

  _createClass(StitchAdminClientFactory, null, [{
    key: 'create',
    value: function create(baseUrl) {
      return (0, _client.newStitchClient)(StitchAdminClient.prototype, '', { baseUrl: baseUrl, authCodec: _common3.ADMIN_CLIENT_CODEC });
    }
  }]);

  return StitchAdminClientFactory;
}();

/** @private */


var StitchAdminClient = exports.StitchAdminClient = function (_StitchClient) {
  _inherits(StitchAdminClient, _StitchClient);

  function StitchAdminClient() {
    _classCallCheck(this, StitchAdminClient);

    return _possibleConstructorReturn(this, (StitchAdminClient.__proto__ || Object.getPrototypeOf(StitchAdminClient)).call(this));
  }

  _createClass(StitchAdminClient, [{
    key: 'logout',


    /**
     * Ends the session for the current user.
     *
     * @returns {Promise}
     */
    value: function logout() {
      var _this2 = this;

      return _get(StitchAdminClient.prototype.__proto__ || Object.getPrototypeOf(StitchAdminClient.prototype), '_do', this).call(this, '/auth/session', 'DELETE', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v3 }).then(function () {
        return _this2.auth.clear();
      });
    }

    /**
     * Returns profile information for the currently logged in user
     *
     * @returns {Promise}
     */

  }, {
    key: 'userProfile',
    value: function userProfile() {
      return this._v3._get('/auth/profile');
    }

    /**
     * Returns available providers for the currently logged in admin
     *
     * @returns {Promise}
     */

  }, {
    key: 'getAuthProviders',
    value: function getAuthProviders() {
      return _get(StitchAdminClient.prototype.__proto__ || Object.getPrototypeOf(StitchAdminClient.prototype), '_do', this).call(this, '/auth/providers', 'GET', { noAuth: true, apiVersion: v3 }).then(function (response) {
        return response.json();
      });
    }

    /**
     * Returns an access token for the user
     *
     * @returns {Promise}
     */

  }, {
    key: 'doSessionPost',
    value: function doSessionPost() {
      return _get(StitchAdminClient.prototype.__proto__ || Object.getPrototypeOf(StitchAdminClient.prototype), '_do', this).call(this, '/auth/session', 'POST', { refreshOnFailure: false, useRefreshToken: true, apiVersion: v3 }).then(function (response) {
        return response.json();
      });
    }

    /* Examples of how to access admin API with this client:
     *
     * List all apps
     *    a.apps('580e6d055b199c221fcb821c').list()
     *
     * Fetch app under name 'planner'
     *    a.apps('580e6d055b199c221fcb821c').app('planner').get()
     *
     * List services under the app 'planner'
     *    a.apps('580e6d055b199c221fcb821c').app('planner').services().list()
     *
     * Delete a rule by ID
     *    a.apps('580e6d055b199c221fcb821c').app('planner').services().service('mdb1').rules().rule('580e6d055b199c221fcb821d').remove()
     *
     */

  }, {
    key: 'apps',
    value: function apps(groupId) {
      var api = this._v3;
      var groupUrl = '/groups/' + groupId + '/apps';
      return {
        list: function list() {
          return api._get(groupUrl);
        },
        create: function create(data, options) {
          var query = options && options.defaults ? '?defaults=true' : '';
          return api._post(groupUrl + query, data);
        },

        app: function app(appId) {
          var appUrl = groupUrl + '/' + appId;
          return {
            get: function get() {
              return api._get(appUrl);
            },
            remove: function remove() {
              return api._delete(appUrl);
            },

            export: function _export() {
              return api._get(appUrl + '/export');
            },

            values: function values() {
              return {
                list: function list() {
                  return api._get(appUrl + '/values');
                },
                create: function create(data) {
                  return api._post(appUrl + '/values', data);
                },
                value: function value(valueId) {
                  var valueUrl = appUrl + '/values/' + valueId;
                  return {
                    get: function get() {
                      return api._get(valueUrl);
                    },
                    remove: function remove() {
                      return api._delete(valueUrl);
                    },
                    update: function update(data) {
                      return api._put(valueUrl, data);
                    }
                  };
                }
              };
            },

            services: function services() {
              return {
                list: function list() {
                  return api._get(appUrl + '/services');
                },
                create: function create(data) {
                  return api._post(appUrl + '/services', data);
                },
                service: function service(serviceId) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/services/' + serviceId);
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/services/' + serviceId);
                    },
                    runCommand: function runCommand(commandName, data) {
                      return api._post(appUrl + '/services/' + serviceId + '/commands/' + commandName, data);
                    },
                    config: function config() {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/services/' + serviceId + '/config');
                        },
                        update: function update(data) {
                          return api._patch(appUrl + '/services/' + serviceId + '/config', data);
                        }
                      };
                    },

                    rules: function rules() {
                      return {
                        list: function list() {
                          return api._get(appUrl + '/services/' + serviceId + '/rules');
                        },
                        create: function create(data) {
                          return api._post(appUrl + '/services/' + serviceId + '/rules', data);
                        },
                        rule: function rule(ruleId) {
                          var ruleUrl = appUrl + '/services/' + serviceId + '/rules/' + ruleId;
                          return {
                            get: function get() {
                              return api._get(ruleUrl);
                            },
                            update: function update(data) {
                              return api._put(ruleUrl, data);
                            },
                            remove: function remove() {
                              return api._delete(ruleUrl);
                            }
                          };
                        }
                      };
                    },

                    incomingWebhooks: function incomingWebhooks() {
                      return {
                        list: function list() {
                          return api._get(appUrl + '/services/' + serviceId + '/incoming_webhooks');
                        },
                        create: function create(data) {
                          return api._post(appUrl + '/services/' + serviceId + '/incoming_webhooks', data);
                        },
                        incomingWebhook: function incomingWebhook(incomingWebhookId) {
                          var webhookUrl = appUrl + '/services/' + serviceId + '/incoming_webhooks/' + incomingWebhookId;
                          return {
                            get: function get() {
                              return api._get(webhookUrl);
                            },
                            update: function update(data) {
                              return api._put(webhookUrl, data);
                            },
                            remove: function remove() {
                              return api._delete(webhookUrl);
                            }
                          };
                        }
                      };
                    }
                  };
                }
              };
            },

            pushNotifications: function pushNotifications() {
              return {
                list: function list(filter) {
                  return api._get(appUrl + '/push/notifications', filter);
                },
                create: function create(data) {
                  return api._post(appUrl + '/push/notifications', data);
                },
                pushNotification: function pushNotification(messageId) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/push/notifications/' + messageId);
                    },
                    update: function update(data) {
                      return api._put(appUrl + '/push/notifications/' + messageId, data);
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/push/notifications/' + messageId);
                    },
                    send: function send() {
                      return api._post(appUrl + '/push/notifications/' + messageId + '/send');
                    }
                  };
                }
              };
            },

            users: function users() {
              return {
                list: function list(filter) {
                  return api._get(appUrl + '/users', filter);
                },
                create: function create(user) {
                  return api._post(appUrl + '/users', user);
                },
                user: function user(uid) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/users/' + uid);
                    },
                    devices: function devices() {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/users/' + uid + '/devices');
                        }
                      };
                    },
                    logout: function logout() {
                      return api._put(appUrl + '/users/' + uid + '/logout');
                    },
                    enable: function enable() {
                      return api._put(appUrl + '/users/' + uid + '/enable');
                    },
                    disable: function disable() {
                      return api._put(appUrl + '/users/' + uid + '/disable');
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/users/' + uid);
                    }
                  };
                }
              };
            },

            userRegistrations: function userRegistrations() {
              return {
                sendConfirmationEmail: function sendConfirmationEmail(email) {
                  return api._post(appUrl + '/user_registrations/by_email/' + email + '/send_confirm');
                }
              };
            },

            debug: function debug() {
              return {
                executeFunction: function executeFunction(userId) {
                  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    args[_key - 2] = arguments[_key];
                  }

                  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

                  return api._post(appUrl + '/debug/execute_function', { name: name, 'arguments': args }, { user_id: userId });
                },
                executeFunctionSource: function executeFunctionSource(userId) {
                  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
                  var evalSource = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

                  return api._post(appUrl + '/debug/execute_function_source', { source: source, 'eval_source': evalSource }, { user_id: userId });
                }
              };
            },

            authProviders: function authProviders() {
              return {
                list: function list() {
                  return api._get(appUrl + '/auth_providers');
                },
                create: function create(data) {
                  return api._post(appUrl + '/auth_providers', data);
                },
                authProvider: function authProvider(providerId) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/auth_providers/' + providerId);
                    },
                    update: function update(data) {
                      return api._patch(appUrl + '/auth_providers/' + providerId, data);
                    },
                    enable: function enable() {
                      return api._put(appUrl + '/auth_providers/' + providerId + '/enable');
                    },
                    disable: function disable() {
                      return api._put(appUrl + '/auth_providers/' + providerId + '/disable');
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/auth_providers/' + providerId);
                    }
                  };
                }
              };
            },

            security: function security() {
              return {
                allowedRequestOrigins: function allowedRequestOrigins() {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/security/allowed_request_origins');
                    },
                    update: function update(data) {
                      return api._post(appUrl + '/security/allowed_request_origins', data);
                    }
                  };
                }
              };
            },

            logs: function logs() {
              return {
                list: function list(filter) {
                  return api._get(appUrl + '/logs', filter);
                }
              };
            },

            apiKeys: function apiKeys() {
              return {
                list: function list() {
                  return api._get(appUrl + '/api_keys');
                },
                create: function create(data) {
                  return api._post(appUrl + '/api_keys', data);
                },
                apiKey: function apiKey(apiKeyId) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/api_keys/' + apiKeyId);
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/api_keys/' + apiKeyId);
                    },
                    enable: function enable() {
                      return api._put(appUrl + '/api_keys/' + apiKeyId + '/enable');
                    },
                    disable: function disable() {
                      return api._put(appUrl + '/api_keys/' + apiKeyId + '/disable');
                    }
                  };
                }
              };
            },

            functions: function functions() {
              return {
                list: function list() {
                  return api._get(appUrl + '/functions');
                },
                create: function create(data) {
                  return api._post(appUrl + '/functions', data);
                },
                function: function _function(functionId) {
                  return {
                    get: function get() {
                      return api._get(appUrl + '/functions/' + functionId);
                    },
                    update: function update(data) {
                      return api._put(appUrl + '/functions/' + functionId, data);
                    },
                    remove: function remove() {
                      return api._delete(appUrl + '/functions/' + functionId);
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  }, {
    key: 'v2',
    value: function v2() {
      var api = this._v2;
      return {

        apps: function apps(groupId) {
          var groupUrl = '/groups/' + groupId + '/apps';
          return {
            list: function list() {
              return api._get(groupUrl);
            },
            create: function create(data, options) {
              var query = options && options.defaults ? '?defaults=true' : '';
              return api._post(groupUrl + query, data);
            },

            app: function app(appId) {
              var appUrl = groupUrl + '/' + appId;
              return {
                get: function get() {
                  return api._get(appUrl);
                },
                remove: function remove() {
                  return api._delete(appUrl);
                },

                pipelines: function pipelines() {
                  return {
                    list: function list() {
                      return api._get(appUrl + '/pipelines');
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/pipelines', data);
                    },
                    pipeline: function pipeline(pipelineId) {
                      var pipelineUrl = appUrl + '/pipelines/' + pipelineId;
                      return {
                        get: function get() {
                          return api._get(pipelineUrl);
                        },
                        remove: function remove() {
                          return api._delete(pipelineUrl);
                        },
                        update: function update(data) {
                          return api._put(pipelineUrl, data);
                        }
                      };
                    }
                  };
                },

                values: function values() {
                  return {
                    list: function list() {
                      return api._get(appUrl + '/values');
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/values', data);
                    },
                    value: function value(valueId) {
                      var valueUrl = appUrl + '/values/' + valueId;
                      return {
                        get: function get() {
                          return api._get(valueUrl);
                        },
                        remove: function remove() {
                          return api._delete(valueUrl);
                        },
                        update: function update(data) {
                          return api._put(valueUrl, data);
                        }
                      };
                    }
                  };
                },

                services: function services() {
                  return {
                    list: function list() {
                      return api._get(appUrl + '/services');
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/services', data);
                    },
                    service: function service(serviceId) {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/services/' + serviceId);
                        },
                        remove: function remove() {
                          return api._delete(appUrl + '/services/' + serviceId);
                        },
                        runCommand: function runCommand(commandName, data) {
                          return api._post(appUrl + '/services/' + serviceId + '/commands/' + commandName, data);
                        },
                        config: function config() {
                          return {
                            get: function get() {
                              return api._get(appUrl + '/services/' + serviceId + '/config');
                            },
                            update: function update(data) {
                              return api._patch(appUrl + '/services/' + serviceId + '/config', data);
                            }
                          };
                        },

                        rules: function rules() {
                          return {
                            list: function list() {
                              return api._get(appUrl + '/services/' + serviceId + '/rules');
                            },
                            create: function create(data) {
                              return api._post(appUrl + '/services/' + serviceId + '/rules', data);
                            },
                            rule: function rule(ruleId) {
                              var ruleUrl = appUrl + '/services/' + serviceId + '/rules/' + ruleId;
                              return {
                                get: function get() {
                                  return api._get(ruleUrl);
                                },
                                update: function update(data) {
                                  return api._put(ruleUrl, data);
                                },
                                remove: function remove() {
                                  return api._delete(ruleUrl);
                                }
                              };
                            }
                          };
                        },

                        incomingWebhooks: function incomingWebhooks() {
                          return {
                            list: function list() {
                              return api._get(appUrl + '/services/' + serviceId + '/incoming_webhooks');
                            },
                            create: function create(data) {
                              return api._post(appUrl + '/services/' + serviceId + '/incoming_webhooks', data);
                            },
                            incomingWebhook: function incomingWebhook(incomingWebhookId) {
                              var webhookUrl = appUrl + '/services/' + serviceId + '/incoming_webhooks/' + incomingWebhookId;
                              return {
                                get: function get() {
                                  return api._get(webhookUrl);
                                },
                                update: function update(data) {
                                  return api._put(webhookUrl, data);
                                },
                                remove: function remove() {
                                  return api._delete(webhookUrl);
                                }
                              };
                            }
                          };
                        }

                      };
                    }
                  };
                },

                pushNotifications: function pushNotifications() {
                  return {
                    list: function list(filter) {
                      return api._get(appUrl + '/push/notifications', filter);
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/push/notifications', data);
                    },
                    pushNotification: function pushNotification(messageId) {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/push/notifications/' + messageId);
                        },
                        update: function update(data) {
                          return api._put(appUrl + '/push/notifications/' + messageId, data);
                        },
                        setType: function setType(type) {
                          return api._put(appUrl + '/push/notifications/' + messageId + '/type', { type: type });
                        },
                        remove: function remove() {
                          return api._delete(appUrl + '/push/notifications/' + messageId);
                        }
                      };
                    }
                  };
                },

                users: function users() {
                  return {
                    list: function list(filter) {
                      return api._get(appUrl + '/users', filter);
                    },
                    create: function create(user) {
                      return api._post(appUrl + '/users', user);
                    },
                    user: function user(uid) {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/users/' + uid);
                        },
                        logout: function logout() {
                          return api._put(appUrl + '/users/' + uid + '/logout');
                        },
                        remove: function remove() {
                          return api._delete(appUrl + '/users/' + uid);
                        }
                      };
                    }
                  };
                },

                dev: function dev() {
                  return {
                    executePipeline: function executePipeline(body, userId, options) {
                      return api._post(appUrl + '/dev/pipeline', body, Object.assign({}, options, { user_id: userId }));
                    }
                  };
                },

                authProviders: function authProviders() {
                  return {
                    list: function list() {
                      return api._get(appUrl + '/auth_providers');
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/auth_providers', data);
                    },
                    authProvider: function authProvider(providerId) {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/auth_providers/' + providerId);
                        },
                        update: function update(data) {
                          return api._patch(appUrl + '/auth_providers/' + providerId, data);
                        },
                        enable: function enable() {
                          return api._put(appUrl + '/auth_providers/' + providerId + '/enable');
                        },
                        disable: function disable() {
                          return api._put(appUrl + '/auth_providers/' + providerId + '/disable');
                        },
                        remove: function remove() {
                          return api._delete(appUrl + '/auth_providers/' + providerId);
                        }
                      };
                    }
                  };
                },

                security: function security() {
                  return {
                    allowedRequestOrigins: function allowedRequestOrigins() {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/security/allowed_request_origins');
                        },
                        update: function update(data) {
                          return api._post(appUrl + '/security/allowed_request_origins', data);
                        }
                      };
                    }
                  };
                },

                logs: function logs() {
                  return {
                    list: function list(filter) {
                      return api._get(appUrl + '/logs', filter);
                    }
                  };
                },

                apiKeys: function apiKeys() {
                  return {
                    list: function list() {
                      return api._get(appUrl + '/api_keys');
                    },
                    create: function create(data) {
                      return api._post(appUrl + '/api_keys', data);
                    },
                    apiKey: function apiKey(apiKeyId) {
                      return {
                        get: function get() {
                          return api._get(appUrl + '/api_keys/' + apiKeyId);
                        },
                        remove: function remove() {
                          return api._delete(appUrl + '/api_keys/' + apiKeyId);
                        },
                        enable: function enable() {
                          return api._put(appUrl + '/api_keys/' + apiKeyId + '/enable');
                        },
                        disable: function disable() {
                          return api._put(appUrl + '/api_keys/' + apiKeyId + '/disable');
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  }, {
    key: 'type',
    get: function get() {
      return _common2.default;
    }
  }, {
    key: '_v3',
    get: function get() {
      var _this3 = this;

      var v3do = function v3do(url, method, options) {
        return _get(StitchAdminClient.prototype.__proto__ || Object.getPrototypeOf(StitchAdminClient.prototype), '_do', _this3).call(_this3, url, method, Object.assign({}, { apiVersion: v3 }, options)).then(function (response) {
          var contentHeader = response.headers.get('content-type') || '';
          if (contentHeader.split(',').indexOf('application/json') >= 0) {
            return response.json();
          }
          return response;
        });
      };

      return {
        _get: function _get(url, queryParams) {
          return v3do(url, 'GET', { queryParams: queryParams });
        },
        _put: function _put(url, data) {
          return data ? v3do(url, 'PUT', { body: JSON.stringify(data) }) : v3do(url, 'PUT');
        },
        _patch: function _patch(url, data) {
          return data ? v3do(url, 'PATCH', { body: JSON.stringify(data) }) : v3do(url, 'PATCH');
        },
        _delete: function _delete(url) {
          return v3do(url, 'DELETE');
        },
        _post: function _post(url, body, queryParams) {
          return queryParams ? v3do(url, 'POST', { body: JSON.stringify(body), queryParams: queryParams }) : v3do(url, 'POST', { body: JSON.stringify(body) });
        }
      };
    }
  }, {
    key: '_v2',
    get: function get() {
      var _this4 = this;

      var v2do = function v2do(url, method, options) {
        return _get(StitchAdminClient.prototype.__proto__ || Object.getPrototypeOf(StitchAdminClient.prototype), '_do', _this4).call(_this4, url, method, Object.assign({}, { apiVersion: v2 }, options)).then(function (response) {
          var contentHeader = response.headers.get('content-type') || '';
          if (contentHeader.split(',').indexOf('application/json') >= 0) {
            return response.json();
          }
          return response;
        });
      };

      return {
        _get: function _get(url, queryParams) {
          return v2do(url, 'GET', { queryParams: queryParams });
        },
        _put: function _put(url, data) {
          return data ? v2do(url, 'PUT', { body: JSON.stringify(data) }) : v2do(url, 'PUT');
        },
        _patch: function _patch(url, data) {
          return data ? v2do(url, 'PATCH', { body: JSON.stringify(data) }) : v2do(url, 'PATCH');
        },
        _delete: function _delete(url) {
          return v2do(url, 'DELETE');
        },
        _post: function _post(url, body, queryParams) {
          return queryParams ? v2do(url, 'POST', { body: JSON.stringify(body), queryParams: queryParams }) : v2do(url, 'POST', { body: JSON.stringify(body) });
        }
      };
    }
  }]);

  return StitchAdminClient;
}(_client.StitchClient);