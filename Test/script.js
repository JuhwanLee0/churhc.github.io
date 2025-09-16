document.addEventListener('DOMContentLoaded', () => {
    // ================= Carousel (from first file) =================
    const container = document.getElementById('carousel-container');
    const track = document.getElementById('carousel-track');
    const backdrop = document.getElementById('backdrop');
    
    const videoData = [
        { videoId: 'ey2vfE8abqU', imageSrc: 'https://i.ytimg.com/vi/ey2vfE8abqU/maxresdefault.jpg'},
        { videoId: '3XGYOnJUzAg', imageSrc: 'https://i.ytimg.com/vi/5zUgiW67fY0/maxresdefault.jpg' },
        { videoId: 'gwXfTT2vi4Y', imageSrc: 'https://i.ytimg.com/vi/gwXfTT2vi4Y/maxresdefault.jpg' },
        { videoId: 'GKlaiIC9xSI', imageSrc: 'https://i.ytimg.com/vi/GKlaiIC9xSI/maxresdefault.jpg' },
        { videoId: 'ZFArNQHKJT0', imageSrc: 'https://i.ytimg.com/vi/ZFArNQHKJT0/maxresdefault.jpg' },
       
    ];
    
    let isZoomed = false;
    let isAnimating = false;
    let isDragging = false;
    let isAutoScrolling = true;
    let leaveTimeout = null;
    let hoverCheckInterval = null;
    let hoveredCard = null;
    let collapseFallback = null;

    let currentPosition = 0;
    let targetPosition = 0;
    let velocity = 0;
    let lastPosition;

    const autoScrollSpeed = 0.05;
    const friction = 0.92;
    const hoverPadding = 60;

    function restoreCardToTrack(card) {
        const placeholder = card && card.__placeholder;
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.insertBefore(card, placeholder);
            placeholder.remove();
            card.__placeholder = null;
        }
    }

    function moveCardToOverlay(card) {
        if (card.__placeholder) return;
        const placeholder = document.createElement('div');
        placeholder.style.width = `${card.offsetWidth}px`;
        placeholder.style.height = `${card.offsetHeight}px`;
        placeholder.style.margin = window.getComputedStyle(card).margin;
        card.parentNode.insertBefore(placeholder, card);
        card.__placeholder = placeholder;
        document.body.appendChild(card);
    }

    function finalizeCollapse() {
        isZoomed = false;
        isAnimating = false;
        const card = hoveredCard;
        restoreCardToTrack(card);
        hoveredCard = null;
        backdrop.style.pointerEvents = 'none';
        clearInterval(hoverCheckInterval);
        hoverCheckInterval = null;
        clearTimeout(leaveTimeout);
        leaveTimeout = null;
        if (collapseFallback) { clearTimeout(collapseFallback); collapseFallback = null; }
    }

    function collapseZoom() {
        if (!hoveredCard || !isZoomed) return;
        isAnimating = true;
        requestAnimationFrame(() => {
            restoreCardToTrack(hoveredCard);
            hoveredCard.classList.remove('zoomed');
        });
        hoveredCard.addEventListener('transitionend', finalizeCollapse, { once: true });
        if (collapseFallback) clearTimeout(collapseFallback);
        collapseFallback = setTimeout(() => {
            if (!isZoomed) return;
            finalizeCollapse();
        }, 600);
    }

    function expandZoom(card) {
        if (isDragging || isAnimating) return;
        clearTimeout(leaveTimeout);
        if (isZoomed && hoveredCard === card) return;
        isZoomed = true;
        isAnimating = true;
        hoveredCard = card;
        requestAnimationFrame(() => {
            moveCardToOverlay(card);
            card.classList.add('zoomed');
            backdrop.style.pointerEvents = 'auto';
        });
        card.addEventListener('transitionend', () => {
            isAnimating = false;
        }, { once: true });
        if (hoverCheckInterval) { clearInterval(hoverCheckInterval); hoverCheckInterval = null; }
    }

    function createCardElement(data) {
        const card = document.createElement('div');
        card.classList.add('carousel-card');
        card.style.backgroundImage = `url(${data.imageSrc})`;
        card.addEventListener('click', (e) => {
            if (!isZoomed) {
                e.preventDefault();
                expandZoom(card);
                return;
            }
            if (hoveredCard === card) {
                window.open(`https://www.youtube.com/watch?v=${data.videoId}`, '_blank');
            }
        });
        card.addEventListener('mouseenter', () => expandZoom(card));
        card.addEventListener('mouseleave', () => {
            if (!isZoomed) return;
            clearTimeout(leaveTimeout);
            collapseZoom();
        });
        card.addEventListener('mouseenter', () => {
            if (!isZoomed) return;
            clearTimeout(leaveTimeout);
        });
        return card;
    }

    const allCardsData = [...videoData, ...videoData, ...videoData];
    allCardsData.forEach(data => {
        const card = createCardElement(data);
        track.appendChild(card);
    });

    const stopCarouselActions = () => isZoomed || isAnimating;

    container.addEventListener('wheel', (e) => {
        if (stopCarouselActions()) return;
        e.preventDefault();
        isAutoScrolling = false;
        const dx = e.deltaX;
        if (dx === 0) return;
        const direction = dx > 0 ? -1 : 1;
        const SCROLL_STEP = 0.8;
        velocity += direction * SCROLL_STEP;
        clearTimeout(container.scrollTimer);
        container.scrollTimer = setTimeout(() => { isAutoScrolling = true; }, 2000);
    }, { passive: false });

    container.addEventListener('mousedown', (e) => {
        if (stopCarouselActions()) return;
        isDragging = true; isAutoScrolling = false; lastPosition = e.pageX;
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging || stopCarouselActions()) return;
        const delta = e.pageX - lastPosition; velocity += delta * 0.7;
        lastPosition = e.pageX;
    });

    const endDrag = () => {
        if (!isDragging) return; isDragging = false;
        container.style.cursor = 'grab';
        clearTimeout(container.dragTimer);
        container.dragTimer = setTimeout(() => { isAutoScrolling = true; }, 2000);
    };

    window.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);

    function animate() {
        if (stopCarouselActions()) {
            velocity = 0;
        } else {
            if (isAutoScrolling && !isDragging) { velocity -= autoScrollSpeed; }
            velocity *= friction; targetPosition += velocity;
            currentPosition += (targetPosition - currentPosition) * 0.1;
            const oneSetWidth = track.scrollWidth / 3;
            if (targetPosition <= -oneSetWidth * 2) { currentPosition += oneSetWidth; targetPosition += oneSetWidth; }
            if (targetPosition >= -oneSetWidth) { currentPosition -= oneSetWidth; targetPosition -= oneSetWidth; }
            track.style.transform = `translateX(${currentPosition}px)`;
        }
        requestAnimationFrame(animate);
    }

    backdrop.addEventListener('click', () => {
        if (isZoomed && !isAnimating) collapseZoom();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isZoomed && !isAnimating) {
            collapseZoom();
        }
    });

    function getNearestProximityCard(mouseX, mouseY) {
        const cards = document.querySelectorAll('.carousel-card');
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const expanded = {
                left: rect.left - hoverPadding,
                top: rect.top - hoverPadding,
                right: rect.right + hoverPadding,
                bottom: rect.bottom + hoverPadding
            };
            if (mouseX >= expanded.left && mouseX <= expanded.right && mouseY >= expanded.top && mouseY <= expanded.bottom) {
                return card;
            }
        }
        return null;
    }

    // container.addEventListener('mousemove', (e) => {
    //     if (isDragging || isAnimating || isZoomed) return;
    //     const candidate = getNearestProximityCard(e.clientX, e.clientY);
    //     if (candidate) expandZoom(candidate);
    // });

    document.addEventListener('pointerout', (e) => {
        if (e.relatedTarget === null && isZoomed && !isAnimating) {
            collapseZoom();
        }
    });

    window.addEventListener('blur', () => {
        if (isZoomed && !isAnimating) collapseZoom();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isZoomed && !isAnimating) collapseZoom();
    });

    animate();

    // ================= Header Logic (from second file) =================
    const header2Links = document.querySelectorAll('.header2 a');
    let currentPath = window.location.pathname;
    currentPath = currentPath.substring(currentPath.lastIndexOf('/') + 1);

    header2Links.forEach(link => {
        link.classList.remove('active');
        let linkPath = link.getAttribute('href');
        linkPath = linkPath.substring(linkPath.lastIndexOf('/') + 1);
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'block';
        });
        item.addEventListener('mouseleave', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'none';
        });
    });
});