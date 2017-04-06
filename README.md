# Formplug
A form backend for static sites. Formplug is built using the Serverless Framework and runs on AWS Lambda. It uses API Gateway for routes, DynamoDB as a queue and SES to send emails. It has been heavily inspired by [Formspree](https://formspree.io/).

## Usage
### HTML forms
Set a HTML form action to your Formplug endpoint and POST data will be forwarded on to the specified email address.
``` html
<form action="https://apigatewayurl.com/to/johndoe@example.com">
    <input type="text" name="name">
    <input type="text" name="location">
    <input type="text" name="_redirect-to" value="http://yoursite.com">
    <input type="text" name="_honeypot" style="display:none">
    <input type="submit" value="send">
</form>
```
Fields *_honeypot* and *_redirect-to* are optional. The *_honeypot* field is a spam prevention field and should be hidden for regular website users. If *_honeypot* is not empty the request will be ignored. If provided, users will be redirected to the *_redirect-to* URL after form submission. If this field is missing a generic 'form submission successfully made' message will be shown.

### AJAX
Append *_format=json* to the query string of the Formplug URL to get responses back in JSON. This makes it easy to interact with Formplug using Javscript.
``` html
https://apigatewayurl.com/to/johndoe@example.com?_format=json
```

## Setup
1. Follow the instructions on the [Serverless](https://serverless.com/framework/docs/providers/aws/guide/installation) website to install Node.js, Serverless and setup your AWS credentials.
2. Copy *config.sample.json* and save it as *config.json*. *ENCRYPTION_KEY* should be set to a random character string, this is used for encrypting/decrypting data stored in the DynamoDB queue. *REGION* should be set as either *eu-west-1*, *us-east-1*, or *us-west-2* as these are the only regions where Amazon SES is supported. *STAGE* is the AWS stage to use, this will appear in your API Gateway URL, it's common to use *dev* or *prod*. *TABLE_NAME* is the DynamoDB table name to be created and used as the queue. Your config file should look similar to the following with *STREAM* and *FROM_ARN* empty.
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
3. Run *serverless deploy* from the terminal to make the inital deployment.
4. You need to now get the *STREAM_ARN* from AWS. Log into your [AWS Console](https://aws.amazon.com) and head to the DynamoDB dashboard. Click on the name of the table that was just created and on the right hand side a panel should slide in that shows the *Latest stream ARN*. You should copy this ARN and paste it as the value of *STREAM_ARN* in *config.json*.
5. You need to now setup an email address that can be used to send email from, this is also done on the AWS Console. Head to the SES dashboard and on the left hand side select *Email Addresses* from underneath *Identity Management*. Hit the blue *Verify a New Email Address* button, enter your desired email and click the verification link in your inbox. After verification, the email's *Identity ARN* is visible after clicking on the email on the *Email Addresses* page. Copy this value and paste it to the *FROM_ARN* field in *config.json*. Unfortunately AWS puts new SES accounts under limits which prevents emails being sent to email addresses that haven't been verified. Check out the relevant [AWS SES documentation](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) for more information. The limits can be lifted easily by opening a support ticket as outlined in the docs, but this takes them a few hours to approve.
6. Run *serverless deploy* from the terminal again to upload the updated config file. Formplug should now be up and running. You should see your API Gateway endpoint to POST to in the terminal after the Serverless deployment has finished.
