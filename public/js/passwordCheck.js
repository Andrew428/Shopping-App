const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');

function confrimPassword() {
  var p = document.getElementById("password").value;
  var cp = document.getElementById("confirmPassword").value;
  if(p !== cp){
    document.getElementById("confirmPassword").style.borderColor = 'red';
  }else {
    document.getElementById("confirmPassword").style.borderColor = '';
  }
}

confirmPassword.addEventListener('change', confrimPassword);