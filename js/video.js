    function playVideo(src) {
      const container = document.getElementById('videoPlayerContainer');
      const player = document.getElementById('videoPlayer');
      player.src = src;
      player.play();
      container.style.display = 'flex';
    }
    function closePlayer() {
      const container = document.getElementById('videoPlayerContainer');
      const player = document.getElementById('videoPlayer');
      player.pause();
      player.src = '';
      container.style.display = 'none';
    }
    const defaultIndex = 5; // 调整为聚焦第三个真实视频
    window.addEventListener('load', () => {
      const coverFlow = document.querySelector('.cover-flow');
      if (coverFlow) {
        const items = coverFlow.querySelectorAll('li');
        if (defaultIndex >= 0 && defaultIndex < items.length) {
          const itemWidth = items[0].offsetWidth;
          const containerWidth = coverFlow.offsetWidth;
          const scrollPosition = (defaultIndex * itemWidth) - (containerWidth / 2 - itemWidth / 2);
          coverFlow.scrollTo({ left: scrollPosition, behavior: 'instant' });
        }
        updateDescription(); // 初始更新描述
      }
      // 添加点击事件到非占位符 li
      const coverItems = document.querySelectorAll('.cover-flow li:not(.placeholder)');
      coverItems.forEach(item => {
        item.addEventListener('click', function(e) {
          if (!this.classList.contains('centered')) {
            const centerItem = document.querySelector('.cover-flow li.centered');
            if (!centerItem) return;
            const thisRect = this.getBoundingClientRect();
            const centerRect = centerItem.getBoundingClientRect();
            if (thisRect.left < centerRect.left) {
              scrollPrev();
            } else {
              scrollNext();
            }
          }
          // Removed playVideo for centered items to ensure only button click plays the video
        });
      });
      // Carousel Navigation for multiple carousels
      const carousels = document.querySelectorAll('.carousel');
      carousels.forEach(carousel => {
        const carouselContainer = carousel.querySelector('.carousel-container');
        const btnLeft = carousel.querySelector('.carousel-arrow.left');
        const btnRight = carousel.querySelector('.carousel-arrow.right');

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
      });
      // Add click event to cards for modal
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const title = card.dataset.title;
          const synopsis = card.dataset.synopsis;
          const rating = card.dataset.rating;
          const audience = card.dataset.audience;
          const cast = card.dataset.cast.split(', ');
          const reviews = card.dataset.reviews.split(' | ');
          const poster = card.querySelector('img').src;

          document.getElementById('movieTitle').textContent = title;
          document.getElementById('movieSynopsis').textContent = synopsis;
          document.getElementById('movieRating').textContent = rating;
          document.getElementById('movieAudience').textContent = audience;
          document.getElementById('moviePoster').src = poster;

          const castList = document.getElementById('movieCast');
          castList.innerHTML = '';
          cast.forEach(actor => {
            const span = document.createElement('span');
            span.className = 'movie-modal-cast-member';
            span.textContent = actor;
            castList.appendChild(span);
          });

          const reviewList = document.getElementById('movieReviews');
          reviewList.innerHTML = '';
          reviews.forEach(review => {
            const p = document.createElement('p');
            p.className = 'movie-modal-review';
            p.textContent = review;
            reviewList.appendChild(p);
          });

          document.getElementById('movieModal').classList.add('show');
        });
      });
    });

    function closeMovieModal() {
      document.getElementById('movieModal').classList.remove('show');
    }

    // 滚动函数
    function scrollPrev() {
      const coverFlow = document.querySelector('.cover-flow');
      const itemWidth = coverFlow.querySelector('li').offsetWidth;
      coverFlow.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    }

    function scrollNext() {
      const coverFlow = document.querySelector('.cover-flow');
      const itemWidth = coverFlow.querySelector('li').offsetWidth;
      coverFlow.scrollBy({ left: itemWidth, behavior: 'smooth' });
    }

    // 更新描述函数 - 模仿X帖子样式
    function updateDescription() {
      const coverFlow = document.querySelector('.cover-flow');
      const description = document.querySelector('.selected-description');
      const items = coverFlow.querySelectorAll('li');
      const containerRect = coverFlow.getBoundingClientRect();
      const center = containerRect.left + containerRect.width / 2;

      let closestItem = null;
      let minDistance = Infinity;

      items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(center - itemCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
        }
      });

      items.forEach(item => item.classList.remove('centered'));

      if (closestItem) {
        const newTitle = closestItem.dataset.title;
        if (!newTitle) return; // 跳过占位符
        closestItem.classList.add('centered');
        const newDescription = closestItem.dataset.description;
        const newLink = closestItem.dataset.link;
        const newTags = closestItem.dataset.tags;
        const newHtml = `
        <div class="post-header">${newTitle}</div>
        <div class="post-user">
            <div class="post-user-left">
            <div class="post-user-logo">V</div>
            <div class="post-user-name">Video Hub</div>
            </div>
            <div class="post-actions">
            <span>👍 8</span>
            <span>👎</span>
            <span>↗️ 分享</span>
            <span>⋯</span>
            </div>
        </div>
        <div class="post-meta">239次观看 2025年6月13日 #Featured #Video</div>
        <div class="post-content">${newDescription}</div>
        <a href="${newLink}" class="post-link">${newLink}</a>
        <div class="post-tags">${newTags}</div>
        `;
        if (description.innerHTML !== newHtml) {
          description.classList.add('fade');
          setTimeout(() => {
            description.innerHTML = newHtml;
            description.classList.remove('fade');
          }, 300); // 与过渡时间匹配
        }
      }
    }

    // 监听滚动事件
    const coverFlow = document.querySelector('.cover-flow');
    if (coverFlow) {
      coverFlow.addEventListener('scroll', updateDescription);
    }