const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const CHANNEL_IDS = {
  low: '1508563482927173662',
  high: '1508563501533237278',
  og: '1508563513038078063',
  best: '1508563513038078063'
};

const LOW_BRAINROTS = [
  'Tung Tung Tung Sahur', 'Ketupat Kepat', 'Buho de Volto',
  'Los Mariachis', 'Gym Bros', 'Los Chillis', 'Ketchuru and Musturu',
  'Chicleteira Bicicleteira', 'Nacho Spyder', 'Cigno Fulgoro',
  'Los Amigos', 'DJ Panda', 'Tacorillo Crocodillo', 'Paradiso Axolottino',
  'Serafinna Medusella', 'Los Mobilis', 'Mieteteira Bicicleteira'
];

const HIGH_BRAINROTS = [
  'Dragon Cannelloni', 'Dragon Gingerini', 'Griffin', 'Spaghetti Tualetti',
  'Garama and Madundung', 'Los Bros', 'Hydra Dragon Cannelloni',
  'Cash or Card', 'Globa Steppa', 'La Supreme Combinasion',
  'Foxini Lanternini', 'Celestial Pegasus', 'Ventoliero Pavonero',
  'Capitano Moby', 'Cerberus'
];

const OG_BRAINROTS = [
  'Strawberry Elephant', 'Meowl', 'Skibidi Toilet', 'Headless Horseman'
];

const BEST_BRAINROTS = [
  'Strawberry Elephant', 'Meowl', 'Skibidi Toilet'
];

const ALL_BRAINROTS = [...LOW_BRAINROTS];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomServerId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function formatBps(bps) {
  if (bps >= 1000) return `$${(bps / 1000).toFixed(1)}B/s`;
  return `$${bps.toFixed(1)}M/s`;
}

function getExtraBrainrots(main) {
  const count = randomBetween(2, 5);
  const pool = ALL_BRAINROTS.filter(b => b !== main);
  const picked = [];
  while (picked.length < count) {
    const b = randomChoice(pool);
    if (!picked.includes(b)) picked.push(b);
  }
  return picked;
}

async function getBrainrotImage(name) {
  try {
    const pageName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
    const url = `https://stealabrainrot.fandom.com/api.php?action=query&titles=${pageName}&prop=pageimages&format=json&pithumbsize=300`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function sendLog(channelId, brainrotList, bpsMin, bpsMax, color) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;

  const brainrot = randomChoice(brainrotList);
  const bps = randomBetween(bpsMin, bpsMax);
  const players = randomBetween(1, 8);
  const id = randomServerId();

  const image = await getBrainrotImage(brainrot);

  const extras = getExtraBrainrots(brainrot);
  const extraLines = extras.map(b => {
    const extraBps = randomBetween(10, 99);
    return `${b} | ${formatBps(extraBps)}`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🧠 Brainrot Notify')
    .addFields(
      { name: '🏷️ Name', value: brainrot, inline: true },
      { name: '💰 Money per sec', value: formatBps(bps), inline: true },
      { name: '👥 Players', value: `${players}/8`, inline: true },
      { name: '🟢 All Brainrots (>5m/s)', value: `\`\`\`\n${brainrot} | ${formatBps(bps)}\n${extraLines}\n\`\`\`` }
    )
    .setFooter({ text: `Server ID: ${id} • Shadow Notifier` })
    .setTimestamp();

  if (image) embed.setThumbnail(image);
  channel.send({ embeds: [embed] });
}

function scheduleRandom(fn, minMs, maxMs) {
  const delay = randomBetween(minMs, maxMs);
  setTimeout(() => {
    fn();
    scheduleRandom(fn, minMs, maxMs);
  }, delay);
}

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} online`);

  scheduleRandom(() => sendLog(CHANNEL_IDS.low, LOW_BRAINROTS, 50, 99, 0x5865f2), 4000, 7000);
  scheduleRandom(() => sendLog(CHANNEL_IDS.high, HIGH_BRAINROTS, 50, 399, 0x00ff99), 8000, 8000);
  setInterval(() => sendLog(CHANNEL_IDS.og, OG_BRAINROTS, 450, 999, 0xff4500), 47 * 60 * 1000);
  setInterval(() => sendLog(CHANNEL_IDS.best, BEST_BRAINROTS, 1000, 9999, 0xffd700), 3 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);