document.addEventListener("DOMContentLoaded", () => {
    // =======================================================
    // 캐러셀 기능 관련 변수 및 로직
    // =======================================================
    const track = document.getElementById("carouselTrack");
    const slides = Array.from(document.querySelectorAll(".carousel-slide"));
    const carouselDots = document.getElementById("carouselDots");
    const unifiedControlBtn = document.getElementById("unifiedControlBtn");
    
    if (slides.length === 0) return;

    let currentIndex = 0;
    let progressInterval;
    const slideDuration = 6000; // 6초
    let currentProgress = 0;
    
    // ✅ 이 부분의 초기값을 false로 변경합니다.
    let isPlaying = false; 

    // 점과 프로그레스 바 생성 함수
function createDots() {
    carouselDots.innerHTML = '';
    slides.forEach((_, i) => {
        if (i === currentIndex) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-fill"></div>';
            carouselDots.appendChild(progressBar);
            setTimeout(() => progressBar.classList.add('bounce'), 50);
        } else {
            const dot = document.createElement('button');
            dot.className = 'dot';
            
            // ✅ 이 부분이 수정되었습니다.
            dot.addEventListener('click', () => {
                stopProgressAnimation();
                moveToSlide(i);
                currentProgress = 0;
                
                // 캐러셀이 '재생 중'인 상태였다면, 
                // 새로운 슬라이드에서 프로그레스 애니메이션을 바로 다시 시작합니다.
                if (isPlaying) {
                    startProgressAnimation();
                }
            });
            carouselDots.appendChild(dot);
        }
    });
}
    // 슬라이드 이동 및 중앙 정렬 함수
    function moveToSlide(targetIndex) {
        const trackContainer = track.parentElement;
        const targetSlide = slides[targetIndex];
        
        if (!trackContainer || !targetSlide) return;

        const containerCenter = trackContainer.offsetWidth / 2;
        const targetCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
        const offset = containerCenter - targetCenter;
        
        track.style.transform = `translateX(${offset}px)`;

        slides.forEach((slide, index) => {
            slide.classList.remove("active");
            if (index === targetIndex) {
                slide.classList.add("active");
            }
        });
        
        currentIndex = targetIndex;
        createDots();
    }
    
    // 프로그레스 바 애니메이션 함수
    function startProgressAnimation() {
        stopProgressAnimation(); 
        
        const progressFill = carouselDots.querySelector('.progress-fill');
        if (!progressFill) return;

        progressFill.style.width = `${currentProgress}%`;

        const startTime = Date.now() - (slideDuration * (currentProgress / 100));

        progressInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            currentProgress = (elapsedTime / slideDuration) * 100;
            
            if (currentProgress >= 100) {
                currentProgress = 0; // 리셋 먼저
                stopProgressAnimation();
                const nextIndex = (currentIndex + 1) % slides.length;
                moveToSlide(nextIndex);
                startProgressAnimation(); 
            } else {
                progressFill.style.width = `${currentProgress}%`;
            }
        }, 16);
    }

    // 애니메이션 정지 함수
    function stopProgressAnimation() {
        clearInterval(progressInterval);
    }
    
    // 재생 함수
    function play() {
        if (isPlaying) return; // 이미 재생 중이면 아무것도 안 함
        isPlaying = true;
        unifiedControlBtn.classList.add("playing");
        startProgressAnimation();
    }

    // 일시정지 함수
    function pause() {
        if (!isPlaying) return; // 이미 정지 상태면 아무것도 안 함
        isPlaying = false;
        unifiedControlBtn.classList.remove("playing");
        stopProgressAnimation();
    }
    
    // 통합 버튼 클릭 이벤트
    unifiedControlBtn.addEventListener("click", () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    });

    // 마우스를 이미지 영역에 올리면 일시정지, 벗어나면 다시 재생
    const slideImages = document.querySelectorAll('.slide-image');
    slideImages.forEach(slideImage => {
        slideImage.addEventListener("mouseenter", pause);
        slideImage.addEventListener("mouseleave", play);
    });
    
    // 창 크기 변경 시 중앙 정렬 다시 계산
    window.addEventListener("resize", () => {
        track.style.transition = 'none';
        moveToSlide(currentIndex);
        setTimeout(() => {
            track.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 50);
    });

    // =======================================================
    // 추가된 헤더 및 텍스트 기능
    // =======================================================

    // ------------------- Hero Text 한 글자씩 나타나기 -------------------
    const heroText = document.getElementById('heroText');
    if (heroText) {
        const text = heroText.textContent.trim();
        heroText.textContent = ''; 
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            heroText.appendChild(span);
        });

        let i = 0;
        const spans = heroText.querySelectorAll('span');
        function showNextLetter() {
            if (i < spans.length) {
                spans[i].classList.add('visible');
                i++;
                setTimeout(showNextLetter, 300); 
            }
        }
        showNextLetter();
    }

    // ------------------- 메뉴 호버 시 캐러셀 블러 효과 -------------------
    const heroSection = document.querySelector('.hero-section');
    const blurMenus = ['aboutMenu', 'worshipMenu', 'scheduleMenu', 'ministryMenu'];
    
    if (heroSection) {
        blurMenus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (!menu) return;

            menu.addEventListener('mouseenter', () => {
                heroSection.classList.add('blurred');
            });

            menu.addEventListener('mouseleave', () => {
                heroSection.classList.remove('blurred');
            });
        });
    }

    // ------------------- 활성 메뉴 표시 -------------------
    function setActiveMenu() {
        const currentPage = window.location.pathname;
        const menuMap = {
            aboutMenu: ['/about-us/'],
            worshipMenu: ['/Worship1/'],
            scheduleMenu: ['list-view.html', 'calendar-view.html'],
            ministryMenu: ['kfd.html', 'first-friday.html', 'campus.html', 'outreach.html'],
            churchMenu: ['church.html'],
            connectMenu: ['connect.html']
        };

        Object.entries(menuMap).forEach(([menuId, paths]) => {
            const menu = document.getElementById(menuId);
            if (!menu) return;

            menu.classList.remove('active');
            const isActive = paths.some(path => currentPage.includes(path));
            if (isActive) {
                menu.classList.add('active');
            }
        });
    }

    // =======================================================
    // 초기 실행
    // =======================================================
    function init() {
        moveToSlide(0);
        play(); // isPlaying이 false이므로 정상적으로 실행됨
        setActiveMenu();
    }

    init();
});