const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/kakao", (req, res) => {
  console.log("📩 카카오 요청 수신");
  console.log(JSON.stringify(req.body, null, 2));

  return res.status(200).json({
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "문의가 정상적으로 접수되었습니다. 담당자가 확인 후 안내드리겠습니다."
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
