let roomData = null;

// 추가 인원 커스텀 드롭다운
// getRoomData()에서 selectBtn을 쓰기 때문에 선언이 먼저 와야 한다
const selectBox = document.querySelector('#select-box');
const selectBtn = document.querySelector('#select-btn');
const selectLabel = document.querySelector('#select-label');
const selectList = document.querySelector('#select-list');

// 취소 / 예약하기 버튼
// updateTotal()에서 reserveBtn을 쓰기 때문에 선언이 먼저 와야 한다
const cancelBtn = document.querySelector('#cancel-btn');
const reserveBtn = document.querySelector('#reserve-btn');

// 선택된 추가 인원 (가격 계산에 쓸 상태 변수)
let extraGuestCount = 0;

// 버튼을 누르면 목록을 열고 닫는다
selectBtn.addEventListener('click', () => {
  selectBox.classList.toggle('open');
});

// 목록의 항목을 누르면 값을 저장하고 목록을 닫는다
selectList.addEventListener('click', e => {
  const item = e.target.closest('.select-item');
  if (!item) return;

  extraGuestCount = Number(item.dataset.value);
  selectLabel.textContent = item.textContent;
  selectBox.classList.remove('open');

  updateTotal(); // 추가 인원이 바뀌면 합계 다시 계산
});

// 바깥을 누르면 목록을 닫는다
document.addEventListener('click', e => {
  if (!selectBox.contains(e.target)) {
    selectBox.classList.remove('open');
  }
});

// ROOM-DETAIL 섹션
// URL 파라미터 읽어오기
const params = new URLSearchParams(location.search);
const roomType = params.get('room');

// db.json에서 room에 대한 정보 읽어오고,
const roomsURL = `rooms`;
async function getRoomData() {
  const roomsRes = await fetch(roomsURL, { method: 'GET' });
  const getRooms = await roomsRes.json();

  roomData = getRooms.find(room => room.name_eng === roomType);

  // 데이터를 화면에 채우기
  const roomTitle = document.querySelector('#room-title');
  const mainImgTrack = document.querySelector('#main-img-track');
  const thumbnailList = document.querySelector('.thumbnail-list');
  const roomDesc = document.querySelector('#desc');
  const roomDescEng = document.querySelector('#desc-eng');

  // textContent로 넣을 수 있는 데이터 먼저 넣기
  roomTitle.textContent = roomData.name_eng.toUpperCase();
  roomDesc.textContent = roomData.desc;
  roomDescEng.textContent = roomData.desc_eng;

  // 메인 이미지(track)와 썸네일을 같은 배열로 한 번에 채우기
  // track 안에 이미지 전부를 가로로 깔아두고, track을 옆으로 밀어서 전환한다
  let trackHtml = '';
  let thumbHtml = '';
  roomData.images.forEach(img => {
    trackHtml += `<img src="${img}" />`;
    thumbHtml += `<img src="${img}" />`;
  });
  mainImgTrack.innerHTML = trackHtml;
  thumbnailList.innerHTML = thumbHtml;

  // 각 방마다 추가 인원을 다르게 세팅하기
  // 추가 가능 인원 = capacity - min
  const guestInfo = document.querySelector('.guest-info');
  const maxExtra = roomData.capacity - roomData.min;

  // 커스텀 드롭다운 목록 채우기 (select/option은 hover 스타일이 안 먹어서 직접 만든다)
  let optionHTML = '<li class="select-item" data-value="0">없음</li>';
  for (let i = 1; i <= maxExtra; i++) {
    optionHTML += `<li class="select-item" data-value="${i}">${i}명</li>`;
  }
  selectList.innerHTML = optionHTML;

  // 추가 인원이 0명이면 선택할 게 없으므로 버튼 비활성화
  selectBtn.disabled = maxExtra === 0;

  // 안내 문구도 객실 기준 인원에 맞춰서 채우기
  guestInfo.textContent = `기준 인원 ${roomData.min}명, 추가 시 한 명당 객실 가격의 20%`;

  // 지금 몇 번째 이미지를 보고 있는지 (썸네일 클릭과 스와이프가 함께 쓴다)
  let currentIndex = 0;

  // 썸네일 리스트의 이미지를 누르면 track을 그만큼 옆으로 밀기
  thumbnailList.addEventListener('click', e => {
    if (!e.target.matches('img')) return;

    // 클릭한 썸네일이 몇 번째인지 구하기
    const index = [...thumbnailList.children].indexOf(e.target);
    currentIndex = index; // 스와이프와 위치를 맞춘다

    // 0번이면 0%, 2번이면 -200% 만큼 track을 왼쪽으로 이동
    mainImgTrack.style.transform = `translateX(-${index * 100}%)`;
  });

  // 메인 이미지를 드래그(마우스) / 스와이프(터치)해서 넘기기
  let startX = 0;
  let isDragging = false;

  const viewport = document.querySelector('.main-img-viewport');

  function swipeStart(x) {
    startX = x;
    isDragging = true;
    mainImgTrack.style.transition = 'none'; // 드래그 중엔 애니메이션을 끈다
  }

  // 드래그하는 동안 이미지가 손가락을 따라오게 한다
  function swipeMove(x) {
    if (!isDragging) return;

    const distance = x - startX;
    const percent = (distance / viewport.offsetWidth) * 100;
    mainImgTrack.style.transform = `translateX(calc(-${currentIndex * 100}% + ${percent}%))`;
  }

  function swipeEnd(x) {
    if (!isDragging) return;
    isDragging = false;
    mainImgTrack.style.transition = 'transform 0.3s'; // 놓으면 부드럽게 정렬된다

    const distance = x - startX;
    const last = roomData.images.length - 1;

    // 50px 이상 움직여야 스와이프로 친다 (그냥 클릭한 것과 구분)
    if (Math.abs(distance) >= 50) {
      // 왼쪽으로 밀면 다음 사진, 오른쪽으로 밀면 이전 사진
      // 끝에서 넘기면 반대쪽 끝으로 이어진다
      if (distance < 0) {
        currentIndex = currentIndex === last ? 0 : currentIndex + 1;
      } else {
        currentIndex = currentIndex === 0 ? last : currentIndex - 1;
      }
    }

    mainImgTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // 마우스
  viewport.addEventListener('mousedown', e => swipeStart(e.clientX));
  viewport.addEventListener('mousemove', e => swipeMove(e.clientX));
  viewport.addEventListener('mouseup', e => swipeEnd(e.clientX));
  viewport.addEventListener('mouseleave', e => swipeEnd(e.clientX));

  // 터치
  viewport.addEventListener('touchstart', e => swipeStart(e.touches[0].clientX));
  viewport.addEventListener('touchmove', e => swipeMove(e.touches[0].clientX));
  viewport.addEventListener('touchend', e => swipeEnd(e.changedTouches[0].clientX));
}

// CALENDAR 섹션
// 상태 변수부터 선언하기
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 월은 0부터 시작
const days = document.querySelector('#days');

// 예약 상태변수
let checkIn = null;
let checkOut = null;

// 오늘 기준 년/월 (이전 달 이동 막기에 사용)
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();

// 공휴일 판단 함수 (년, 월(1부터), 일을 받아서 검사)
function checkHoliday(y, m, d) {
  return holiday.some(h => {
    const [hy, hm, hd] = h.holiday_date.split('-');
    return Number(hy) === y && Number(hm) === m && Number(hd) === d;
  });
}

// 예약 판단 함수
function isReserved(dateStr) {
  // myReservations를 하나씩 확인한다
  for (let i = 0; i < myReservations.length; i++) {
    const r = myReservations[i];

    // 이 날짜가 예약 범위 안에 있으면 true
    if (dateStr >= r.check_in_date && dateStr <= r.check_out_date) {
      return true;
    }
  }

  // 다 돌았는데도 하나도 안 걸리면 false
  return false;
}

// 오늘 날짜 문자열
const tMM = String(todayMonth + 1).padStart(2, '0');
const tDD = String(today.getDate()).padStart(2, '0');
const todayStr = `${todayYear}-${tMM}-${tDD}`;

// 지난 날짜 판단 함수
function isPast(dateStr) {
  // 날짜 문자열은 사전순 = 날짜순이라 그냥 비교하면 된다
  return dateStr < todayStr;
}

// 선택한 범위(start ~ end) 안에 예약된 날짜가 하나라도 있으면 true
function hasReservedInRange(start, end) {
  const d = new Date(start);
  const last = new Date(end);

  // 하루씩 넘기면서 전부 확인한다
  while (d <= last) {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    if (isReserved(`${y}-${mm}-${dd}`)) return true;

    // setDate로 하루를 더하면 말일에서 다음 달로 알아서 넘어간다
    d.setDate(d.getDate() + 1);
  }

  return false;
}

// 선택한 범위가 며칠인지 세는 함수 (입실일, 퇴실일 포함)
function countDays(start, end) {
  // 날짜끼리 빼면 밀리초 차이가 나온다
  const diff = new Date(end) - new Date(start);
  // 하루 = 1000 * 60 * 60 * 24 밀리초
  return diff / (1000 * 60 * 60 * 24) + 1;
}

// 날짜 문자열로 공휴일인지 판단하는 함수
function isHolidayDate(dateStr) {
  return holiday.some(h => h.holiday_date === dateStr);
}

// 날짜 하루의 가격을 구하는 함수
function getDayPrice(dateStr) {
  // 1. 시즌 판단
  // 성수기 범위 안이면 성수기, 아니면 비수기로 친다.
  // 비수기는 10/01~06/30처럼 해를 넘기는 범위라 단순 비교가 안 되므로 뒤집어서 판단한다.
  const high = seasons.find(s => s.name === '성수기');
  const low = seasons.find(s => s.name === '비수기');

  // 년도를 빼고 월-일만 비교해야 매년 성수기 판단이 된다
  const md = dateStr.slice(5); // "07-20"
  const isHigh = md >= high.start_date.slice(5) && md <= high.end_date.slice(5);
  const seasonId = isHigh ? high.id : low.id;

  // 2. 이 객실 + 이 시즌의 가격 줄 찾기
  const p = prices.find(row => row.season_id === seasonId);

  // 3. 주중 / 주말 / 휴일 판단
  // 공휴일이면 요일과 상관없이 휴일가
  if (isHolidayDate(dateStr)) return p.holiday_price;

  // 토(6), 일(0)은 주말가
  const dayOfWeek = new Date(dateStr).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return p.weekend_price;

  // 나머지 월~금은 주중가
  return p.weekday_price;
}

// 총 합계를 계산해서 화면에 표시하는 함수
function updateTotal() {
  const totalPrice = document.querySelector('#total-price');

  // 날짜를 둘 다 골라야 예약하기 버튼이 활성화된 색이 된다
  reserveBtn.classList.toggle('disable', checkIn === null || checkOut === null);

  // 입실일 / 퇴실일이 둘 다 정해지지 않았으면 0원
  if (checkIn === null || checkOut === null) {
    totalPrice.textContent = '0';
    return;
  }

  // 입실일부터 퇴실일 전날까지 하루씩 더한다 (퇴실일은 숙박에 포함되지 않는다)
  let sum = 0;
  const d = new Date(checkIn);
  const last = new Date(checkOut);

  while (d < last) {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    sum += getDayPrice(`${y}-${mm}-${dd}`);
    d.setDate(d.getDate() + 1);
  }

  // 추가 인원 1명당 객실 가격의 20%
  sum = sum + sum * 0.2 * extraGuestCount;

  totalPrice.textContent = sum.toLocaleString();
}

function renderCalendar() {
  // newDate(년,월,일)의 월도 똑같이 0부터 세는 규칙.
  // 이번 달이라고 1을 더할 필요가 없다.
  // 화면에 표시할 때만 +1을 할 것.
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 이번 달 1일의 요일
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate(); // 이번 달 마지막 날
  const prevLastDate = new Date(currentYear, currentMonth, 0).getDate(); // 이전 달 마지막 날

  // 이전 달 / 다음 달의 년, 월 구하기 (12월->1월 같은 년도 넘김을 Date가 처리해준다)
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1; // 공휴일 비교용이라 +1

  const nextDate = new Date(currentYear, currentMonth + 1, 1);
  const nextYear = nextDate.getFullYear();
  const nextMonth = nextDate.getMonth() + 1; // 공휴일 비교용이라 +1

  // 달력 위 타이틀 채우기
  const monthTitle = document.querySelector('#current-month');
  monthTitle.textContent = `${currentYear}년 ${currentMonth + 1}월`;

  // 이번 달이면 이전 달 버튼 비활성화
  prevMonthBtn.disabled = currentYear === todayYear && currentMonth === todayMonth;

  // 달력 채우기 (42칸)
  let html = '';
  let cellCounter = 0; // 일요일 체크할 카운터

  // 앞 칸(이전 달) 채우기
  // firstDay개만큼 앞칸이 채워진다.
  // 이전 달은 항상 지난 날짜라 선택 대상이 아니다. (.day를 안 붙인다)
  for (let i = prevLastDate - firstDay + 1; i <= prevLastDate; i++) {
    const isSunday = cellCounter % 7 === 0;
    // 공휴일 판단 (이전 달 기준)
    const isHoliday = checkHoliday(prevYear, prevMonth, i);

    html += `<div class="other ${isSunday || isHoliday ? 'red' : ''} past">${i}</div>`;
    cellCounter++;
  }

  // 이번 달 채우기
  // 1일부터 lastDate까지 채우기
  for (let i = 1; i <= lastDate; i++) {
    const isSunday = cellCounter % 7 === 0;
    // 공휴일 판단 (이번 달 기준)
    const isHoliday = checkHoliday(currentYear, currentMonth + 1, i);

    // 예약 날짜엔 '예약 완료'로 뜨도록
    // db 날짜 형식("2026-05-03")에 맞춰 문자열을 만든다
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;

    // 예약 상태 화면에 표시하기
    const isCheckIn = dateStr === checkIn;
    const isCheckOut = dateStr === checkOut;
    const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
    const reserved = isReserved(dateStr);
    const past = isPast(dateStr);

    html += `<div class="day ${isSunday || isHoliday ? 'red' : ''} ${reserved ? 'reserved' : ''} ${past ? 'past' : ''} ${isCheckIn || isCheckOut ? 'selected' : ''} ${inRange ? 'in-range' : ''}" data-date="${dateStr}">${i}${reserved ? '<span class="reserved-text">예약완료</span>' : ''}${isCheckIn ? '<span class="range-text">입실</span>' : ''}${isCheckOut ? '<span class="range-text">퇴실</span>' : ''}</div>`;
    cellCounter++;
  }

  // 뒷 칸(다음 달) 채우기
  // 42 - (앞칸 수 + lastDate)개를 1일부터 채우기
  // 달을 넘기는 예약(7/31 입실 ~ 8/2 퇴실)을 위해 뒷칸도 선택 대상이다. (.day를 붙인다)
  for (let i = 1; i <= 42 - (firstDay + lastDate); i++) {
    const isSunday = cellCounter % 7 === 0;
    // 공휴일 판단 (다음 달 기준)
    const isHoliday = checkHoliday(nextYear, nextMonth, i);

    // 다음 달 기준 날짜 문자열
    const nMM = String(nextMonth).padStart(2, '0');
    const nDD = String(i).padStart(2, '0');
    const dateStr = `${nextYear}-${nMM}-${nDD}`;

    // 예약 상태 화면에 표시하기
    const isCheckIn = dateStr === checkIn;
    const isCheckOut = dateStr === checkOut;
    const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
    const reserved = isReserved(dateStr);
    const past = isPast(dateStr);

    html += `<div class="day ${isSunday || isHoliday ? 'red' : ''} ${reserved ? 'reserved' : ''} ${past ? 'past' : ''} ${isCheckIn || isCheckOut ? 'selected' : ''} ${inRange ? 'in-range' : ''}" data-date="${dateStr}">${i}${reserved ? '<span class="reserved-text">예약완료</span>' : ''}${isCheckIn ? '<span class="range-text">입실</span>' : ''}${isCheckOut ? '<span class="range-text">퇴실</span>' : ''}</div>`;
    cellCounter++;
  }

  days.innerHTML = html;

  updateTotal(); // 날짜가 바뀔 때마다 합계도 다시 계산
}

// db.json에서 공휴일 데이터 불러오고, init 함수 만들기
let holiday = [];
let myReservations = [];
let seasons = [];
let prices = [];
const holidayURL = `holiday`;
const reservationURL = `reservation`;
const seasonURL = `season`;
const priceURL = `price`;
async function init() {
  await getRoomData();

  const holidayRes = await fetch(holidayURL, { method: 'GET' });
  holiday = await holidayRes.json();

  // 예약 테이블 불러오기
  const reservationRes = await fetch(reservationURL, { method: 'GET' });
  const allReservations = await reservationRes.json();
  myReservations = allReservations.filter(r => r.room_id === roomData.id);

  // 시즌 테이블 불러오기
  const seasonRes = await fetch(seasonURL, { method: 'GET' });
  seasons = await seasonRes.json();

  // 가격 테이블 불러오기 (이 객실 것만 걸러둔다)
  const priceRes = await fetch(priceURL, { method: 'GET' });
  const allPrices = await priceRes.json();
  prices = allPrices.filter(p => p.room_id === roomData.id);

  renderCalendar();
}

init();

// 달력 다음달 버튼에 이벤트 붙이기
const prevMonthBtn = document.querySelector('#prev-month');
const nextMonthBtn = document.querySelector('#next-month');

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  // 1월(0)에서 이전으로 가면 작년 12월(11)로 넘긴다
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  // 12월(11)에서 다음으로 가면 내년 1월(0)로 넘긴다
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// 일자 클릭 리스너
days.addEventListener('click', e => {
  const cell = e.target.closest('.day');
  if (!cell) return;

  // 예약 완료 / 지난 날짜는 선택 불가
  if (cell.classList.contains('reserved')) return;
  if (cell.classList.contains('past')) return;

  const date = cell.dataset.date;

  // 입실일을 다시 누르면 선택 전체 취소 (퇴실일도 의미가 없어지므로 같이 비운다)
  if (date === checkIn) {
    checkIn = null;
    checkOut = null;
    renderCalendar();
    return;
  }

  // 퇴실일을 다시 누르면 퇴실일만 취소
  if (date === checkOut) {
    checkOut = null;
    renderCalendar();
    return;
  }

  // 클릭으로 checkIn / checkOut 잡기
  if (checkIn === null) {
    // 첫 클릭 -> 입실일
    checkIn = date;
  } else if (checkOut === null) {
    // 두 번째 클릭 -> 퇴실일

    // 입실일보다 앞선(또는 같은) 날짜는 퇴실일이 될 수 없다.
    // 대신 그 날짜를 새 입실일로 잡아준다.
    if (date <= checkIn) {
      checkIn = date;
      renderCalendar();
      return;
    }

    // 선택한 범위 안에 이미 예약된 날짜가 있으면 선택 불가
    if (hasReservedInRange(checkIn, date)) {
      openModal('선택한 기간에 이미 예약된 날짜가 있습니다.');
      return;
    }

    // 6일 이상이면 모달을 띄운다
    if (countDays(checkIn, date) >= 6) {
      openModal('6일 이상은 예약할 수 없습니다.');
      return;
    }

    checkOut = date;
  } else {
    // 이미 둘 다 정해졌으면 처음부터 다시
    checkIn = date;
    checkOut = null;
  }

  renderCalendar(); // 선택 상태를 화면에 반영한다.
});

// 취소를 누르면 이전 페이지로 돌아간다
cancelBtn.addEventListener('click', () => {
  history.back();
});

// 예약하기를 누르면 선택한 정보를 쿼리로 실어서 예약등록 페이지로 넘어간다
reserveBtn.addEventListener('click', () => {
  // 날짜를 다 고르지 않았으면 넘어갈 수 없다
  if (checkIn === null || checkOut === null) {
    openModal('입실일과 퇴실일을 선택해 주세요.');
    return;
  }

  const query = `?room=${roomType}&in=${checkIn}&out=${checkOut}&guest=${extraGuestCount}`;
  location.href = `html/reservation_form.html${query}`;
});

// 모달
const alertModal = document.querySelector('#alert-modal');
const modalText = document.querySelector('#modal-text');
const modalClose = document.querySelector('#modal-close');

// 문구를 받아서 모달을 띄우는 함수
function openModal(text) {
  modalText.textContent = text;
  alertModal.classList.add('open');
}

// 확인 버튼을 누르면 닫는다
modalClose.addEventListener('click', () => {
  alertModal.classList.remove('open');
});

// 백드롭을 누르면 닫는다
alertModal.addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    alertModal.classList.remove('open');
  }
});
