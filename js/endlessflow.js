  const gallery = document.getElementById('gallery');
  const originalCards = Array.from(gallery.children);
  gallery.innerHTML = '';
  originalCards.forEach((card, i) => card.dataset.index = i);

  const batchSize = originalCards.length;
  const maxItems  = batchSize * 5;
  const threshold = 300;

  // 初始加载 3 批
  for (let i = 0; i < batchSize * 3; i++) {
    const idx = i % batchSize;
    const clone = originalCards[idx].cloneNode(true);
    clone.dataset.index = idx;
    gallery.appendChild(clone);
    updateCardColor(clone);  // ← 初始也要调用一次
  }

  gallery.addEventListener('scroll', () => {
    // 底部加载
    if (gallery.scrollTop + gallery.clientHeight >= gallery.scrollHeight - threshold) {
      const lastIndex = +gallery.lastChild.dataset.index;
      for (let j = 0; j < batchSize; j++) {
        const nextIdx = (lastIndex + 1 + j) % batchSize;
        const clone = originalCards[nextIdx].cloneNode(true);
        clone.dataset.index = nextIdx;
        gallery.appendChild(clone);
        updateCardColor(clone);  // ← 这里调用
      }
      // 清理超出部分…
      let excess = gallery.children.length - maxItems;
      if (excess > 0) {
        const oldH = gallery.scrollHeight;
        for (let k = 0; k < excess; k++) {
          gallery.removeChild(gallery.firstChild);
        }
        gallery.scrollTop -= oldH - gallery.scrollHeight;
      }
    }

    // 顶部加载
      if (gallery.scrollTop <= threshold) {
    const firstIndex = +gallery.firstChild.dataset.index;
    const frag = document.createDocumentFragment();
    const newClones = [];

    // 1) 先造节点
    for (let i = batchSize; i >= 1; i--) {
      const prevIdx = (firstIndex - i + batchSize) % batchSize;
      const clone = originalCards[prevIdx].cloneNode(true);
      clone.dataset.index = prevIdx;
      frag.appendChild(clone);
      newClones.push(clone);
    }

    // 2) 插入到最前面
    const oldHeight = gallery.scrollHeight;
    const oldScroll = gallery.scrollTop;
    gallery.insertBefore(frag, gallery.firstChild);

    // 3) 调用配色函数
    newClones.forEach(clone => updateCardColor(clone));

    // 4) 修正 scrollTop 保持视口位置不变
    gallery.scrollTop = oldScroll + (gallery.scrollHeight - oldHeight);

    // 5) 清理尾部多余
    let excess = gallery.children.length - maxItems;
    if (excess > 0) {
      for (let k = 0; k < excess; k++) {
        gallery.removeChild(gallery.lastChild);
      }
    }
  }
});