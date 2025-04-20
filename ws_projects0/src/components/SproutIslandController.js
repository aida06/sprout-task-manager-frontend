export default class SproutIslandController {
    constructor(scene) {
        this.scene = scene;  // Bind the Phaser scenario
        this.isPlacing = false;
        this.placingItem = null;
        this.isMoving = false;
        this.movingSprite = null;
        this.ghostSprite = null;
        this.ghostText = null;
        this.currentItem = null;

        this.userIdRef = scene.userIdRef
        this.userCoinsRef = scene.userCoinsRef
        this.itemPriceMap = {};
        console.log("SproutIslandController.js initialized with userCoins:", this.userCoinsRef.value);

        this.loadItemPriceMap();
    }

    // Start the placement mode
    startPlacingItem(item) {
        console.log("User coins:", this.userCoinsRef.value);

        this.clearItemOptions();
        if (this.isPlacing) return;

        console.log('Starting placing mode for:', item.itemSprite);
        this.placingItem = item;
        this.isPlacing = true;

        this.ghostSprite = this.scene.add.sprite(this.scene.input.x, this.scene.input.y, item.itemSprite)
            .setFrame(item.frameIndex)
            .setAlpha(0.5)
            .setScale(2)
            .setDepth(2)
            .setInteractive({ cursor: 'pointer' });

        this.ghostText = this.scene.add.text(this.ghostSprite.x, this.ghostSprite.y + 40, 'Press Q: place  W: cancel', {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '16px',
            fill: '#6D4C41',
            align: 'center',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5).setDepth(2);

        this.scene.input.on('pointermove', (pointer) => {
            if (this.ghostSprite) {
                this.ghostSprite.x = pointer.x;
                this.ghostSprite.y = pointer.y;
                this.ghostText.x = pointer.x;
                this.ghostText.y = pointer.y + 40;

                const tile = this.scene.grassLayer.getTileAtWorldXY(pointer.x, pointer.y);
                tile ? this.ghostSprite.clearTint() : this.ghostSprite.setTint(0xFF4530);
            }
        });

        this.scene.input.keyboard.on('keydown-Q', this.confirmPlace, this);
        this.scene.input.keyboard.on('keydown-W', this.cancelPlace, this);
    }

    // Press Q to confirm the placement
    async confirmPlace() {
        if (!this.isPlacing) return;
        console.log('Placing item at:', this.ghostSprite.x, this.ghostSprite.y);

        this.placeItem(this.ghostSprite.x, this.ghostSprite.y);

    }

    // Press W to cancel the placement
    cancelPlace() {
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

        this.scene.input.keyboard.off('keydown-Q', this.confirmPlace, this);
        this.scene.input.keyboard.off('keydown-W', this.cancelPlace, this);
    }


    async placeItem(x, y) {
        if (!this.placingItem) return;
        const tile = this.scene.grassLayer.getTileAtWorldXY(x, y);
        if (!tile) {
            console.log('This is not grass. It\'s forbidden！');
            return;
        }

        const purchaseSuccess = await this.purchaseItem(this.placingItem);
        if (!purchaseSuccess) {
            return; // If there are not enough gold coins, do not place items
        }

        let newItem = this.scene.add.sprite(x, y, this.placingItem.itemSprite).setScale(2);
        newItem.setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => {
                console.log('New Item clicked:', newItem);
                this.showItemOptions(newItem);
            });

        console.log('New Item placed at:', x, y);

        try {
            const response = await fetch('http://localhost:8080/userBelongings/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: localStorage.getItem("userId"),
                    itemId: this.placingItem.itemId,
                    locationX: x,
                    locationY: y
                })
            });

            if (response.ok) {
                console.log("Item stored in database successfully!");
            } else {
                console.error("Failed to store item:", await response.text());
            }
        } catch (error) {
            console.error("Error storing item:", error);
        }

        this.cancelPlace();
    }


    async purchaseItem(item) {
        if (!this.userCoinsRef.value || this.userCoinsRef.value < item.itemPrice) {
            console.error("Not enough coins!");
            alert("Not enough coins to buy this item!");
            return false;
        }
        try {
            await fetch("http://localhost:8080/user/updateCoins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: this.userIdRef.value,
                    rewardCoins: -Number(item.itemPrice)
                })
            });

            this.userCoinsRef.value = Number((this.userCoinsRef.value - item.itemPrice).toFixed(2));
            console.log(`Purchased item: ${item.itemId}, cost: ${item.itemPrice} coins. New balance: ${this.userCoinsRef.value}`);
            return true;
        } catch (err) {
            console.error("Failed to update coins:", err);
            return false;
        }
    }


    // Display item options
    showItemOptions(newItem) {
        if (this.currentItem === newItem && this.moveButton) {
            this.clearItemOptions();
            this.currentItem = null;
            return;
        }
        // this.loadItemPriceMap();
        // Calculate the return of coins
        const price = this.itemPriceMap[newItem.itemId]; // Retrieve the value from the local Map
        if (price === undefined) {
            console.error(`Item ${newItem.itemId} price not found in map`);
            return;
        }
        const refundCoins = Number((price / 2).toFixed(2));

        this.clearItemOptions();
        this.currentItem = newItem;

        let bounds = newItem.getBounds();
        let optionX = bounds.centerX;
        let optionY2 = bounds.bottom + 10;
        let optionY = bounds.top - 10;

        // Move
        this.moveButton = this.scene.add.rectangle(optionX - 25, optionY, 45, 30, 0xA5D6A7)
            .setStrokeStyle(1, 0xFFFFFF)
            .setInteractive({ cursor: 'pointer' })
            // .on('pointerdown', () => this.startMovingItem(newItem))
            .on('pointerover', () => {
                    this.movetip = this.scene.add.text(
                        optionX,
                        optionY2,
                        `Move me to a better location ? `,
                        {
                            fontFamily: '"Comic Sans MS", cursive',
                            fontSize: '16px',
                            align: 'center',
                            color: '#6D4C41'
                        }
                    ).setOrigin(0.5);
                })
            .on('pointerout', () => {
                if (this.movetip) {
                    this.movetip.destroy();
                    this.movetip = null;
                }
            })
            .on('pointerdown', () => {
                this.startMovingItem(newItem);
                if (this.movetip) {
                    this.movetip.destroy();
                    this.movetip = null;
                }
            })

        this.moveText = this.scene.add.text(optionX - 25, optionY, 'Move', {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '15px',
            align: 'center'
        }).setOrigin(0.5);

        // Sell
        this.saleButton = this.scene.add.rectangle(optionX + 25, optionY, 45, 30, 0xEF9A9A)
            .setStrokeStyle(1, 0xFFFFFF)
            .setInteractive({ cursor: 'pointer' })
            // .on('pointerdown', () => this.sellItem(newItem))
            .on('pointerover', () => {
                this.refundTooltip = this.scene.add.text(
                    optionX,
                    optionY2,
                    `Sell me for half the price:💰${refundCoins} ? `,
                    {
                        fontFamily: '"Comic Sans MS", cursive',
                        fontSize: '16px',
                        align: 'center',
                        color: '#6D4C41'
                    }
                ).setOrigin(0.5);
            })
            .on('pointerout', () => {
                if (this.refundTooltip) {
                    this.refundTooltip.destroy();
                    this.refundTooltip = null;
                }
            })
            .on('pointerdown', () => {
                this.sellItem(newItem);
                if (this.refundTooltip) {
                    this.refundTooltip.destroy();
                    this.refundTooltip = null;
                }
            })

        this.saleText = this.scene.add.text(optionX + 25, optionY, 'Sell', {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '15px',
            align: 'center'
        }).setOrigin(0.5);

        console.log('Raw item data from backend:', this.currentItem);
        console.log("Item Price:", this.currentItem.itemPrice);
    }


    // Pull the itemPriceMap during initialization
    async loadItemPriceMap() {
        try {
            const response = await fetch("http://localhost:8080/storeItems/itemPriceMap");
            if (!response.ok) throw new Error(await response.text());
            this.itemPriceMap = await response.json(); // 存储到前端
            console.log("Loaded itemPriceMap:", this.itemPriceMap);
        } catch (error) {
            console.error("Failed to load itemPriceMap:", error);
        }
    }


    // Delete item
    async sellItem(item) {
        if (!item) return;

        try {
            const response = await fetch(`http://localhost:8080/userBelongings/delete/${item.belongingsId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log(`Item ${item.belongingsId} deleted from database!`);

                const price = this.itemPriceMap[item.itemId];
                if (price === undefined) {
                    console.error(`Item ${item.itemId} price not found in map`);
                    return;
                }

                const refundCoins = Number((price / 2).toFixed(2));

                const coinResponse = await fetch("http://localhost:8080/user/updateCoins", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: this.userIdRef.value,
                        rewardCoins: refundCoins
                    })
                });

                if (coinResponse.ok) {
                    this.userCoinsRef.value = Number((this.userCoinsRef.value + refundCoins).toFixed(2));
                    console.log(`Sold item: ${item.belongingsId}, received: ${refundCoins} coins. New balance: ${this.userCoinsRef.value}`);
                } else {
                    console.error("Failed to update coins:", await coinResponse.text());
                }

                // Remove items from the scene
                item.destroy();
                this.clearItemOptions();
                this.currentItem = null;

            } else {
                console.error("Failed to delete item:", await response.text());
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    }


    clearItemOptions() {
        if (this.moveButton) this.moveButton.destroy();
        if (this.saleButton) this.saleButton.destroy();
        if (this.moveText) this.moveText.destroy();
        if (this.saleText) this.saleText.destroy();

        this.moveButton = null;
        this.saleButton = null;
        this.moveText = null;
        this.saleText = null;
    }


    startMovingItem(sprite) {
        this.clearItemOptions();
        if (this.isMoving) return;

        console.log('Start moving existing item, belongingId=', sprite.belongingsId);
        console.log('Start moving existing item, itemId=', sprite.itemId);
        this.isMoving = true;
        this.movingSprite = sprite;

        let frameIndex = this.scene.frameIndexMap[sprite.itemId] || 0;

        this.ghostSprite = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key)
            .setFrame(frameIndex)
            .setAlpha(0.5)
            .setScale(2);

        sprite.setVisible(false);

        this.ghostText = this.scene.add.text(this.ghostSprite.x, this.ghostSprite.y + 40, ' Press Q: place  W: cancel', {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '16px',
            fill: '#6D4C41',
            align: 'center',
            padding: { x: 6, y: 2 }
        }).setOrigin(0.5);

        this.scene.input.on('pointermove', (pointer) => {
            if (this.ghostSprite) {
                this.ghostSprite.x = pointer.x;
                this.ghostSprite.y = pointer.y;
                this.ghostText.x = pointer.x;
                this.ghostText.y = pointer.y + 40;

                const tile = this.scene.grassLayer.getTileAtWorldXY(pointer.x, pointer.y);
                if (tile) {
                    this.ghostSprite.clearTint();
                } else {
                    this.ghostSprite.setTint(0xFF4530);
                }
            }
        });

        this.scene.input.keyboard.on('keydown-Q', this.confirmMove, this);
        this.scene.input.keyboard.on('keydown-W', this.cancelMove, this);
    }


    async confirmMove() {
        if (!this.isMoving || !this.ghostSprite) return;

        let x = this.ghostSprite.x;
        let y = this.ghostSprite.y;

        const tile = this.scene.grassLayer.getTileAtWorldXY(x, y);
        if (!tile) {
            console.log('This is not grass. It\'s forbidden！');
            return;
        }

        console.log('Moving item to:', x, y);
        const belongingId = this.movingSprite.belongingsId;
        console.log(`Updating belongingId=${belongingId}`);

        try {
            const response = await fetch(`http://localhost:8080/userBelongings/update/${belongingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationX: x, locationY: y })
            });

            if (response.ok) {
                console.log("Item location updated in database!");
            } else {
                console.error("Failed to update item:", await response.text());
                return;
            }
        } catch (error) {
            console.error("Error updating item:", error);
            return;
        }

        this.movingSprite.setPosition(x, y);
        this.movingSprite.setVisible(true);
        this.cancelMove();
    }


    cancelMove() {
        this.isMoving = false;
        if (this.movingSprite) {
            this.movingSprite.setVisible(true);
            this.movingSprite = null;
        }
        if (this.ghostSprite) {
            this.ghostSprite.destroy();
            this.ghostSprite = null;
        }
        if (this.ghostText) {
            this.ghostText.destroy();
            this.ghostText = null;
        }

        this.scene.input.keyboard.off('keydown-Q', this.confirmMove, this);
        this.scene.input.keyboard.off('keydown-W', this.cancelMove, this);
    }


}
