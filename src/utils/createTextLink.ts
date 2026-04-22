import Phaser from 'phaser';

type TextLinkOptions = {
    fontSize?: number;
    color?: string;
    backgroundHeight?: number;
    backgroundPaddingX?: number;
    minBackgroundWidth?: number;
    lineSpacing?: number;
    underlineOffsetY?: number;
    underlineThickness?: number;
    underlineWidthPadding?: number;
};

const createTextLink = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    options: TextLinkOptions = {},
) => {
    const textColor = options.color ?? '#ffffff';
    const underlineOffsetY = options.underlineOffsetY ?? 16;
    const underlineThickness = options.underlineThickness ?? 4;
    const text = scene.add.text(0, 0, label.toUpperCase(), {
        fontFamily: 'Bushiroad',
        fontSize: `${options.fontSize ?? 42}px`,
        color: textColor,
        align: 'center',
    });
    text.setOrigin(0.5);
    text.setLineSpacing(options.lineSpacing ?? 0);

    const underline = scene.add.rectangle(
        0,
        text.height / 2 + underlineOffsetY,
        text.width + (options.underlineWidthPadding ?? 18),
        underlineThickness,
        Phaser.Display.Color.HexStringToColor(textColor).color,
    );
    underline.setOrigin(0.5);

    const hitWidth = Math.max(text.width + (options.backgroundPaddingX ?? 48), options.minBackgroundWidth ?? 0);
    const hitTop = -text.height / 2 - 12;
    const hitBottom = text.height / 2 + underlineOffsetY + underlineThickness / 2 + 12;
    const hitHeight = options.backgroundHeight ?? Math.max(hitBottom - hitTop, 72);
    const hitCenterY = (hitTop + hitBottom) / 2;
    const hitArea = scene.add.zone(0, hitCenterY, hitWidth, hitHeight);
    const container = scene.add.container(x, y, [hitArea, underline, text]);
    container.setSize(hitWidth, hitHeight);

    hitArea.setOrigin(0.5);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerup', onClick);

    return container;
};

export default createTextLink;
