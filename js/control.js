control = {
	
	init: function() {
		
		utils.log('hello world');

	}

};

utils = {
	
	log: function(msg) {
		try {
			console.log(msg);
		} catch(er) {
			
		}
	}
};