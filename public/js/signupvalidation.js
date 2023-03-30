$(document).ready(function() {
    $('#myForm').validate({
      rules: {
        username: {
          required: true,
          minlength: 3,
          maxlength: 15
        },
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 8,
          maxlength: 20
        },
        phone: {
          required: true,
          minlength: 10,
          maxlength: 12,
          digits: true
        }
      },
      messages: {
        username: {
          required: "Please enter your username",
          minlength: "Username must be at least 3 characters long",
          maxlength: "Username must be no more than 15 characters long"
        },
        email: {
          required: "Please enter your email address",
          email: "Please enter a valid email address"
        },
        password: {
          required: "Please enter a password",
          minlength: "Password must be at least 8 characters long",
          maxlength: "Password must be no more than 20 characters long"
        },
        phone: {
          required: "Please enter your phone number",
          minlength: "Phone number must be at least 10 digits long",
          maxlength: "Phone number must be no more than 12 digits long",
          digits: "Please enter only digits"
        }
      }
    });
  });
  