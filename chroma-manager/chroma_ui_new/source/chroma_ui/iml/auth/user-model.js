//
// INTEL CONFIDENTIAL
//
// Copyright 2013 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.


angular.module('auth')
  .constant('user_EULA_STATES', {
    EULA: 'eula',
    PASS: 'pass',
    DENIED: 'denied'
  })
  /**
   * @name UserModel
   */
  .factory('UserModel', ['modelFactory', 'user_EULA_STATES', function (modelFactory, EULA_STATES) {
    'use strict';

    var UserModel = modelFactory({
      url: 'user/:id',
      params: { id: '@id' }
    });

    UserModel.prototype.actOnEulaState = function actOnEulaState(showFunc, denyFunc, passFunc) {
      passFunc = passFunc || angular.noop;

      var result;

      switch (this.eula_state) {
      case EULA_STATES.PASS:
        result = passFunc(this);
        break;
      case EULA_STATES.EULA:
        result = showFunc(this);
        break;
      case EULA_STATES.DENIED:
        result = denyFunc(this);
        break;
      }

      return result;
    };

    return UserModel;
  }]);