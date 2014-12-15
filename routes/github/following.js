var Route = require(__modules+'/Route');

var route = new Route({
	title: 'Following',
	name:  'github:following',
	url:   'https://github.com/<%- query %>/following?page=<%= state.currentPage %>',
	priority: 50,

	test: {
		query: 'isaacs',
		shouldCreateProfiles:  false,
		shouldSpawnOperations: true,
	}
});

// This function is executed in the PhantomJS contex;
// we have no access to the context out of this function
route.scraper = function() {
	var hasPagination, data;

	data = {
		operations: []
	};

	// Get all the usernames in this page
	$('.follow-list-item').each(function() {
		data.operations.push({
			routeName: 'github:profile',
			query: $(this).find('.gravatar').parent().attr('href').substr(1), 
		});
	});

	hasPagination = $('.paginate-container').find('a').length > 0;

	if ( hasPagination ) {
		data.hasNextPage = $('.paginate-container').find('.pagination').children().last().prop("tagName") === 'A';
	}

	return data;
};

module.exports = route;