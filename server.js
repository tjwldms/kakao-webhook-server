// server.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 카카오 챗봇에서 호출되는 엔드포인트
app.post("/kakao", (req, res) => {
  console.log("📩 카카오에서 받은 데이터:");
  console.log(JSON.stringify(req.body, null, 2));

  // ⭐ 핵심: status(200) + json + return
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

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 : ${PORT}`);
});
