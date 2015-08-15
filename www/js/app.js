angular.module('opensunshine', ['ionic', 'ngSanitize'])
    .filter('capitalize', function() {
        return function(input, all) {
            return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) : '';
        };
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
    .directive('ngClickOnce', function() {
        return {
            restrict: "A",
            link: function(scope, element, attribute) {
                var clickFunction = function() {
                    scope.$eval(attribute.ngClickOnce);
                    scope.$apply();
                    element.unbind("click", clickFunction);
                };

                element.bind("click", clickFunction);
            }
        };
    })

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
}])

.controller("Sunshine", function($scope, $http, $q, $window) {

    var apiKey = '58576aebd9604aefa80483d098c365c7';

    if (apiKey === '') {
        alert("You'll need an API key from data.influenceexplorer.com");
        return;
    }

    $scope.politician = {};

    $scope.politicians = {};


    $scope.donorDescription = function(donorID, politicianIndex, donorIndex) {

        var year = $scope.politician.year;

        $scope.loading = true;

        var organizationURL = 'http://transparencydata.com/api/1.0/entities/' + donorID + '.json?apikey=' + apiKey + '&callback=JSON_CALLBACK';

        if (year !== undefined) {
            organizationURL += '&cycle=' + year;
        }

        var otherRecipientsUrl = 'http://transparencydata.com/api/1.0/aggregates/org/' + donorID + '/recipients.json?apikey=' + apiKey + '&callback=JSON_CALLBACK';

        if (year !== undefined) {
            otherRecipientsUrl += '&cycle=' + year;
        }
        console.log(otherRecipientsUrl);

        //$scope.politicians[politicianIndex].donors[donorIndex] = {};

        $http.jsonp(organizationURL).success(function(organization) {
            $scope.loading = false;

            if (organization.metadata.bio !== undefined) {
                console.log(organization.metadata.bio);
                $scope.politicians[politicianIndex].donors[donorIndex].bio = organization.metadata.bio;
            }
            if (organization.metadata.parent_entity !== null) {
                $scope.politicians[politicianIndex].donors[donorIndex].parentEntity = organization.metadata.parent_entity.name;
            }
        }).error(function(data, status, headers, config) {
            alert("Error connecting to server");

        });

        $http.jsonp(otherRecipientsUrl).success(function(recipients) {
            $scope.politicians[politicianIndex].donors[donorIndex].otherRecipients = recipients;
        }).error(function(data, status, headers, config) {
            alert("Error connecting to server");
            $scope.loading = false;

        });
    };

    $scope.searchPoliticians = function() {

        cordova.plugins.Keyboard.close();

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


        $http.jsonp(politicianURL).success(function(politicians) {
            console.log(politicians);
            console.log(politicians.length);
            $scope.politicians = politicians;

            if (politicians.length < 1) {
                $scope.loading = false;
                $scope.noResults = true;
                return false;
            }

            angular.forEach(politicians, function(politician) {
                politician.name = politician.name.replace('(D)', '').replace('(R)', '');
                console.log(politician.name);
                console.log(politician.id);
                politicianID = politician.id;
                industriesURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors/industries.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK';

                if (year) {
                    industriesURL += '&cycle=' + year;
                }

                donorsURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK';

                if (year) {
                    donorsURL += '&cycle=' + year;
                }

                $http.jsonp(industriesURL).success(function(industries) {
                    console.log('industries');
                    console.log(industries);
                    politician.industries = industries;
                }).error(function(data, status, headers, config) {
                    alert("Error connecting to server");
                    $scope.loading = false;

                });

                $http.jsonp(donorsURL).success(function(donors) {
                    console.log('donors');
                    console.log(donors);

                    politician.donors = donors;
                    $scope.loading = false;
                }).error(function(data, status, headers, config) {
                    alert("Error connecting to server");
                    $scope.loading = false;

                });
            });
        }).error(function(data, status, headers, config) {
            alert("Error connecting to server");
            $scope.loading = false;

        });
    };
});
