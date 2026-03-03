function switchTab(tab) {
    // Hide all forms
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => form.classList.remove('active'));

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));

    // Show selected form
    document.getElementById(tab).classList.add('active');

    // Add active class to the clicked tab
    if (tab === 'signin') {
        tabs[0].classList.add('active');
    } else if (tab === 'signup') {
        tabs[1].classList.add('active');
    }
}

// Handle form submissions
document.getElementById("signup").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    if(password !== confirm) {
        alert("Passwords do not match, re-enter the passwords!");
        // empty the password fields
        document.getElementById('signup-password').value = '';
        document.getElementById('signup-confirm').value = '';
        // focus on the password fields
        document.getElementById('signup-password').focus();
        document.getElementById('signup-confirm').focus();
        return; 
    } else {
        // Sending data to backend
        try {
            const response = await fetch('/users/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, email, password})
            });
            const data = await response.json();
            if(!response.ok) {
                alert(data.message || "Something went wrong!");
            }else {
                document.getElementById("signup").reset();
                alert("User registered successfully!");
                switchTab('signin');
            }

        } catch(error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    }
});

document.getElementById("signin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;
    // Sending data to backend
    try {
        const response = await fetch('/users/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password})
        })
        const data  = await response.json();
        if(!response.ok) {
            if(data.message === "User not found, please sign up first") {
                alert(data.message);
                switchTab('signup');
                return;
            } else {
                alert(data.message || "Something went wrong!");
                return;
            }
        } else {
            const toast = document.getElementById("toast");
            toast.classList.add("show");
            localStorage.setItem("data", JSON.stringify(data));
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    } catch(error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
});
