// 웹 페이지의 모든 요소가 로드된 후에 스크립트가 실행되도록 합니다.
document.addEventListener('DOMContentLoaded', () => {

  // ================= Header2 현재 페이지 활성화 =================
  const header2Links = document.querySelectorAll('.header2 a');
  let currentPath = window.location.pathname;

  // 브라우저에 표시되는 주소(URL)에서 파일명만 추출합니다.
  // 예: "/about-us/location/1.html" -> "1.html"
  currentPath = currentPath.substring(currentPath.lastIndexOf('/') + 1);

  header2Links.forEach(link => {
    // 모든 링크의 'active' 클래스를 일단 제거합니다.
    link.classList.remove('active');

    // 각 링크의 href 속성에서 파일명만 추출합니다.
    let linkPath = link.getAttribute('href');
    linkPath = linkPath.substring(linkPath.lastIndexOf('/') + 1);

    // 현재 페이지의 파일명과 링크의 파일명이 일치하면 'active' 클래스를 추가합니다.
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /*
  // ================= Header1 드롭다운 애니메이션 (참고) =================
  // 이 기능은 CSS의 :hover 가상 클래스를 사용하는 것이 더 부드럽고 성능이 좋습니다.
  // (예: .menu-item:hover .dropdown { display: block; })
  // 따라서 JavaScript에서는 제외하는 것을 추천합니다.
  */

  // ================= 텍스트 박스 클릭 시 주소 복사 및 토스트 메시지 표시 =================
  const textBox = document.querySelector('.text-box');
  
  // text-box 요소가 페이지에 존재하는 경우에만 클릭 이벤트를 추가합니다.
  if (textBox) {
    textBox.addEventListener('click', () => {
      const addressEl = document.getElementById('church-address');
      if (addressEl) {
        const address = addressEl.innerText.trim();
        navigator.clipboard.writeText(address)
          .then(() => {
            // 복사 성공 시, 클릭된 textBox 옆에 토스트 메시지를 표시합니다.
            showToast("Address copied!", textBox);
          })
          .catch(err => {
            console.error("Copy failed:", err);
            showToast("Copy failed!", textBox);
          });
      }
    });
  }

  // ================= 토스트 메시지 표시 함수 =================
  // 두 번째 인자(anchorElement)를 기준으로 토스트 메시지의 위치를 동적으로 설정합니다.
  function showToast(message, anchorElement) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }

    // anchorElement가 인자로 전달된 경우, 해당 요소 옆으로 위치를 계산합니다.
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect(); // 기준 요소의 좌표와 크기를 가져옵니다.
      
      // 토스트의 위치를 설정합니다.
      // left: 기준 요소의 오른쪽 + 15px 여백
      // top: 기준 요소의 세로 중앙
      toast.style.left = `${rect.right + 15}px`;
      toast.style.top = `${rect.top + rect.height / 2}px`;
      
      // 토스트 자체의 높이를 고려하여 정확히 세로 중앙에 오도록 Y축을 보정합니다.
      toast.style.transform = 'translateY(-50%)';
    }
    
    // 메시지 내용을 설정하고 'show' 클래스를 추가하여 화면에 나타나게 합니다.
    toast.innerText = message;
    toast.className = 'show';

    // 2초(2000ms) 후에 'show' 클래스를 제거하여 사라지게 합니다.
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
      // 부드러운 다음 등장을 위해 transform 속성을 초기화해주는 것이 좋습니다.
      setTimeout(() => {
        if (toast) { // 토스트가 여전히 존재하는지 확인
           toast.style.transform = 'translateY(10px)';
        }
      }, 300); // CSS의 transition 시간과 일치시킵니다.
    }, 2000);
  }
});