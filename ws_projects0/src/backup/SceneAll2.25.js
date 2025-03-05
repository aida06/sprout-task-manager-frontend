import Phaser from 'phaser';
import SceneController from './SceneController.js';

export default class Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneKey' });

        this.storeItems = [];    // 从后端获取的物品数据
        this.typeButtons = [];   // 标签按钮数组
        this.itemElements = [];  // 存放当前显示的物品相关对象（背景、文字、sprite等）

        // this.ghostSprite = null;   // 当前残影
        // this.placingItem = null;   // 当前要放置的物品数据
        // this.isPlacing = false;  // 是否正在放置模式

        this.spriteMap = {};
        this.belongings = []

        this.sceneController = null;
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
        this.sceneController = new SceneController(this);

        this.createMap();
        this.createSprite();
        //this.createAnimation();
        this.createStoreUI();

        // 异步获取后端数据:顺序很重要
        this.loadStoreData();
        this.loadItemSpriteMap();
        this.loadUserBelongings(); // 加载用户物品

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

        this.input.mouse.disableContextMenu();  // 禁用右键菜单

    }

    createMap() {
        // 读取 Tiled JSON 地图
        this.map = this.make.tilemap({ key: 'backgroundMap' });

        // 绑定 Tileset（名称要和 `tmj` 里的 Tileset 名称一致）
        const waterTileset = this.map.addTilesetImage('Water', 'water_tileset');
        const grassTileset = this.map.addTilesetImage('GrassV2', 'grass_tileset');

        // 创建图层（名称要和 `tmj` 里的一致）
        this.waterLayer = this.map.createLayer('water1', waterTileset, 0, 0);
        this.grassLayer = this.map.createLayer('grass1', grassTileset, 0, 0);

        // 放大
        this.waterLayer.setScale(3.1);
        this.grassLayer.setScale(3);
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
        this.anims.create({
            key: 'walk',   // 动画名称
            frames: this.anims.generateFrameNumbers('cow', { start: 0, end: 4 }), // 从第0帧到第4帧
            frameRate: 10, // 播放速度（每秒10帧）
            repeat: -1     // 无限循环
        });
        this.cow = this.add.sprite(200, 200, 'cow').setScale(2); // 位置 (200,200)
        this.cow.play('walk'); // 让小牛播放动画

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

    // 接收 belongings 数据，并在 Phaser 场景中渲染
    loadBelongingsIntoScene(belongings) {
        belongings.forEach(item => {
            let spriteKey = this.spriteMap[item.itemId] || 'cow';
            // 创建 Phaser Sprite
            let sprite = this.add.sprite(item.locationX, item.locationY, spriteKey)
                .setScale(2)
                .setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => {
                    console.log('DB item clicked:', sprite);
                    this.sceneController.showItemOptions(sprite);
                });

            // 关键点：把“数据库记录的ID”存到 sprite 上
            // 假设后端返回字段是 item.belongingId 或 item.id
            sprite.belongingsId = item.belongingsId;

            // 如果还需要“物品类型ID”，也可以赋值
            sprite.itemId = item.itemId;
            sprite.itemPrize = item.itemPrize;
        });
    }


    async loadItemSpriteMap() {
        try {
            const response = await fetch("http://localhost:8080/storeItems/itemSpriteMap");
            const itemSpriteMap = await response.json();
            console.log("Item Sprite Map:", itemSpriteMap);

            this.spriteMap = Object.fromEntries(
                Object.entries(itemSpriteMap).map(([key, value]) => [Number(key), value])
            );
        } catch (error) {
            console.error("Failed to fetch item sprite map:", error);
        }
    }


    async loadUserBelongings() {
        try {
            const userId = localStorage.getItem("userId");
            const response = await fetch(`http://localhost:8080/userBelongings/users/${userId}`);
            this.belongings = await response.json() || [];
            console.log("User belongings loaded:", this.belongings);
            // 传给 Phaser 场景渲染
            this.loadBelongingsIntoScene(this.belongings);
        } catch (error) {
            console.error("Failed to load user belongings:", error);
            this.belongings = [];
        }
    }


    /**
     * 1. 创建商店面板和“Store”按钮
     */
    createStoreUI() {
        // 创建 Store 按钮
        this.storeButton = this.add.image(1420, 20, 'buttons', 4)
            .setScale(3, 3)
            .setInteractive({ cursor: 'pointer' })
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
            console.error('Failed to load store data:', error);
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
                .setInteractive({ cursor: 'pointer' })
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
            itemContainer.setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => this.sceneController.startPlacingItem(item))
                .on('pointerover', () => bgRect.setFillStyle(0xFFF59D)) // 高亮
                .on('pointerout', () => bgRect.setFillStyle(0xFFFDE7));  // 还原

            this.itemElements.push(itemContainer);
        });
    }

    /**
     * 6. 清除上一次显示的物品网格（避免重复堆叠）
     */
    clearItemElements() {
        this.itemElements.forEach(elem => elem.destroy());  // 删除所有物品元素
        this.itemElements = [];
    }


    // // 点击商店中的某个物品，进入放置模式
    // startPlacingItem(item) {
    //     this.clearItemOptions();
    //
    //     if (this.isPlacing) return;
    //
    //     console.log('Starting placing mode for:', item.itemSprite);
    //     this.placingItem = item;
    //     this.isPlacing = true;
    //
    //     // **创建残影 sprite**
    //     this.ghostSprite = this.add.sprite(this.input.x, this.input.y, item.itemSprite)
    //         .setAlpha(0.5)
    //         .setScale(2)
    //         .setInteractive({ cursor: 'pointer' });
    //
    //     console.log('ghostSprite created at:', this.ghostSprite.x, this.ghostSprite.y);
    //
    //     // **添加键盘提示文本**
    //     this.ghostText = this.add.text(this.ghostSprite.x, this.ghostSprite.y + 40, ' Press Q: place  W: cancel', {
    //         fontFamily:'"Comic Sans MS", cursive',
    //         fontSize: '15px',
    //         fill: '#37474F',
    //         align: 'center',
    //         padding: { x: 6, y: 2 }
    //     }).setOrigin(0.5);
    //
    //     // **让提示文本也跟随鼠标**
    //     this.input.on('pointermove', (pointer) => {
    //         if (this.ghostSprite) {
    //             this.ghostSprite.x = pointer.x;
    //             this.ghostSprite.y = pointer.y;
    //             this.ghostText.x = pointer.x;
    //             this.ghostText.y = pointer.y + 40;
    //
    //             // === 新增：判断是否在 grassLayer 上 ===
    //             const tile = this.grassLayer.getTileAtWorldXY(pointer.x, pointer.y);
    //             if (tile) {
    //                 // 在草地上，可放置
    //                 this.ghostSprite.clearTint();     // 去掉红色
    //                 // 或者改为一些可放置的颜色
    //                 // this.ghostSprite.setTint(0x00FF00);
    //             } else {
    //                 // 不在草地上，变红提示
    //                 this.ghostSprite.setTint(0xFF4530);
    //             }
    //         }
    //     });
    //
    //     // **绑定键盘监听**
    //     this.input.keyboard.on('keydown-Q', this.confirmPlacement, this);
    //     this.input.keyboard.on('keydown-W', this.cancelPlacingItem, this);
    // }
    //
    //
    // // **按 Q 确认放置**
    // confirmPlacement() {
    //     if (!this.isPlacing) return;
    //
    //     console.log('Placing item at:', this.ghostSprite.x, this.ghostSprite.y);
    //     this.placeItem(this.ghostSprite.x, this.ghostSprite.y);
    // }
    //
    // // **按 W 取消放置**
    // cancelPlacingItem() {
    //     if (this.ghostSprite) {
    //         this.ghostSprite.destroy();
    //         this.ghostSprite = null;
    //     }
    //     if (this.ghostText) {
    //         this.ghostText.destroy();
    //         this.ghostText = null;
    //     }
    //
    //     this.placingItem = null;
    //     this.isPlacing = false;
    //
    //     // **移除键盘监听**
    //     this.input.keyboard.off('keydown-Q', this.confirmPlacement, this);
    //     this.input.keyboard.off('keydown-W', this.cancelPlacingItem, this);
    // }
    //
    //
    // async placeItem(x, y) {
    //     if (!this.placingItem) return;
    //     // 仅允许在 grassLayer 上放置
    //     const tile = this.grassLayer.getTileAtWorldXY(x, y);
    //     if (!tile) {
    //         console.log('This is not grass. It\'s forbidden！');
    //         return;
    //     }
    //
    //     // 在 Phaser 场景中创建物品
    //     let newItem = this.add.sprite(x, y, this.placingItem.itemSprite).setScale(2);
    //     newItem.setInteractive({ cursor: 'pointer' })
    //         .on('pointerdown', () => {
    //             console.log('Item clicked:', newItem);
    //             this.showItemOptions(newItem);
    //         });
    //
    //     console.log('Item placed at:', x, y);
    //
    //     // === 【新增】 将物品存入数据库 ===
    //     try {
    //         const response = await fetch('http://localhost:8080/userBelongings/add', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 userId: localStorage.getItem("userId"),
    //                 itemId: this.placingItem.itemId,
    //                 locationX: x,
    //                 locationY: y
    //             })
    //         });
    //
    //         if (response.ok) {
    //             console.log("Item stored in database successfully!");
    //         } else {
    //             console.error("Failed to store item:", await response.text());
    //         }
    //     } catch (error) {
    //         console.error("Error storing item:", error);
    //     }
    //
    //     // 清除放置状态
    //     this.cancelPlacingItem();
    // }
    //
    //
    // showItemOptions(newItem) {
    //     // **如果当前按钮已经显示，并且是同一个物品，销毁它**
    //     if (this.currentItem === newItem && this.moveButton) {
    //         this.clearItemOptions();
    //         this.currentItem = null; // 重置当前选中的物品
    //         // newItem.setInteractive({ cursor: 'default' }); // 恢复鼠标指针
    //         return;
    //     }
    //
    //     // **否则，先清除可能存在的按钮，再创建新的**
    //     this.clearItemOptions();
    //     this.currentItem = newItem; // 记录当前选中的物品
    //
    //     newItem.setInteractive({ cursor: 'pointer' }); // **悬停时显示手指光标**
    //
    //     let bounds = newItem.getBounds();
    //     let optionX = bounds.centerX;
    //     let optionY = bounds.top - 10;
    //
    //     // **创建 Move 按钮**
    //     this.moveButton = this.add.rectangle(optionX - 25, optionY, 45, 30, 0xA5D6A7)
    //         .setStrokeStyle(1, 0xFFFFFF)
    //         .setInteractive({ cursor: 'pointer' }) // **按钮也设置手指光标**
    //         .on('pointerdown', () => this.sceneController.startMovingItem(newItem));
    //
    //     this.moveText = this.add.text(optionX - 25, optionY, 'Move', {
    //         fontFamily: '"Comic Sans MS", cursive',
    //         fontSize: '14px',
    //         align: 'center'
    //     }).setOrigin(0.5);
    //
    //     // **创建 Sale 按钮**
    //     this.saleButton = this.add.rectangle(optionX + 25, optionY, 45, 30, 0xEF9A9A)
    //         .setStrokeStyle(1, 0xFFFFFF)
    //         .setInteractive({ cursor: 'pointer' }) // **按钮也设置手指光标**
    //         .on('pointerdown', () => this.deleteItem(newItem));
    //
    //     this.saleText = this.add.text(optionX + 25, optionY, 'Sale', {
    //         fontFamily: '"Comic Sans MS", cursive',
    //         fontSize: '14px',
    //         align: 'center'
    //     }).setOrigin(0.5);
    // }
    //
    // // **封装：清除 Move 和 Sale 按钮**
    // clearItemOptions() {
    //     if (this.moveButton) this.moveButton.destroy();
    //     if (this.saleButton) this.saleButton.destroy();
    //     if (this.moveText) this.moveText.destroy();
    //     if (this.saleText) this.saleText.destroy();
    //
    //     // if (this.currentItem) {
    //     //     this.currentItem.setInteractive({ cursor: 'default' }); // **恢复默认鼠标**
    //     // }
    //
    //     this.moveButton = null;
    //     this.saleButton = null;
    //     this.moveText = null;
    //     this.saleText = null;
    // }
    //
    //
    // async deleteItem(item) {
    //     try {
    //         const response = await fetch(`http://localhost:8080/userBelongings/delete/${item.belongingsId}`, {
    //             method: 'DELETE'
    //         });
    //
    //         if (response.ok) {
    //             console.log("Item deleted from database!");
    //             item.destroy(); // **从 Phaser 场景移除**
    //             this.clearItemOptions(); // **移除按钮**
    //             this.currentItem = null;
    //         } else {
    //             console.error("Failed to delete item:", await response.text());
    //         }
    //     } catch (error) {
    //         console.error("Error deleting item:", error);
    //     }
    // }

    // -------------------------------------------------
// 2) startMovingItem：与startPlacingItem的区别在于：
//    - 保存的是“正在移动的Sprite”和它的belongingId
//    - confirmPlacement时走更新逻辑
// -------------------------------------------------
//     startMovingItem(sprite) {
//         this.clearItemOptions();
//
//         // 避免重复进入
//         if (this.isMoving) return;
//
//         console.log('Start moving existing item, belongingId=', sprite.belongingsId);
//
//         this.isMoving = true;
//         this.movingSprite = sprite;  // 存一下，以后要拿它的belongingId
//         this.ghostSprite = this.add.sprite(sprite.x, sprite.y, sprite.texture.key)
//             .setAlpha(0.5)
//             .setScale(2);
//
//         // 也可以先把原sprite隐藏或销毁
//         sprite.setVisible(false);
//         // 或 sprite.destroy();
//
//         // 提示文字
//         this.ghostText = this.add.text(this.ghostSprite.x, this.ghostSprite.y + 40, ' Press Q: place  W: cancel', {
//             fontFamily:'"Comic Sans MS", cursive',
//             fontSize: '15px',
//             fill: '#37474F',
//             align: 'center',
//             padding: { x: 6, y: 2 }
//         }).setOrigin(0.5);
//
//         // 跟随鼠标
//         this.input.on('pointermove', (pointer) => {
//             if (this.ghostSprite) {
//                 this.ghostSprite.x = pointer.x;
//                 this.ghostSprite.y = pointer.y;
//                 this.ghostText.x = pointer.x;
//                 this.ghostText.y = pointer.y + 40;
//
//                 const tile = this.grassLayer.getTileAtWorldXY(pointer.x, pointer.y);
//                 if (tile) {
//                     this.ghostSprite.clearTint();
//                 } else {
//                     this.ghostSprite.setTint(0xFF4530);
//                 }
//             }
//         });
//
//         // 绑定按键：Q / W
//         this.input.keyboard.on('keydown-Q', this.confirmMovingItem, this);
//         this.input.keyboard.on('keydown-W', this.cancelMovingItem, this);
//     }
//
// // -------------------------------------------------
// // 3) confirmMovingItem：最后调用后端 PUT /update
// // -------------------------------------------------
//     async confirmMovingItem() {
//         if (!this.isMoving || !this.ghostSprite) return;
//
//         let x = this.ghostSprite.x;
//         let y = this.ghostSprite.y;
//
//         // 判断草地
//         const tile = this.grassLayer.getTileAtWorldXY(x, y);
//         if (!tile) {
//             console.log('This is not grass. It\'s forbidden！');
//             return;
//         }
//
//         console.log('Moving item to:', x, y);
//         const belongingId = this.movingSprite.belongingsId;
//         console.log(`Updating belongingId=${belongingId}`);
//         // 更新数据库
//         try {
//             const response = await fetch(`http://localhost:8080/userBelongings/update/${belongingId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     locationX: x,   // 新坐标
//                     locationY: y
//                 })
//             });
//
//             if (response.ok) {
//                 console.log("Item location updated in database!");
//             } else {
//                 console.error("Failed to update item:", await response.text());
//                 return; // 更新失败就不改位置
//             }
//         } catch (error) {
//             console.error("Error updating item:", error);
//             return;
//         }
//
//         // 如果更新成功，可以把移动的Sprite移到新位置
//         this.movingSprite.setPosition(x, y);
//         // 如果之前隐藏了它，就让它显示
//         this.movingSprite.setVisible(true);
//         // 清除移动状态
//         this.cancelMovingItem();
//     }
//
// // -------------------------------------------------
// // 4) cancelMovingItem：和cancelPlacingItem类似
// // -------------------------------------------------
//     cancelMovingItem() {
//         this.isMoving = false;
//         this.movingSprite.setVisible(true);
//         this.movingSprite = null;
//
//         if (this.ghostSprite) {
//             this.ghostSprite.destroy();
//             this.ghostSprite = null;
//         }
//         if (this.ghostText) {
//             this.ghostText.destroy();
//             this.ghostText = null;
//         }
//
//         this.input.keyboard.off('keydown-Q', this.confirmMovingItem, this);
//         this.input.keyboard.off('keydown-W', this.cancelMovingItem, this);
//     }


}

