//nav.js
// Global variables
const overlay = document.getElementById('overlay');
const content = document.getElementById('content');
const mobileToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navItem = document.querySelector('nav ul li');
const width = window.innerWidth;  
console.log(`当前窗口宽度：${width}px`); 
let ticking = false;

// Desktop Submenu Hover
navItem.addEventListener('mouseenter', () => {
    overlay.classList.add('active');
    content.classList.add('blur');
});
navItem.addEventListener('mouseleave', () => {
    overlay.classList.remove('active');
    content.classList.remove('blur');
});

// Mobile Menu Toggle
mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    if (mobileMenu.classList.contains('active')) {
    overlay.classList.add('active');
    content.classList.add('blur');
    } else {
    overlay.classList.remove('active');
    content.classList.remove('blur');
    }
});
// Toggle Mobile Submenu
function toggleMobileSubmenu(event, id) {
    event.preventDefault();
    const submenu = document.getElementById(id);
    submenu.classList.toggle('active');
}

document.documentElement.style.setProperty('--window-width', `${window.innerWidth}px`);