import Konva from "konva";
import "konva/skia-backend";

import { CARD_CONFIG, formatNumberWithK } from "./helper";

export async function generateGangProfileCard({
  avatarUrl,
  msgs,
  name,
  gang,
  rank,
  daysInGang,
}: {
  avatarUrl: string;
  name: string;
  gang: { totalMessages: number; name: string };
  rank: number;
  daysInGang: number;
  msgs: number[]; // [all_time, today]
}) {
  const stage = new Konva.Stage({
    width: CARD_CONFIG.dimensions.modalWidth,
    height: CARD_CONFIG.dimensions.modalHeight,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  const frameGroup = new Konva.Group({ x: 0, y: 0 });
  frameGroup.add(
    new Konva.Rect({
      width: 900,
      height: 520,
      fill: CARD_CONFIG.colors.bgApp,
    }),
  );

  const topLeftCorner = new Konva.Path({
    x: 25,
    y: 25,
    data: "M0 20 V0 H20",
    stroke: CARD_CONFIG.colors.accentPrimary,
    strokeWidth: 2,
  });

  const bottomRightCorner = new Konva.Path({
    x: 900 - 25,
    y: 520 - 25,
    data: "M0 20 V0 H20",
    stroke: CARD_CONFIG.colors.accentPrimary,
    strokeWidth: 2,
    rotation: 180,
  });

  frameGroup.add(topLeftCorner, bottomRightCorner);

  layer.add(frameGroup);

  const operatorGroup = new Konva.Group({ x: 100, y: 85 });

  try {
    await new Promise((resolve) => {
      Konva.Image.fromURL(avatarUrl, function (img) {
        const radius = 50;
        const imageGroup = new Konva.Group({
          y: -40,
          x: -40,
          clipFunc: (c) => {
            c.arc(radius, radius, radius, Math.PI * 2, 0, false);
          },
        });
        img.width(radius * 2);
        img.height(radius * 2);
        imageGroup.add(img);
        operatorGroup.add(imageGroup, img);
      });
      resolve(0);
    });
  } catch (err) {}

  operatorGroup.add(
    new Konva.Rect({
      x: -20,
      y: -35,
      width: 80,
      height: 80,
      cornerRadius: 40,
      fill: CARD_CONFIG.colors.bgCardElevated,
    }),
  );

  operatorGroup.add(
    new Konva.Text({
      text: name,
      x: 80,
      y: -20,
      fontSize: 22,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    }),
  );

  operatorGroup.add(
    new Konva.Text({
      text: gang.name,
      x: 80,
      y: 10,
      fontSize: 12,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
    }),
  );

  layer.add(operatorGroup);

  const rankGroup = new Konva.Group({ x: 450, y: 260 });

  const rankNum = new Konva.Text({
    text: rank.toLocaleString(),
    x: -100,
    y: -65,
    fontSize: 100,
    fontStyle: "bold",
    fill: CARD_CONFIG.colors.textWhite,
    tracking: 1,
  });

  rankGroup.add(
    new Konva.Text({
      text: "F R I E N D Z O N E",
      x: -30,
      y: -50,
      rotation: 90,
      fontSize: 10,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textMuted,
      tracking: 4,
    }),
  );

  rankGroup.add(rankNum);

  rankGroup.add(
    new Konva.Text({
      text: "#",
      x: -130,
      y: -45,
      fontSize: 26,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
    }),
  );

  rankGroup.add(
    new Konva.Text({
      text: "GANG RANK",
      x: -100,
      y: 60,
      width: 200,
      align: "center",
      fontSize: 12,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.accentPrimary,
      tracking: 6,
    }),
  );

  layer.add(rankGroup);

  const statsGroup = new Konva.Group({ x: 50, y: 380 });

  function createDataCol(
    xPos: number,
    title: string,
    value: string,
    unit: string,
  ) {
    const g = new Konva.Group({ x: xPos });

    // Vertical line indicator
    g.add(
      new Konva.Rect({
        width: 3,
        height: 60,
        fill: CARD_CONFIG.colors.accentPrimary,
      }),
    );

    g.add(
      new Konva.Text({
        text: title,
        x: 20,
        y: 12,
        width: 150,
        fontSize: 10,
        fontStyle: "bold",
        fill: CARD_CONFIG.colors.textMuted,
      }),
    );

    const valText = new Konva.Text({
      text: value,
      x: 20,
      y: 32,
      fontSize: 24,
      fontStyle: "bold",
      fill: CARD_CONFIG.colors.textWhite,
    });
    g.add(valText);

    g.add(
      new Konva.Text({
        text: unit,
        x: 25 + valText.getTextWidth(),
        y: 42,
        fontSize: 11,
        fontStyle: "bold",
        fill: CARD_CONFIG.colors.accentPrimary,
      }),
    );

    return g;
  }

  statsGroup.add(
    createDataCol(
      0,
      "ALL TIME MSGS CONTRIBUTED",
      formatNumberWithK(msgs[0] ?? 0),
      "MGS",
    ),
  );
  statsGroup.add(
    createDataCol(
      280,
      "TODAY MSGS CONTRIBUTED",
      formatNumberWithK(msgs[1] ?? 0),
      "MSGS",
    ),
  );

  function calculateProgress(ratio: number, days: number) {
    const c = 0.0153;
    const percentage = 100 * (1 - Math.exp(-c * ratio * days));
    return Math.max(Math.min(percentage - 0.05 * days, 100), 0).toFixed(2);
  }

  statsGroup.add(
    createDataCol(
      280 * 2,
      "GANG LOYALTY PERCENT",
      calculateProgress(
        (msgs[0] ?? 0) / gang.totalMessages,
        daysInGang,
      ).toString() + "%",
      "INTEGRITY",
    ),
  );

  layer.add(statsGroup);

  layer.draw();
  return stage.toDataURL({ quality: 2 });
}

const mockGangProfileCards = [
  {
    name: "X",
    avatarUrl: "https://cdn-icons-png.flaticon.com/128/19038/19038312.png",
    gang: {
      name: "Cyber Phantoms",
      totalMessages: 32150,
    },
    rank: 3,
    daysInGang: 60, // Exactly 2 months (Hit that 60% loyalty milestone!)
    msgs: [4200, 85],
  },
  {
    name: "GhostRunner",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ghost",
    gang: {
      name: "Shadow Syndicate",
      totalMessages: 54200,
    },
    rank: 14,
    daysInGang: 15,
    msgs: [450, 12],
  },
  {
    name: "NeonSamurai_X",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Neon",
    gang: {
      name: "The Gridlock Protocol", // Long name to test UI text wrapping/overflow
      totalMessages: 105000,
    },
    rank: 42,
    daysInGang: 2, // Fresh recruit
    msgs: [35, 35],
  },
];

console.log(await generateGangProfileCard(mockGangProfileCards[0]!));
