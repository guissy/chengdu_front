import Phaser from 'phaser';

/**
 * 敌人行为模式枚举
 */
enum EnemyBehavior {
  PATROL, // 巡逻模式
  CHASE,  // 追逐模式
  IDLE    // 静止模式
}

/**
 * 巡逻敌人类
 * 在固定区域内左右移动的敌人
 */
export default class PatrolEnemy extends Phaser.Physics.Arcade.Sprite {
  /** 移动速度 */
  private speed: number = 80;
  /** 移动方向（1为右，-1为左） */
  private direction: number = 1;
  /** 当前行为模式 */
  private behavior: EnemyBehavior = EnemyBehavior.PATROL;
  /** 行为模式切换计时器 */
  private behaviorTimer: number = 0;
  /** 目标玩家 */
  private target: Phaser.GameObjects.GameObject | null = null;
  /** 检测范围 */
  private detectionRange: number = 150;

  /**
   * 构造函数
   * @param scene - 游戏场景实例
   * @param x - 初始X坐标
   * @param y - 初始Y坐标
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'snake');
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    
    // 设置显示大小和物理碰撞箱大小 - 调整为更合适的尺寸
    this.setDisplaySize(32, 32);
    if (this.body) {
      this.body.setSize(24, 24);
      this.body.setOffset(4, 4);
    }
    
    // 确保敌人有正确的深度层级
    this.setDepth(10);
    
    // 创建敌人动画（如果尚未创建）
    this.createAnimations();
    
    // 随机选择初始行为
    this.randomizeBehavior();
    
    // 播放默认动画
    this.play('snake_idle');
  }

  /**
   * 创建敌人动画
   */
  private createAnimations() {
    // 检查动画是否已存在
    if (!this.scene.anims.exists('snake_idle')) {
      // 创建静止动画
      this.scene.anims.create({
        key: 'snake_idle',
        frames: this.scene.anims.generateFrameNumbers('snake', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
      });
      
      // 创建移动动画
      this.scene.anims.create({
        key: 'snake_move',
        frames: this.scene.anims.generateFrameNumbers('snake', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  /**
   * 更新敌人状态
   * 处理敌人的巡逻移动逻辑
   */
  update() {
    // 更新行为计时器
    this.behaviorTimer -= 1;
    if (this.behaviorTimer <= 0) {
      this.randomizeBehavior();
    }
    
    // 根据当前行为模式执行相应的动作
    switch (this.behavior) {
      case EnemyBehavior.PATROL:
        this.patrol();
        this.play('snake_move', true);
        break;
      case EnemyBehavior.CHASE:
        this.chase();
        this.play('snake_move', true);
        break;
      case EnemyBehavior.IDLE:
        this.idle();
        this.play('snake_idle', true);
        break;
    }
    
    // 检查是否有玩家在检测范围内
    this.detectPlayer();
  }
  
  /**
   * 随机选择行为模式
   */
  private randomizeBehavior() {
    // 如果当前在追逐模式且目标仍在范围内，保持追逐
    if (this.behavior === EnemyBehavior.CHASE && this.isTargetInRange()) {
      this.behaviorTimer = 100;
      return;
    }
    
    // 随机选择行为
    const behaviors = [EnemyBehavior.PATROL, EnemyBehavior.IDLE];
    this.behavior = Phaser.Math.RND.pick(behaviors);
    
    // 设置行为持续时间
    this.behaviorTimer = Phaser.Math.Between(100, 300);
    
    // 如果是巡逻模式，随机设置方向
    if (this.behavior === EnemyBehavior.PATROL) {
      this.direction = Phaser.Math.RND.pick([-1, 1]);
    }
  }
  
  /**
   * 巡逻行为
   */
  private patrol() {
    if (this.body?.blocked.right) {
      this.direction = -1;
    } else if (this.body?.blocked.left) {
      this.direction = 1;
    }
    
    this.setVelocityX(this.speed * this.direction);
    this.flipX = this.direction < 0;
  }
  
  /**
   * 静止行为
   */
  private idle() {
    this.setVelocity(0, 0);
  }
  
  /**
   * 追逐行为
   */
  private chase() {
    if (!this.target || !this.target.active) {
      this.behavior = EnemyBehavior.PATROL;
      return;
    }
    
    // 计算到目标的方向
    const dx = (this.target as Phaser.Physics.Arcade.Sprite).x - this.x;
    const dy = (this.target as Phaser.Physics.Arcade.Sprite).y - this.y;
    
    // 归一化方向向量
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // 设置速度（追逐速度略快于巡逻速度）
    this.setVelocity(
      dirX * (this.speed * 1.2),
      dirY * (this.speed * 1.2)
    );
    
    // 设置朝向
    this.flipX = dx < 0;
  }
  
  /**
   * 检测玩家
   */
  private detectPlayer() {
    // 获取场景中的所有玩家
    const players = this.scene.children.list.filter(
      child => child.type === 'Sprite' && child.name === 'player'
    );
    
    if (players.length > 0) {
      const player = players[0] as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      
      if (distance <= this.detectionRange) {
        this.target = player;
        this.behavior = EnemyBehavior.CHASE;
        this.behaviorTimer = 100;
      }
    }
  }
  
  /**
   * 检查目标是否在范围内
   */
  private isTargetInRange(): boolean {
    if (!this.target || !this.target.active) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.x, 
      this.y, 
      (this.target as Phaser.Physics.Arcade.Sprite).x, 
      (this.target as Phaser.Physics.Arcade.Sprite).y
    );
    
    return distance <= this.detectionRange;
  }
  
  /**
   * 重置敌人状态
   * 当从对象池重新激活时调用
   * 此方法会被Phaser.Physics.Arcade.Group自动调用
   */
  public reset(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true).setVisible(true);
    this.target = null;
    // 确保敌人有正确的深度层级
    this.setDepth(10);
    // 确保敌人的显示尺寸正确
    this.setDisplaySize(32, 32);
    // 如果物理体存在，确保它被启用
    if (this.body) {
      this.body.enable = true;
    }
    // 随机选择行为
    this.randomizeBehavior();
    // 播放默认动画
    this.play('snake_idle', true);
    return this;
  }
}