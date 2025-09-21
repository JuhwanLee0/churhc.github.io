document.addEventListener('DOMContentLoaded', () => {
    // ================= Carousel =================
    const container = document.getElementById('carousel-container');
    const track = document.getElementById('carousel-track');
    
    const videoData = [
        { videoId: '3XGYOnJUzAg', imageSrc: 'https://i.ytimg.com/vi/3XGYOnJUzAg/maxresdefault.jpg' },
        { videoId: '1gYtBxfMbcs', imageSrc: 'https://i.ytimg.com/vi/1gYtBxfMbcs/maxresdefault.jpg' },
        { videoId: '04WiCFl2yts', imageSrc: 'https://i.ytimg.com/vi/04WiCFl2yts/maxresdefault.jpg' },
        { videoId: 'QKnOzDs5O40', imageSrc: 'https://i.ytimg.com/vi/QKnOzDs5O40/maxresdefault.jpg' },
        { videoId: '4KbFYw6BnJk', imageSrc: 'https://i.ytimg.com/vi/4KbFYw6BnJk/maxresdefault.jpg'}
    ];
    
    // --- Simplified Carousel Logic ---
    let isDragging = false;
    let isAutoScrolling = true;
    let lastPosition;

    let currentPosition = 0;
    let targetPosition = 0;
    let velocity = 0;

    const autoScrollSpeed = 0.05;
    const friction = 0.92;

    /**
     * Creates a card element and sets up its click event.
     * @param {object} data - The video data for the card.
     * @returns {HTMLElement} The created card element.
     */
    function createCardElement(data) {
        const card = document.createElement('div');
        card.classList.add('carousel-card');
        card.style.backgroundImage = `url(${data.imageSrc})`;
        
        // --- CLICK EVENT (MODIFIED) ---
        // Simplified: Directly opens the YouTube link in a new tab on click.
        card.addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${data.videoId}`, '_blank');
        });

        // All mouseenter/mouseleave (hover) events have been removed.
        return card;
    }

    // Populate the track with cards (duplicated for infinite scroll effect)
    const allCardsData = [...videoData, ...videoData, ...videoData];
    allCardsData.forEach(data => {
        const card = createCardElement(data);
        track.appendChild(card);
    });
    
    // --- Drag and Scroll Logic (Largely Unchanged) ---
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        isAutoScrolling = false;
        velocity += (e.deltaX > 0 ? -1 : 1) * 0.8;
        clearTimeout(container.scrollTimer);
        container.scrollTimer = setTimeout(() => { isAutoScrolling = true; }, 2000);
    }, { passive: false });

    container.addEventListener('mousedown', (e) => {
        isDragging = true; 
        isAutoScrolling = false; 
        lastPosition = e.pageX;
        container.style.cursor = 'grabbing';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = e.pageX - lastPosition; 
        velocity += delta * 0.7;
        lastPosition = e.pageX;
    });

    const endDrag = () => {
        if (!isDragging) return; 
        isDragging = false;
        container.style.cursor = 'grab';
        clearTimeout(container.dragTimer);
        container.dragTimer = setTimeout(() => { isAutoScrolling = true; }, 2000);
    };

    window.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);

    function animate() {
        if (isAutoScrolling && !isDragging) { 
            velocity -= autoScrollSpeed; 
        }
        velocity *= friction; 
        targetPosition += velocity;
        currentPosition += (targetPosition - currentPosition) * 0.1;

        // Infinite scroll logic
        const oneSetWidth = track.scrollWidth / 3;
        if (targetPosition <= -oneSetWidth * 2) { 
            currentPosition += oneSetWidth; 
            targetPosition += oneSetWidth; 
        }
        if (targetPosition >= -oneSetWidth) { 
            currentPosition -= oneSetWidth; 
            targetPosition -= oneSetWidth; 
        }
        track.style.transform = `translateX(${currentPosition}px)`;
        
        requestAnimationFrame(animate);
    }

    animate();

    // ================= Header Logic (Unchanged) =================
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
});