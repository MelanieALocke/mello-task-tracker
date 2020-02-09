const $setLogin = $('#login');
const $setSignUp = $('#signup');
const $submitButton = $('#submit');
const $emailInput = $('#email');
const $passwordInput = $('#password');
const $message = $('#message');

let authSetting = 'login';

sendUserToBoards();

// If user exists redirect to boards
function sendUserToBoards() {
  if(localStorage.getItem('user')) {
    location.replace('/boards');
  }
}

// Create toggle between login and signup
function setAuth(setting) {
  authSetting = setting;
  
  if(authSetting === 'login') {
    $setLogin.addClass('active');
    $setSignUp.removeClass('active');
    $submitButton.text('Log In');
  } else {
    $setSignUp.addClass('active');
    $setLogin.removeClass('active');
    $submitButton.text('Sign Up');
  }
}

function handleFormSubmission() {
  // prevent HTTP post request
  event.preventDefault();

  let email = $emailInput.val().trim();
  let password = $passwordInput.val().trim();

  if (!email || !password) {
    displayMessage('Email and password fields cannot be blank.', 'danger');
    return;
  }

  $emailInput.val('');
  $passwordInput.val('');

  authenticateUser(email, password);
}

function displayMessage(message, type) {
  $message.text(message).attr('class', type);
}

function handleSignupResponse(status) {
  if (status === 'success') {
    displayMessage('Success! You may now sign in.', 'success');
    setAuth('login');
  } else {
    displayMessage('Something went wrong. A user with this account may already exist.', 'danger');
  }
}

function handleLoginResponse(data, status, jqXHR) {
  if (status === 'success') {
    // Get JSON web token from server
    let jwt = jqXHR.getResponseHeader('authorization');
    let user = JSON.stringify(data);

    // Store token for authorization across app
    localStorage.setItem('authorization', jwt);
    localStorage.setItem('user', user);

    // Redirect to Boards page
    sendUserToBoards();
  } else {
    displayMessage('Invalid email or password.', 'danger');
  }
}

function authenticateUser(email, password) {
  // Create ajax call to create || authorize user
  $.ajax({
    url: '/' + authSetting,
    data: {
      user: {
        email,
        password
      }
    },
    method: 'POST'
  }).then(function(data, status, jqXHR) {
    if (authSetting === 'signup') {
      handleSignupResponse(status);
    } else {
      handleLoginResponse(data, status, jqXHR);
    }
  })
  .catch(function(err) {
    if (authSetting === 'signup') {
      handleSignupResponse(err.statusText);
    } else {
      handleLoginResponse(err.statusText);
    }
  });
}

$setLogin.on('click', setAuth.bind(null, 'login'));
$setSignUp.on('click', setAuth.bind(null, 'signup'));
$submitButton.on('click', handleFormSubmission);