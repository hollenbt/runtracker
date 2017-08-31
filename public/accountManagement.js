var currentP = document.querySelector('#current');
var newP = document.querySelector('#new');
var submitBtn = document.querySelector('#submitBtn');
var deleteBtn = document.querySelector('#deleteBtn');

submitBtn.addEventListener('click', function() {
    if (currentP.value && newP.value) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/changepassword", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        var queryText = "current=" + currentP.value + "&new=" + newP.value;
        xhr.send(queryText);

        xhr.addEventListener('load', function() {
            alert(xhr.response);
            if (xhr.response == "Password successfully changed.")
                currentP.parentElement.reset();
            else currentP.focus();
        }, { once: true });
    }
    else alert("You must provide the current password and a new password.");
});

deleteBtn.addEventListener('click', function() {
    var confirm = prompt("Please type \"delete\" to delete your account:");
    if (confirm == "delete")
        deleteBtn.parentElement.submit();
});