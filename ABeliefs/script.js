// ================= DOMContentLoaded 통합 =================
document.addEventListener('DOMContentLoaded', () => {

  // ================= Header2 현재 페이지 활성화 =================
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

  // ================= Header1 드롭다운 애니메이션 =================
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

  // ================= Sidebar Nav 생성 =================
  const sidebarNav = document.querySelector('.sidebar-nav');
  const progressFill = document.querySelector('.progress-fill');
  const currentIndicator = document.querySelector('.current-indicator');
  const sections = document.querySelectorAll('section');
  let navItems;

  const navContainer = document.createDocumentFragment();
  sections.forEach(sec => {
    if (sec.id === 'intro') return; // intro 섹션 제외

    const navItem = document.createElement('div');
    navItem.className = 'nav-item';
    navItem.dataset.section = sec.id;

    const span = document.createElement('span');
    span.className = 'text';
    span.innerText = sec.querySelector('h2') ? sec.querySelector('h2').innerText : 'Section';
    navItem.appendChild(span);

    navContainer.appendChild(navItem);

    // 클릭 시 부드럽게 스크롤
    navItem.addEventListener('click', () => {
      smoothScrollTo(sec.offsetTop);
    });
  });

  sidebarNav.appendChild(navContainer);
  navItems = document.querySelectorAll('.nav-item');

  updateIndicator(); // 초기 표시

  // ================= Smooth Scroll 함수 =================
  function smoothScrollTo(targetPosition, duration = 1500) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  }

  // ================= Indicator 업데이트 =================
  function updateIndicator() {
    if (!navItems || navItems.length === 0) return;

    const scrollTop = window.pageYOffset;
    let closestIndex = 0;
    let minDistance = Infinity;

    sections.forEach((sec, i) => {
      const sectionMiddle = sec.offsetTop + sec.offsetHeight / 2;
      const distance = Math.abs(scrollTop + window.innerHeight / 2 - sectionMiddle);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    const activeNav = navItems[closestIndex];
    if (!activeNav) return;

    const indicatorTop = activeNav.offsetTop + activeNav.offsetHeight / 2;
    currentIndicator.style.top = `${indicatorTop}px`;

    const progressBarStartTop = 20;
    let fillHeight = indicatorTop - progressBarStartTop;
    if (closestIndex === sections.length - 1) {
      const trackFullHeight = sidebarNav.offsetHeight - (progressBarStartTop * 2);
      fillHeight = trackFullHeight;
    }
    progressFill.style.height = `${Math.max(0, fillHeight)}px`;

    navItems.forEach((item, i) => {
      item.classList.toggle('active', i === closestIndex);
    });
  }

  window.addEventListener('scroll', updateIndicator);
  window.addEventListener('resize', updateIndicator);
});