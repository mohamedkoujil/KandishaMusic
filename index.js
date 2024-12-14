// Requiere las dependencias necesarias
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const play = require("play-dl");
// Usar dotenv para cargar las variables de entorno
require("dotenv").config();

// Crea el cliente de Discord con las intenciones necesarias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

// Token del bot, importado desde un archivo .env
const TOKEN = process.env.DISCORD_TOKEN;

client.on("ready", () => {
  console.log(`¡Bot conectado como ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  console.log("Mensaje recibido:", message.content);
  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    const url = args[1];
    console.log("URL recibida:", url);

    if (!url) {
      message.reply("Y el link de yutu que? no soy adivino.");
      return;
    }

    // Únete al canal de voz del usuario
    const channel = message.member.voice.channel;
    if (!channel) {
      message.reply("Tienes que estar en un canal de voz Albert Einstein");
      return;
    }

    try {
      // Únete al canal de voz
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      console.log("Bot unido al canal de voz");

      // Reproduce el audio de YouTube
      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);
      player.play(resource);

      message.reply("🎶 Reproduciendo: " + url);
    } catch (error) {
      console.error(
        "Error al unirse al canal de voz o reproducir audio:",
        error
      );
      message.reply("Error suprimiko, as puesto bien el link tete?");
    }
  }
});

// Inicia sesión con el token del bot
client.login(TOKEN);
