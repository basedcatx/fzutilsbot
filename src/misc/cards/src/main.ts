import Konva from "konva";

    const REGISTRY_THEME = {
      width: 700,
      height: 750,
      bgCard: '#0F1316',       // Deep grey panel fill
      neonCyan: '#00D2FF',     // Accent teal info text
      neonRed: '#FF3B47',      // Rank #1 unique high alert accent
      textMuted: '#5F7582',    // Label gray
      textWhite: '#FFFFFF',
    };

    const stage = new Konva.Stage({
      container: 'app',
      width: REGISTRY_THEME.width,
      height: REGISTRY_THEME.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    layer.add(new Konva.Rect({
      width: REGISTRY_THEME.width,
      height: REGISTRY_THEME.height,
      fill: '#080B0D'
    }));

    const registryHeader = new Konva.Group({ x: 50, y: 40 });

    registryHeader.add(new Konva.Text({
      text: 'GANG_MEMBERS_REGISTRY //',
      fontSize: 12, fontStyle: 'bold', fill: REGISTRY_THEME.neonCyan, tracking: 2
    }));

    registryHeader.add(new Konva.Text({
      text: 'CYBER_KINGS', x: 0, y: 22,
      fontSize: 44, fontStyle: 'bold', fill: REGISTRY_THEME.textWhite
    }));

    registryHeader.add(new Konva.Text({
      text: '■ MEMBERS: 25   ■ TOTAL MESSAGES: 1.2M', x: 0, y: 80,
      fontSize: 11, fontStyle: 'bold', fill: REGISTRY_THEME.textMuted, tracking: 1
    }));
    
    layer.add(registryHeader);


    const listContainer = new Konva.Group({ x: 50, y: 205 });

    async function createLeaderboardRow(yPos, rank, name, title, metricValue, isTopRank) {
      // Create a local root group for the entire row structure
      const rowGroup = new Konva.Group({ x: 0, y: yPos });

      // Determine accent colors based on rank position
      const accentColor = isTopRank ? REGISTRY_THEME.neonRed : REGISTRY_THEME.neonCyan;

      // 1. Dark solid row plate box background
      rowGroup.add(new Konva.Rect({
        width: 600,
        height: 90,
        fill: REGISTRY_THEME.bgCard,
        cornerRadius: 2
      }));

      // 2. Left side indicator strip (Red for rank 1, cyan for the rest)
      rowGroup.add(new Konva.Rect({
        width: 4,
        height: 90,
        fill: accentColor
      }));

      // 3. Large stylized italicized rank number
      rowGroup.add(new Konva.Text({
        text: rank,
        x: 20,
        y: 30,
        fontSize: 28,
        fontStyle: 'italic bold',
        fill: '#1B242C' // Blends into the dark grid background nicely
      }));

      // 4. Square Profile Avatar frame placeholder box

      await new Promise((resolve) => {
        Konva.Image.fromURL("https://cdn-icons-png.flaticon.com/128/18775/18775912.png", function (img) {
            const radius = 30
            const imageGroup = new Konva.Group({x: 75, y: 11, clipFunc: (c) => {
                c.arc(radius, radius, radius, Math.PI * 2, 0, false)
            }})

            img.width(radius * 2)
            img.height(radius * 2)
            imageGroup.add(img)
            rowGroup.add(imageGroup)
        })
        resolve(0)
      })
      rowGroup.add(new Konva.Rect({
        x: 75,
        y: 15,
        width: 60,
        height: 60,
        fill: '#1A2228',
        stroke: '#25313A',
        strokeWidth: 1,
        cornerRadius: 40
      }));

      rowGroup.add(new Konva.Text({
        text: name,
        x: 155,
        y: 26,
        fontSize: 15,
        fontStyle: 'bold',
        fill: REGISTRY_THEME.textWhite,
        tracking: 0.5
      }));

      rowGroup.add(new Konva.Text({
        text: `RANK: ${title}`,
        x: 155,
        y: 48,
        fontSize: 10,
        fontStyle: 'bold',
        fill: REGISTRY_THEME.textMuted,
        tracking: 1
      }));

      // 6. Quantitative Statistics Value Metrics (Right Aligned)
      rowGroup.add(new Konva.Text({
        text: metricValue,
        x: 430,
        y: 25,
        width: 150,
        align: 'right',
        fontSize: 20,
        fontStyle: 'bold',
        fill: accentColor
      }));

      rowGroup.add(new Konva.Text({
        text: 'COMMS_LOGGED',
        x: 430,
        y: 50,
        width: 150,
        align: 'right',
        fontSize: 9,
        fontStyle: 'bold',
        fill: REGISTRY_THEME.textMuted,
        tracking: 0.5
      }));

      return rowGroup;
    }

    const gangData = [
      { rank: '01', name: 'VOID_WALKER', title: 'OVERSEER', stats: '42.5K' },
      { rank: '02', name: 'NEON_GHOST', title: 'SPECIALIST', stats: '38.1K' },
      { rank: '03', name: 'PULSE_CODE', title: 'AGENT', stats: '31.4K' },
      { rank: '04', name: 'K1LL_SWITCH', title: 'AGENT', stats: '29.8K' },
      { rank: '05', name: 'K1LL_SWITCH', title: 'AGENT', stats: '29.8K' }
    ];

    // Build items seamlessly utilizing relative math offset chains
    gangData.forEach(async (operator, index) => {
      // The first item (index === 0) handles the critical red highlighting style
      const isTopRank = index === 0; 
      
      // Every subsequent row automatically shifts downwards by 102 pixels
      const rowItem = await createLeaderboardRow(
        index * 102, 
        operator.rank, 
        operator.name, 
        operator.title, 
        operator.stats,
        isTopRank
      );
      
      listContainer.add(rowItem);
    });

    layer.add(listContainer);

    layer.draw();