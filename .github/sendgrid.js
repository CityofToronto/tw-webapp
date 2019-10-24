#! /usr/bin/env node

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: 'jun.ma@toronto.ca',
    from: 'amber.brasher@toronto.ca',
    subject: 'hi pls build',
    text: 'yes build pls',
    html: '<p>i need a build pls</p>'
};

sgMail
    .send(msg)
    .then(() => console.log('Mail sent successfully'))
    .catch(error => console.error(error.toString()));
