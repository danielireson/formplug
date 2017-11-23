# Formplug
A form backend for static sites. Formplug is built using the Serverless Framework and runs on AWS Lambda. It uses API Gateway for routes and SES to send emails.

## Usage
### HTML forms
Set the form action to your Formplug endpoint and responses will be forwarded on to the specified email address. The email address can be plain text as shown below or hidden behind an encrypted hexedecimal string (see next section).
``` html
<form action="https://apigatewayurl.com/to/johndoe@example.com" method="post">
    <input type="text" name="name">
    <input type="text" name="location">
    <input type="hidden" name="_cc" value="johndoe2@example.com;johndoe3@exmaple.com">
    <input type="hidden" name="_redirect" value="http://yoursite.com">
    <input type="text" name="_honeypot" style="display:none">
    <input type="submit" value="send">
</form>
```
* The optional *_honeypot* field is a spam prevention field and should be hidden for regular website users. If *_honeypot* is not empty the request will be ignored. 
* The optional *_cc* field allows you to specify a list of email addresses to receive a carbon copy of the message. Separate multiple email addresses with semicolons.
* The optional *_redirect* field is a redirect success URL. If *_redirect* is missing a generic 'form submission successfully made' message will be shown.

![Submission preview](readme-screenshot.png)

### Encrypt your email address
The email address can be encyrpted so it's not visible in the request or HTML page source. It's encrypted and decrypted using the encryption key in *config.json*. If this key is changed then the email's encrypted string will also change.
``` html
# make a GET request to the encrypt endpoint to get the hex string
https://apigatewayurl.com/encrypt/johndoe@example.com

# to endpoints can now look like the following
https://apigatewayurl.com/to/1974d0cc894607de62f0581ec1334997
```

### AJAX
Append *_format=json* to the query string of the Formplug URL to get responses back in JSON with a CORS allow all origin header. This makes it easy to interact with Formplug using Javascript.
``` html
https://apigatewayurl.com/to/johndoe@example.com?_format=json
```

### Customisable messages
You can optionally add custom messages to *config.json* to override the default user messages for *encrypt* and *receive* http requests.
``` json
{
  "MSG_ENCRYPT_NO_EMAIL": "",
  "MSG_ENCRYPT_BAD_EMAIL": "",
  "MSG_RECEIVE_HONEYPOT": "",
  "MSG_RECEIVE_NO_EMAIL": "",
  "MSG_RECEIVE_BAD_EMAIL": "",
  "MSG_RECEIVE_ERROR": "",
  "MSG_RECEIVE_SUCCESS": ""
}
```

## Setup
### Overview
1. Install Serverless.
2. Create initial config.
3. Get a SES ARN and add to config.
4. Deploy.

### Instructions
1. Follow the instructions on the [Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation) website to install Node.js, Serverless and setup your AWS credentials.
2. Copy *config.sample.json* and save it as *config.json*. *SERVICE_NAME* should be set to match the name of your service in serverless.yml. *ENCRYPTION_KEY* should be set to a random character string, this is used for the optional encrypting/decrypting of the email address in the endpoint URL. *REGION* should be set as either *eu-west-1*, *us-east-1*, or *us-west-2* as these are the only regions where Amazon SES is supported. *STAGE* is the AWS stage to use, this will appear in your API Gateway URL, it's common to use *dev* or *prod*.
``` json
{
  "SERVICE_NAME": "formplug",
  "ENCRYPTION_KEY": "formsaregreat",
  "REGION": "eu-west-1",
  "STAGE": "dev",
  "FROM_ARN": ""
}
```
3. Using the AWS Console an email address needs to be setup to send email from. Head to the SES dashboard and on the left hand side select *Email Addresses* from underneath *Identity Management*. Hit the blue *Verify a New Email Address* button, enter your desired email and click the verification link in your inbox. After verification, the email's *Identity ARN* is visible after clicking on the email on the *Email Addresses* page. Copy this value and paste it to the *FROM_ARN* field in *config.json*. Unfortunately AWS puts new SES accounts under limits which prevents emails being sent to email addresses that haven't been verified. Check out the relevant [AWS SES documentation](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) for more information. The limits can be lifted easily by opening a support ticket as outlined in the docs, but this takes them a few hours to approve.
4. Run *serverless deploy* from the terminal and Formplug should be up and running. You should see your API Gateway endpoint to POST to in the terminal after the Serverless deployment has finished.

