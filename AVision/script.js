document.addEventListener('DOMContentLoaded', () => {
    // ================= 기존 코드 =================
    const scaleContainer = document.querySelector('.image-scale-container');
    const scalingImage = document.querySelector('.scaling-image');
    const visionTitle = document.querySelector('.vision-title');

    const header1 = document.querySelector('.header1');
    const header2 = document.querySelector('.header2');
    const headerHeight = header1.offsetHeight + header2.offsetHeight;

    const styles = getComputedStyle(document.documentElement);
    const startScale = parseFloat(styles.getPropertyValue('--initial-image-scale'));

    let imageScalingComplete = false;
    let initialNumberAnimationTriggered = false;
    let numberAnimationStarted = false;

    const handleImageScroll = () => {
        if (!scaleContainer || !scalingImage || !visionTitle) return;

        const containerTop = scaleContainer.offsetTop;
        const scrollY = window.scrollY;
        const animationStartPoint = containerTop - headerHeight;
        const scrollableHeight = scaleContainer.offsetHeight - window.innerHeight;

        let progress = (scrollY - animationStartPoint) / scrollableHeight;
        progress = Math.max(0, Math.min(1, progress));

        if (scrollY > animationStartPoint) {
            const endScale = 1;
            const currentScale = startScale - (startScale - endScale) * progress;
            const titleOpacity = Math.max(0, 1 - progress / 0.4);

            scalingImage.style.transform = `scale(${currentScale})`;
            visionTitle.style.opacity = titleOpacity;

            if (progress >= 0.95 && !imageScalingComplete) {
                imageScalingComplete = true;
                if (!initialNumberAnimationTriggered) {
                    initialNumberAnimationTriggered = true;
                    setTimeout(() => {
                        animateNumberFromZeroToFifty();
                        numberAnimationStarted = true;
                    }, 300);
                }
            }
        } else {
            scalingImage.style.transform = `scale(${startScale})`;
            visionTitle.style.opacity = '1';
            imageScalingComplete = false;
            initialNumberAnimationTriggered = false;
        }
    };

    window.addEventListener('scroll', handleImageScroll);

    const descriptionItems = document.querySelectorAll('.description-item');
    const stickyNumberSpan = document.querySelector('#sticky-number-circle span');

    let currentNumber = 0;
    let lastActiveItem = null;

    function animateNumberFromZeroToFifty() {
        const start = 0;
        const end = 50;
        const duration = 2000;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4);
            const value = Math.round(start + (end - start) * easedProgress);

            stickyNumberSpan.textContent = value;
            currentNumber = value;

            if (progress < 1) requestAnimationFrame(step);
            else {
                currentNumber = end;
                stickyNumberSpan.textContent = end;
            }
        }
        requestAnimationFrame(step);
    }

    function animateNumber(newNumber) {
        const start = currentNumber;
        const end = parseInt(newNumber);
        if (start === end) return;

        const diff = Math.abs(end - start);
        const duration = Math.min(1000, Math.max(300, 600 * (diff / 50)));

        const startTime = performance.now();
        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.round(start + (end - start) * progress);
            stickyNumberSpan.textContent = value;
            currentNumber = value;

            if (progress < 1) requestAnimationFrame(step);
            else {
                currentNumber = end;
                stickyNumberSpan.textContent = end;
            }
        }
        requestAnimationFrame(step);
    }

    function updateActiveItem() {
        if (!numberAnimationStarted) return;

        const middleScreen = window.scrollY + window.innerHeight / 2;
        let activeItem = descriptionItems[0];

        descriptionItems.forEach(item => {
            if (middleScreen >= item.offsetTop) activeItem = item;
        });

        if (activeItem !== lastActiveItem) {
            descriptionItems.forEach(item => item.classList.remove('active'));
            activeItem.classList.add('active');

            if (activeItem.dataset.number) animateNumber(activeItem.dataset.number);
            lastActiveItem = activeItem;
        }
    }

    stickyNumberSpan.textContent = '0';
    lastActiveItem = null;

    window.addEventListener('scroll', () => {
        handleImageScroll();
        updateActiveItem();
    });
    window.addEventListener('resize', updateActiveItem);

    // Header2 활성화
    const header2Links = document.querySelectorAll('.header2 a');
    const currentPath = window.location.pathname;
    const currentPageFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    header2Links.forEach(link => {
        link.classList.remove('active');
        const linkFile = link.getAttribute('href').substring(link.getAttribute('href').lastIndexOf('/') + 1) || 'index.html';
        if (linkFile === currentPageFile) link.classList.add('active');
    });

    // Header1 드롭다운
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'block';
        });
        item.addEventListener('mouseleave', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) dropdown.style.display = 'none';
        });
    });

    window.onbeforeunload = () => { window.scrollTo(0, 0); };

    // ================= 스크롤 속도 0.6배로 줄이기 =================
    let isScrolling = false;
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (!isScrolling) {
            isScrolling = true;
            const scrollAmount = e.deltaY * 0.6; // 🔹 0.6배 감속
            window.scrollBy({ top: scrollAmount, left: 0, behavior: 'auto' });
            setTimeout(() => { isScrolling = false; }, 10);
        }
    }, { passive: false });
});