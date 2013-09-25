var express = require('express'),
	port = process.env.PORT || 5000,
	app = express();

app.configure(function () {
	app.use(express.logger());
	app.use(express.bodyParser());
});

app.get('/mail', function (req, res){
	if (req.connection.remoteAddress === '127.0.0.1') {
		var nodemailer = require('nodemailer');

		// create reusable transport method (opens pool of SMTP connections)
		var smtpTransport = nodemailer.createTransport('SMTP',{
		    service: 'Gmail',
		    auth: {
		        user: process.env.GMAIL_USER,
		        pass: process.env.GMAIL_PASS
		    }
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'Contact Form <jpspens@gmail.com>', // sender address
		    to: 'Joseph Spens <jpspens@gmail.com>', // list of receivers
		    replyTo: req.query.name + ' <' + req.query.email + '>',
		    subject: req.query.subject, // Subject line
		    text: req.query.message, // plaintext body
		    html: '<b>' + req.query.message + '</b>' // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function (error, response){
		    if (error) {
		        console.log(error);
		        res.json({
		        	success: false,
		        	error: error
		        });
		    } else {
		        console.log('Message sent: ' + response.message);
		        res.json({
		        	success: true
		        });
		    }

		    smtpTransport.close(); // shut down the connection pool, no more messages
		});
	} else {
		res.send('Sorry, I don\'t talk to strangers.');
	}
});

app.get('/recaptcha', function (req, res){
	if (req.connection.remoteAddress === '127.0.0.1') {
		var Recaptcha = require('recaptcha').Recaptcha;

		var recaptcha = new Recaptcha(
			process.env.RECAPTCHA_PUBLIC_KEY,
			process.env.RECAPTCHA_PRIVATE_KEY,
			{
		        remoteip:  req.connection.remoteAddress,
		        challenge: req.body.recaptchaChallengeField,
		        response:  req.body.recaptchaResponseField
		    }
		);

		recaptcha.verify(function (success, error_code) {
	        res.json({ isCorrect: success });
	    });
	} else {
		res.send('Sorry, I don\'t talk to strangers.');
	}
});

app.listen(port, function () {
	console.log("Listening on " + port);
});