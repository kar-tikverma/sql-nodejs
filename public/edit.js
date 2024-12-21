document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.querySelector("#username");
    const button = document.querySelector("button");
    const emailInput = document.querySelector("#email");
    const existsMessage = document.querySelector("#existsMessage");

    if (duplicateEmail) {
        existsMessage.style.display = "block";
        emailInput.classList.add("error");
    }

    const initialUsername = usernameInput.value;

    let validUsername = true;
    let validEmail = true;

    let debounceTimeout;
    
    usernameInput.addEventListener("input", function () {
        button.disabled = true;
        const currentUsername = this.value.trim();

        clearTimeout(debounceTimeout);

        if (currentUsername === "") {
            validUsername = false;
            document.getElementById("errMessage").style.display = "none";
            usernameInput.classList.remove("error");
            button.disabled = true;
        } else if (currentUsername === initialUsername) {
            validUsername = true;
            document.getElementById("errMessage").style.display = "none";
            usernameInput.classList.remove("error");
            if (validEmail) {
                button.disabled = false;
            }
        } else {
            debounceTimeout = setTimeout(() => {
                fetch(`/check-username?username=${currentUsername}`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.exists) {
                            validUsername = false;
                            document.getElementById("errMessage").style.display = "block";
                            usernameInput.classList.add("error");
                            button.disabled = true;
                        } else {
                            validUsername = true;
                            document.getElementById("errMessage").style.display = "none";
                            usernameInput.classList.remove("error");
                            if (validEmail) {
                                button.disabled = false;
                            }
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking username:", error);
                    });
            }, 1200);
        }
    });


    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    emailInput.addEventListener("input", function () {
        existsMessage.style.display = "none";
        const message = document.querySelector("#invalidMessage");
        message.style.display = "none";
        button.disabled = true;

        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            const currentEmail = this.value.trim();
            if (emailPattern.test(currentEmail)) {
                validEmail = true;
                if (validUsername) {
                    button.disabled = false;
                }
                
                emailInput.classList.remove("error");
            } else {
                validEmail = false;
                message.style.display = "block";
                emailInput.classList.add("error");
            }
        }, 800);
    });
});