
// 获取按钮和特色部分元素
const toggle = document.getElementById('toggle');
const featured = document.getElementById('featured');

// 添加点击事件监听器
toggle.addEventListener('click', () => {
    // 切换 'grid' 类名以改变布局
    featured.classList.toggle('grid');
    // 根据当前是否为网格视图更新按钮文本
    toggle.textContent = featured.classList.contains('grid') ? 'List View' : 'Grid View';
});