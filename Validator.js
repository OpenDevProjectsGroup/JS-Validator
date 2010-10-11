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
		},
		sameAs : {
			// need property name, what it's comparing to, and the value to compare
			validate : function(value, limit, propName, sameAs) {
				if ( !Validator.data[sameAs] ) throw new Error('What property are you comparing too?');
				return value === Validator.data[sameAs];
			},
		errorMessage : 'Values must be the same'
		}
	},

	// Will contain array of error messages (should there be any)
	errorMessages: [],

	// To be set by the user. 
	config: {},

	// The object of data we're testing
	data : {},

	validate: function(data) {
		var validationRule, 
			 checker, 
			 goodToGo, 
			 toString = Object.prototype.toString,
			 isArray, 
			 prop, j, len,
			 sameAs,
			 isSameRuleSet;

		// Empty error errorMessages
		this.errorMessages = [];

		// Expose data to Validator object.
		this.data = data;

		// Determines if a min|max rule has been applied,
		// If so, it splits it.
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
		
		// Determines if the rule is "sameAs"
		// If so, splits it, and returns an object.
		function testSame(validationRule) {
			var split;
			// what if verification (sameAs_<field>)
			if ( /^sameAs/i.test(validationRule) ) {
				split = validationRule.split('_');
				return {
					sameAs : split[1],
					validationRule : split[0]
				};
			}
			return false;
		}

		// Filter through the form data object
		for (prop in data) {
			// prop = field name (firstName)
			// data[prop] = field value (Jeffrey)
		
			if (data.hasOwnProperty(prop)) {
				// Like, "number" or "required" (Could be array of checks)
				validationRule = this.config[prop];
	
				// Did the user pass an array of checks?
				isArray = (toString.call(validationRule) === '[object Array]');
				if (isArray) {
					// Then filter through array, and check to see if we have a rule for the check.
					len = validationRule.length;
					checker = [];

						while (len--) {
						// Check if the rule is "min" or "max" followed by a limit (int). 
						validationRule[len] = reviseIfLimit(validationRule[len]);
						
						// Determine if the rule is "sameAs_<otherPropName>". 
						isSameRuleSet = testSame(validationRule[len]);
						if ( isSameRuleSet )  {
							validationRule[len] = isSameRuleSet.validationRule;
							sameAs = isSameRuleSet.sameAs;
						}

						if (!this.validationRules[validationRule[len]]) {
							throw new Error(validationRule[len] + ': Validation parameter is unknown.');
						}
						checker.push(this.validationRules[validationRule[len]]);
					}
				} else {
					// no array. just a single value to validate.
					// Check if the rule has a limit (min | max_INT)
					validationRule = reviseIfLimit(validationRule);
					
					// Determine if the rule is "sameAs_<otherPropName>". 
					isSameRuleSet = testSame(validationRule);
					if ( isSameRuleSet )  {
						validationRule = isSameRuleSet.validationRule;
						sameAs = isSameRuleSet.sameAs;
					}

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
						goodToGo = callValidator(this, checker[j], goodToGo, sameAs);	
					}
				} else {
					goodToGo = callValidator(this, checker, goodToGo, sameAs);
				}
			}
		} // end for

		function callValidator(that, checker, goodToGo, sameAs) {
			goodToGo = checker.validate(data[prop], that.limit, prop, sameAs); // value, property name, what it's being compared to
			if (!goodToGo) {
				that.errorMessages.push(prop + ': ' + checker.errorMessage + (that.limit ? ' (' + that.limit + ')' : ''));
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

