// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


angular.module('opensunshine', ['ionic'])
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


    $scope.openGoogle = function(link) {
        $window.open(link, '_system');
    };

    $scope.otherContributions = function(contributor) {
        
        var contributorURL = 'http://transparencydata.com/api/1.0/aggregates/org/' + contributor + '/recipients.json?apikey=' + apiKey + '&callback=JSON_CALLBACK';
        $http.jsonp(contributorURL).then(function(recipients) {
            recipients = recipients.data;
        });
    }

    $scope.politician = {};


    $scope.searchPoliticians = function() {

        $scope.loading = true;

       

        var name = $scope.politician.name;
        name = encodeURI(name);


        var year = $scope.politician.year;

        var politicianID;
        var industries;
        var industriesURL;
        var donorsUrl;

        var politicianURL = 'http://transparencydata.com/api/1.0/entities.json?search=' + name + '&type=politician&apikey=' + apiKey + '&callback=JSON_CALLBACK';


        $http.jsonp(politicianURL).then(function(politicians) {

            $scope.politicians = politicians.data;

            angular.forEach(politicians.data, function(politician) {
                politician.name = politician.name.replace('(D)', '').replace('(R)', '');
                politicianID = politician.id;
                industriesURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors/industries.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK';

                if (year) {
                    industriesURL += '&cycle=' + year;
                }

                donorsURL = 'http://transparencydata.com/api/1.0/aggregates/pol/' + politicianID + '/contributors.json?page=1&per_page=1000&apikey=' + apiKey + '&callback=JSON_CALLBACK'
                console.log(donorsURL);
                if (year) {
                    donorsURL += '&cycle=' + year;
                }

                $http.jsonp(industriesURL).then(function(industries) {
                    politician.industries = industries.data;
                });

                $http.jsonp(donorsURL).then(function(donors) {
                    politician.donors = donors.data;
                    console.log(donors);
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
