<p>This is a nifty little JavaScript validator object, inspired by "JS Patterns." It offers a convenient method to extend the validation options as well. </p>

<h3> Step 1 </h3>
<p>For a crash-course, first, reference the <code>Validator.js</code> file in your project. At the bottom is fine. </p>

<h3>Step 2</h3>
<p>Next, you certainly need some data to work with -- probably coming from a form. Something like this... <D-d></p>

<pre><code>
var formData = {
	firstName : 'Jeffrey',
	lastName : '',
	occupation : 'web developer',
	age : '',
	emailAddress : 'jeff_way@yahoodotcom'
}
<code></pre>

<p>Once you have the necessary data in object-form, you can apply the configuration settings. </p>

<pre><code>
 // Here, we set up our rules for each field.
// If a field doesn't require validation,
// just leave it out (like occupation).
Validator.config = {
	firstName : 'required',
	lastName : 'required', // only for example
	age : ['required', 'number'],
	emailAddress : 'email'
};
</code></pre>

<p>You can apply configuration settings by referencing <code>Validator.config</code>. Notice how the config properties refer to the form data names. <em>Note that you can either add a single validation rule, or multiple ones, by wrapping them in array (see age property above). </em></p>

<h3> Step 3 </h3>
<p>Finally, you call the validate method. </p>

<pre><code>
 Validator.validate(formData);

if ( Validator.hasErrors() ) {
	Validator.populateList(document.getElementById('results'));
} else {
	alert('No errors. Now update a database or something.');
}
</code></pre>

<p>Above, we call the "validate" method, and pass in the object that we wish to validate against (formData). Once this method runs, if there are errors, they will applied to Validate.messages. However, a convenience method is provided, <code>Validator.hasErrors()</code> that will perform the obvious for you. If there aren't errors, you can proceed, and rest assured that the submission passes validation. (Don't forget a server-side fallback, though!)

<h3> Adding Custom Rules </h3>
<p>
This script only provides a few rules for convenience: "required," "number," and "email." You'll certainly (myself included) want to extend this for your needs. You can either update the <code>ValidationRules</code> object, from <code>Validator.js</code>, or you can alternatively add additional rules by adding a new object to <code>Validator.validationRules</code>. </p>

<pre><code>
Validator.validationRules.greaterThanFiveChars = {
	validate : function(value) {
		return value.length > 5;
	},
	errorMessage : 'Input must be at least six characters'
}
</code></pre>
</p>
Note that you must apply: </p>

<ul>
<li><strong>validate: </strong> A method that performs your desired "check."</li>
<li><strong>errorMessage: </strong>Your desired error message, if the test fails. </li>
</ul>

<p><strong>This script was a quickie; so please let me know if you notice any issues/improvements. :) </strong></p>

