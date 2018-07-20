// hander.js
const AWS = require('aws-sdk');
const SES = new AWS.SES();

function sendEmail(formData, callback) {
  // Build the SES parameters
  // Send the email
  const emailParams = {
    Source: 'enquiries@oneafricaproject.org', // SES SENDING EMAIL
    ReplyToAddresses: [formData.reply_to],
    Destination: {
      ToAddresses: ['enquiries@oneafricaproject.org'], // SES RECEIVING EMAIL
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `${formData.message}\n\nName: ${formData.fname}\nLast Name: ${formData.lname}\nEmail: ${formData.reply_to}`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'New message from oneafricaproject.org',
      },
    },
  };

  SES.sendEmail(emailParams, callback);
}

// handler.js

module.exports.staticSiteMailer = (event, context, callback) => {
  const formData = JSON.parse(event.body);

  sendEmail(formData, function(err, data) {
    const response = {
      statusCode: err ? 500 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://oneafricaproject.org/',
      },
      body: JSON.stringify({
        message: err ? err.message : data,
      }),
    };

    callback(null, response);
  });
};

(() => {
  const form = document.querySelector('form');
  const formResponse = document.querySelector('js-form-response');

  form.onsubmit = e => {
    e.preventDefault();

    // Prepare data to send
    const data = {};
    const formElements = Array.from(form);
    formElements.map(input => (data[input.name] = input.value));

    // Log what our lambda function will receive
    console.log(JSON.stringify(data));

    // Construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.open(form.method, form.action, true);
    xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // Send the collected data as JSON
    xhr.send(JSON.stringify(data));

    // Callback function
    xhr.onloadend = response => {
      if (response.target.status === 200) {
        // The form submission was successful
        form.reset();
        formResponse.innerHTML = 'Thanks for the message. We will be in touch shortly.';
      } else {
        // The form submission failed
        formResponse.innerHTML = 'Something went wrong';
        console.error(JSON.parse(response.target.response).message);
      }
    };
  };
})();