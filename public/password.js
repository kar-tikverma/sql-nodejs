const password = document.querySelector("#password");
const checkbox = document.querySelector("#checkbox");
const button = document.querySelector("button");
const passMessage = document.querySelector("#passMessage");

button.disabled = true;

if (incorrectPass) {
    passMessage.style.display = "block";
    password.classList.add("error");
}

password.addEventListener("input", function () {
    if (this.value === "") {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
});

checkbox.addEventListener("change", function () {
    if (this.checked) {
        password.type = "text";
    } else {
        password.type = "password";
    }
});