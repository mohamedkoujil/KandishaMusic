// use requiere para importar las dependencias
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const play = require("play-dl");
// usar dotenv para cargar las variables de entorno
require("dotenv").config();

// Crea el cliente de Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Token del bot, importado desde un archivo .env
const TOKEN = process.env.DISCORD_TOKEN;

client.on("ready", () => {
  console.log(`¡Bot conectado como ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    const url = args[1]; // URL de YouTube después de !play
    console.log(url);
    if (!url) {
      message.reply("Y el link de yutu que? no soy adivino, puta");
      return;
    }

    // Únete al canal de voz del usuario
    const channel = message.member.voice.channel;
    if (!channel) {
      message.reply("Tienes que estar en un canal de voz Albert Einstein");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Reproduce el audio de YouTube
    try {
      const stream = await play.stream(url); // Obtén el stream de YouTube
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);
      player.play(resource);

      message.reply("🎶 Reproduciendo: " + url);
    } catch (error) {
      console.error(error);
      message.reply("Error suprimiko, as puesto bien el link tete?");
    }
  }
});

// Inicia sesión con el token del bot
client.login(TOKEN);
