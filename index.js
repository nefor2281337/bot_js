require("dotenv").config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "menu",
    description: "Получить меню",
  },
]);

bot.command("start", async (ctx) => {
  await ctx.react("🙊");
});

const menuKeyboard = new InlineKeyboard()
  .text("Узнать статус заказа", "order-status").row()
  .text("Обратиться в поддержку", "support");

const backKeyboard = new InlineKeyboard().text("Назад в меню", "back-to-menu");

bot.command("menu", async (ctx) => {
  await ctx.reply("Выберите пункт меню", {
    reply_markup: menuKeyboard,
  });
});

bot.callbackQuery("back-to-menu", async (callback) => {
  await callback.callbackQuery.message.editText("Выберите пункт меню", {
    reply_markup: menuKeyboard,
  });

  await callback.answerCallbackQuery()
});

bot.on("callback_query:data", async (callback) => {
  let answer = "";

  callback.update.callback_query.data == "order-status" 
  ? answer = "Заказ в пути" 
  : answer = "Поддержка";

  await  callback.callbackQuery.message.editText(answer, {
    reply_markup: backKeyboard,
  });

  await callback.answerCallbackQuery()
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request: ", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram: ", e);
  } else {
    console.log("Unknow error: ", e);
  }
});

bot.start();
