import Phaser from 'phaser';
import SceneController from './SceneController.js';


export default class Scene extends Phaser.Scene {
    constructor({userId, userCoins}) {
        super({ key: 'SceneKey' });

        // 这里保存“ref 对象”，不要取 .value
        this.userIdRef = userId
        this.userCoinsRef = userCoins

        this.storeItems = [];    // 从后端获取的物品数据
        this.typeButtons = [];   // 标签按钮数组
        this.itemElements = [];  // 存放当前显示的物品相关对象（背景、文字、sprite等）

        this.spriteMap = {};
        this.frameIndexMap = {};

        this.belongings = []

        console.log("Scene.js initialized with userCoins:", this.userCoinsRef.value);

        // 创建一个控制器，并把自己传进去
        this.sceneController = new SceneController(this);
    }

    preload() {
        // 加载 Tiled Tileset 图片
        this.load.image('water_tileset', '/src/assets/tilesets/Water.png');
        this.load.image('grass_tileset', '/src/assets/tilesets/Grass_tiles_v2.png');

        this.load.image('houseWall_tileset', '/src/assets/tilesets/Wooden_House_Walls_Tilset.png');
        this.load.image('houseDoor_tileset', '/src/assets/tilesets/door animation sprites.png');
        this.load.image('furniture_tileset', '/src/assets/tilesets/Basic_Furniture.png');

        this.load.image('houseRoof_tileset', '/src/assets/tilesets/Wooden_House_Roof_Tilset.png');

        this.load.image('plantField_tileset', '/src/assets/tilesets/Tilled_Dirt_Wide_v2.png');


        // 加载 Tiled JSON 地图
        this.load.tilemapTiledJSON('backgroundMap', '/src/assets/maps/background3.tmj');

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
        this.load.spritesheet('boat', '/src/assets/sprites/Boats.png', {
            frameWidth: 48,
            frameHeight: 32
        });


        // 加载StoreItem
        this.load.spritesheet('trees', '/src/assets/sprites/Trees.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('bushes', '/src/assets/sprites/Bushes.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('giant tree', '/src/assets/sprites/Giant Tree.png', {
            frameWidth: 44,
            frameHeight: 48
        });

        this.load.spritesheet('small stump', '/src/assets/sprites/Small Stump.png', {
            frameWidth: 10,
            frameHeight: 10
        });

        this.load.spritesheet('sprout stump', '/src/assets/sprites/Sprout Stump.png', {
            frameWidth: 26,
            frameHeight: 16
        });

        this.load.spritesheet('short log', '/src/assets/sprites/Short Log.png', {
            frameWidth: 16,
            frameHeight: 10
        });

        this.load.spritesheet('sprout log', '/src/assets/sprites/Sprout Log.png', {
            frameWidth: 23,
            frameHeight: 14
        });

        this.load.spritesheet('farming plants1', '/src/assets/sprites/Farming Plants1.png', {
            frameWidth: 16,
            frameHeight: 29
        });

        this.load.spritesheet('farming plants2', '/src/assets/sprites/Farming Plants2.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('mushrooms', '/src/assets/sprites/Mushrooms.png', {
            frameWidth: 16,
            frameHeight: 15
        });

        this.load.spritesheet('flowers', '/src/assets/sprites/Flowers.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('sunflower', '/src/assets/sprites/Flowers.png', {
            frameWidth: 16,
            frameHeight: 32
        });

        this.load.spritesheet('weeds', '/src/assets/sprites/Weeds.png', {
            frameWidth: 16,
            frameHeight: 13
        });

        //Animal
        this.load.spritesheet('cow', '/src/assets/sprites/Free Cow Sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('pink cow', '/src/assets/sprites/Pink cow animation sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('brown cow', '/src/assets/sprites/Brown cow animations.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('green cow', '/src/assets/sprites/Green cow animation sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('purple cow', '/src/assets/sprites/Purple cow animation sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('cow baby', '/src/assets/sprites/baby light cow animations sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('pink cow baby', '/src/assets/sprites/baby pink cow animations sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('brown cow baby', '/src/assets/sprites/baby brown cow animations sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('green cow baby', '/src/assets/sprites/baby green cow animations sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('purple cow baby', '/src/assets/sprites/baby purple cow animations sprites.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('chicken', '/src/assets/sprites/Free Chicken Sprites.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('red chicken', '/src/assets/sprites/chicken red.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('brown chicken', '/src/assets/sprites/chicken brown.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('green chicken', '/src/assets/sprites/chicken green.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('blue chicken', '/src/assets/sprites/chicken blue.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('chick', '/src/assets/sprites/Chicken_Baby.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('red chick', '/src/assets/sprites/Chicken_Baby_Red.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('brown chick', '/src/assets/sprites/Chicken_Baby_Brown.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('green chick', '/src/assets/sprites/Chicken_Baby_Green.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('blue chick', '/src/assets/sprites/Chicken_Baby_Blue.png', {
            frameWidth: 16,
            frameHeight: 16
        });


        // Decoration
        this.load.spritesheet('path', '/src/assets/sprites/Paths.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('stone path', '/src/assets/sprites/Stone_Path.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('fenceA', '/src/assets/sprites/FenceA.png', {
            frameWidth: 40,
            frameHeight: 16
        });

        this.load.spritesheet('fenceB', '/src/assets/sprites/FenceB.png', {
            frameWidth: 12,
            frameHeight: 45
        });

        this.load.spritesheet('fence gates', '/src/assets/sprites/Fence gates animation sprites.png', {
            frameWidth: 64,
            frameHeight: 16
        });

        this.load.spritesheet('stones1', '/src/assets/sprites/Stones1.png', {
            frameWidth: 16,
            frameHeight: 14
        });

        this.load.spritesheet('stones2', '/src/assets/sprites/Stones2.png', {
            frameWidth: 27,
            frameHeight: 22
        });

        this.load.spritesheet('stones3', '/src/assets/sprites/Stones3.png', {
            frameWidth: 32,
            frameHeight: 35
        });

        this.load.spritesheet('water tray', '/src/assets/sprites/Water tray.png', {
            frameWidth: 32,
            frameHeight: 16
        });

        this.load.spritesheet('barn1', '/src/assets/sprites/Barn structures.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('barn2', '/src/assets/sprites/Barn structures.png', {
            frameWidth: 30,
            frameHeight: 16
        });

        this.load.spritesheet('water well', '/src/assets/sprites/Water well.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('small chicken houses', '/src/assets/sprites/Small_Chicken_Houses.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        this.load.spritesheet('medium chicken houses', '/src/assets/sprites/Medium_Chicken_Houses.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('large chicken houses', '/src/assets/sprites/Large_Chicken_Houses.png', {
            frameWidth: 64,
            frameHeight: 76
        });

        this.load.spritesheet('chest', '/src/assets/sprites/Chest.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('basket', '/src/assets/sprites/Piknik basket.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('blanket', '/src/assets/sprites/Piknik blanket.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('mailbox', '/src/assets/sprites/Mailbox.png', {
            frameWidth: 10,
            frameHeight: 16
        });

        this.load.spritesheet('plain sign', '/src/assets/sprites/signs_sides.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('sign', '/src/assets/sprites/signs.png', {
            frameWidth: 16,
            frameHeight: 16
        });

    }


    async create() {

        this.createMap();
        this.createSprite();
        this.createStoreUI();

        // 串行加载
        await this.loadStoreData();
        await this.loadItemSpriteMap();
        await this.loadFrameIndexMap();


        await this.loadUserBelongings();

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

        const houseWallTileset = this.map.addTilesetImage('HouseWall', 'houseWall_tileset');
        const houseDoorTileset = this.map.addTilesetImage('HouseDoor', 'houseDoor_tileset');
        const furnitureTileset = this.map.addTilesetImage('Furniture', 'furniture_tileset');

        const houseRoofTileset = this.map.addTilesetImage('HouseRoof', 'houseRoof_tileset'); // 暂时没用

        const plantFieldTileset = this.map.addTilesetImage('TilledDirtV2', 'plantField_tileset');


        // 如果 houseFloor 里用了多个 Tileset（例如 HouseWall 和 HouseRoof），传入数组
        const houseTilesets = [houseWallTileset, houseDoorTileset, furnitureTileset]; // 多个 Tileset

        // 创建图层（名称要和 `tmj` 里的一致）
        this.waterLayer = this.map.createLayer('water1', waterTileset, 0, 0);
        this.grassLayer = this.map.createLayer('grass1', grassTileset, 0, -15);

        // 左上角 -340, -55
        let houseX = 145
        let houseY = -55
        let houseScale = (2.5, 2.5)
        this.houseFloorLayer = this.map.createLayer('houseFloor', houseWallTileset, houseX, houseY); // Floor 只有一个
        this.houseLayer = this.map.createLayer('house', houseTilesets, houseX, houseY);
        this.furnitureLayer = this.map.createLayer('furniture', furnitureTileset, houseX, houseY);

        this.plantFieldLayer = this.map.createLayer('plantField', plantFieldTileset, -355, 10);

        // 放大
        this.waterLayer.setScale(3.1);
        this.grassLayer.setScale(3);

        this.houseFloorLayer.setScale(houseScale);
        this.houseLayer.setScale(houseScale);
        this.furnitureLayer.setScale(houseScale);

        this.plantFieldLayer.setScale(4.5, 2.5);
    }


    createSprite() {
        // this.anims.create({
        //     key: 'walk',   // 动画名称
        //     frames: this.anims.generateFrameNumbers('cow', { start: 0, end: 4 }), // 从第0帧到第4帧
        //     frameRate: 10, // 播放速度（每秒10帧）
        //     repeat: -1     // 无限循环
        // });
        //
        // this.cow = this.add.sprite(1000, 200, 'cow').setScale(2);
        // this.cow.play('walk'); // 让小牛播放动画

        // this.waterWell = this.add.sprite(1000, 300, 'waterWell').setScale(2);
        //
        // this.cow = this.add.sprite(1000, 400, 'chicken').setScale(2);


        this.anims.create({
            key: 'float',   // 动画名称
            frames: this.anims.generateFrameNumbers('boat', { start: 0, end: 1 }), // 从第0帧到第4帧
            frameRate: 2, // 播放速度（每秒10帧）
            repeat: -1     // 无限循环
        });
        this.boat = this.add.sprite(1380, 655, 'boat').setScale(3);
        this.boat.play('float');

        // this.tree = this.add.sprite(800, 400, 'trees').setFrame(0).setScale(2);
        //
        // this.bush = this.add.sprite(800, 450, 'small chicken houses').setFrame(4).setScale(2);
    }

    // 接收 belongings 数据，并在 Phaser 场景中渲染
    // loadBelongingsIntoScene(belongings) {
    //     belongings.forEach(item => {
    //         let spriteKey = this.spriteMap[item.itemId] || 'cow';
    //         // 创建 Phaser Sprite
    //         let sprite = this.add.sprite(item.locationX, item.locationY, spriteKey)
    //             .setScale(2)
    //             .setInteractive({ cursor: 'pointer' })
    //             .on('pointerdown', () => {
    //                 console.log('DB item clicked:', sprite);
    //                 this.sceneController.showItemOptions(sprite);
    //             });
    //         // 关键点：把“数据库记录的ID”存到 sprite 上
    //         // 假设后端返回字段是 item.belongingId 或 item.id
    //         sprite.belongingsId = item.belongingsId;
    //         // 如果还需要“物品类型ID”，也可以赋值
    //         sprite.itemId = item.itemId;
    //
    //     });
    // }

    async loadUserBelongings() {
        try {
            // const userId = localStorage.getItem("userId");
            const response = await fetch(`http://localhost:8080/userBelongings/users/${this.userIdRef.value}`);
            this.belongings = await response.json() || [];
            console.log("User belongings loaded:", this.belongings);
            // 传给 Phaser 场景渲染
            this.loadBelongingsIntoScene(this.belongings);
        } catch (error) {
            console.error("Failed to load user belongings:", error);
            this.belongings = [];
        }
    }

    loadBelongingsIntoScene(belongings) {
        belongings.forEach(item => {
            let spriteKey = this.spriteMap[item.itemId] || 'cow';
            let frameIndex = this.frameIndexMap[item.itemId] || 0; // 取数据库中的帧编号，默认 0
            // 创建 Phaser Sprite，并设置正确的帧
            let sprite = this.add.sprite(item.locationX, item.locationY, spriteKey)
                .setFrame(frameIndex)
                .setScale(2)
                .setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => {
                    console.log('DB item clicked:', sprite);
                    this.sceneController.showItemOptions(sprite);
                });

            // 关键点：把“数据库记录的ID”存到 sprite 上
            sprite.belongingsId = item.belongingsId; // 物品唯一ID
            sprite.itemId = item.itemId; // 物品类型ID
            sprite.frameIndex = item.frameIndex;
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

    async loadFrameIndexMap() {
        try {
            const response = await fetch("http://localhost:8080/storeItems/frameIndexMap");
            const frameIndexMap = await response.json();
            console.log("Frame Index Map:", frameIndexMap);

            this.frameIndexMap = Object.fromEntries(
                Object.entries(frameIndexMap).map(([key, value]) => [Number(key), value])
            );
        } catch (error) {
            console.error("Failed to fetch frame index map:", error);
        }
    }

    // 1. 创建商店面板和“Store”按钮
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
        this.storePanel = this.add.image(1380, 317, 'panel', 1)
            .setScale(3.75, 4.52)
            .setVisible(false)
            .setDepth(1);
    }

    // 2. 切换商店面板的可见性
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


    // 3. 从后端获取商店物品数据
    async loadStoreData() {
        try {
            const response = await fetch("http://localhost:8080/storeItems");
            this.storeItems = await response.json();  // 得到 [{ itemId, itemName, itemType, itemSprite, itemPrice }, ...]

            // 构建标签（Tab）按钮
            this.createTypeTabs();
        } catch (error) {
            console.error('Failed to load store data:', error);
        }
    }

    // 4. 动态生成「物品类型」Tab 按钮，比如“Animal”、“Plant”、“Building”等
    createTypeTabs() {
        const types = [...new Set(this.storeItems.map(item => item.itemType))];

        let startX = 1262;
        let startY = 85;
        let gapX = 113;

        types.forEach((type, index) => {
            let tabBg = this.add.rectangle(startX + index * gapX, startY, 100, 30)
                .setFillStyle(0xFFFDE7)
                .setStrokeStyle(1.2, 0x8D6E63)
                .setInteractive({ cursor: 'pointer' })
                .setDepth(11)
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
                .setDepth(12)
                .setVisible(false); // 默认隐藏

            this.typeButtons.push({ bg: tabBg, text: tabText, type });
        });

        // 默认选中第一个
        if (types.length > 0) {
            this.activateTab(types[0]);
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
        this.showItems(selectedType);
    }


    // 5. 根据选中的物品类型，在商店面板里排布对应的物品
    // showItemsByType(selectedType) {
    //     this.clearItemElements();
    //     if (!this.storePanel.visible) return;
    //
    //     const filteredItems = this.storeItems.filter(i => i.itemType === selectedType);
    //
    //     let startX = 1250;
    //     let startY = 155;
    //     let gapX = 110;
    //     let gapY = 110;
    //     let colCount = 3;
    //
    //     filteredItems.forEach((item, idx) => {
    //         let col = idx % colCount;
    //         let row = Math.floor(idx / colCount);
    //         let x = startX + col * gapX;
    //         let y = startY + row * gapY;
    //
    //         // **创建一个 Container 统一管理所有元素**
    //         let itemContainer = this.add.container(x, y);
    //         this.itemElements.push(itemContainer);
    //
    //         // **1) 方形背景**
    //         let bgRect = this.add.rectangle(0, 0, 85, 85, 0xFFFDE7)
    //             .setOrigin(0.5)
    //             .setStrokeStyle(1, 0x8D6E63);
    //
    //         // **2) 物品名称**
    //         let nameText = this.add.text(0, 53, item.itemName, {
    //             fontSize: '15px',
    //             fill: '#6D4C41',
    //             fontFamily: '"Comic Sans MS", cursive',
    //             align: 'center'
    //         }).setOrigin(0.5);
    //
    //         // **3) 物品 Sprite**
    //         let sprite = this.add.sprite(0, -7, item.itemSprite)
    //             .setFrame(item.frameIndex)
    //             .setScale(1.6);
    //
    //         // **4) 物品价格**
    //         let priceText = this.add.text(0, 30, `💰${item.itemPrice}`, {
    //             fontSize: '15px',
    //             fill: '#6D4C41',
    //             fontFamily: '"Comic Sans MS", cursive',
    //             align: 'center'
    //         }).setOrigin(0.5);
    //
    //         // **将所有元素加入 Container**
    //         itemContainer.add([bgRect, nameText, sprite, priceText]);
    //
    //         // **让整个物品框可交互**
    //         itemContainer.setSize(80, 80);
    //         itemContainer.setInteractive({ cursor: 'pointer' })
    //             .on('pointerdown', () => this.sceneController.startPlacingItem(item))
    //             .on('pointerover', () => bgRect.setFillStyle(0xFFF59D)) // 高亮
    //             .on('pointerout', () => bgRect.setFillStyle(0xFFFDE7));  // 还原
    //
    //         this.itemElements.push(itemContainer);
    //     });
    // }


    showItems(selectedType) {
        // 0) 清理之前的元素
        this.clearItemElements();
        if (!this.storePanel.visible) return;

        const filteredItems = this.storeItems.filter(i => i.itemType === selectedType);

        // 1) 一些布局相关的常量
        let startX = 1258;      // 物品列表左上角X
        let startY = 160;       // 物品列表左上角Y
        let gapX = 115;         // 水平间距
        let gapY = 118;         // 垂直间距
        let colCount = 3;       // 每行列数

        let viewHeight = 469;   // 可视区域（mask）高度
        let viewWidth = colCount * gapX + 10; // 可视区域宽度（和列数 & 间距相关）

        // 2) 计算内容高度 & 创建容器
        let contentHeight = Math.ceil(filteredItems.length / colCount) * gapY;
        // 避免出现 contentHeight = 0
        if (contentHeight < 1) contentHeight = 1;

        this.itemContainer = this.add.container(startX, startY);
        // rect 相对容器本身的(0,0)，大小与显示区域一致
        this.itemElements.push(this.itemContainer);

        // 3) 创建 mask 并将其隐藏，用来限制可视范围
        let maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0xffffff, 1);
        // 在这里，你可以适当微调 mask 的位置和大小
        maskGraphics.fillRect(startX - 60, startY - 45, viewWidth, viewHeight);
        maskGraphics.setVisible(false);
        let mask = maskGraphics.createGeometryMask();
        this.itemContainer.setMask(mask)
            .setDepth(2);

        // 4) 创建实际的物品 Box
        filteredItems.forEach((item, idx) => {
            let col = idx % colCount;
            let row = Math.floor(idx / colCount);
            let x = col * gapX;
            let y = row * gapY;

            // 单个物品容器
            let itemBox = this.add.container(x, y);

            // 背景
            let bgRect = this.add.rectangle(0, 0, 90, 90, 0xFFFDE7)
                .setOrigin(0.5)
                .setStrokeStyle(1.2, 0x8D6E63);

            // 物品名称
            let nameText = this.add.text(0, 57, item.itemName, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);

            // 物品精灵
            let sprite = this.add.sprite(0, -5, item.itemSprite)
                .setFrame(item.frameIndex)
                .setScale(1.7);

            // 价格文本
            let priceText = this.add.text(0, 33, `💰${item.itemPrice}`, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);

            // 加入子容器
            itemBox.add([bgRect, nameText, sprite, priceText]);

            // 交互
            itemBox.setSize(90, 90);
            itemBox.setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => this.sceneController.startPlacingItem(item))
                .on('pointerover', () => bgRect.setFillStyle(0xFFF59D))
                .on('pointerout',  () => bgRect.setFillStyle(0xFFFDE7));

            // **存储原始 Y 位置**
            // itemBox.originalY = y;
            // // itemBox.originalY + 469 = y2;
            //
            // // **设置交互（初始可见的物品才可交互）**
            // itemBox.setSize(90, 90);
            // if (y >= 0) {
            //     itemBox.setInteractive({ cursor: 'pointer' })
            //         .on('pointerdown', () => this.sceneController.startPlacingItem(item))
            //         .on('pointerover', () => bgRect.setFillStyle(0xFFF59D))
            //         .on('pointerout', () => bgRect.setFillStyle(0xFFFDE7));
            // }


            // 将物品容器添加到大的 itemContainer
            this.itemContainer.add(itemBox);
        });

        // 5) 计算最大滚动距离
        this.scrollY = 0;
        let maxScroll = Math.max(0, contentHeight - viewHeight);

        // 6) 创建滚动条
        //  先定义滚动条位置、大小
        let scrollbarX = startX + viewWidth - 57; // X位置可以微调
        let scrollbarY = startY - 50;            // Y位置可再微调
        let scrollbarWidth = 10;
        let scrollbarHeight = viewHeight;

        //  创建滚动条本体（背景）
        let scrollbar = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 0xFFF8E1)
            .setOrigin(0, 0)
            .setDepth(999);
        this.itemElements.push(scrollbar);
        //  创建滑块
        //  如果内容小于等于一屏，则不需要滚动——可隐藏或固定滑块
        if (contentHeight <= viewHeight) {
            // 隐藏滚动条或让其不可拖动
            scrollbar.setVisible(false);
        }

        // 计算滑块高度
        let ratio = viewHeight / contentHeight;
        // 如果 ratio >= 1，说明内容不满一页，可直接让滑块和滚动条同高或隐藏
        let thumbHeight = ratio >= 1 ? scrollbarHeight : ratio * scrollbarHeight;

        let scrollThumb = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, thumbHeight, 0x8D6E63)
            .setOrigin(0, 0)
            .setDepth(1000)
            .setInteractive({ cursor: 'pointer' });
        this.itemElements.push(scrollThumb);

        if (ratio >= 1) {
            // 若内容不够一页，也将滑块隐藏或设为不可移动
            scrollThumb.setVisible(false);
        }



        // 7) 监听滚轮事件，实现滚动 & 同步滑块
        console.log("maxScroll:", maxScroll, "contentHeight:", contentHeight, "viewHeight:", viewHeight);
        // 监听鼠标滚轮事件，让 itemContainer 和 scrollThumb 同步移动
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            let scrollSpeed = 30; // 滚动速度
            this.itemContainer.y -= (deltaY > 0) ? scrollSpeed : -scrollSpeed;

            // 限制 itemContainer 滚动范围
            let maxScrollUp = startY;
            let maxScrollDown = startY - (contentHeight - viewHeight);
            if (this.itemContainer.y > maxScrollUp) {
                this.itemContainer.y = maxScrollUp;
            } else if (this.itemContainer.y < maxScrollDown) {
                this.itemContainer.y = maxScrollDown;
            }

            // **同步 scrollThumb 滑块的位置**
            if (maxScroll > 0) {
                let scrollRatio = (this.itemContainer.y - maxScrollDown) / (maxScrollUp - maxScrollDown);
                scrollThumb.y = scrollbarY + (1 - scrollRatio) * (scrollbarHeight - thumbHeight);
            }
        });

        // // 8) 拖动滑块
        this.input.setDraggable(scrollThumb);
        scrollThumb.on('drag', (pointer, dragX, dragY) => {
            if (maxScroll <= 0) return; // 不需要滚动

            // 限制滑块只能在滚动条范围内移动
            let newY = Phaser.Math.Clamp(
                dragY,
                scrollbarY,
                scrollbarY + scrollbarHeight - thumbHeight
            );
            scrollThumb.y = newY;

            // 计算滚动比例
            let scrollRatio = (newY - scrollbarY) / (scrollbarHeight - thumbHeight);
            // 将比例映射到 itemContainer
            this.scrollY = -scrollRatio * maxScroll;
            this.itemContainer.y = startY + this.scrollY;
        });


    }


    // showItemsByType(selectedType) {
    //     // 0) 清理之前的元素
    //     this.clearItemElements();
    //     if (!this.storePanel.visible) return;
    //
    //     const filteredItems = this.storeItems.filter(i => i.itemType === selectedType);
    //
    //     // 1) 一些布局相关的常量
    //     let startX = 1258;
    //     let startY = 160;
    //     let gapX = 115;
    //     let gapY = 118;
    //     let colCount = 3;
    //
    //     let viewHeight = 469;
    //     let viewWidth = colCount * gapX + 10;
    //
    //     // 2) 计算内容总高度
    //     let contentHeight = Math.ceil(filteredItems.length / colCount) * gapY;
    //     if (contentHeight < 1) contentHeight = 1;
    //
    //     // 3) 创建容器 & 遮罩
    //     this.itemContainer = this.add.container(startX, startY);
    //     this.itemElements.push(this.itemContainer);
    //
    //     let maskGraphics = this.add.graphics();
    //     maskGraphics.fillStyle(0xffffff, 1);
    //     maskGraphics.fillRect(startX - 60, startY - 45, viewWidth, viewHeight);
    //     maskGraphics.setVisible(false);
    //     let mask = maskGraphics.createGeometryMask();
    //     this.itemContainer.setMask(mask);
    //
    //     // **存储所有 itemBox**
    //     this.itemBoxes = [];
    //
    //     // 4) 创建所有物品 Box
    //     filteredItems.forEach((item, idx) => {
    //         let col = idx % colCount;
    //         let row = Math.floor(idx / colCount);
    //         let x = col * gapX;
    //         let y = row * gapY;
    //
    //         // 单个物品容器
    //         let itemBox = this.add.container(x, y);
    //
    //         // 背景
    //         let bgRect = this.add.rectangle(0, 0, 90, 90, 0xFFFDE7)
    //             .setOrigin(0.5)
    //             .setStrokeStyle(1.2, 0x8D6E63);
    //
    //         // 物品名称
    //         let nameText = this.add.text(0, 57, item.itemName, {
    //             fontSize: '15px',
    //             fill: '#6D4C41',
    //             fontFamily: '"Comic Sans MS", cursive',
    //             align: 'center'
    //         }).setOrigin(0.5);
    //
    //         // 物品精灵
    //         let sprite = this.add.sprite(0, -5, item.itemSprite)
    //             .setFrame(item.frameIndex)
    //             .setScale(1.7);
    //
    //         // 价格文本
    //         let priceText = this.add.text(0, 33, `💰${item.itemPrice}`, {
    //             fontSize: '15px',
    //             fill: '#6D4C41',
    //             fontFamily: '"Comic Sans MS", cursive',
    //             align: 'center'
    //         }).setOrigin(0.5);
    //
    //         // 加入子容器
    //         itemBox.add([bgRect, nameText, sprite, priceText]);
    //
    //         // **存储原始 Y 位置**
    //         itemBox.originalY = y;
    //
    //         // **设置交互（初始可见的物品才可交互）**
    //         itemBox.setSize(90, 90);
    //         if (y >= startY ) {
    //             itemBox.setInteractive({ cursor: 'pointer' })
    //                 .on('pointerdown', () => this.sceneController.startPlacingItem(item))
    //                 .on('pointerover', () => bgRect.setFillStyle(0xFFF59D))
    //                 .on('pointerout', () => bgRect.setFillStyle(0xFFFDE7));
    //         }
    //
    //         // **存入数组，后续控制交互**
    //         this.itemBoxes.push(itemBox);
    //
    //         // 将物品容器添加到大的 itemContainer
    //         this.itemContainer.add(itemBox);
    //     });
    //
    //     // 5) 计算最大滚动距离
    //     // this.scrollY = 0;
    //     // let maxScroll = Math.max(0, contentHeight - viewHeight);
    //
    //     // 5) 计算最大滚动距离
    //     this.scrollY = 0;
    //     let maxScroll = Math.max(0, contentHeight - viewHeight);
    //
    //     // 6) 创建滚动条
    //     //  先定义滚动条位置、大小
    //     let scrollbarX = startX + viewWidth - 57; // X位置可以微调
    //     let scrollbarY = startY - 50;            // Y位置可再微调
    //     let scrollbarWidth = 10;
    //     let scrollbarHeight = viewHeight;
    //
    //     //  创建滚动条本体（背景）
    //     let scrollbar = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 0xFFF8E1)
    //         .setOrigin(0, 0)
    //         .setDepth(999);
    //     this.itemElements.push(scrollbar);
    //     //  创建滑块
    //     //  如果内容小于等于一屏，则不需要滚动——可隐藏或固定滑块
    //     if (contentHeight <= viewHeight) {
    //         // 隐藏滚动条或让其不可拖动
    //         scrollbar.setVisible(false);
    //     }
    //
    //     // 计算滑块高度
    //     let ratio = viewHeight / contentHeight;
    //     // 如果 ratio >= 1，说明内容不满一页，可直接让滑块和滚动条同高或隐藏
    //     let thumbHeight = ratio >= 1 ? scrollbarHeight : ratio * scrollbarHeight;
    //
    //     let scrollThumb = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, thumbHeight, 0x8D6E63)
    //         .setOrigin(0, 0)
    //         .setDepth(1000)
    //         .setInteractive({ cursor: 'pointer' });
    //     this.itemElements.push(scrollThumb);
    //
    //     if (ratio >= 1) {
    //         // 若内容不够一页，也将滑块隐藏或设为不可移动
    //         scrollThumb.setVisible(false);
    //     }
    //
    //     // 7) 监听滚轮事件，实现滚动 & 同步滑块
    //     this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
    //         let scrollSpeed = 30; // 滚动速度
    //         this.itemContainer.y -= (deltaY > 0) ? scrollSpeed : -scrollSpeed;
    //
    //         // 限制 itemContainer 滚动范围
    //         let maxScrollUp = startY;
    //         let maxScrollDown = startY - (contentHeight - viewHeight);
    //         if (this.itemContainer.y > maxScrollUp) {
    //             this.itemContainer.y = maxScrollUp;
    //         } else if (this.itemContainer.y < maxScrollDown) {
    //             this.itemContainer.y = maxScrollDown;
    //         }
    //
    //         // **同步 scrollThumb 滑块的位置**
    //         if (maxScroll > 0) {
    //             let scrollRatio = (this.itemContainer.y - maxScrollDown) / (maxScrollUp - maxScrollDown);
    //             scrollThumb.y = scrollbarY + (1 - scrollRatio) * (scrollbarHeight - thumbHeight);
    //         }
    //
    //         // **检查可视区域**
    //         this.checkVisibleItems(scrollThumb, scrollbarY, scrollbarHeight, thumbHeight, contentHeight, viewHeight,startY);
    //     });
    //
    //
    //     // 8) 拖动滑块
    //     this.input.setDraggable(scrollThumb);
    //     scrollThumb.on('drag', (pointer, dragX, dragY) => {
    //         if (maxScroll <= 0) return; // 不需要滚动
    //
    //         // 限制滑块只能在滚动条范围内移动
    //         let newY = Phaser.Math.Clamp(
    //             dragY,
    //             scrollbarY,
    //             scrollbarY + scrollbarHeight - thumbHeight
    //         );
    //         scrollThumb.y = newY;
    //
    //         // 计算滚动比例
    //         let scrollRatio = (newY - scrollbarY) / (scrollbarHeight - thumbHeight);
    //         // 将比例映射到 itemContainer
    //         this.scrollY = -scrollRatio * maxScroll;
    //         this.itemContainer.y = startY + this.scrollY;
    //
    //         // **检查可视区域**
    //         this.checkVisibleItems(scrollThumb, scrollbarY, scrollbarHeight, thumbHeight, contentHeight, viewHeight,startY);
    //     });
    //
    //     // // **初次检查可视区域**
    //     // this.checkVisibleItems();
    //     this.checkVisibleItems(scrollThumb, scrollbarY, scrollbarHeight, thumbHeight, contentHeight, viewHeight,startY);
    // }

// **检查 itemBox 是否在可视范围内**
    checkVisibleItems(scrollThumb, scrollbarY, scrollbarHeight, thumbHeight, contentHeight, viewHeight,startY) {
        let localTop = 0;
        let localBottom = 469;

        // **根据滚动条 scrollThumb 位置调整 localBottom**
        let scrollRatio = (scrollThumb.y - scrollbarY) / (scrollbarHeight - thumbHeight);
        let scrollOffset = scrollRatio * (contentHeight - viewHeight);

        // localBottom 需要随着滚动增加/减少
        localBottom += scrollOffset;
        localTop += scrollOffset;

        this.itemBoxes.forEach(box => {
            // 计算物品的实际 Y 位置（相对于 itemContainer）
            let boxY = box.originalY + (this.itemContainer.y - startY);

            if (boxY + 45 < localTop || boxY - 45 > localBottom) {
                box.disableInteractive(); // 超出可视范围，禁用交互
            } else {
                if (!box.input?.enabled) {
                    box.setInteractive({ cursor: 'pointer' });
                }
            }
        });
    }



    // 6. 清除上一次显示的物品网格（避免重复堆叠）
    clearItemElements() {
        this.itemElements.forEach(elem => elem.destroy());  // 删除所有物品元素
        this.itemElements = [];

        // 可选：移除滚轮监听，防止多次注册
        this.input.removeListener('wheel');
    }


}

