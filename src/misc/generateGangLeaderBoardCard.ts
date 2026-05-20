import Konva from "konva";
import "konva/skia-backend";
import { CARD_CONFIG, formatNumberWithK } from "./helper";

const FIRST_RANKED_IMAGE_URL =
  "https://cdn-icons-png.flaticon.com/128/2583/2583381.png";
const SECOND_RANKED_IMAGE_URL =
  "https://cdn-icons-png.flaticon.com/128/2374/2374861.png";
const THIRD_RANKED_IMAGE_URL =
  "https://cdn-icons-png.flaticon.com/128/2374/2374864.png";
const GANG_MEDAL_ICON_URL =
  "https://cdn-icons-png.flaticon.com/128/3176/3176294.png";

export async function generateGangLeaderBoardCard(
  leaderBoardData: { msgCount: number; name: string; avatarUrl: string }[],
) {
  const formatName = (name: string): string => {
    const slength = 13;
    const ncount = name.length;
    if (ncount > slength) {
      return name.substring(0, slength + 1) + "...";
    }
    return name;
  };

  const stage = new Konva.Stage({
    width: CARD_CONFIG.dimensions.cardWidth,
    height: CARD_CONFIG.dimensions.cardHeight,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const mainCard = new Konva.Rect({
    x: 0,
    y: 0,
    width: CARD_CONFIG.dimensions.cardWidth,
    height: CARD_CONFIG.dimensions.cardHeight,
    fill: CARD_CONFIG.colors.bgApp,
    cornerRadius: 24,
  });

  layer.add(mainCard);

  const podiumGroup = new Konva.Group({ x: 180, y: 150 });

  async function createPodium(
    rank: number,
    name: string,
    msgs: number,
    xPos: number,
    height: number,
    avatarUrl: string,
  ) {
    const g = new Konva.Group({ x: xPos });

    const cylinder = new Konva.Rect({
      x: 0,
      y: 180 - height,
      width: 100,
      height: height,
      fill: CARD_CONFIG.colors.bgBadge,
      opacity: 1,
      cornerRadius: [10, 10, 0, 0],
    });
    g.add(cylinder);

    await new Promise((resolve) => {
      Konva.Image.fromURL(avatarUrl, function (img) {
        const size = 55;
        const radius = size / 2;

        const imageGroup = new Konva.Group({
          x: 24,
          y: 123 - height,
          width: size,
          height: size,
          clipFunc: (ctx) => {
            ctx.arc(radius, radius, radius, Math.PI * 2, 0);
          },
        });

        img.width(size);
        img.height(size);

        // 3. Nest your elements
        imageGroup.add(img);
        g.add(imageGroup);

        resolve(0);
      });
    });

    // Name Text
    const nameTxt = new Konva.Text({
      text: formatName(name),
      x: -10,
      y: 65 - height,
      width: 120,
      align: "center",
      fontSize: 14,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    });

    const xpPill = new Konva.Rect({
      x: 15,
      y: 85 - height,
      width: 70,
      height: 35,
      cornerRadius: 10,
      fill: CARD_CONFIG.colors.bgBadge,
    });

    const xpTxt = new Konva.Text({
      text: `${msgs}K messages`,
      x: 15,
      y: 90 - height,
      width: 70,
      align: "center",
      fontSize: 11,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    });

    const getRankIcon = (): string => {
      if (rank === 0) return FIRST_RANKED_IMAGE_URL;
      if (rank === 1) return SECOND_RANKED_IMAGE_URL;
      return THIRD_RANKED_IMAGE_URL;
    };

    await new Promise((resolve) => {
      Konva.Image.fromURL(getRankIcon(), function (img) {
        // 1. Create the container group
        const size = 30;
        const radius = size / 2;

        const imageGroup = new Konva.Group({
          x: 38,
          y: 180 - height + 10,
          width: size,
          height: size,
          clipFunc: (ctx) => {
            ctx.arc(radius, radius, radius, Math.PI * 2, 0);
          },
        });

        img.width(size);
        img.height(size);

        // 3. Nest your elements
        imageGroup.add(img);
        g.add(imageGroup);

        resolve(0);
      });
    });

    g.add(nameTxt, xpPill, xpTxt);
    return g;
  }

  // Render 1st, 2nd, and 3rd place columns
  const rank2 = await createPodium(
    1,
    leaderBoardData[1]!.name,
    leaderBoardData[1]!.msgCount,
    0,
    100,
    leaderBoardData[1]!.avatarUrl,
  );

  const rank1 = await createPodium(
    0,
    leaderBoardData[0]!.name,
    leaderBoardData[0]!.msgCount,
    130,
    140,
    leaderBoardData[0]!.avatarUrl,
  );

  const rank3 = await createPodium(
    2,
    leaderBoardData[2]!.name,
    leaderBoardData[2]!.msgCount,
    260,
    65,
    leaderBoardData[2]!.avatarUrl,
  );

  podiumGroup.add(rank2, rank1, rank3);
  layer.add(podiumGroup);

  // --- 3. Leaderboard List Rows Component ---
  const listGroup = new Konva.Group({ x: 40, y: 360 });

  async function createListRow(
    yPos: number,
    rank: number,
    name: string,
    nmsgs: number,
  ) {
    const row = new Konva.Group({ x: 0, y: yPos });

    // Row background strip
    const bg = new Konva.Rect({
      width: 620,
      height: 48,
      fill: CARD_CONFIG.colors.bgBadge,
      opacity: 0.8,
    });

    row.add(bg);
    // Rank Bubble
    const rankCircle = new Konva.Circle({
      x: 25,
      y: 24,
      radius: 12,
      fill: CARD_CONFIG.colors.bgBadge,
      stroke: CARD_CONFIG.colors.accentPrimary,
      strokeWidth: 1,
    });
    const rankTxt = new Konva.Text({
      text: rank.toString(),
      x: 15,
      y: 19,
      width: 20,
      align: "center",
      fontSize: 11,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    });

    await new Promise((resolve) => {
      Konva.Image.fromURL(GANG_MEDAL_ICON_URL, function (img) {
        const size = 25,
          radius = size / 2;

        const imageGroup = new Konva.Group({
          x: 65,
          y: 13,
          width: size,
          height: size,
          clipFunc: (ctx) => {
            ctx.arc(radius, radius, radius, Math.PI * 2, 0, false);
          },
        });
        img.width(size);
        img.height(size);
        imageGroup.add(img);
        row.add(imageGroup);
        resolve(0);
      });
    });

    const nameTxt = new Konva.Text({
      text: formatName(name),
      x: 95,
      y: 16,
      fontSize: 15,
      fill: CARD_CONFIG.colors.textWhite,
    });
    const xpTxt = new Konva.Text({
      text: `${formatNumberWithK(nmsgs)} MSGS`,
      x: 560,
      y: 12,
      width: 50,
      align: "center",
      fontSize: 13,
      fontStyle: "italic",
      fill: CARD_CONFIG.colors.accentPrimary,
    });

    row.add(rankCircle, rankTxt, nameTxt, xpTxt);
    return row;
  }

  for (let i = 0; i < leaderBoardData.slice(3).length; i++) {
    const player = leaderBoardData[i]!;
    const rowItem = await createListRow(
      i * 54,
      i + 4,
      player.name,
      player.msgCount,
    );
    listGroup.add(rowItem);
  }

  layer.add(listGroup);
  layer.draw();

  return stage.toDataURL({ mimeType: "image/png", quality: 2 });
}

const testLeaderBoardData = [
  {
    msgCount: 12345,
    name: "ShadowStriker",
    avatarUrl: "https://i.pravatar.cc/150?img=1", // Placeholder avatar
  },
  {
    msgCount: 9876,
    name: "NightHawk",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
  },
  {
    msgCount: 5432,
    name: "CrimsonViper",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  },
  {
    msgCount: 2100,
    name: "GhostRider",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
  },
  {
    msgCount: 875,
    name: "DarkPhoenix",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
];

console.log(await generateGangLeaderBoardCard(testLeaderBoardData));
