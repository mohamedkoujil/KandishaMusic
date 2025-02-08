const { Client, GatewayIntentBits, GuildMember } = require("discord.js");
const { Player, QueryType } = require("discord-player");
require("dotenv").config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Crear el cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Inicializar el reproductor
const player = new Player(client);

// Configurar extractores (opcional, para usar plataformas específicas)
const { YoutubeiExtractor } = require("discord-player-youtubei");
player.extractors.register(YoutubeiExtractor, {});

// Cuando el bot esté listo
client.on("ready", () => {
  console.log("Bot is online!");
  client.user.setActivity("🎶 | Music Time", { type: "LISTENING" });
});

// Manejar comandos
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (!client.application?.owner) await client.application?.fetch();
  //deploy the commands
  if (
    message.content === "!deploy"
    //&& message.author.id === client.application?.owner?.id
  ) {
    await message.guild.commands.set([
      {
        name: "play",
        description: "Play a song from YouTube",
        options: [
          {
            name: "query",
            type: 3, // STRING type
            description: "The song you want to play",
            required: true,
          },
        ],
      },
      {
        name: "pause",
        description: "Pause the current song",
      },
      {
        name: "resume",
        description: "Resume the current song",
      },
      {
        name: "stop",
        description: "Stop the player",
      },
      {
        name: "skip",
        description: "Skip the current song",
      },
      {
        name: "queue",
        description: "Show the current queue",
      },
    ]);

    await message.reply("Commands deployed!");
  }
});

// Manejar interacciones (slash commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || !interaction.guildId) return;

  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: "Tienes que estar en un canal de voz Albert Einstein",
      ephemeral: true,
    });
  }

  const queue = player.nodes.create(interaction.guild, {
    metadata: {
      channel: interaction.channel,
    },
  });

  if (interaction.commandName === "play") {
    await interaction.deferReply();

    const query = interaction.options.getString("query");
    const track = await player
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE,
      })
      .then((x) => x.tracks[0]);

    if (!track) {
      return interaction.followUp("No ay naa por aki primo");
    }

    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.delete();
      return interaction.followUp("No me e podio unir al canal de voz primiko");
    }

    queue.addTrack(track);
    if (!queue.isPlaying()) await queue.node.play();

    return interaction.followUp(`🎶 | Playing **${track.title}** now!`);
  } else if (interaction.commandName === "skip") {
    await interaction.deferReply();

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp("❌ | No hay naa que saltar primo");
    }

    queue.node.skip();
    return interaction.followUp("⏭ | Skipped the current song!");
  } else if (interaction.commandName === "stop") {
    await interaction.deferReply();

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp("❌ | No music is playing!");
    }

    queue.delete();
    return interaction.followUp(
      "🛑 | Porke para la musica irmano, tu jiripoya o que?"
    );
  } else if (interaction.commandName === "pause") {
    await interaction.deferReply();

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp("❌ | No hay música sonando ahora mismo.");
    }

    queue.node.setPaused(true); // Pausar la música
    return interaction.followUp("⏸ | Música pausada!");
  } else if (interaction.commandName === "resume") {
    await interaction.deferReply();

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp("❌ | No hay música sonando ahora mismo.");
    }

    queue.node.setPaused(false); // Reanudar la música
    return interaction.followUp("▶ | Música reanudada!");
  } else if (interaction.commandName === "queue") {
    await interaction.deferReply();

    if (!queue || !queue.isPlaying()) {
      return interaction.followUp("❌ | No music is playing!");
    }

    const tracks = queue.tracks.map(
      (track, index) => `${index + 1}. ${track.title}`
    );

    return interaction.followUp({
      content: `🎶 | **Queue**:\n${tracks.join("\n")}`,
    });
  } else {
    interaction.reply({
      content: "Unknown command!",
      ephemeral: true,
    });
  }
});

// Manejar eventos del reproductor
player.events.on("playerStart", (queue, track) => {
  queue.metadata.channel.send(
    `🎶 | Vaya mierda de canción primo: **${track.title}**!`
  );
});

player.events.on("error", (queue, error) => {
  console.error(`Error: ${error.message}`);
});

player.events.on("playerError", (queue, error) => {
  console.error(`Player error: ${error.message}`);
});

// Iniciar sesión del cliente
client.login(DISCORD_TOKEN);
