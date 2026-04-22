import { Scene } from 'phaser';
import config, {
    getStoredStars,
    hasEmmaCharmUpgrade,
    hasFamiliarRouteUpgrade,
    hasTripleJumpUpgrade,
    setStoredStars,
    unlockEmmaCharmUpgrade,
    unlockFamiliarRouteUpgrade,
    unlockTripleJumpUpgrade,
} from '../../utils/config';
import { EventBus } from '../EventBus';

type ShopItemId = 'triple_jump' | 'emma_charm' | 'familiar_route' | 'lucky_charm' | 'feather_cape';

type ShopItemConfig = {
    id: ShopItemId;
    title: string;
    subtitle: string;
    price: number;
    available: boolean;
};

type ShopCardDisplay = {
    title: string;
    subtitle: string;
};

const SHOP_ITEMS: ShopItemConfig[] = [
    {
        id: 'triple_jump',
        title: '三连跳',
        subtitle: '希罗刻苦训练后，\n解锁了三连跳',
        price: 100,
        available: true,
    },
    {
        id: 'emma_charm',
        title: '艾玛护符',
        subtitle: '每局首次受击时\n护盾破碎免死',
        price: 160,
        available: true,
    },
    {
        id: 'familiar_route',
        title: '轻车熟路',
        subtitle: '开局直达50秒难度\n计时也+50秒',
        price: 120,
        available: true,
    }
];

const SHOP_FONT = 'Xiaolai';

export class Shop extends Scene {
    stars: number;

    constructor() {
        super('Shop');
    }

    create() {
        const centerX = config.gameWidth / 2;
        const centerY = config.gameHeight / 2;
        this.stars = getStoredStars();

        this.add.image(centerX, centerY, 'background').setDisplaySize(config.gameWidth, config.gameHeight);
        this.add.rectangle(centerX, centerY, config.gameWidth, config.gameHeight, 0x100f12, 0.56);

        this.add.text(centerX, 108, 'SHOP', {
            fontFamily: 'Bushiroad',
            fontSize: '86px',
            color: '#f3e8cd',
        }).setOrigin(0.5);

        this.createWallet(1100, 108, this.stars);
        this.createCards(centerX, centerY + 30);

        this.createBackLink(140, config.gameHeight - 74);

        EventBus.emit('current-scene-ready', this);
    }

    createWallet(x: number, y: number, stars: number) {
        const chip = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 182, 78, 0x151417, 0.84);
        bg.setStrokeStyle(1, 0xf3e8cd, 0.28);
        bg.setOrigin(0.5);

        const star = this.add.image(-50, 0, 'star');
        star.setScale(0.14);
        star.setAngle(-12);

        const value = this.add.text(12, 0, `${stars}`, {
            fontFamily: 'Xiaolai',
            fontSize: '40px',
            color: '#fff4cf',
        }).setOrigin(0.5);

        chip.add([bg, star, value]);
    }

    createCards(centerX: number, y: number) {
        const gap = 34;
        const cardWidth = 270;
        const totalWidth = SHOP_ITEMS.length * cardWidth + (SHOP_ITEMS.length - 1) * gap;
        let currentX = centerX - totalWidth / 2 + cardWidth / 2;

        SHOP_ITEMS.forEach((item) => {
            const card = this.add.container(currentX, y);
            const itemState = this.getItemState(item);
            const display = this.getCardDisplay(item);

            const frame = this.add.rectangle(0, 0, cardWidth, 292, 0x121115, 0.84);
            frame.setStrokeStyle(1, 0xf3e8cd, 0.18);

            const accent = this.add.rectangle(0, -108, 194, 70, 0xc93a2f, 0.16);
            accent.setStrokeStyle(1, 0xf7c8a9, 0.28);

            const star = this.add.image(0, -110, 'star');
            star.setScale(0.13);
            star.setAngle(-8);

            const title = this.add.text(0, -20, display.title, {
                fontFamily: SHOP_FONT,
                fontSize: '30px',
                color: '#f3e8cd',
                align: 'center',
                fontStyle: '700',
                wordWrap: { width: 210 },
            }).setOrigin(0.5);

            const subtitle = this.add.text(0, 36, display.subtitle, {
                fontFamily: SHOP_FONT,
                fontSize: '22px',
                color: '#efe9dc',
                align: 'center',
                wordWrap: { width: 210 },
            }).setOrigin(0.5);

            const actionBar = this.add.rectangle(0, 108, 178, 64, this.getActionColor(itemState), 0.94);
            actionBar.setStrokeStyle(1, 0xf3e8cd, itemState === 'available' ? 0.24 : 0.12);

            const actionLabel = this.add.text(0, itemState === 'available' || itemState === 'locked' ? 94 : 108, this.getActionLabel(itemState), {
                fontFamily: SHOP_FONT,
                fontSize: '20px',
                color: itemState === 'available' ? '#fff7dd' : '#d6cfbf',
                fontStyle: '700',
            }).setOrigin(0.5);

            const priceStar = this.add.image(-34, 122, 'star');
            priceStar.setScale(0.075);
            priceStar.setVisible(itemState === 'available' || itemState === 'locked');

            const price = this.add.text(20, 122, `${item.price}`, {
                fontFamily: 'Xiaolai',
                fontSize: '24px',
                color: '#fff4cf',
            }).setOrigin(0.5);
            price.setVisible(itemState === 'available' || itemState === 'locked');

            const hitArea = this.add.zone(0, 108, 178, 64).setOrigin(0.5);
            if (itemState === 'available') {
                hitArea.setInteractive({ useHandCursor: true });
                hitArea.on('pointerup', () => {
                    this.buyItem(item);
                });
            }

            card.add([frame, accent, star, title, subtitle, actionBar, priceStar, price, actionLabel, hitArea]);
            currentX += cardWidth + gap;
        });

        this.add.text(centerX, y + 220, '购买道具后，下一回合开始会生效。', {
            fontFamily: SHOP_FONT,
            fontSize: '22px',
            color: '#d9d3c5',
        }).setOrigin(0.5);
    }

    createBackLink(x: number, y: number) {
        const label = this.add.text(0, 0, 'BACK MENU', {
            fontFamily: 'Bushiroad',
            fontSize: '28px',
            color: '#f4f0d8',
        }).setOrigin(0.5);

        const underline = this.add.rectangle(0, 24, label.width + 14, 2, 0xf4f0d8).setOrigin(0.5);
        const hitArea = this.add.zone(0, 10, label.width + 28, 48).setOrigin(0.5);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerup', () => {
            this.scene.start('MainMenu');
        });

        this.add.container(x, y, [hitArea, underline, label]).setScrollFactor(0, 1);
    }

    getItemState(item: ShopItemConfig) {
        if (this.isOwned(item.id)) {
            return 'owned';
        }

        if (!item.available) {
            return 'soon';
        }

        if (this.stars < item.price) {
            return 'locked';
        }

        return 'available';
    }

    isOwned(itemId: ShopItemId) {
        if (itemId === 'triple_jump') {
            return hasTripleJumpUpgrade();
        }

        if (itemId === 'emma_charm') {
            return hasEmmaCharmUpgrade();
        }

        if (itemId === 'familiar_route') {
            return hasFamiliarRouteUpgrade();
        }

        return false;
    }

    getCardDisplay(item: ShopItemConfig): ShopCardDisplay {
        if (!item.available) {
            return {
                title: '未解锁',
                subtitle: '',
            };
        }

        return {
            title: item.title,
            subtitle: item.subtitle,
        };
    }

    getActionLabel(state: 'owned' | 'soon' | 'locked' | 'available') {
        if (state === 'owned') {
            return '已拥有';
        }

        if (state === 'soon') {
            return '未解锁';
        }

        if (state === 'locked') {
            return '星星不足';
        }

        return '购买';
    }

    getActionColor(state: 'owned' | 'soon' | 'locked' | 'available') {
        if (state === 'owned') {
            return 0x2d4d38;
        }

        if (state === 'available') {
            return 0x5f4520;
        }

        if (state === 'locked') {
            return 0x2b292f;
        }

        return 0x1f1e24;
    }

    buyItem(item: ShopItemConfig) {
        if (!item.available || this.isOwned(item.id) || this.stars < item.price) {
            return;
        }

        this.stars -= item.price;
        setStoredStars(this.stars);
        this.unlockItem(item.id);
        this.scene.restart();
    }

    unlockItem(itemId: ShopItemId) {
        if (itemId === 'triple_jump') {
            unlockTripleJumpUpgrade();
            return;
        }

        if (itemId === 'emma_charm') {
            unlockEmmaCharmUpgrade();
            return;
        }

        if (itemId === 'familiar_route') {
            unlockFamiliarRouteUpgrade();
        }
    }
}
