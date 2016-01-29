ng.module('smart-table')
	.directive('stSort', ['stConfig', '$parse', '$timeout', function (stConfig, $parse, $timeout) {
		return {
			restrict: 'A',
			require: '^stTable',
			link: function (scope, element, attr, ctrl) {

				var predicate = attr.stSort;
				var getter = $parse(predicate);
				var index = 0;
				var classAscent = attr.stClassAscent || stConfig.sort.ascentClass;
				var classDescent = attr.stClassDescent || stConfig.sort.descentClass;
				var stateClasses = [classAscent, classDescent];
				var sortDefault;
				var skipNatural = attr.stSkipNatural !== undefined ? attr.stSkipNatural : stConfig.sort.skipNatural;
				var descendingFirst = attr.stDescendingFirst !== undefined ? attr.stDescendingFirst : stConfig.sort.descendingFirst;
				var promise = null;
				var throttle = attr.stDelay || stConfig.sort.delay;

				if (attr.stSortDefault) {
					sortDefault = scope.$eval(attr.stSortDefault) !== undefined ? scope.$eval(attr.stSortDefault) : attr.stSortDefault;
				}

				//view --> table state
				function sort (defaultSort) {
					if ( descendingFirst ) {
						if ( index === 0 ) {
							index = 2;
						} else if ( index === 2 ) {
							index = 1;
						} else {
							index = 0;
						}
					} else {
						index++;
					}

					var func;
					predicate = ng.isFunction(getter(scope)) || ng.isArray(getter(scope)) ? getter(scope) : attr.stSort;
					if (index % 3 === 0 && !!skipNatural !== true) {
						//manual reset
						index = 0;
						ctrl.tableState().sort = {};
						ctrl.tableState().pagination.start = 0;
						func = ctrl.pipe.bind(ctrl);
					} else {
						func = ctrl.sortBy.bind(ctrl, predicate, index % 2 === 0, defaultSort /* keeps current page if true */);
					}
					if (promise !== null) {
						$timeout.cancel(promise);
					}
					if (throttle < 0) {
						func();
					} else {
						promise = $timeout(func, throttle);
					}
				}

				element.bind('click', function sortClick () {
					if (predicate) {
						scope.$apply(sort);
					}
				});

				if (sortDefault) {
					index = sortDefault === 'reverse' ? 1 : 0;
					sort(true);
				}

				//table state --> view
				scope.$watch(function () {
					return ctrl.tableState().sort;
				}, function (newValue) {
					console.log('tableState().sort watch fired', newValue);
					console.log('newValue predicate ', newValue.predicate, 'old predicate', predicate);
					if (newValue.predicate !== predicate) {
						console.log('if path');
						index = 0;
						element
							.removeClass(classAscent)
							.removeClass(classDescent);
					} else {
						console.log('else path');
						index = newValue.reverse === true ? 2 : 1;
						element
							.removeClass(stateClasses[index % 2])
							.addClass(stateClasses[index - 1]);
					}
				}, true);
			}
		};
	}]);
