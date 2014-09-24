//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2014 Intel Corporation All Rights Reserved.
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


(function () {
  'use strict';

  angular.module('server')
    .controller('SelectServerProfileStepCtrl', ['$scope', '$stepInstance', 'OVERRIDE_BUTTON_TYPES', 'data',
      function SelectServerProfileStepCtrl ($scope, $stepInstance, OVERRIDE_BUTTON_TYPES, data) {
        $scope.selectServerProfile = {
          /**
           * Tells manager to perform a transition.
           * @param {String} action
           */
          transition: function transition (action) {
            off();

            if (action !== OVERRIDE_BUTTON_TYPES.OVERRIDE)
              $stepInstance.transition(action, {
                data: data,
                hostProfileData: $scope.selectServerProfile.data,
                profile: $scope.selectServerProfile.item
              });
          },
          onSelected: function onSelected (item) {
            $scope.selectServerProfile.overridden = false;
            $scope.selectServerProfile.item = item;
            $scope.selectServerProfile.items = $scope.selectServerProfile.data.map(function (object) {
              return _.extend({}, object, {
                profile: item.caption,
                items: object.profiles[item.id],
                valid: object.profiles[item.id].length === 0
              });
            });
          },
          /**
           * Used by filters to determine the context.
           * @param {Object} item
           * @returns {String}
           */
          getHostPath: function getHostPath (item) {
            return item.address;
          },
          /**
           * Update hostnames.
           * @param {String} pdsh
           * @param {Array|undefined} hostnames
           */
          pdshUpdate: function pdshUpdate (pdsh, hostnames) {
            $scope.selectServerProfile.pdsh = pdsh;

            if (hostnames)
              $scope.selectServerProfile.hostnames = hostnames;
          }
        };

        var off = data.hostProfileSpark.onValue('data', function (response) {
          var profiles = _.pluck(response.body.objects, 'profiles');

          var valid = buildReducer(function predicate (profile) {
            return profile.length === 0;
          })(profiles);

          var invalid = buildReducer(function predicate (profile) {
            return profile.length > 0;
          })(profiles);

          valid = _.difference(valid, invalid);

          $scope.selectServerProfile.data = response.body.objects;
          $scope.selectServerProfile.options = makeFancy(invalid).concat(makeFancy(valid, true));

          function makeFancy (profiles, valid) {
            return profiles.map(function (profile) {
              var option = {
                id: profile,
                caption: _.capitalize(profile.split('_').join(' ')),
                valid: valid
              };

              if (!valid)
                _.extend(option, {
                  labelType: 'label-danger',
                  label: 'Incompatible'
                });

              return option;
            });
          }

          function buildReducer (predicate) {
            return function reducer (profiles) {
              return _.unique(profiles.reduce(function (arr, profile) {
                return arr.concat(Object.keys(profile).filter(function (key) {
                  return predicate(profile[key]);
                }));
              }, []));
            };
          }
        });
      }])
    .factory('selectServerProfileStep', [
      function selectServerProfileStep () {
        return {
          templateUrl: 'iml/server/assets/html/select-server-profile-step.html',
          controller: 'SelectServerProfileStepCtrl',
          transition: ['$transition', 'data', 'requestSocket', 'hostProfileData', 'profile',
            function transition ($transition, data, requestSocket, hostProfileData, profile) {
              if ($transition.action !== 'previous') {
                var spark = requestSocket();

                data.serverSpark.onceValue('data', function (response) {
                  var servers = response.body.objects;

                  var objects = hostProfileData
                    .map(function convertToObjects (data) {
                      return {
                        host: data.host,
                        profile: profile.id
                      };
                    })
                    .filter(function limitToUnconfigured (object) {
                      var server = _.find(servers, { id: object.host.toString()});

                      return server && server.server_profile && server.server_profile.initial_state === 'unconfigured';
                    });

                  var hostProfile = spark.sendPost('/host_profile', {
                    json: { objects: objects }
                  }, true)
                    .catch(function throwError (response) {
                      throw response.error;
                    });

                  //@TODO: The backend should return a command as the result of POSTing here.
                  //@TODO: Put open command modal here when that occurs.

                  hostProfile
                    .then($transition.end)
                    .finally(function snuffSpark () {
                      spark.end();
                    });

                });

                return;
              }

              return {
                step: $transition.steps.serverStatusStep,
                resolve: { data: data }
              };
            }
          ]
        };
      }
    ]);
}());