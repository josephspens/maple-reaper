var express = require('express'),
	port = process.env.PORT || 5000,
	app = express();

app.configure(function () {
	app.use(express.logger());
});

app.get('/mail', function (req, res){
	//if (req.ip === '127.0.0.1' || req.ip === '10.92.242.199' || req.get('Referer') === 'http://josephspens.github.io/') {
		mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_KEY);
		mandrill_client.messages.send({
			"message": {
			    "html": '<b>' + req.query.message + '</b>',
			    "text": req.query.message,
			    "subject": req.query.subject,
			    "from_email": req.query.email,
			    "from_name": req.query.name,
			    "to": [{
		            "email": "jpspens@gmail.com",
		            "name": "Joseph Spens"
		        }],
			    "headers": {
			        "Reply-To": req.query.name + ' <' + req.query.email + '>'
			    }
			},
			"async": false,
			"ip_pool": "Main Pool",
			"send_at": "example send_at"
		}, function (result) {
		    console.log(result);
		    /*[{
	            "email": "recipient.email@example.com",
	            "status": "sent",
	            "reject_reason": "hard-bounce",
	            "_id": "abc123abc123abc123abc123abc123"
	        }]*/
		}, function (e) {
		    // Mandrill returns the error as an object with name and message keys
		    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
		});
	/*} else {
		res.send('Sorry, I don\'t talk to strangers. ' + req.ip);
	}*/
});

app.get('/recaptcha', function (req, res){
	//if (req.ip === '127.0.0.1' || req.ip === '10.92.242.199' || req.get('Referer') === 'http://josephspens.github.io/') {
		var Recaptcha = require('recaptcha').Recaptcha;

		var recaptcha = new Recaptcha(
			process.env.RECAPTCHA_PUBLIC_KEY,
			process.env.RECAPTCHA_PRIVATE_KEY,
			{
		        remoteip:  req.ip,
		        challenge: req.query.recaptchaChallengeField,
		        response:  req.query.recaptchaResponseField
		    }
		);

		recaptcha.verify(function (success, error_code) {
			res.type('application/json');
	        res.jsonp({
	        	isCorrect: success,
	        	error: error_code
	        });
	    });
	/*} else {
		res.send('Sorry, I don\'t talk to strangers. ' + req.ip);
	}*/
});

app.listen(port, function () {
	console.log("Listening on " + port);
});