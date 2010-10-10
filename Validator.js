// inspired by JS Patterns
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
		}
	},

	// Will contain array of error messages (should there be any)
	errorMessages: [],

	// To be set by the user. 
	config: {},

	validate: function(data) {
		var validationRule, checker, goodToGo, toString = Object.prototype.toString;

		// Empty error errorMessages
		this.errorMessages = [];

		// Filter through the form data object
		for (var i in data) {
			if (data.hasOwnProperty(i)) {
				// Like, "number" or "required" (Could be array of checks)
				validationRule = this.config[i];

				// Did the user pass an array of checks?
				var isArray = (toString.call(validationRule) === '[object Array]');
				if (isArray) {
					// Then filter through array, and check to see if we have a rule for the check.
					var len = validationRule.length;
					checker = [];
					while (len--) {
						// if (!validationRule[len]) continue;
						checker.push(this.validationRules[validationRule[len]]);
					}
				} else {
					// no array. just a single value to validate.

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
					for (var j = 0; j < checker.length; j++) {
						goodToGo = checker[j].validate(data[i]);

						// If not good to go, add the error message to the "errorMessages" array.
						if (!goodToGo) this.errorMessages.push(i + ': ' + checker[j].errorMessage);
					}
				} else {
					goodToGo = checker.validate(data[i]);
					if (!goodToGo) {
						this.errorMessages.push(i + ': ' + checker.errorMessage);
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
		if (!results) {
			throw new Error('populateList requires an argument that specifies the container element for the error list.');
		}
		if (this.hasErrors) {
			var len = Validator.errorMessages.length,
			    li;

			while (len--) {
				li = document.createElement('li');
				li.appendChild(document.createTextNode(Validator.errorMessages[len]));
				results.appendChild(li);
			}
		}
	}

};
