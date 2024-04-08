const { AmoJoScopeClient, AmoApiClient, Task } = require("@mobilon-dev/amotop");
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
function tommorow_date() {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  return Math.floor(currentDate.getTime() / 1000);
}

const amoApiClient = new AmoApiClient(
  "",
  "",
  { debug: true }
);

const add_leads = async () => {
  try {
    // const leads_arr = [];
    for (let i = 0; i < 100; i++) {
      // leads_arr.push({
      //     ...amoApiClient.getBaseLeadPayload('Продать слона', getRandomInt(200,100000)),
      // })
      const lead = {
        ...amoApiClient.getBaseLeadPayload(
          "Продать слона",
          getRandomInt(200, 100000)
        ),
      };
      console.log("lead payload", lead);

      const leadResponse = await amoApiClient.addLead(lead);

      console.log("leadResponse", JSON.stringify(leadResponse, null, 2));
    }
  } catch (err) {
    const errMessage = err.response?.data
      ? JSON.stringify(err.response.data, null, 2)
      : err;
    console.log("err", errMessage);
  }
};

const lead_to_manager = async () => {
  const all_leads = await amoApiClient.getLeads();

  let need_leads = [];
  all_leads._embedded.leads.forEach((el) => {
    if (el.price > 10000) need_leads.push(el);
  });

  let managers = await amoApiClient.getUsers();

  const need_managers = [];

  managers._embedded.users.forEach((el) => {
    if (el.rights.group_id === 541222) need_managers.push(el);
  });

  let count = 0;
  for (let i = 0; i < need_leads.length; i++) {
    if (count >= need_managers.length - 1) count = 0;
    else count += 1;

    await amoApiClient.appendTagsToLead(need_leads[i].id, {
      responsible_user_id: need_managers[count].id, //Потребовалась небольшая "доработка"
    });
    const task = [
      {
        text: "Связаться с клиентом",
        responsible_user_id: need_managers[count].id,
        complete_till: tommorow_date(),
      },
    ];
    await amoApiClient.addTask(task).catch((err) => {
      console.log(err.response.data["validation-errors"][0].errors);
    });
  }
};
