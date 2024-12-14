require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const player = new Player(client);
player.extractors.register(YoutubeiExtractor, {});

const connections = new Map(); // Para guardar las conexiones de voz

const TOKEN = process.env.DISCORD_TOKEN;

client.on("ready", () => {
  console.log(`¡Bot conectado como ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    const url = args[1];

    if (!url) {
      message.reply("Y el link de YouTube qué? no soy adivino.");
      return;
    }

    const channel = message.member.voice.channel;
    if (!channel) {
      message.reply("Tienes que estar en un canal de voz Albert Einstein.");
      return;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      connections.set(message.guild.id, connection); // Guarda la conexión

      console.log("Bot unido al canal de voz");

      const track = await player.play(url);
      if (!track) {
        message.reply("No pude encontrar el audio para ese link.");
        return;
      }

      connection.subscribe(track.stream); // Suscríbete al stream
      message.reply(`🎶 Reproduciendo: ${url}`);
    } catch (error) {
      console.error("Error al obtener el track:", error);
      message.reply("Hubo un error al obtener el track de YouTube.");
    }
  }

  if (message.content.startsWith("!stop")) {
    const connection = connections.get(message.guild.id);

    if (!connection) {
      message.reply("No estoy en un canal de voz.");
      return;
    }

    connection.destroy(); // Destruye la conexión
    connections.delete(message.guild.id); // Elimina la conexión del mapa
    message.reply("Adioh pisha.");
  }
});

client.login(TOKEN);
