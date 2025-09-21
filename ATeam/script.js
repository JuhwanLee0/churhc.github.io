document.addEventListener('DOMContentLoaded', () => {
    const teamCards = document.querySelectorAll('.team-card');
    const modalContainer = document.querySelector('.modal-container');
    const closeButtons = document.querySelectorAll('.modal-close-button');
    const body = document.body;

    // ========================================================
    // ✨ 1. 모달을 닫는 로직을 하나의 함수로 정리했습니다.
    // ========================================================
    const closeModal = () => {
        const activeModal = document.querySelector('.modal-content.active');
        if (activeModal) {
            activeModal.classList.remove('active');
        }
        modalContainer.classList.remove('active');
        body.classList.remove('modal-open');
    };

    // ================= Header2 현재 페이지 활성화 =================
    const header2Links = document.querySelectorAll('.header2 a');
    let currentPath = window.location.pathname;

    let currentPageFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (currentPageFile === '') {
        currentPageFile = 'index.html';
    }

    header2Links.forEach(link => {
        link.classList.remove('active');
        let linkPathFile = link.getAttribute('href');
        linkPathFile = linkPathFile.substring(linkPathFile.lastIndexOf('/') + 1);
        
        if (linkPathFile === '') {
            linkPathFile = 'index.html';
        }

        if (linkPathFile === currentPageFile) {
            link.classList.add('active');
        }
    });

    // ================= Header1 드롭다운 메뉴 =================
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) {
                dropdown.style.display = 'block';
            }
        });
        item.addEventListener('mouseleave', () => {
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });
    });

    // ================= 모달 열기 로직 =================
    teamCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModalId = card.dataset.modalTarget;
            const targetModal = document.getElementById(targetModalId);

            if (targetModal) {
                modalContainer.classList.add('active');
                targetModal.classList.add('active');
                body.classList.add('modal-open');
            }
        });
    });

    // ================= 모달 닫기 로직 =================
    // ✨ 2. X 버튼과 배경 클릭 시 closeModal 함수를 사용하도록 변경
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    // ========================================================
    // ✨ 3. Esc 키를 눌렀을 때 모달을 닫는 기능을 추가했습니다.
    // ========================================================
    window.addEventListener('keydown', (e) => {
        // 눌린 키가 'Escape'이고, 모달 컨테이너가 활성화 상태일 때만 실행
        if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
            closeModal();
        }
    });
});