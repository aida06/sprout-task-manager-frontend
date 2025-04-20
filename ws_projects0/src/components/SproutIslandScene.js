import Phaser from 'phaser';
import SproutIslandController from './SproutIslandController.js';


export default class SproutIslandScene extends Phaser.Scene {
    constructor({userId, userCoins}) {
        super({ key: 'SceneKey' });

        // save the "ref object", and do not take the.value
        this.userIdRef = userId
        this.userCoinsRef = userCoins

        this.storeItems = [];    // Item data obtained from the back end
        this.typeButtons = [];   // Array of label buttons
        this.itemElements = [];  // Store the objects related to the currently displayed items

        this.spriteMap = {};
        this.frameIndexMap = {};

        this.belongings = []

        console.log("SproutIslandScene.js initialized with userCoins:", this.userCoinsRef.value);

        this.sceneController = new SproutIslandController(this);
    }

    preload() {
        // Load the Tiled Tileset image
        this.load.image('water_tileset', '/src/assets/tilesets/Water.png');
        this.load.image('grass_tileset', '/src/assets/tilesets/Grass_tiles_v2.png');

        this.load.image('houseWall_tileset', '/src/assets/tilesets/Wooden_House_Walls_Tilset.png');
        this.load.image('houseDoor_tileset', '/src/assets/tilesets/door animation sprites.png');
        this.load.image('furniture_tileset', '/src/assets/tilesets/Basic_Furniture.png');

        this.load.image('houseRoof_tileset', '/src/assets/tilesets/Wooden_House_Roof_Tilset.png');

        this.load.image('plantField_tileset', '/src/assets/tilesets/Tilled_Dirt_Wide_v2.png');


        // Load the Tiled JSON map
        this.load.tilemapTiledJSON('backgroundMap', '/src/assets/maps/background3.tmj');

        // Load UI
        this.load.spritesheet('buttons', '/src/assets/UI/SquareButtons26x19.png', {
            frameWidth: 48,   // 计算得出，每个按钮宽 32px
            frameHeight: 32    // 每个按钮高 32px
        });

        this.load.spritesheet('panel', '/src/assets/UI/Settingmenu.png', {
            frameWidth: 128,   // 计算得出，每个按钮宽 32px
            frameHeight: 144    // 每个按钮高 32px
        });

        // Load Sprite
        this.load.spritesheet('boat', '/src/assets/sprites/Boats.png', {
            frameWidth: 48,
            frameHeight: 32
        });


        // Load Store Item
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

        // Serial loading
        await this.loadStoreData();
        await this.loadItemSpriteMap();
        await this.loadFrameIndexMap();


        await this.loadUserBelongings();

        // Global monitoring pointermove: Let ghostSprite follow the mouse
        this.input.on('pointermove', (pointer) => {
            // console.log('pointer move:', pointer.x, pointer.y);
            // console.log(this.ghostSprite)
            if (this.ghostSprite) {
                this.ghostSprite.x = pointer.x;
                this.ghostSprite.y = pointer.y;
                // console.log(this.ghostSprite.x, this.ghostSprite.y)
            }
        });

        this.input.mouse.disableContextMenu();  // Disable the right-click menu

    }


    createMap() {
        // Read the Tiled JSON map
        this.map = this.make.tilemap({ key: 'backgroundMap' });

        // Bind the Tileset (the name should be consistent with the Tileset name in 'tmj')
        const waterTileset = this.map.addTilesetImage('Water', 'water_tileset');
        const grassTileset = this.map.addTilesetImage('GrassV2', 'grass_tileset');

        const houseWallTileset = this.map.addTilesetImage('HouseWall', 'houseWall_tileset');
        const houseDoorTileset = this.map.addTilesetImage('HouseDoor', 'houseDoor_tileset');
        const furnitureTileset = this.map.addTilesetImage('Furniture', 'furniture_tileset');

        const houseRoofTileset = this.map.addTilesetImage('HouseRoof', 'houseRoof_tileset'); // 暂时没用

        const plantFieldTileset = this.map.addTilesetImage('TilledDirtV2', 'plantField_tileset');


        const houseTilesets = [houseWallTileset, houseDoorTileset, furnitureTileset]; // Multiple Tilesets

        // Create a layer (the name should be consistent with that in 'tmj')
        this.waterLayer = this.map.createLayer('water1', waterTileset, 0, 0);
        this.grassLayer = this.map.createLayer('grass1', grassTileset, 0, -15);


        let houseX = 145
        let houseY = -55
        let houseScale = (2.5, 2.5)
        this.houseFloorLayer = this.map.createLayer('houseFloor', houseWallTileset, houseX, houseY);
        this.houseLayer = this.map.createLayer('house', houseTilesets, houseX, houseY);
        this.furnitureLayer = this.map.createLayer('furniture', furnitureTileset, houseX, houseY);

        this.plantFieldLayer = this.map.createLayer('plantField', plantFieldTileset, -355, 10);


        this.waterLayer.setScale(3.1);
        this.grassLayer.setScale(3);

        this.houseFloorLayer.setScale(houseScale);
        this.houseLayer.setScale(houseScale);
        this.furnitureLayer.setScale(houseScale);

        this.plantFieldLayer.setScale(4.5, 2.5);
    }


    createSprite() {
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNumbers('cow', { start: 0, end: 4 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        //
        // this.cow = this.add.sprite(1000, 200, 'cow').setScale(2);
        // this.cow.play('walk');

        // this.waterWell = this.add.sprite(1000, 300, 'waterWell').setScale(2);
        //
        // this.cow = this.add.sprite(1000, 400, 'chicken').setScale(2);


        this.anims.create({
            key: 'float',   // Animation name
            frames: this.anims.generateFrameNumbers('boat', { start: 0, end: 1 }), // From Frame 0 to Frame 4
            frameRate: 2, // Playback speed (10 frames per second)
            repeat: -1     // Infinite loop
        });
        this.boat = this.add.sprite(1380, 655, 'boat').setScale(3);
        this.boat.play('float');

        // this.tree = this.add.sprite(800, 400, 'trees').setFrame(0).setScale(2);
        //
        // this.bush = this.add.sprite(800, 450, 'small chicken houses').setFrame(4).setScale(2);
    }


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


    createStoreUI() {
        this.storeButton = this.add.image(1420, 20, 'buttons', 4)
            .setScale(3, 3)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.toggleStorePanel())
            .on('pointerover', () => {
            this.storeButton.setTint(0xFFECB3);
        })
            .on('pointerout', () => {
                this.storeButton.clearTint();
            });

        this.storeText = this.add.text(1420, 18, 'Store', {fontFamily:'"Comic Sans MS", cursive', fontSize: '18px', fill: '#6D4C41' })
            .setOrigin(0.5);

        this.storePanel = this.add.image(1380, 317, 'panel', 1)
            .setScale(3.75, 4.52)
            .setVisible(false)
            .setDepth(1);
    }


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

    // Dynamically generate the "Item Type" Tab button
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
                    if (tabBg.fillColor !== 0xFFF59D) {
                        tabBg.setFillStyle(0xFFF9C4);
                    }
                })
                .on('pointerout', () => {
                    if (tabBg.fillColor !== 0xFFF59D) {
                        tabBg.setFillStyle(0xFFFDE7);
                    }
                })
                .setVisible(false);

            let tabText = this.add.text(startX + index * gapX, startY, type, {
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '16px',
                fill: '#6D4C41',
                // fontStyle: 'bold'
            })
                .setOrigin(0.5)
                .setDepth(12)
                .setVisible(false);

            this.typeButtons.push({ bg: tabBg, text: tabText, type });
        });

        // The first one is selected by default
        if (types.length > 0) {
            this.activateTab(types[0]);
        }
    }

    activateTab(selectedType) {
        this.typeButtons.forEach(tab => {
            if (tab.type === selectedType) {
                tab.bg.fillColor = 0xFFF59D; // Selected state (dark)
                tab.text.setColor('#6D4C41').setFontStyle('normal');
            } else {
                tab.bg.fillColor = 0xFFFDE7; // Unselected state (light color)
                tab.text.setColor('#795548').setFontStyle('normal');
            }
        });
        // Update the displayed items
        this.showItems(selectedType);
    }


    showItems(selectedType) {
        // Clean up the previous elements
        this.clearItemElements();
        if (!this.storePanel.visible) return;

        const filteredItems = this.storeItems.filter(i => i.itemType === selectedType);

        let startX = 1258;
        let startY = 160;
        let gapX = 115;
        let gapY = 118;
        let colCount = 3;

        let viewHeight = 469;   // Visible area  height
        let viewWidth = colCount * gapX + 10; // Visible area width

        // Calculate the content height & create the container
        let contentHeight = Math.ceil(filteredItems.length / colCount) * gapY;
        // Avoid the situation where contentHeight = 0
        if (contentHeight < 1) contentHeight = 1;

        this.itemContainer = this.add.container(startX, startY);
        this.itemElements.push(this.itemContainer);

        // Create a mask and hide it to limit the visible range
        let maskGraphics = this.add.graphics();
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(startX - 60, startY - 45, viewWidth, viewHeight);
        maskGraphics.setVisible(false);
        let mask = maskGraphics.createGeometryMask();
        this.itemContainer.setMask(mask)
            .setDepth(2);

        // Create the actual item Box
        filteredItems.forEach((item, idx) => {
            let col = idx % colCount;
            let row = Math.floor(idx / colCount);
            let x = col * gapX;
            let y = row * gapY;

            // Single item container
            let itemBox = this.add.container(x, y);

            // background
            let bgRect = this.add.rectangle(0, 0, 90, 90, 0xFFFDE7)
                .setOrigin(0.5)
                .setStrokeStyle(1.2, 0x8D6E63);

            // Item name
            let nameText = this.add.text(0, 57, item.itemName, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);

            // Item Sprite
            let sprite = this.add.sprite(0, -5, item.itemSprite)
                .setFrame(item.frameIndex)
                .setScale(1.7);

            // Item Price
            let priceText = this.add.text(0, 33, `💰${item.itemPrice}`, {
                fontSize: '15px',
                fill: '#6D4C41',
                fontFamily: '"Comic Sans MS", cursive',
                align: 'center'
            }).setOrigin(0.5);


            itemBox.add([bgRect, nameText, sprite, priceText]);

            // Interaction
            itemBox.setSize(90, 90);
            itemBox.setInteractive({ cursor: 'pointer' })
                .on('pointerdown', () => this.sceneController.startPlacingItem(item))
                .on('pointerover', () => bgRect.setFillStyle(0xFFF59D))
                .on('pointerout',  () => bgRect.setFillStyle(0xFFFDE7));


            this.itemContainer.add(itemBox);
        });

        // Calculate the maximum rolling distance
        this.scrollY = 0;
        let maxScroll = Math.max(0, contentHeight - viewHeight);

        // 6) 创建滚动条
        let scrollbarX = startX + viewWidth - 57;
        let scrollbarY = startY - 50;
        let scrollbarWidth = 10;
        let scrollbarHeight = viewHeight;

        let scrollbar = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 0xFFF8E1)
            .setOrigin(0, 0)
            .setDepth(999);
        this.itemElements.push(scrollbar);

        if (contentHeight <= viewHeight) {
            scrollbar.setVisible(false);
        }

        // Calculate the height of the slider
        let ratio = viewHeight / contentHeight;
        let thumbHeight = ratio >= 1 ? scrollbarHeight : ratio * scrollbarHeight;
        let scrollThumb = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, thumbHeight, 0x8D6E63)
            .setOrigin(0, 0)
            .setDepth(1000)
            .setInteractive({ cursor: 'pointer' });
        this.itemElements.push(scrollThumb);

        if (ratio >= 1) {
            scrollThumb.setVisible(false);
        }



        // Listen for the scroll wheel event to implement the scroll & synchronous slider
        console.log("maxScroll:", maxScroll, "contentHeight:", contentHeight, "viewHeight:", viewHeight);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            let scrollSpeed = 30; // Rolling speed
            this.itemContainer.y -= (deltaY > 0) ? scrollSpeed : -scrollSpeed;

            // Limit the scrolling range of the itemContainer
            let maxScrollUp = startY;
            let maxScrollDown = startY - (contentHeight - viewHeight);
            if (this.itemContainer.y > maxScrollUp) {
                this.itemContainer.y = maxScrollUp;
            } else if (this.itemContainer.y < maxScrollDown) {
                this.itemContainer.y = maxScrollDown;
            }

            // Synchronize the position of the scrollThumb slider
            if (maxScroll > 0) {
                let scrollRatio = (this.itemContainer.y - maxScrollDown) / (maxScrollUp - maxScrollDown);
                scrollThumb.y = scrollbarY + (1 - scrollRatio) * (scrollbarHeight - thumbHeight);
            }
        });

        // // Drag the slider
        this.input.setDraggable(scrollThumb);
        scrollThumb.on('drag', (pointer, dragX, dragY) => {
            if (maxScroll <= 0) return; // 不需要滚动

            // Restrict the slider to move only within the range of the scroll bar
            let newY = Phaser.Math.Clamp(
                dragY,
                scrollbarY,
                scrollbarY + scrollbarHeight - thumbHeight
            );
            scrollThumb.y = newY;

            // Calculate the rolling ratio
            let scrollRatio = (newY - scrollbarY) / (scrollbarHeight - thumbHeight);
            this.scrollY = -scrollRatio * maxScroll;
            this.itemContainer.y = startY + this.scrollY;
        });


    }


    // Clear the item grid that was displayed last time
    clearItemElements() {
        this.itemElements.forEach(elem => elem.destroy());
        this.itemElements = [];

        this.input.removeListener('wheel');
    }


}

