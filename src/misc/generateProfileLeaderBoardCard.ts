import Konva from "konva";
import "konva/skia-backend";
import { CARD_CONFIG, formatNumberWithK } from "./helper";

export async function generateProfileLeaderBoardCard({
  gang,
  members,
}: {
  gang: { name: string; msgCount: number };
  members: { name: string; msgCount: number }[];
}) {
  const stage = new Konva.Stage({
    width: CARD_CONFIG.dimensions.cardWidth,
    height: CARD_CONFIG.dimensions.cardHeight,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  layer.add(
    new Konva.Rect({
      width: CARD_CONFIG.dimensions.cardWidth,
      height: CARD_CONFIG.dimensions.cardHeight,
      fill: CARD_CONFIG.colors.bgApp,
    }),
  );

  const registryHeader = new Konva.Group({ x: 50, y: 40 });

  registryHeader.add(
    new Konva.Text({
      text: "GANG_MEMBERS_REGISTRY //",
      fontSize: 12,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
      tracking: 2,
    }),
  );

  registryHeader.add(
    new Konva.Text({
      text: gang.name,
      x: 0,
      y: 22,
      fontSize: 44,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    }),
  );

  registryHeader.add(
    new Konva.Text({
      text: `■ MEMBERS: ${members.length}   ■ TOTAL MESSAGES: ${formatNumberWithK(gang.msgCount)}`,
      x: 0,
      y: 80,
      fontSize: 11,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 1,
    }),
  );

  layer.add(registryHeader);

  const listContainer = new Konva.Group({ x: 50, y: 205 });

  async function createLeaderboardRow(
    yPos: number,
    rank: string,
    name: string,
    metricValue: number,
    isTopRank: boolean,
  ) {
    const rowGroup = new Konva.Group({ x: 0, y: yPos });

    const accentColor = isTopRank
      ? CARD_CONFIG.colors.accentSecondary
      : CARD_CONFIG.colors.accentPrimary;

    rowGroup.add(
      new Konva.Rect({
        width: 600,
        height: 90,
        fill: CARD_CONFIG.colors.bgCard,
        cornerRadius: 2,
      }),
    );

    rowGroup.add(
      new Konva.Rect({
        width: 4,
        height: 90,
        fill: accentColor,
      }),
    );

    rowGroup.add(
      new Konva.Text({
        text: rank,
        x: 20,
        y: 30,
        fontSize: 28,
        fontStyle: "italic bold",
        fill: isTopRank
          ? CARD_CONFIG.colors.accentSecondary
          : CARD_CONFIG.colors.accentPrimary,
      }),
    );

    try {
      await new Promise((resolve) => {
        Konva.Image.fromURL(
          "https://cdn-icons-png.flaticon.com/128/18775/18775912.png",
          function (img) {
            const radius = 30;
            const imageGroup = new Konva.Group({
              x: 75,
              y: 11,
              clipFunc: (c) => {
                c.arc(radius, radius, radius, Math.PI * 2, 0, false);
              },
            });

            img.width(radius * 2);
            img.height(radius * 2);
            imageGroup.add(img);
            rowGroup.add(imageGroup);
          },
        );
        resolve(0);
      });
    } catch (e) {}

    rowGroup.add(
      new Konva.Rect({
        x: 75,
        y: 15,
        width: 60,
        height: 60,
        fill: CARD_CONFIG.colors.bgCardElevated,
        stroke: CARD_CONFIG.colors.accentTertiary,
        strokeWidth: 1,
        cornerRadius: 40,
      }),
    );

    rowGroup.add(
      new Konva.Text({
        text: name,
        x: 155,
        y: 40,
        fontSize: 15,
        fontStyle: "bold",
        fill: CARD_CONFIG.colors.textWhite,
        tracking: 0.5,
      }),
    );

    rowGroup.add(
      new Konva.Text({
        text: formatNumberWithK(metricValue),
        x: 430,
        y: 32,
        width: 150,
        align: "right",
        fontSize: 20,
        fontStyle: "bold",
        fill: accentColor,
      }),
    );

    rowGroup.add(
      new Konva.Text({
        text: "MSGS_LOGGED",
        x: 430,
        y: 52,
        width: 150,
        align: "right",
        fontSize: 9,
        fontStyle: "bold",
        fill: CARD_CONFIG.colors.textMuted,
        tracking: 0.5,
      }),
    );

    return rowGroup;
  }

  for (let i = 0; i < members.length; i++) {
    const operator = members[i]!;
    const isTopRank = i === 0;

    const rowItem = await createLeaderboardRow(
      i * 102,
      i.toString(),
      operator.name,
      operator.msgCount,
      isTopRank,
    );

    listContainer.add(rowItem);
  }

  layer.add(listContainer);
  layer.draw();
  return stage.toDataURL({ quality: 2 });
}

const mockLeaderboardData = {
  gang: {
    name: "GANG: X",
    msgCount: 1200000, // Reflects the 1.2M total messages metric
  },
  members: [
    {
      name: "VOID_WALKER",
      msgCount: 42500, // Reflects 42.5K comms logged
    },
    {
      name: "NEON_GHOST",
      msgCount: 38100, // Reflects 38.1K comms logged
    },
    {
      name: "PULSE_CODE",
      msgCount: 31400, // Reflects 31.4K comms logged
    },
    {
      name: "K1LL_SWITCH",
      msgCount: 29800, // Reflects 29.8K comms logged
    },
    {
      name: "GHOST_SHELL",
      msgCount: 18500,
    },
  ],
};

console.log(await generateProfileLeaderBoardCard(mockLeaderboardData));
