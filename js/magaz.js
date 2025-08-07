  // PDF path
  const scriptElement = [...document.getElementsByTagName('script')].find(s => s.src.includes('magaz.js'));
  const pdfPath = scriptElement ? (scriptElement.dataset.headerPath || '../magazine/RE3.pdf') : '../magazine/RE3.pdf'; 
  let currentScale = 1;
  const crossPages = [];

  const errorDiv = document.getElementById('pdf-error');
  const loadingIndicator = document.getElementById('loading-indicator');
  const modeSwitch = document.getElementById('mode-switch');
  const spreadSwitch = document.getElementById('spread-switch');
  const flipContainer = document.getElementById('flipbook-container');
  const traditionalContainer = document.getElementById('traditional-container');
  const mainContent = document.querySelector('main');
  const settingsButton = document.querySelector('.settings-button');
  const settingsMenu = document.getElementById('settings-menu');
  const spreadToggleItem = document.getElementById('spread-toggle-item');
  const pageIndicator = document.getElementById('page-number-indicator');
  const pageJumpModal = document.getElementById('page-jump-modal');
  const jumpPageInput = document.getElementById('jump-page-input');
  const jumpConfirm = document.getElementById('jump-confirm');
  const closeModal = document.querySelector('.close-modal');
  const totalPagesDisplay = document.getElementById('total-pages-display');
  let currentPage = 1;
  let totalPages = 0;


  function updatePageIndicator() {
    if (totalPages > 0) {
      pageIndicator.textContent = `${currentPage} / ${totalPages}`;
      totalPagesDisplay.textContent = totalPages;
      pageIndicator.style.display = 'block';
    }
  }

  function debounce(func, delay) {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(func, delay);
    };
  }

  function getVisiblePageInTraditional() {
    const canvases = traditionalContainer.querySelectorAll('canvas');
    const containerRect = traditionalContainer.getBoundingClientRect();
    for (let i = 0; i < canvases.length; i++) {
      const canvasRect = canvases[i].getBoundingClientRect();
      if (canvasRect.top >= containerRect.top && canvasRect.top < containerRect.top + containerRect.height) {
        return i + 1;
      }
    }
    return 1;
  }

  // Function to toggle blur on main content
  function toggleBlur(isBlurred) {
    mainContent.classList.toggle('blur', isBlurred);
  }
  function jumpToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) {
      alert('无效页码！');
      return;
    }
    currentPage = pageNum;
    const mode = modeSwitch.checked ? 'traditional' : 'flip';
    if (mode === 'flip') {
      const flipbook = $('#flipbook');
      flipbook.turn('page', pageNum); // Turn.js 跳转
    } else {
      const canvases = traditionalContainer.querySelectorAll('canvas');
      if (canvases[pageNum - 1]) {
        const targetCanvas = canvases[pageNum - 1];
        const offset = targetCanvas.offsetTop; // 计算顶部偏移
        traditionalContainer.scrollTop = offset; // 滚动到指定页面
      }
    }
    updatePageIndicator();
    totalPagesDisplay.textContent = totalPages;
  }

  // Function to load PDF with scale
  async function loadPDF(mode) {
      errorDiv.textContent = '';
      pageIndicator.style.display = 'none';
      loadingIndicator.style.display = 'block';
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdfjs/pdf.worker.min.js';
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        totalPages = pdf.numPages;
        console.log('PDF has', pdf.numPages, 'pages');

        if (mode === 'flip') {
          const flipbook = $('#flipbook');
          if (!$.fn.turn) {
            throw new Error('Turn.js is not loaded');
          }
          if (flipbook.length === 0) {
            throw new Error('Flipbook element not found');
          }
          if (flipbook.data('turn')) {
            flipbook.turn('destroy');
          }
          flipbook.empty();
          flipbook.css({ transform: 'scale(1)' }); // 重置缩放

          let pageW, pageH;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: currentScale * 2});

            if (i === 1) {
              pageW = viewport.width/2;
              pageH = viewport.height/2;
              // 动态绑定高度到 viewport.height（单页高度）
              flipContainer.style.height = `${pageH}px`; // 设置 #flipbook-container 高度
            }

            const pageDiv = $('<div class="page"></div>');
            pageDiv.css({ width: viewport.width / 2, height: viewport.height / 2 });

            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.width = `${viewport.width / 2}px`;  // 添加 CSS 宽度
            canvas.style.height = `${viewport.height / 2}px`;  // 添加 CSS 高度
            const context = canvas.getContext('2d', { willReadFrequently: true });
            await page.render({ canvasContext: context, viewport });
            pageDiv.append(canvas);
            flipbook.append(pageDiv);
          }

          // 计算书本尺寸（双页宽度，单页高度）
          const bookW = 2 * pageW;
          const bookH = pageH;

          // 获取容器宽度（用于缩放计算）
          const containerW = viewerContainer.clientWidth;
          const containerH = viewerContainer.clientHeight; // 但现在高度由 JS 设置为 pageH

          // 计算缩放因子：仅缩小以适应（不超过1），保持比例
          const scaleFactor = Math.min(1, containerW / bookW, containerH / bookH);

          // 应用缩放
          flipbook.css({ transform: `scale(${scaleFactor})` });

          flipbook.turn({
            width: bookW,  
            height: bookH, 
            autoCenter: true,
            display: 'double',
            duration: 600,
            acceleration: true,
            gradients: true
          });
          flipbook.bind('turned', function(event, page) {
            currentPage = page;
            updatePageIndicator();
          });
          currentPage = 1;
          updatePageIndicator();
        } else {
          traditionalContainer.innerHTML = '';
          traditionalContainer.classList.toggle('single-page', !spreadSwitch.checked);
          const columns = spreadSwitch.checked ? 2 : 1;
          traditionalContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: currentScale * 2 });

            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.width = `${viewport.width / 2}px`; // 逻辑像素宽度
            canvas.style.height = `${viewport.height / 2}px`; // 逻辑像素高度
            const context = canvas.getContext('2d', { willReadFrequently: true });
            await page.render({ canvasContext: context, viewport });
            traditionalContainer.appendChild(canvas);
          }
          // ... (页面渲染 for 循环结束后)
          traditionalContainer.removeEventListener('scroll', debouncedScrollHandler); // 已存在
          traditionalContainer.addEventListener('scroll', debouncedScrollHandler); // 已存在

          // 新增：强制滚动到顶部并初始更新（修复单页模式不显示）
          traditionalContainer.scrollTop = 0;
          currentPage = 1;
          updatePageIndicator();
                    
        }
      } catch (err) {
        console.error('PDF loading failed:', err.name, err.message, err.stack);
        errorDiv.textContent = `Failed to load PDF: ${err.message || 'Unknown error'}. Ensure Turn.js is loaded and check path '${pdfPath}'.`;
      } finally {
        loadingIndicator.style.display = 'none';
      }
    }
  const debouncedScrollHandler = debounce(() => {
    currentPage = getVisiblePageInTraditional();
    updatePageIndicator();
  }, 100);
  // Mode switching
  function switchMode() {
    const mode = modeSwitch.checked ? 'traditional' : 'flip';
    flipContainer.style.display = mode === 'flip' ? 'block' : 'none';
    traditionalContainer.style.display = mode === 'traditional' ? 'grid' : 'none';
    spreadToggleItem.style.display = mode === 'flip' ? 'none' : 'flex';
    loadPDF(mode);
  }

  function switchSpread() {
    if (!modeSwitch.checked) { // Only in Novel mode
      const isSpread = spreadSwitch.checked;
      traditionalContainer.classList.toggle('single-page', !isSpread);
      traditionalContainer.style.gridTemplateColumns = isSpread ? 'repeat(2, 1fr)' : '1fr'; // 动态设置列
      traditionalContainer.innerHTML = ''; // 清空旧内容，避免残留
      loadPDF('traditional'); // Re-render
    }
  }

// 事件绑定部分：包裹在 DOMContentLoaded 中
document.addEventListener('DOMContentLoaded', () => {
  const modalContent = document.querySelector('.modal-content'); // 确保声明

  // 点击页码指示器显示模态框
  pageIndicator.addEventListener('click', () => {
    console.log('Page indicator clicked! totalPages:', totalPages); // 调试
    if (totalPages > 0) {
      // 动态设置位置：模态内容相对于页码
      const indicatorRect = pageIndicator.getBoundingClientRect();
      modalContent.style.top = `${indicatorRect.bottom + window.scrollY}px`; // 下方
      modalContent.style.left = `${indicatorRect.left + window.scrollX}px`; // 左对齐

      pageJumpModal.classList.add('active'); // 激活遮罩
      pageJumpModal.style.display = 'block';
      modalContent.classList.remove('slide-out'); // 移除收回状态
      modalContent.classList.add('slide-in'); // 触发滑出动画
      jumpPageInput.value = currentPage;
      jumpPageInput.focus();
    }
  });

  // 关闭模态框
  closeModal.addEventListener('click', closeModalWithAnimation);

  // 点击外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === pageJumpModal) {
      closeModalWithAnimation();
    }
  });

  // 确认跳转
  jumpConfirm.addEventListener('click', () => {
    const pageNum = parseInt(jumpPageInput.value, 10);
    jumpToPage(pageNum);
    closeModalWithAnimation();
  });

  // 回车键确认
  jumpPageInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(jumpPageInput.value, 10);
      jumpToPage(pageNum);
      closeModalWithAnimation();
    }
  });

  // 关闭动画函数
  function closeModalWithAnimation() {
    modalContent.classList.remove('slide-in');
    modalContent.classList.add('slide-out');
    pageJumpModal.classList.remove('active');
    setTimeout(() => {
      pageJumpModal.style.display = 'none';
      modalContent.classList.remove('slide-out'); // 重置
    }, 300); // 0.3s 与 CSS 动画时间匹配
  }
});
  // Zoom handling
  function adjustZoom(delta) {
    currentScale = Math.min(Math.max(currentScale + delta, 1.0), 3.0);
    const mode = modeSwitch.checked ? 'flip' : 'traditional';
    loadPDF(mode); // Re-render with new scale
  }

  // Keyboard zoom
  document.addEventListener('keydown', (e) => {
    if (e.metaKey) { // Command key
      if (e.key === '+') {
        adjustZoom(0.2);
      } else if (e.key === '-') {
        adjustZoom(-0.2);
      }
    }
  });

  // Touch zoom (pinch)
  let initialDistance = 0;
  const viewerContainer = document.getElementById('viewer-container');
  viewerContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
    }
  });
  viewerContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const currentDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = (currentDistance - initialDistance) / 1000;
      adjustZoom(delta);
      initialDistance = currentDistance;
    }
  });

  // Settings menu toggle
  settingsButton.addEventListener('click', () => {
    settingsMenu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!settingsButton.contains(e.target) && !settingsMenu.contains(e.target)) {
      settingsMenu.classList.remove('open');
    }
  });

  // Add hover event to toggle blur
  const navItems = document.querySelectorAll('nav ul li');
  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => toggleBlur(true));
    item.addEventListener('mouseleave', () => toggleBlur(false));
  });

  modeSwitch.addEventListener('change', switchMode);
  spreadSwitch.addEventListener('change', switchSpread);

  // Initial load
  switchMode();