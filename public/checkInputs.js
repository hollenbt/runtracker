var submitBtn = document.querySelector('#submitBtn');
submitBtn.addEventListener('click', function(event) {
    var form = submitBtn.parentElement;
    var username = document.querySelector('input[name="username"]').value;
    var password = document.querySelector('input[name="password"]').value; 
    if (password == "" || username == "")
        alert("Username and password cannot be blank");
    else form.submit();
});