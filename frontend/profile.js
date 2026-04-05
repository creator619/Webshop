const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const res = await fetch(BASE_URL + "/profile", {
    headers: {
        "Authorization": "Bearer " + token
    }
});


await fetch(BASE_URL + "/profile", {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
        phone,
        zip,
        city,
        address
    })
});


if (user.role === "admin") {
   //document.getElementById("admin-link").style.display = "block";
}

async function saveProfile() {
    const data = {
        userId: 1, // később JWT-ből
        phone: document.getElementById("user-phone").value,
        zip: document.getElementById("user-zip").value,
        city: document.getElementById("user-city").value,
        address: document.getElementById("user-address").value
    };

    const res = await fetch("http://192.168.0.164:3000/profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
        alert("Mentve!");
    }
}
