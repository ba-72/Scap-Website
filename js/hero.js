const hero = document.querySelector('.hero');
(function() {
const hero      = document.querySelector('.hero');
const container = document.getElementById('content'); // 主滚动容器
const maxScaleDown = 0.2;  // 最多缩到 80%
const maxRadius    = 30;   // 圆角最大 50x
let ticking = false;

function onScroll() {
    if (!ticking) {
    window.requestAnimationFrame(() => {
        // 用 container.scrollTop 读取 main 的滚动距离
        const scrollY = container.scrollTop;
        const heroHeight = hero.offsetHeight;
        const ratio  = Math.min(scrollY / heroHeight, 1);
        const scale  = 1 - maxScaleDown * ratio;
        const radius = maxRadius * ratio;

        hero.style.transform    = `scale(${scale})`;
        hero.style.borderRadius = `${radius}px`;

        ticking = false;
    });
    ticking = true;
    }
}

// 监听 main 的滚动
container.addEventListener('scroll', onScroll, { passive: true });
})();