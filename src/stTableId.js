ng.module('smart-table')
  .directive('stTableId', ['stTableService', function (stTableService) {
    return {
      require: '^stTable',
      scope: {
        id: '@stTableId'
      },
      link: function (scope, element, attrs, ctrl) {
        stTableService.register(scope.id, ctrl);

        scope.$on('$destroy', function() {
          stTableService.deregister(scope.id);
        });
      }
    };
  }]);
