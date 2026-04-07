const modal = document.getElementById("emailModal");
const btn = document.getElementById("emailBtn");
const closeBtn = document.querySelector(".close-btn");

btn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};