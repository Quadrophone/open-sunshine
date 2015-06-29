angular.module('opensunshine', ['ionic', 'ngSanitize'])
    .filter('capitalize', function() {
        return function(input, all) {
            return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) : '';
        }
    })

.filter('encodeURIComponent', function() {
    return function(uriComponent) {
        uriComponent = uriComponent.replace(/'/g, "/\'");
        return encodeURIComponent(uriComponent);
    };
})

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
}])

.controller("Sunshine", function($scope, $http, $q, $window) {

    var apiKey = '58576aebd9604aefa80483d098c365c7';

    $scope.politician = {};

    $scope.politicians = {};


    $scope.donorDescription = function(donor, politicianIndex, donorIndex) {
        var year = $scope.politician.year;
        console.log(year);

        var organizationURL = 'http://transparencydata.com/api/1.0/entities/' + donor + '.json?apikey=' + apiKey + '&callback=JSON_CALLBACK';
        if (year) {
            organizationURL += '&cycle=' + year;
        }

        var otherRecipientsUrl = 'http://transparencydata.com/api/1.0/aggregates/org/' + donor + '/recipients.json?apikey=' + apiKey + '&callback=JSON_CALLBACK';
        if (year) {
            otherRecipientsUrl += '&cycle=' + year;
        }
        $scope.politicians[politicianIndex].donors[donorIndex] = {};

        $http.jsonp(organizationURL).then(function(organization) {
            if (organization.data.metadata.bio != undefined) {
                $scope.politicians[politicianIndex].donors[donorIndex].bio = organization.data.metadata.bio;
            }
            if (organization.data.metadata.parent_entity !== null) {
                $scope.politicians[politicianIndex].donors[donorIndex].parentEntity = organization.data.metadata.parent_entity.name;
            }
        });

        $http.jsonp(otherRecipientsUrl).then(function(recipients) {
            console.log(recipients.data);
            $scope.politicians[politicianIndex].donors[donorIndex].otherRecipients = recipients.data;
        });
    }

    $scope.searchPoliticians = function() {

        $scope.loading = true;
        $scope.noResults = false;

        var name = $scope.politician.name;
        name = encodeURI(name);


        var year = $scope.politician.year;

        var politicianID;
        var industries;
        var industriesURL;
        var donorsUrl;

        var politicianURL = 'http://transparencydata.com/api/1.0/entities.json?search=' + name + '&type=politician&apikey=' + apiKey + '&callback=JSON_CALLBACK';


        $http.jsonp(politicianURL).then(function(politicians) {

            if (politicians.data.length < 1) {
                $scope.loading = false;
                $scope.noResults = true;
                return false;
            }

            $scope.politicians = politicians.data;

            angular.forEach(politicians.data, function(politician) {
                politician.name = politician.name.replace('(D)', '').replace('(R)', '');
                politicianID = politician.id;
                industriesURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors/industries.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK';

                if (year) {
                    industriesURL += '&cycle=' + year;
                }

                donorsURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK'

                if (year) {
                    donorsURL += '&cycle=' + year;
                }

                $http.jsonp(industriesURL).then(function(industries) {

                    politician.industries = industries.data;
                });

                $http.jsonp(donorsURL).then(function(donors) {

                    politician.donors = donors.data;
                    $scope.loading = false;

                });

            });
        });

    };

});

/*         
                politicianID = result.data[0].id;
                console.log(result);
                $scope.politicians = data;


                industriesURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors/industries.json?cycle=2012&limit=100&apikey=58576aebd9604aefa80483d098c365c7&callback=JSON_CALLBACK';
                $http.jsonp(industriesURL).then(function(industries) {
                   $scope.industries = industries.data;
                });

*/
