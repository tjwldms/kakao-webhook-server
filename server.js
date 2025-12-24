const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/kakao", async (req, res) => {
  console.log("📩 카카오 요청 수신");
  console.log(JSON.stringify(req.body, null, 2));

  // 1️⃣ 사용자가 보낸 실제 메시지
  const userText = req.body?.userRequest?.utterance || "내용 없음";

  // 2️⃣ 구글 시트로 전송
  await fetch("https://script.google.com/macros/s/AKfycbwj8bwr7WTEsz7SJYNJMP0UkgHF-d6dTYSdcF8uEuh9R2SiHi1q9zqiZpdqsFl5DYG1Gw/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userText,
      time: new Date().toLocaleString(),
    }),
  });

  // 3️⃣ 카카오에게 응답
  return res.status(200).json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "문의가 정상적으로 접수되었습니다.\n담당자가 확인 후 안내드리겠습니다."
          }
        }
      ]
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 : ${PORT}`);
});
