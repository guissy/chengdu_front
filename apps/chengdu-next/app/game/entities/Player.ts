import Phaser from 'phaser';

/**
 * 玩家角色类
 * 处理玩家的移动、跳跃和动画状态
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  /** 键盘输入控制器 */
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  /** 是否在地面上 */
  private isGrounded: boolean = false;
  /** 跳跃力度 */
  private jumpPower: number = 0;
  /** 生命值 */
  public lives: number = 3;
  /** 是否处于无敌状态 */
  public isInvincible: boolean = false;

  /**
   * 构造函数
   * @param scene - 游戏场景实例
   * @param x - 初始X坐标
   * @param y - 初始Y坐标
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    // 设置玩家名称，便于其他对象识别
    this.name = 'player';
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    
    if (this.body) {
      this.body.setSize(28, 40);
      this.body.setOffset(2, 18);
    }
    
    this.cursors = scene.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;

    // 播放默认动画
    this.play('idle');
  }

  /**
   * 更新玩家状态
   * 处理玩家的移动、跳跃和动画播放
   */
  update() {
    // 水平移动
    if (this.cursors.left?.isDown) {
      this.setVelocityX(-160);
      this.flipX = true;
      if (this.isGrounded) {
        this.play('run', true);
      }
    } else if (this.cursors.right?.isDown) {
      this.setVelocityX(160);
      this.flipX = false;
      if (this.isGrounded) {
        this.play('run', true);
      }
    } else {
      this.setVelocityX(0);
      if (this.isGrounded) {
        this.play('idle', true);
      }
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (this.isGrounded) {
        this.jumpPower = 400;
        this.setVelocityY(-this.jumpPower);
        this.play('jump', true);
      }
    }

    if (this.cursors.up?.isDown && this.jumpPower > 0) {
      this.jumpPower = Math.min(this.jumpPower + 15, 500);
      this.setVelocityY(-this.jumpPower);
    } else {
      this.jumpPower = 0;
    }

    // 空中惯性
    if (!this.isGrounded && this.body) {
      this.body.velocity.x *= 0.92;
    }
  }

  /**
   * 检查玩家是否在地面上
   * 使用射线检测方法判断玩家是否与地面接触
   * @param groundLayer - 地面图层
   */
  checkGround(groundLayer: Phaser.Tilemaps.TilemapLayer) {
    if (!groundLayer) return;
    
    const rayLength = 5;
    const bounds = this.getBounds();
    const startX = bounds.x + 5;
    const startY = bounds.y + bounds.height;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * 10;
      const y = startY + rayLength;
      
      // 使用getTileAtWorldXY来检测地面
      const tile = groundLayer.getTileAtWorldXY(x, y);
      if (tile) {
        this.isGrounded = true;
        return;
      }
    }
    this.isGrounded = false;
  }
} 