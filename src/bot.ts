import { Bot, Context, session, SessionFlavor } from "grammy";
import { Fluent } from "@moebius/fluent";
import { useFluent, FluentContextFlavor } from "@grammyjs/fluent";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

import { RedisAdapter } from "@satont/grammy-redis-storage";
import Redis from "ioredis";

const storage = new RedisAdapter({
  instance: new Redis("redis://localhost:6379/0"),
});

export type MyAppContext = Context &
  FluentContextFlavor &
  ConversationFlavor &
  SessionFlavor<{}>;

const bot = new Bot<MyAppContext>("");

const fluent = new Fluent();

fluent.addTranslation({
  locales: "en",
  source: `welcome = Welcome, {$name}`,
  bundleOptions: {
    useIsolating: false,
  },
});

async function example(
  conversation: Conversation<MyAppContext>,
  ctx: MyAppContext
) {
  do {
    await ctx.reply(
      ctx.t("welcome", {
        name: ctx.from!.first_name,
      })
    );
    ctx = await conversation.wait();
  } while (true);
}

bot.use(
  useFluent({
    fluent,
  })
);

bot.use(
  session({
    initial: () => ({}),
    storage,
  })
);

bot.use(conversations());
bot.use(createConversation(example));

bot.command("start", async (ctx) => {
  await ctx.conversation.enter("example");
});

bot.start();
