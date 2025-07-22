//scriptblock1.js
// Carousel Navigation
const carouselContainer = document.querySelector('.carousel-container');
const btnLeft = document.querySelector('.carousel-arrow.left');
const btnRight = document.querySelector('.carousel-arrow.right');
btnLeft.addEventListener('click', () => {
    carouselContainer.scrollBy({
    left: -carouselContainer.clientWidth,
    behavior: 'smooth'
    });
});
btnRight.addEventListener('click', () => {
    carouselContainer.scrollBy({
    left: carouselContainer.clientWidth,
    behavior: 'smooth'
    });
});

// Marquee Effect for Descriptions
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.description').forEach(desc => {
    const text = desc.textContent.trim();
    const meas = document.createElement('span');
    meas.style.position = 'absolute';
    meas.style.whiteSpace = 'nowrap';
    meas.style.visibility = 'hidden';
    meas.textContent = text;
    document.body.appendChild(meas);
    const textWidth = meas.scrollWidth;
    document.body.removeChild(meas);
    const containerWidth = desc.clientWidth;

    if (textWidth > containerWidth) {
        const wrapper = document.createElement('span');
        wrapper.className = 'marquee-content';
        wrapper.innerHTML = `<span>${text}</span><span>${text}</span>`;
        desc.textContent = '';
        desc.appendChild(wrapper);

        desc.style.setProperty('--marquee-dist', `${textWidth}px`);
        const timeSec = (textWidth / 25).toFixed(2) + 's';
        desc.style.setProperty('--marquee-time', timeSec);
    }
    });
});