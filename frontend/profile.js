const user = JSON.parse(localStorage.getItem("user"));

console.log(user.role === "admin");

if (user.role === "admin") {
   //document.getElementById("admin-link").style.display = "block";
}
