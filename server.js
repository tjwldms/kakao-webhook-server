const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 구글 Apps Script 웹앱 URL
const SHEET_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbzxZg0QOdwxLN32V2JkTByj96fwJEmncDONm3UaQ1LJ-2hOsnSwLahJb6XqymwiDJOnpg/exec";

const sessions = {};

const steps = [
  "이름을 입력해주세요 😊",
  "상호명을 입력해주세요 🏪",
  "연락처를 입력해주세요 📞 (숫자만 입력)",
  "문의유형을 선택해주세요 👇\n1) 용지(주소포함)\n2) 기기고장/AS\n3) 메뉴수정\n4) 서류\n5) 기타",
  "문의내용을 입력해주세요 ✍️"
];

app.post("/kakao", async (req, res) => {
  const userId = req.body?.userRequest?.user?.id;
  const text = req.body?.userRequest?.utterance;

  if (!userId) {
    return res.json(makeReply("오류가 발생했어요."));
  }

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

  if (s.step === 0) {
    s.name = text;
  } else if (s.step === 1) {
    s.name = s.name + " / " + text;
  } else if (s.step === 2) {
    s.phone = text.replace(/[^0-9]/g, "");
  } else if (s.step === 3) {
    const map = {
      "1": "용지(주소포함)",
      "2": "기기고장/AS",
      "3": "메뉴수정",
      "4": "서류",
      "5": "기타"
    };
    s.type = map[text] || "기타";
  } else if (s.step === 4) {
    s.message = text;
  }

  s.step += 1;

  if (s.step < steps.length) {
    return res.json(makeReply(steps[s.step]));
  }

  try {
    await fetch(SHEET_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: s.name,
        phone: s.phone,
        type: s.type,
        message: s.message,
        time: new Date().toLocaleString("ko-KR")
      })
    });
  } catch (e) {
    console.error("시트 전송 오류", e);
  }

  delete sessions[userId];

  return res.json(
    makeReply("문의가 정상적으로 접수됐어요 🙏 빠르게 확인 후 연락드릴게요!")
  );
});

function makeReply(text) {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: text
          }
        }
      ]
    }
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("✅ 서버 실행 중 :", PORT);
});
