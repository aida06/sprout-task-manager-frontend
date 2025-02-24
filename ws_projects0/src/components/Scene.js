import Phaser from 'phaser';

export default class Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneKey' });

        this.storeItems = [];    // 从后端获取的物品数据
        this.typeButtons = [];   // 标签按钮数组
        this.itemElements = [];  // 存放当前显示的物品相关对象（背景、文字、sprite等）

        this.ghostSprite = null;   // 当前残影
        this.placingItem = null;   // 当前要放置的物品数据
        this.isPlacing = false;  // 是否正在放置模式

    }

    preload() {
        // 加载 Tiled Tileset 图片
        this.load.image('water_tileset', '/src/assets/tilesets/Water.png');
        this.load.image('grass_tileset', '/src/assets/tilesets/Grass_tiles_v2.png');

        // 加载 Tiled JSON 地图
        this.load.tilemapTiledJSON('backgroundMap', '/src/assets/maps/background1.tmj');

        // 加载UI
        this.load.spritesheet('buttons', '/src/assets/UI/SquareButtons26x19.png', {
            frameWidth: 48,   // 计算得出，每个按钮宽 32px
            frameHeight: 32    // 每个按钮高 32px
        });

        this.load.spritesheet('panel', '/src/assets/UI/Settingmenu.png', {
            frameWidth: 128,   // 计算得出，每个按钮宽 32px
            frameHeight: 144    // 每个按钮高 32px
        });

        // 加载Sprite
        this.load.spritesheet('cow', '/src/assets/sprites/Free Cow Sprites.png', {
            frameWidth: 32,  // 每帧宽度
            frameHeight: 32  // 每帧高度
        });

        this.load.spritesheet('chicken', '/src/assets/sprites/Free Chicken Sprites.png', {
            frameWidth: 16,  // 每帧宽度
            frameHeight: 16  // 每帧高度
        });

        this.load.spritesheet('waterWell', '/src/assets/sprites/Water well.png', {
            frameWidth: 32,  // 每帧宽度
            frameHeight: 32  // 每帧高度
        });

    }


    create() {
        this.createMap();
        this.createSprite();
        //this.createAnimation();
        // this.createStore();

        this.createStoreUI();

        // 异步获取后端数据，然后根据数据生成商店UI
        this.loadStoreData();

        // 全局监听 pointermove: 让 ghostSprite 跟随鼠标
        this.input.on('pointermove', (pointer) => {
            // console.log('pointer move:', pointer.x, pointer.y);
            // console.log(this.ghostSprite)
            if (this.ghostSprite) {
                this.ghostSprite.x = pointer.x;
                this.ghostSprite.y = pointer.y;
                // console.log(this.ghostSprite.x, this.ghostSprite.y)
            }
        });

        // // 全局监听 pointerdown: 左键放置 / 右键取消
        // this.input.on('pointerdown', (pointer) => {
        //     // 若没有在“放置模式”，直接 return
        //     if (!this.isPlacing) return;
        //
        //     if (pointer.button === 2) {  // 右键 ⇒ 取消
        //         console.log('Cancel placing item');
        //         this.cancelPlacingItem();
        //         return;
        //     }
        //
        //     if (pointer.button === 0) {  // 左键 ⇒ 放置
        //         console.log('Placing item at:', pointer.x, pointer.y);
        //         this.placeItem(pointer.x, pointer.y, this.placingItem);
        //     }
        // });


        this.input.mouse.disableContextMenu();  // 禁用右键菜单

    }

    createMap() {
        // 读取 Tiled JSON 地图
        const map = this.make.tilemap({ key: 'backgroundMap' });

        // 绑定 Tileset（名称要和 `tmj` 里的 Tileset 名称一致）
        const waterTileset = map.addTilesetImage('Water', 'water_tileset');
        const grassTileset = map.addTilesetImage('GrassV2', 'grass_tileset');

        // 创建图层（名称要和 `tmj` 里的一致）
        const waterLayer = map.createLayer('water1', waterTileset, 0, 0);
        const grassLayer = map.createLayer('grass1', grassTileset, 0, 0);

        // **放大缩放**
        waterLayer.setScale(3);
        grassLayer.setScale(3);
    }

    createAnimation() {
        this.anims.create({
            key: 'walk',   // 动画名称
            frames: this.anims.generateFrameNumbers('cow', { start: 0, end: 4 }), // 从第0帧到第4帧
            frameRate: 10, // 播放速度（每秒10帧）
            repeat: -1     // 无限循环
        });
    }

    createSprite() {
        this.cow = this.add.sprite(200, 200, 'cow').setScale(2); // 位置 (200,200)
        // this.cow.play('walk'); // 让小牛播放动画

        // this.cow.setInteractive({ draggable: true });
        // this.input.setDraggable(this.cow);
        //
        // this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        //     gameObject.x = dragX;
        //     gameObject.y = dragY;
        // });

        this.waterWell = this.add.sprite(200, 300, 'waterWell').setScale(2); // 位置 (200,200)

        this.cow = this.add.sprite(300, 200, 'chicken').setScale(2); // 位置 (200,200)

    }



    /**
     * 1. 创建商店面板和“Store”按钮
     */
    createStoreUI() {
        // 创建 Store 按钮
        this.storeButton = this.add.image(1420, 20, 'buttons', 4)
            .setScale(3, 2)
            .setInteractive()
            .on('pointerdown', () => this.toggleStorePanel())
            .on('pointerover', () => {
            this.storeButton.setTint(0xFFECB3);  // 浅棕色
        })
            .on('pointerout', () => {
                this.storeButton.clearTint();
            });

        // 添加 Store 文字
        this.storeText = this.add.text(1420, 18, 'Store', {fontFamily:'"Comic Sans MS", cursive', fontSize: '18px', fill: '#6D4C41' })
            .setOrigin(0.5);

        // 创建 Store 面板（默认隐藏）
        this.storePanel = this.add.image(1350, 155, 'panel', 1)
            .setScale(3.5, 2)
            .setVisible(false);
    }

    /**
     * 2. 切换商店面板的可见性
     */
    toggleStorePanel() {
        const isVisible = !this.storePanel.visible;
        this.storePanel.setVisible(isVisible);

        // 隐藏或显示类型按钮
        this.typeButtons.forEach(tab => {
            tab.bg.setVisible(isVisible);
            tab.text.setVisible(isVisible);
        });

        // 关闭时清除所有商品
        if (!isVisible) {
            this.clearItemElements();
        } else {
            // 重新打开时，默认选中第一个 Tab
            if (this.typeButtons.length > 0) {
                this.activateTab(this.typeButtons[0].type);  // 重新默认选中第一个 type
            }
        }
    }


    /**
     * 3. 从后端获取商店物品数据
     */
    async loadStoreData() {
        try {
            const response = await fetch("http://localhost:8080/storeItems");
            this.storeItems = await response.json();  // 得到 [{ itemId, itemName, itemType, itemSprite, itemPrize }, ...]

            // 构建标签（Tab）按钮
            this.createTypeTabs();
        } catch (error) {
            console.error('加载商店数据失败:', error);
        }
    }

    /**
     * 4. 动态生成「物品类型」Tab 按钮，比如“Animal”、“Plant”、“Building”等
     */
    createTypeTabs() {
        const uniqueTypes = [...new Set(this.storeItems.map(item => item.itemType))];

        let startX = 1235;
        let startY = 70;
        let gapX = 110;

        uniqueTypes.forEach((type, index) => {
            let tabBg = this.add.rectangle(startX + index * gapX, startY, 100, 30, 0xFFFDE7)
                .setStrokeStyle(1, 0x8D6E63)
                .setInteractive()
                .on('pointerdown', () => {
                    this.activateTab(type);
                })
                .on('pointerover', () => {
                    if (tabBg.fillColor !== 0xFFF59D) {  // 不是选中的时候才变颜色
                        tabBg.setFillStyle(0xFFF9C4);  // 浅黄色
                    }
                })
                .on('pointerout', () => {
                    if (tabBg.fillColor !== 0xFFF59D) {
                        tabBg.setFillStyle(0xFFFDE7);  // 恢复原色
                    }
                })
                .setVisible(false); // 默认隐藏

            let tabText = this.add.text(startX + index * gapX, startY, type, {
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '16px',
                fill: '#6D4C41',
                // fontStyle: 'bold'
            })
                .setOrigin(0.5)
                .setVisible(false); // 默认隐藏

            this.typeButtons.push({ bg: tabBg, text: tabText, type });
        });

        // 默认选中第一个
        if (uniqueTypes.length > 0) {
            this.activateTab(uniqueTypes[0]);
        }
    }


    activateTab(selectedType) {
        // 遍历所有 Tab，更新选中状态
        this.typeButtons.forEach(tab => {
            if (tab.type === selectedType) {
                tab.bg.fillColor = 0xFFF59D; // 选中状态（深色）
                tab.text.setColor('#6D4C41').setFontStyle('normal');
            } else {
                tab.bg.fillColor = 0xFFFDE7; // 非选中状态（浅色）
                tab.text.setColor('#795548').setFontStyle('normal');
            }
        });

        // 更新显示的物品
        this.showItemsByType(selectedType);
    }


    /**
     * 5. 根据选中的物品类型，在商店面板里排布对应的物品
     */
    showItemsByType(selectedType) {
        this.clearItemElements();
        if (!this.storePanel.visible) return;

        const filteredItems = this.storeItems.filter(i => i.itemType === selectedType);

        let startX = 1235;
        let startY = 135;
        let gapX = 100;
        let gapY = 80;
        let colCount = 2;

        filteredItems.forEach((item, idx) => {
            let col = idx % colCount;
            let row = Math.floor(idx / colCount);
            let x = startX + col * gapX;
            let y = startY + row * gapY;

            // **创建一个 Container 统一管理所有元素**
            let itemContainer = this.add.container(x, y);
            this.itemElements.push(itemContainer);

            // **1) 方形背景**
            let bgRect = this.add.rectangle(0, 0, 80, 80, 0xFFFDE7)
                .setOrigin(0.5)
                .setStrokeStyle(1, 0x8D6E63);

            // **2) 物品名称**
            let nameText = this.add.text(0, 53, item.itemName, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);

            // **3) 物品 Sprite**
            let sprite = this.add.sprite(0, -8, item.itemSprite).setScale(1.5);

            // **4) 物品价格**
            let priceText = this.add.text(0, 28, `💰${item.itemPrize}`, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);

            // **将所有元素加入 Container**
            itemContainer.add([bgRect, nameText, sprite, priceText]);

            // **让整个物品框可交互**
            itemContainer.setSize(80, 80);
            itemContainer.setInteractive()
                .on('pointerdown', () => this.startPlacingItem(item))
                .on('pointerover', () => bgRect.setFillStyle(0xFFF59D)) // 高亮
                .on('pointerout', () => bgRect.setFillStyle(0xFFFDE7));  // 还原

            this.itemElements.push(itemContainer);
        });
    }



    // 点击商店中的某个物品，进入放置模式
    startPlacingItem(item) {
        if (this.isPlacing) return;

        console.log('Starting placing mode for:', item.itemSprite);

        this.placingItem = item;
        this.isPlacing = true;

        // **创建残影 sprite**
        this.ghostSprite = this.add.sprite(this.input.x, this.input.y, item.itemSprite)
            .setAlpha(0.5)
            .setScale(2);

        console.log('ghostSprite created at:', this.ghostSprite.x, this.ghostSprite.y);

        // **添加键盘提示文本**
        this.ghostText = this.add.text(this.ghostSprite.x, this.ghostSprite.y + 40, ' Press Q: place  W: cancel', {
            fontFamily:'"Comic Sans MS", cursive',
            fontSize: '15px',
            fill: '#37474F',
            align: 'center',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5);

        // **让提示文本也跟随鼠标**
        this.input.on('pointermove', (pointer) => {
            if (this.ghostSprite) {
                this.ghostSprite.x = pointer.x;
                this.ghostSprite.y = pointer.y;
                this.ghostText.x = pointer.x;
                this.ghostText.y = pointer.y + 40;
            }
        });

        // **绑定键盘监听**
        this.input.keyboard.on('keydown-Q', this.confirmPlacement, this);
        this.input.keyboard.on('keydown-W', this.cancelPlacingItem, this);
    }


// **按 Q 确认放置**
    confirmPlacement() {
        if (!this.isPlacing) return;

        console.log('Placing item at:', this.ghostSprite.x, this.ghostSprite.y);
        this.placeItem(this.ghostSprite.x, this.ghostSprite.y);
    }

// **确认放置**
    placeItem(x, y) {
        if (!this.placingItem) return;

        console.log('Attempting to place:', this.placingItem.itemName, 'at', x, y);

        this.add.sprite(x, y, this.placingItem.itemSprite).setScale(2);
        console.log('Item placed at:', x, y);

        this.cancelPlacingItem();
    }

// **按 W 取消放置**
    cancelPlacingItem() {
        if (this.ghostSprite) {
            this.ghostSprite.destroy();
            this.ghostSprite = null;
        }
        if (this.ghostText) {
            this.ghostText.destroy();
            this.ghostText = null;
        }

        this.placingItem = null;
        this.isPlacing = false;

        // **移除键盘监听**
        this.input.keyboard.off('keydown-Q', this.confirmPlacement, this);
        this.input.keyboard.off('keydown-W', this.cancelPlacingItem, this);
    }




    /**
     * 6. 清除上一次显示的物品网格（避免重复堆叠）
     */
    clearItemElements() {
        this.itemElements.forEach(elem => elem.destroy());  // 删除所有物品元素
        this.itemElements = [];
    }


}

