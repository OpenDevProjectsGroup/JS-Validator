// inspired by JS Patterns
var Validator = {

	// For min/max operations
	limit : '',

	validationRules: {
		// A few to get started. 
		required: {
			validate: function(value) {
				return value.length !== 0;
			},
			errorMessage: 'This field cannot be blank.'
		},
		number: {
			validate: function(value) {
				return (typeof value === 'number') && ! isNaN(value); // kinda weird. Needed more than isNaN. Make better, Jeff.
			},
			errorMessage: 'Must be a number.'
		},
		email: {
			validate: function(value) {
				var exp = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
				return exp.test(value);
			},
			errorMessage: 'Must use a valid email address.'
		},
		min: {
			validate : function(value, limit) {
				return value.length >= limit;
			},
			errorMessage : 'Not enough characters'
		},
		max: {
			validate : function(value, limit) {
				return value.length <= limit;
			},
			errorMessage : 'Too many characters.'
		}
	},

	// Will contain array of error messages (should there be any)
	errorMessages: [],

	// To be set by the user. 
	config: {},


	validate: function(data) {
		var validationRule, 
			 checker, 
			 goodToGo, 
			 toString = Object.prototype.toString,
			 isArray, 
			 i, j, len;

		// Empty error errorMessages
		this.errorMessages = [];

		function reviseIfLimit(validationRule) {
			var split;
			// Check if rule is min|max_number
			if ( /\d$/.test(validationRule) ) {
				split = validationRule.split('_');
				validationRule = split[0];
				Validator.limit = split[1];
			}
			return validationRule;
		}
		
		// Filter through the form data object
		for (i in data) {
			// i = field name (firstName)
			// data[i] = field value (Jeffrey)
		
			if (data.hasOwnProperty(i)) {
				// Like, "number" or "required" (Could be array of checks)
				validationRule = this.config[i];
	
				// Did the user pass an array of checks?
				isArray = (toString.call(validationRule) === '[object Array]');
				if (isArray) {
					// Then filter through array, and check to see if we have a rule for the check.
					len = validationRule.length;
					checker = [];

					while (len--) {
						// Check if the rule is "min" or "max" followed by a limit (int). 
						validationRule[len] = reviseIfLimit(validationRule[len]);
						
						if (!this.validationRules[validationRule[len]]) {
							throw new Error(validationRule[len] + ': Validation parameter is unknown.');
						}
						checker.push(this.validationRules[validationRule[len]]);
					}
				} else {
					// no array. just a single value to validate.
					// Check if the rule has a limit (min | max_INT)
					validationRule = reviseIfLimit(validationRule);

					if (!validationRule) {
						continue;
					}

					// checker equals the rule definition
					checker = this.validationRules[validationRule];
					if (!checker) {
						throw new Error(validationRule + ': Validation parameter is unknown.');
					}
				}

				// Now call the validate methods of all the items in the array
				if (toString.call(checker) === '[object Array]') {
					for (j = 0; j < checker.length; j++) {
						goodToGo = checker[j].validate(data[i], this.limit || null );

						// If not good to go, add the error message to the "errorMessages" array.
						if (!goodToGo) {
							this.errorMessages.push(i + ': ' + checker[j].errorMessage + (this.limit ? ' (' + this.limit + ')' : ''));
						}
					}
				} else {
					goodToGo = checker.validate(data[i], this.limit || null);
					if (!goodToGo) {
						this.errorMessages.push(i + ': ' + checker.errorMessage + (this.limit ? ' (' + this.limit + ')' : ''));
					}
				}
			}
		} // end for
	},

	// Very simple, but helpful. 
	hasErrors: function() {
		return this.errorMessages.length !== 0;
	},

	// Another little helper method to populate a ul element with the list of errors (if any).
	populateList: function(results) {
		var len = Validator.errorMessages.length,
			 li,
			 frag = document.createDocumentFragment();

		if (!results) {
			throw new Error('populateList requires an argument that specifies the container element for the error list.');
		}

		if (this.hasErrors) {
			while (len--) {
				li = document.createElement('li');
				li.appendChild( document.createTextNode(Validator.errorMessages[len]) );
				frag.appendChild(li);
			}
			results.appendChild(frag);
		}
	}

};

