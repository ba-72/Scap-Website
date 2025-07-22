document.addEventListener('DOMContentLoaded', () => {
  fetch('header.html')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load header');
      return res.text();
    })
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      placeholder.innerHTML = html;  // 使用innerHTML插入，避免替换整个div导致布局问题

      // 加载完成后绑定事件（避免null错误）
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      const settingsButton = document.getElementById('settingsButton');  // 如果有settingsButton，替换为实际ID
      if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
          // 您的移动菜单切换逻辑，例如显示/隐藏mobile-menu
          document.getElementById('mobile-menu').classList.toggle('active');
          document.getElementById('overlay').classList.toggle('active');
        });
      }
      if (settingsButton) {
        settingsButton.addEventListener('click', () => {
          // 您的设置按钮逻辑
        });
      }

      // 可选：触发重绘，避免Safari布局延迟
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    })
    .catch(err => {
      console.error('加载 header 失败：', err);
      // 可选：在页面显示错误
      document.getElementById('pdf-error').textContent = 'Header加载失败';
    });
});