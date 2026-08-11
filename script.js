// Login Function
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please enter both email and password.");
        return;
    }

    // Temporary login (will be replaced with IBM App ID)
    localStorage.setItem("userEmail", email);

    alert("Login Successful!");

    window.location.href = "dashboard.html";
}

// Logout Function
function logout() {
    localStorage.removeItem("userEmail");

    alert("Logged Out Successfully!");

    window.location.href = "index.html";
}

// Check Login Status
window.onload = function () {
    const user = localStorage.getItem("userEmail");

    if (window.location.pathname.includes("dashboard.html")) {
        if (!user) {
            alert("Please login first.");
            window.location.href = "login.html";
        } else {
            const userElement = document.getElementById("userEmail");
            if (userElement) {
                userElement.innerText = user;
            }
        }
    }
};