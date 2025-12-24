const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ✅ 구글 Apps Script 웹앱 URL (네가 준 주소)
const SHEET_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbzxZg0QOdwxLN32V2JkTByj96fwJEmncDONm3UaQ1LJ-2hOsnSwLahJb6XqymwiDJOnpg/exec";

// 사용자별 진행 상태 저장
const sessions = {};

// 질문 단계
const steps = [
  "이름을 입력해주세요 😊",
  "상호명을 입력해주세요 🏪",
  "연락처를 입력해주세요 📞 (숫자만 입력)",
  "문의유형을 선택해주세요 👇\n1) 용지(주소포함)\n2) 기기고장/AS\n3) 메뉴수정\n4) 서류\n5) 기타",
  "문의내용을 입력해주세요 ✍️"
];

app.post("/kakao", async (req, res) => {
  const userId = req.body?.userRequest?.user?.id;
  const text = req.body?.userRequest?.utterance?.trim();

  if (!userId) {
    return res.json(makeReply("오류가 발생했어요."));
  }

  // 세션 시작
  if (!sessions[userId]) {
    sessions[userId] = {
      step: 0,
      name: "",
      phone: "",
      type: "",
      message: ""
    };
    return res.json(makeReply(steps[0]));
  }

  const s = sessions[userId];

  // 단계별 값 저장
  if (s.step === 0) {
    s.name = text; // 이름
  } else if (s.step === 1) {
    s.name += " / " + text; // 상호명
  } else if (s.step === 2) {
    s.phone = text.replace(/[^0-9]/g, ""); // 연락처
  } else if (s.step === 3) {
    const map = {
      "1": "용지(주소포함)",
      "2": "기기고장/AS",
