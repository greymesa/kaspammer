// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
// import { Session, Adapters } from 'kahoot-api';

const Kahoot = require("kahoot.js-updated");
const express = require("express");
const app = express();
var randoms = [];
let tmp = [1];
for (let i = 0; i < 100000; i++) {
  tmp.push(Math.random());
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.urlencoded());

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

app.post("/new", start);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

async function start(req, res) {
  let keepplaying = true;
  let id = +req.body.dream || 0;
  let num = +req.body.num || 1;
  if (typeof id != "number" || typeof num != "number") {
    res.send("NaN");
    return;
  }
  if (!(id >= 100000 || id <= 9999999)) {
    res.send("not valid id");
    return;
  }
  if (num < 0 || num > 2000) {
    res.send("too many bots! cap is 2000");
    return;
  }

  let sessions = [];
  for (let i = 0; i < num + 1; i++) {
    sessions.unshift(new Kahoot());
    await new Promise((y, n) => {
      let session = sessions[0];
      let tmp = [1];
      for (let k = 0; k < 10000; k++) {
        tmp.push(Math.random());
      }
      randoms.push(tmp);

      session.on("quizStart", quiz => {
        if (i < num)
          console.log("i like ya cut g " + (i<num?i + 1:"haha") + " ready for action: ", quiz.name);
      });
      session.on("questionStart", question => {
        sessions[0].leave();
        switch (question.type) {
          case "quiz":
          case "survey":
            session.answerQuestion(
              Math.floor(
                randoms[i + 1][randoms[i + 1][0]++ % 10000] *
                  (question.quiz.answerCounts[question.index] || 0)
              )
            );
            break;
          case "open_ended":
          case "word_cloud":
            var send = "";
            for (
              let j = 0;
              j < Math.floor(randoms[i + 1][randoms[i + 1][0]++ % 10000] * 4) + 5;
              j++
            ) {
              send += random(
                "abcdefghijklmnopqrstuvwxyzaeiou  ".split(""),
                randoms[i + 1][randoms[i + 1][0]++ % 10000]
              );
            }
            session.answerQuestion(send);
            break;
          default:
            break;
        }
      });
      session.on("finish", e => {
        console.log(
          "im bot " +
            i +
            " and i rankd " +
            e.rank +
            " - " +
            e.correct +
            "correct and " +
            e.incorrect +
            " wrong"
        );
        session.leave();
        keepplaying = false;
      });
      session.on("joined", () => {
        if (i < num) console.log("bot " + (i<num?i + 1:"tmp") + " reporting for duty");
        y(true);
      });
      session.on("invalidName", () => {
        n(true);
      });
      session.join(id, "get stickbugged lol " + (i<num?i + 1:"haha"), "bot gang");
    }).catch(err => {
      res.send(err);
      return;
    });
  }
  await sleep(1000);
  res.send("done!");
  await new Promise(r => {
    setTimeout(_ => {
      if (!keepplaying) {
        r(true);
      }
    }, 500);
  });
  console.log("end");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function random(arr, rand) {
  return arr[Math.floor(rand * arr.length)];
}
