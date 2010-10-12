var Validator = {

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
			validate : function(value, min) {
				return value.length >= min;
			},
			errorMessage : 'Not enough characters'
									
		},
		max: {
			validate : function(value, min, max) {
				return value.length <= max;
			},
			errorMessage : 'Too many characters.'
		},
		sameAs : {
			validate : function(value, limit, propName, sameAs) {
				return value === Validator.sameAs;
			},
		errorMessage : 'Values must be the same'
		}
	},

	// Will contain array of error messages (should there be any)
	errorMessages: [],

	// To be set by the user. 
	config: {},

	min : '',

	max : '',

	sameAs : '',

	// The object of data we're testing
	data : {},

	validate: function(data) {
		var rule, 
			 checker, 
			 goodToGo, 
			 toString = Object.prototype.toString,
			 prop, j, len,
			 sameAs,
			 isSameRuleSet;

		// Empty error errorMessages
		this.errorMessages = [];

		// Expose data to Validator object.
		this.data = data;

		// Determines if a min|max rule has been applied,
		// If so, it splits it.
		function reviseIfLimit(rule) {
			var split;
			// Check if rule is min|max_number
			if ( /\d$/.test(rule) ) {
				split = rule.split('_');
				rule = split[0];
				if ( rule === 'min'.toLowerCase() ) {
					Validator.min = split[1];
				} else {
					Validator.max = split[1];
				}
			}
			return rule;
		}

		function isSameChecker(rule) {
			var split;
			// what if verification (sameAs_<field>)
			if ( /^sameAs/i.test(rule) ) {
				split = rule.split('_');
				rule = split[0];
				Validator.sameAs = split[1];

				if ( !Validator.validationRules[rule] ) {
					throw new Error(rule + ': Validation parameter is unknown.');
				}
			}
			return rule;
		}

		// Filter through the form data object
		for (prop in data) {
			// prop = field name (firstName)
			// data[prop] = field value (Jeffrey)
		
			if (data.hasOwnProperty(prop)) {
				// Like, "number" or "required" (Could be array of checks)
				if ( !this.config[prop] ) continue;
				rule = this.config[prop];

				// Did the user pass an array of checks?
				if (toString.call(rule) === '[object Array]') {
					len = rule.length;
					checker = [];

					// Then filter through array, and check to see if we have a rule for the check.
					while (len--) {
						// Check if the rule is "min" or "max" followed by a limit (int). 
						rule[len] = reviseIfLimit(rule[len]);
						rule[len] = isSameChecker(rule[len]);
						checker.push(this.validationRules[rule[len]]);
					}
				} else {
					// no array. just a single value to validate.
					// Check if the rule has a limit (min | max_INT)
					rule = reviseIfLimit(rule);
					rule = isSameChecker(rule);	
					checker = this.validationRules[rule];

					if (!checker) {
						throw new Error(rule + ': Validation parameter is unknown.');
					}
				}

				// Now call the validate methods of all the items in the array
				if (toString.call(checker) === '[object Array]') {
					for (j = 0; j < checker.length; j++) {
						goodToGo = callValidator.call(this, checker[j]);	
					}
				} else {
					goodToGo = callValidator.call(this, checker);
				}
			}
		} // end for

		function callValidator(checker) {
			goodToGo = checker.validate(data[prop], this.min, this.max, prop, Validator.sameAs); // value, property name, what it's being compared to
			if (!goodToGo) {
				this.errorMessages.push(prop + ': ' + checker.errorMessage);
			}
		}

	},

	// Very simple, but helpful. 
	hasErrors: function() {
		return this.errorMessages.length !== 0;
	},

	// Another little helper method to populate a ul element with the list of errors (if any).
	populateList: function(results) {
		var len = Validator.errorMessages.length,
			 li;
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

