# Formplug
A form backend for static sites. Formplug is built using the Serverless Framework and runs on AWS Lambda. It uses API Gateway for routes, DynamoDB as a queue and SES to send emails. It has been heavily inspired by [Formspree](https://formspree.io/).

## Usage
### HTML forms
Set the form action to your Formplug endpoint and responses will be forwarded on to the specified email address. The email address can be plain text as shown below or hidden behind an encrypted hexedecimal string (see next section).
``` html
<form action="https://apigatewayurl.com/to/johndoe@example.com" method="post">
    <input type="text" name="name">
    <input type="text" name="location">
    <input type="hidden" name="_redirect" value="http://yoursite.com">
    <input type="text" name="_honeypot" style="display:none">
    <input type="submit" value="send">
</form>
```
Fields *_honeypot* and *_redirect* are optional. 
* The *_honeypot* field is a spam prevention field and should be hidden for regular website users. If *_honeypot* is not empty the request will be ignored. 
* If provided, users will be redirected to the *_redirect* URL after form submission. If *_redirect* is missing a generic 'form submission successfully made' message will be shown.

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
Append *_format=json* to the query string of the Formplug URL to get responses back in JSON. This makes it easy to interact with Formplug using Javscript.
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
1. Setup Serverless.
2. Edit config settings and make initial deployment.
4. Get DynamoDB queue ARN and add to config.
5. Setup SES ARN and add to config.
6. Redeploy with updated config.

### Instructions
1. Follow the instructions on the [Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation) website to install Node.js, Serverless and setup your AWS credentials.
2. Copy *config.sample.json* and save it as *config.json*. *ENCRYPTION_KEY* should be set to a random character string, this is used for encrypting/decrypting data stored in the DynamoDB queue. *REGION* should be set as either *eu-west-1*, *us-east-1*, or *us-west-2* as these are the only regions where Amazon SES is supported. *STAGE* is the AWS stage to use, this will appear in your API Gateway URL, it's common to use *dev* or *prod*. *TABLE_NAME* is the DynamoDB table name to be created and used as the queue. Your config file should look similar to the following with *STREAM* and *FROM_ARN* empty. Run *serverless deploy* from the terminal to make the inital deployment.
``` json
{
  "ENCRYPTION_KEY": "formsaregreat",
  "REGION": "eu-west-1",
  "STAGE": "dev",
  "TABLE_NAME": "formplug-queue",
  "STREAM_ARN": "",
  "FROM_ARN": ""
}
```
4. You need to now get the *STREAM_ARN* from AWS. Log into your [AWS Console](https://aws.amazon.com) and head to the DynamoDB dashboard. Click on the name of the table that was just created and on the right hand side a panel should slide in that shows the *Latest stream ARN*. You should copy this ARN and paste it as the value of *STREAM_ARN* in *config.json*.
5. You need to now setup an email address that can be used to send email from, this is also done on the AWS Console. Head to the SES dashboard and on the left hand side select *Email Addresses* from underneath *Identity Management*. Hit the blue *Verify a New Email Address* button, enter your desired email and click the verification link in your inbox. After verification, the email's *Identity ARN* is visible after clicking on the email on the *Email Addresses* page. Copy this value and paste it to the *FROM_ARN* field in *config.json*. Unfortunately AWS puts new SES accounts under limits which prevents emails being sent to email addresses that haven't been verified. Check out the relevant [AWS SES documentation](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) for more information. The limits can be lifted easily by opening a support ticket as outlined in the docs, but this takes them a few hours to approve.
6. Run *serverless deploy* from the terminal again to upload the updated config file. Formplug should now be up and running. You should see your API Gateway endpoint to POST to in the terminal after the Serverless deployment has finished.

