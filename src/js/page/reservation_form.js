// RESERVATION-FORM 섹션
// URL 파라미터 읽어오기 (room_detail에서 쿼리로 넘어온 값)
const params = new URLSearchParams(location.search);
const roomType = params.get('room');
const checkIn = params.get('in');
const checkOut = params.get('out');
const extraGuestCount = Number(params.get('guest'));

// db에서 받아올 데이터들
let roomData = null;
let holiday = [];
let myReservations = [];
let seasons = [];
let prices = [];

const roomsURL = `http://localhost:3000/rooms`;
const holidayURL = `http://localhost:3000/holiday`;
const reservationURL = `http://localhost:3000/reservation`;
const seasonURL = `http://localhost:3000/season`;
const priceURL = `http://localhost:3000/price`;

// CALENDAR 섹션
// 입실일이 있는 달을 기준으로 달력을 보여준다
const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();

let currentYear = Number(checkIn.slice(0, 4));
let currentMonth = Number(checkIn.slice(5, 7)) - 1; // 월은 0부터 시작

const days = document.querySelector('#days');

// 오늘 날짜 문자열
const tMM = String(todayMonth + 1).padStart(2, '0');
const tDD = String(today.getDate()).padStart(2, '0');
const todayStr = `${todayYear}-${tMM}-${tDD}`;

// 공휴일 판단 함수 (년, 월(1부터), 일을 받아서 검사)
function checkHoliday(y, m, d) {
  return holiday.some(h => {
    const [hy, hm, hd] = h.holiday_date.split('-');
    return Number(hy) === y && Number(hm) === m && Number(hd) === d;
  });
}

// 날짜 문자열로 공휴일인지 판단하는 함수
function isHolidayDate(dateStr) {
  return holiday.some(h => h.holiday_date === dateStr);
}

// 예약 판단 함수
function isReserved(dateStr) {
  for (let i = 0; i < myReservations.length; i++) {
    const r = myReservations[i];

    // 이 날짜가 예약 범위 안에 있으면 true
    if (dateStr >= r.check_in_date && dateStr <= r.check_out_date) {
      return true;
    }
  }

  return false;
}

// 지난 날짜 판단 함수
function isPast(dateStr) {
  // 날짜 문자열은 사전순 = 날짜순이라 그냥 비교하면 된다
  return dateStr < todayStr;
}

// 날짜 하루의 가격을 구하는 함수
function getDayPrice(dateStr) {
  // 성수기 범위 안이면 성수기, 아니면 비수기로 친다.
  // 비수기는 10/01~06/30처럼 해를 넘기는 범위라 단순 비교가 안 되므로 뒤집어서 판단한다.
  const high = seasons.find(s => s.name === '성수기');
  const low = seasons.find(s => s.name === '비수기');

  // 년도를 빼고 월-일만 비교해야 매년 성수기 판단이 된다
  const md = dateStr.slice(5);
  const isHigh = md >= high.start_date.slice(5) && md <= high.end_date.slice(5);
  const seasonId = isHigh ? high.id : low.id;

  const p = prices.find(row => row.season_id === seasonId);

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

  // POST할 때 쓰려고 숫자 그대로 돌려준다
  return sum;
}

// 달력 그리기 (이 페이지는 보기 전용이라 data-date와 클릭 리스너를 붙이지 않는다)
function renderCalendar() {
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
  for (let i = prevLastDate - firstDay + 1; i <= prevLastDate; i++) {
    const isSunday = cellCounter % 7 === 0;
    const isHoliday = checkHoliday(prevYear, prevMonth, i);

    html += `<div class="other ${isSunday || isHoliday ? 'red' : ''} past">${i}</div>`;
    cellCounter++;
  }

  // 이번 달 채우기
  for (let i = 1; i <= lastDate; i++) {
    const isSunday = cellCounter % 7 === 0;
    const isHoliday = checkHoliday(currentYear, currentMonth + 1, i);

    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;

    // 넘겨받은 입실일 / 퇴실일을 화면에 표시하기
    const isCheckIn = dateStr === checkIn;
    const isCheckOut = dateStr === checkOut;
    const inRange = dateStr > checkIn && dateStr < checkOut;
    const reserved = isReserved(dateStr);
    const past = isPast(dateStr);

    html += `<div class="day ${isSunday || isHoliday ? 'red' : ''} ${reserved ? 'reserved' : ''} ${past ? 'past' : ''} ${isCheckIn || isCheckOut ? 'selected' : ''} ${inRange ? 'in-range' : ''}">${i}${reserved ? '<span class="reserved-text">예약완료</span>' : ''}${isCheckIn ? '<span class="range-text">입실</span>' : ''}${isCheckOut ? '<span class="range-text">퇴실</span>' : ''}</div>`;
    cellCounter++;
  }

  // 뒷 칸(다음 달) 채우기
  for (let i = 1; i <= 42 - (firstDay + lastDate); i++) {
    const isSunday = cellCounter % 7 === 0;
    const isHoliday = checkHoliday(nextYear, nextMonth, i);

    const nMM = String(nextMonth).padStart(2, '0');
    const nDD = String(i).padStart(2, '0');
    const dateStr = `${nextYear}-${nMM}-${nDD}`;

    const isCheckIn = dateStr === checkIn;
    const isCheckOut = dateStr === checkOut;
    const inRange = dateStr > checkIn && dateStr < checkOut;
    const reserved = isReserved(dateStr);
    const past = isPast(dateStr);

    html += `<div class="day ${isSunday || isHoliday ? 'red' : ''} ${reserved ? 'reserved' : ''} ${past ? 'past' : ''} ${isCheckIn || isCheckOut ? 'selected' : ''} ${inRange ? 'in-range' : ''}">${i}${reserved ? '<span class="reserved-text">예약완료</span>' : ''}${isCheckIn ? '<span class="range-text">입실</span>' : ''}${isCheckOut ? '<span class="range-text">퇴실</span>' : ''}</div>`;
    cellCounter++;
  }

  days.innerHTML = html;
}

// 데이터를 전부 불러온 다음 화면을 채운다
async function init() {
  const roomsRes = await fetch(roomsURL, { method: 'GET' });
  const getRooms = await roomsRes.json();
  roomData = getRooms.find(room => room.name_eng === roomType);

  const holidayRes = await fetch(holidayURL, { method: 'GET' });
  holiday = await holidayRes.json();

  // 예약 테이블 불러오기 (이 객실 것만 걸러둔다)
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

  // 넘겨받은 값으로 폼 채우기
  document.querySelector('#form-room').value = roomData.name_eng.toUpperCase();
  document.querySelector('#form-guest').value = extraGuestCount;
  document.querySelector('#form-checkin').value = checkIn;
  document.querySelector('#form-checkout').value = checkOut;

  renderCalendar();
  updateTotal();
}

init();

// 달력 이전달 / 다음달 버튼에 이벤트 붙이기
const prevMonthBtn = document.querySelector('#prev-month');
const nextMonthBtn = document.querySelector('#next-month');

// FORM 섹션
const formName = document.querySelector('#form-name');
const formPhone = document.querySelector('#form-phone');
const nameError = document.querySelector('#name-error');
const phoneError = document.querySelector('#phone-error');
const cancelBtn = document.querySelector('#cancel-btn');
const submitBtn = document.querySelector('#submit-btn');

// 예약명 유효성 검사
function validateName() {
  const value = formName.value.trim();

  if (value === '') {
    nameError.textContent = '필수 입력 값입니다.';
    formName.classList.add('error');
    return false;
  }

  nameError.textContent = '';
  formName.classList.remove('error');
  return true;
}

// 전화번호 유효성 검사
function validatePhone() {
  const value = formPhone.value.trim();

  if (value === '') {
    phoneError.textContent = '필수 입력 값입니다.';
    formPhone.classList.add('error');
    return false;
  }

  // 숫자만, 10~11자리인지 확인한다
  if (!/^\d{11}$/.test(value)) {
    phoneError.textContent = '- 없이 숫자만 11자리로 입력해 주세요.';
    formPhone.classList.add('error');
    return false;
  }

  phoneError.textContent = '';
  formPhone.classList.remove('error');
  return true;
}

// 두 입력이 모두 올바를 때만 예약하기 버튼이 활성화된 색이 된다
function updateSubmitBtn() {
  const nameOk = formName.value.trim() !== '';
  const phoneOk = /^\d{10,11}$/.test(formPhone.value.trim());
  submitBtn.classList.toggle('disable', !(nameOk && phoneOk));
}

// 입력 중에도 검사해서 바로 알려준다
formName.addEventListener('input', () => {
  validateName();
  updateSubmitBtn();
});
formPhone.addEventListener('input', () => {
  validatePhone();
  updateSubmitBtn();
});

updateSubmitBtn(); // 처음엔 비활성 색으로 시작

// 취소를 누르면 이전 페이지로 돌아간다
cancelBtn.addEventListener('click', () => {
  history.back();
});

// 예약하기를 누르면 db.json에 예약을 등록한다
submitBtn.addEventListener('click', async () => {
  // 둘 다 검사해야 에러 문구가 한 번에 다 뜬다
  const nameOk = validateName();
  const phoneOk = validatePhone();
  if (!nameOk || !phoneOk) return;

  const newReservation = {
    customer_name: formName.value.trim(),
    phone_number: formPhone.value.trim(),
    room_id: roomData.id,
    check_in_date: checkIn,
    check_out_date: checkOut,
    number_of_guests: roomData.min + extraGuestCount,
    total_price: updateTotal(),
  };

  await fetch(reservationURL, {
    method: 'POST',
    body: JSON.stringify(newReservation),
    headers: { 'Content-Type': 'application/json' },
  });

  openModal('예약이 완료되었습니다.');
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

// 예약 완료 모달은 확인을 누르면 메인으로 돌아간다
modalClose.addEventListener('click', () => {
  location.href = 'index.html';
});
