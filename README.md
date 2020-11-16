# Formplug
[![Build Status](https://travis-ci.org/danielireson/formplug-serverless.svg)](https://travis-ci.org/danielireson/formplug-serverless)

Formplug is a form forwarding service for AWS Lambda. Use it to accept form submissions by email without server-side code. It's built using the Serverless Framework and uses Amazon SES to send emails.

## Usage
### Basic
Set the form action to your deployed Formplug endpoint. Email addresses can be passed in plain text (as in the example below) or encrypted as a hexedecimal string (see [encryption](#encryption)).
``` html
<form action="https://apigatewayurl.com" method="post">
    <input type="hidden" name="_to" value="johndoe@example.com">
    <input type="text" name="message">
    <input type="submit" value="send">
</form>
```

Use a `select` if you want to change the recipient based on a user choice without using JavaScript.
``` html
<select name="_to">
  <option value="johndoe@example.com">Recipient option 1</option>
  <option value="janedoe@exmaple.com">Recipient option 2</option>
</select>
```

Separate multiple email addresses by a semicolon.

``` html
<!-- plain text emails -->
<input type="hidden" name="_cc" value="johndoe@example.com;janedoe@exmaple.com">

<!-- encrypted emails -->
<input type="hidden" name="_cc" value="ff19d0abcd474813ad;c031a9b24855090b5e8b">
```

### Special inputs
Name | Description | Multiple emails | Required 
--- | --- | --- | ---
_to | Email address of the primary recipient. | N | Y
_cc | Email addresses to receive a carbon copy. | Y | N
_bcc | Email addresses to receive a blind carbon copy. | Y | N
_replyTo | Email addresses to set as reply to addresses. | Y | N
_honeypot | A spam prevention field that should be hidden for regular website users. The submission will be ignored if the the _honeypot input is present and not empty. | / | N
_recaptcha | User token from Google reCaptcha v3. | / | N
_redirect | A URL to redirect users to after a successful form submission. | / | N

### AJAX
Append `format=json` to the query string to get responses back in JSON with a CORS allow all origin header.
``` html
<form action="https://apigatewayurl.com?format=json" method="post">
    <input type="hidden" name="_to" value="johndoe@example.com">
    <input type="text" name="message">
    <input type="submit" value="send">
</form>
```

### Spam prevention
#### Whitelisting
You can restrict where emails can be sent to by setting `WHITELISTED_RECIPIENTS` in `config.json` to an array of valid recipients. If this is not set then form submissions can be forwarded to any email address.

#### Honeypot
A honeypot field can be used as an easy to setup spam prevention measure. If the `_honeypot` input is not empty on a form submission then the request will be ignored. CSS should be used to hide the input from regular visitors.
``` html
<input type="text" name="_honeypot" value="" style="display:none">
```

#### reCaptcha
Google's [reCaptcha v3](https://developers.google.com/recaptcha/docs/v3) can be integrated for advanced spam prevention. This validates each form submission invisibly based on user interactions with your site. To setup, provide your site secret key in `config.json` as `RECAPTCHA_SECRET_KEY` and send the response token from `execute` as a `_recaptcha` field on each form submission.

```html
<script src="https://www.google.com/recaptcha/api.js?render=RECAPTCHA_SECRET_KEY"></script>
<script>
grecaptcha.ready(function() {
    grecaptcha.execute('RECAPTCHA_SECRET_KEY').then(function(token) {
       // send token as _recaptcha with the rest of the form
       // this can be done by appending a hidden input to the form
       // or sending programatically using the Fetch API or similar
    });
});
</script>
```

### Customisation
Create a HTML template at [src/template/custom.html](src/templates/custom.html) and this will be used instead of [default.html](src/templates/default.html).

![Submission preview](readme-screenshot.png)

## Encryption
Email addresses can be encrypted so that they're not visible in the HTML source. Ensure `ENCRYPTION_KEY` in `config.json` is set to a random value as this is used to determine the encrypted values.

``` bash
> npm run encrypt johndoe@example.com
johndoe@example.com => ff17d6a0cd474813adc031a9b24855090b5e8b
```

``` bash
> npm run decrypt ff17d6a0cd474813adc031a9b24855090b5e8b
ff17d6a0cd474813adc031a9b24855090b5e8b => johndoe@example.com
```

## Setup
### Install Serverless
Follow the [Serverless Framework AWS installation](https://serverless.com/framework/docs/providers/aws/guide/installation).

### Setup SES identity
Amazon SES can only send emails from addresses that you have verified ownership of. Verification can be done using the [AWS Management Console](https://aws.amazon.com) by visiting the SES Dashboard and heading to Identity Management. AWS also puts new SES accounts under limits which prevent emails from being sent to email addresses that haven't been verified. Check out the relevant [AWS SES documentation](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) for more information. The limits can be lifted by opening a support ticket.

### Install dependencies
Run `npm install` to get the NPM dependencies.

### Add config
Create a copy of `config.sample.json` as `config.json` and edit as appropriate.

Name | Description | Required
--- | --- | ---
SERVICE_NAME | The private name for the service. | Y
ENCRYPTION_KEY | A random string used for encryption. | Y
REGION | The AWS region to deploy to (this should be either *eu-west-1*, *us-east-1*, or *us-west-2* as these are the only SES supported regions). | Y
STAGE | The AWS stage to deploy to (it's common to use *dev* or *prod*). | Y
SENDER_ARN | The [ARN](http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) of the sender email address. | Y
MSG_RECEIVE_SUCCESS | This is returned to the user on a successful form submission if a redirect URL isn't provided. | N
MSG_SUBJECT | The subject line to use in emails. | N
WHITELISTED_RECIPIENTS | Only allow emails to be sent to specific addresses. | N
RECAPTCHA_SECRET_KEY | Site secret key for [reCaptcha v3](https://developers.google.com/recaptcha/docs/v3). | N

### Deploy
Run `serverless deploy` to deploy to AWS.
