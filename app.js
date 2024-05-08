import express from "express";
import fs from "fs";
const app = express();
app.use(express.json());

let members = JSON.parse(fs.readFileSync("./members.json"));
let trainers = JSON.parse(fs.readFileSync("./trainers.json"));

/*
 *!  Revenues
 */
app.get("/membersRev", (req, res) => {
  let totalRevenue = 0;
  members.forEach((member) => {
    totalRevenue += member.memberShip.cost;
  });
  res.status(200).json({ TotalRevenue: totalRevenue });
});
app.get("/trainerRev", (req, res) => {
  let id = req.params.id;
  let index = trainers.findIndex((trainer) => trainer.trainerId == id);
  if (index === -1) res.status(404).json({ message: "Trainer Not Found" });
  let member = members.filter(
    (member) => member.trainerId == trainers[index].trainerId
  );
  if (member) {
    let revenue = 0;
    member.forEach((rev) => (revenue += rev.memberShip.cost));
    trainers[index].revenue = revenue;
    res.status(200).json(trainers[index]);
  }
});
/* 
  !Trainers methods
*/
// Get Trainer with there members
app.get("/trainers/member", (req, res) => {
  let trainerInfo = [];
  trainers.forEach((trainer) => {
    let member = members.filter(
      (member) => member.trainerId === trainer.trainerId
    );
    if (member) {
      trainer.members = member;
      trainerInfo.push(trainer);
    }
  });
  res.status(200).json(trainerInfo);
});
//  Get a specific Trainer by ID
app.get("/trainers/:id", (req, res) => {
  let id = req.params.id;
  let index = trainers.findIndex((trainer) => trainer.trainerId == id);
  if (index === -1) res.status(404).json({ message: "Trainer Not Found" });
  let member = members.filter(
    (member) => member.trainerId == trainers[index].trainerId
  );
  if (member) {
    trainers[index].member = member;
    res.status(200).json(trainers[index]);
  }
});
// Add Trainer
app.post("/trainers", (req, res) => {
  req.body.id = trainers.length + 1;
  trainers.push(req.body);
  fs.writeFileSync("trainers.json", JSON.stringify(trainers));
  res.status(201).json({ message: "Trainer Added" });
});
// Update trainer data
app.put("/trainers/:id", (req, res) => {
  let id = req.params.id;
  let index = trainers.findIndex((trainer) => trainer.trainerId == id);
  if (index == -1) res.status(404).json({ message: "Trainer Not Found" });
  else {
    if (req.body.name == "") {
      res.status(404).json({ message: "Name cannot be empty" });
    }
    trainers[index].name = req.body.name;
    trainers[index].duration.from = req.body.duration.from;
    trainers[index].duration.to = req.body.duration.to;

    fs.writeFileSync("trainers.json", JSON.stringify(trainers));
    res.status(200).json({ message: "Updated" });
  }
});
// Delete Trainer
app.delete("/trainers/:id", (req, res) => {
  let id = req.params.id;
  let index = trainers.findIndex((trainer) => trainer.trainerId == id);
  if (index == -1) res.status(404).json({ message: "Trainer Not Found" });
  else {
    trainers.splice(index, 1);
    fs.writeFileSync("trainers.json", JSON.stringify(trainers));
    res.status(200).json({ message: "Removed" });
  }
});

/* 
  ? Members Methods
*/
// Add member
app.post("/members", (req, res) => {
  let existMember = members.find(
    (member) => member.nationalId == req.body.nationalId
  );
  if (existMember) {
    res.status(404).json({ message: "Member is already exist" });
  } else {
    members.push(req.body);
    fs.writeFileSync("members.json", JSON.stringify(members));
    res.status(200).json({ message: "Member Added" });
  }
});

// Get Specific Member
app.get("/members/:id", (req, res) => {
  // Get Today's Date
  let today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let todayDate = day + "-" + month + "-" + year;

  let id = req.params.id;
  let index = members.findIndex((member) => member.id == id);
  if (index === -1) res.status(404).json({ message: "Member Not Found" });
  if (
    members[index].memberShip.to == todayDate ||
    members[index].memberShip.to.split("-")[1] < todayDate.split("-")[1]
  ) {
    res
      .status(404)
      .json({ message: "This member is not allowed to enter the gym" });
  }
  res.status(200).json(members[index]);
});

// Update Member Data
app.put("/members/:id", (req, res) => {
  let id = req.params.id;
  let index = members.findIndex((member) => member.id == id);
  if (index === -1) res.status(404).json({ message: "Trainer Not Found" });
  else {
    if (req.body.name == "") {
      res.status(404).json({ message: "Name cannot be empty" });
    }
    members[index].name = req.body.name;
    members[index].memberShip.from = req.body.memberShip.from;
    members[index].memberShip.to = req.body.memberShip.to;
    members[index].memberShip.cost = req.body.memberShip.cost;
    members[index].trainerId = req.body.trainerId;

    fs.writeFileSync("trainers.json", JSON.stringify(members));
    res.status(200).json({ message: "Updated" });
  }
});
// Delete Member
app.delete("/members/:id", (req, res) => {
  let id = req.params.id;
  let index = members.findIndex((member) => member.id == id);
  if (index === -1) res.status(404).json({ message: "Member Not Found" });
  else {
    members.splice(index, 1);
    fs.writeFileSync("trainers.json", JSON.stringify(members));
    res.status(200).json({ message: "Removed" });
  }
});
// Get member with there trainers info
app.get("/member/trainer", (req, res) => {
  let memberInfo = [];
  members.forEach((member) => {
    let info = { ...member };
    let trainer = trainers.find(
      (trainer) => trainer.trainerId === info.trainerId
    );
    if (trainer) {
      info.trainer = trainer.name;
    }
    memberInfo.push(info);
  });
  res.status(200).json(memberInfo);
});

app.listen(3000, () => console.log(`Server is ruuning`));
