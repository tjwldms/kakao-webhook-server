const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SHEET_WEBAPP_URL = "🔥여기에_새_웹앱_URL🔥";
const sessions = {};

const steps = [
  "이름을 입력해주세요 😊",
  "상호명을 입력해주세요 🏪",
  "연락처를 입력해주세요 📞 (숫자만)",
  "문의유형을 선택해주세요 👇\n1) 용지(주소포함)\n2) 기기고장/AS\n3) 메뉴수정\n4) 서류\n5) 기타",
  "문의내용을 입력해주세요 ✍️"
];

app.post("/kakao", async (req, res) => {
  const userId = req.body?.userRequest?.user?.id;
  const text = req.body?.userRequest?.utterance?.trim();

  if (!userId) {
    return res.json(reply("오류가 발생했어요."));
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
    return res.json(reply(steps[0]));
  }

  const s = sessions[userId];

  if (s.step === 0) s.name = text;                // 이름
  else if (s.step === 1) s.name += ` / ${text}`;  // 상호명
  else if (s.step === 2) s.phone = text.replace(/[^0-9]/g, "");
  else if (s.step === 3) {
    const map = {
      "1": "용지(주소포함)",
      "2": "기기고장/AS",
      "3": "메뉴수정",
      "4": "서류",
      "5": "기타"
    };
    s.type = map[text] || "기타";
  }
  else if (s.step === 4) s.message = text;

  s.step++;

  // 아직 질문 남음
  if (s.step < steps.length) {
    return res.json(reply(steps[s.step]));
  }

  // ✅ 전부 받았으면 시트 저장
  await fetch(SHEET_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: s.name,
      phone: s.phone,
      type: s.type,
      message: s.message,
      time: new Date().toLocaleString()
    })
  });

  delete sessions[userId];

  return res.json(reply("문의가 정상적으로 접수됐어요 🙏 빠르게 확인 후 연락드릴게요!"));
});

function reply(text) {
  return {
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text } }]
    }
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =
