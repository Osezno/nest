var _ = require('lodash');
var debug = require('debug')('Operation:statics');

exports.getKeyParams = function(params) {
	if ( !params.routeName || !params.query ) {
		throw new Error('Params are invalid: '+JSON.stringify(params));
	}

	var keyParams = {
		routeName: params.routeName,
		query: params.query,
	};

	debug('Generated key params', keyParams);

	return keyParams;
};

exports.findOrCreate = function(params, callback) {
	var Operation, keyParams;

	Operation = this;
	keyParams = Operation.getKeyParams(params);

	debug('findOrCreate with params', keyParams);

	Operation.findOne(keyParams, function(err, operation) {
		if (err) return callback(err);
		if (!operation) {
			debug('Creating operation with params', params);
			Operation.create(params, function(err, operation) {
				if (err) return callback(err);
				operation.wasNew = true;
				callback(null, operation);
			});
		}
		else {
			operation.wasNew = false;
			callback(null, operation);
		}
	});
};

exports.getNext = function(state, callback) {
	var runningOperations = state.getOperationIds();

	var query = { 
		'state.finished': false
	};

	if ( runningOperations.length ) {
		query._id = { $nin: runningOperations };
	}

	var disabledRoutes = __config.engine.disabledRoutes || [];
	if ( disabledRoutes.length ) {
		query.route = { $nin: [] };

		_.each(disabledRoutes, function(route) {
			query.route.$nin.push(route);
		});
	}

	this.findOne(query).sort({ 'priority': -1 }).exec(callback);
};