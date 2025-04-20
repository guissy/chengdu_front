import Phaser from 'phaser';
import { Howl } from 'howler';

interface Obstacle extends Phaser.Physics.Matter.Sprite {
    note: string;
    lastCollisionTime: number; // 添加上次碰撞时间记录
}

interface SoundState {
    howl: Howl;
    isPlaying: boolean;
}

interface WaveConfig {
    amplitude1: number;
    amplitude2: number;
    frequency1: number;
    frequency2: number;
    centerX: number;
    baseDistance: number;
    distanceVariation: number;
    ySpacing: number;
}

interface AngleConfig {
    leftMin: number;
    leftMax: number;
    rightMin: number;
    rightMax: number;
}

interface CollisionPair {
    bodyA: { gameObject: Phaser.GameObjects.GameObject };
    bodyB: { gameObject: Phaser.GameObjects.GameObject };
}

export default class GameScene extends Phaser.Scene {
    private marble!: Phaser.Physics.Matter.Sprite;
    private obstacles!: Phaser.GameObjects.Group;
    private sounds: { [key: string]: SoundState } = {};
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private readonly SCREEN_PADDING: number = 50; // 屏幕边距
    private readonly MOVE_SPEED: number = 6; // 新增：直接移动的速度
    private readonly BASE_COLLISION_COOLDOWN: number = 300;
    private readonly MARBLE_CONFIG = {
        restitution: 1, // 完全弹性
        friction: 0,    // 无摩擦
        frictionAir: 0, // 无空气阻力
        circleRadius: 21,
        chamfer: { radius: 10 },
        mass: 1,
        inertia: Infinity, // 防止旋转
        density: 0.001    // 降低密度，使弹跳更轻盈
    };
    private readonly COLLISION_FORCE = {
        base: 0.008,      // 基础弹力
        max: 0.015,       // 最大弹力
        min: 0.005        // 最小弹力
    };
    private glowEffects: Map<Phaser.GameObjects.Graphics, Obstacle> = new Map(); // 存储发光效果与障碍物的关联
    private lastFpsUpdate: number = 0;
    private fpsText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    preload() {
        console.log('开始加载资源...');
        this.load.image('marble', 'assets/ball.png');
        this.load.image('obstacle', 'assets/platform_gray.png');
        console.log('资源加载完成');
    }

    create() {
        console.log('开始创建场景...');
        // 设置 Matter.js 物理世界
        this.matter.world.setBounds(0, 0, 800, 6000);
        
        // 创建FPS显示
        this.fpsText = this.add.text(10, 10, 'FPS: 0', { 
            fontSize: '16px', 
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.fpsText.setScrollFactor(0);
        this.fpsText.setDepth(100);
        this.fpsText.setAlpha(0.1);

        // 创建小球
        this.marble = this.matter.add.sprite(400, 100, 'marble', undefined, this.MARBLE_CONFIG);
        this.marble.setScale(0.5);
        this.marble.setFixedRotation(); // 防止小球旋转
        this.marble.setPipeline('TextureTintPipeline');
        this.marble.setBlendMode(Phaser.BlendModes.NORMAL);
        this.marble.setPosition(400, 100);
        this.marble.setVelocity(0, 0);

        // 创建障碍物组
        this.obstacles = this.add.group();

        console.log('障碍物组创建完成');

        this.sounds = {
            'note1': this.createSound('assets/ir_samples/A1_1.wav'),
            'note2': this.createSound('assets/ir_samples/A1_2.wav'),
            'note3': this.createSound('assets/ir_samples/A1_3.wav'),
            'note4': this.createSound('assets/ir_samples/A1_4.wav'),
            'note5': this.createSound('assets/ir_samples/A1_5.wav'),
            'note6': this.createSound('assets/ir_samples/A2_1.wav'),
            'note7': this.createSound('assets/ir_samples/A2_2.wav'),
            'note8': this.createSound('assets/ir_samples/A2_3.wav'),
            'note9': this.createSound('assets/ir_samples/A2_4.wav'),
            'note10': this.createSound('assets/ir_samples/A2_5.wav'),
            'note11': this.createSound('assets/ir_samples/B_1.wav'),
            'note12': this.createSound('assets/ir_samples/B_2.wav'),
            'note13': this.createSound('assets/ir_samples/B_3.wav'),
            'note14': this.createSound('assets/ir_samples/B_4.wav'),
            'note15': this.createSound('assets/ir_samples/B_5.wav'),
            'note16': this.createSound('assets/ir_samples/C1.wav'),
            'note17': this.createSound('assets/ir_samples/C2.wav'),
            'note18': this.createSound('assets/ir_samples/C3.wav'),
            'note19': this.createSound('assets/ir_samples/C4.wav'),
            'note20': this.createSound('assets/ir_samples/C5.wav'),
            'note21': this.createSound('assets/ir_samples/D_1.wav'),
            'note22': this.createSound('assets/ir_samples/D_2.wav'),
            'note23': this.createSound('assets/ir_samples/D_3.wav'),
            'note24': this.createSound('assets/ir_samples/D_4.wav'),
            'note25': this.createSound('assets/ir_samples/D_5.wav'),
            'note26': this.createSound('assets/ir_samples/E_1.wav'),
            'note27': this.createSound('assets/ir_samples/E_2.wav'),
            'note28': this.createSound('assets/ir_samples/E_3.wav'),
            'note29': this.createSound('assets/ir_samples/E_4.wav'),
            'note30': this.createSound('assets/ir_samples/E_5.wav'),
            'note31': this.createSound('assets/ir_samples/F1.wav'),
            'note32': this.createSound('assets/ir_samples/F2.wav'),
            'note33': this.createSound('assets/ir_samples/F3.wav'),
            'note34': this.createSound('assets/ir_samples/F4.wav'),
            'note35': this.createSound('assets/ir_samples/F5.wav'),
            'note36': this.createSound('assets/ir_samples/G1.wav'),
            'note37': this.createSound('assets/ir_samples/G2.wav'),
            'note38': this.createSound('assets/ir_samples/G3.wav'),
            'note39': this.createSound('assets/ir_samples/G4.wav'),
            'note40': this.createSound('assets/ir_samples/G5.wav'),
            'note41': this.createSound('assets/ir_samples/Gliss_1.wav'),
            'note42': this.createSound('assets/ir_samples/Gliss_2.wav')
        };

        this.createObstacles();
        console.log('障碍物创建完成，数量:', this.obstacles.getLength());

        // 设置碰撞检测
        this.marble.setOnCollide((pair: CollisionPair) => {
            const obstacle = pair.bodyB.gameObject === this.marble ? pair.bodyA.gameObject : pair.bodyB.gameObject;
            if (obstacle && (obstacle as Obstacle).note) {
                const currentTime = this.time.now;
                const typedObstacle = obstacle as Obstacle;
                const cooldown = this.getCollisionCooldown();
                if (!typedObstacle.lastCollisionTime || currentTime - typedObstacle.lastCollisionTime > cooldown) {
                    typedObstacle.lastCollisionTime = currentTime;
                    this.handleCollision(typedObstacle);
                }
            }
        });

        this.cameras.main.startFollow(this.marble, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 800, 6000);

        this.cursors = this.input.keyboard!.createCursorKeys();

        // 启用物理调试（可选，调试完成后可关闭）
        // this.physics.world.createDebugGraphic();
    }

    private createSound(src: string): SoundState {
        const howl = new Howl({ 
            src: [src],
            volume: 0.7,
            loop: false,
            rate: 1.0
        });
        const soundState: SoundState = { howl, isPlaying: false };

        howl.on('end', () => {
            soundState.isPlaying = false;
        });

        return soundState;
    }

    private handleCollision(obstacle: Obstacle) {
        if (!obstacle.note) return;

        const soundState = this.sounds[obstacle.note];
        if (!soundState.isPlaying) {
            soundState.isPlaying = true;
            soundState.howl.play();
            
            // 创建发光效果
            this.createGlowEffect(obstacle);
            
            // 添加旋转动画
            this.addRotationAnimation(obstacle);

            // 计算碰撞角度
            const angle = Phaser.Math.Angle.Between(
                this.marble.x, this.marble.y,
                obstacle.x, obstacle.y
            );

            // 根据碰撞角度计算弹力
            const force = this.calculateCollisionForce(angle);
            
            // 计算当前速度
            const currentVelocity = this.marble.body!.velocity;
            let currentSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
            
            // 根据当前速度调整弹力
            const speedFactor = Math.min(1, currentSpeed / 5);
            const adjustedForce = force * (1 + speedFactor);
            
            // 施加弹力
            this.marble.applyForce(new Phaser.Math.Vector2(
                Math.cos(angle) * adjustedForce,
                Math.sin(angle) * adjustedForce
            ));

            // 添加轻微的旋转效果
            const rotationSpeed = Phaser.Math.Between(-0.1, 0.1);
            this.marble.setAngularVelocity(rotationSpeed);

            // 补偿低速，防止卡住或弹性不足
            const velocity = this.marble.body!.velocity;
            const minSpeed = 2.5; // 可根据体验调整
            currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (currentSpeed < minSpeed) {
                const angle = Math.atan2(velocity.y, velocity.x);
                this.marble.setVelocity(
                    Math.cos(angle) * minSpeed,
                    Math.sin(angle) * minSpeed
                );
            }
        }
    }

    private calculateCollisionForce(angle: number): number {
        // 根据垂直分量调整弹力
        const verticalComponent = Math.abs(Math.sin(angle));
        const force = this.COLLISION_FORCE.base * (1 + verticalComponent);
        
        // 添加随机性，使弹跳更有趣
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        // 限制弹力范围
        return Phaser.Math.Clamp(
            force * randomFactor,
            this.COLLISION_FORCE.min,
            this.COLLISION_FORCE.max
        );
    }

    private createGlowEffect(obstacle: Obstacle) {
        const glow = this.add.graphics();
        glow.setDepth(2);
        this.glowEffects.set(glow, obstacle);
        
        const color = this.getNoteColor(obstacle.note);
        const width = 162 * 0.5;
        const height = 32 * 0.5;
        
        // 创建发光动画
        this.tweens.add({
            targets: glow,
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2',
            onUpdate: () => {
                this.updateGlowEffect(glow, obstacle, color, width, height);
            },
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.glowEffects.delete(glow);
                    glow.destroy();
                });
            }
        });
    }

    private addRotationAnimation(obstacle: Obstacle) {
        const currentRotation = obstacle.rotation;
        const targetRotation = currentRotation + Phaser.Math.DegToRad(10); // 减小旋转角度
        
        this.tweens.add({
            targets: obstacle,
            rotation: targetRotation,
            duration: 80, // 缩短动画时间
            ease: 'Sine.easeInOut', // 使用更平滑的缓动函数
            yoyo: true,
            repeat: 0 // 仅执行一次
        });
    }

    private getNoteColor(note: string): number {
        const colors: Record<string, number> = {
            'note1': 0xff0000, 'note2': 0xff4000, 'note3': 0xff8000, 'note4': 0xffbf00, 'note5': 0xffff00,
            'note6': 0xbfff00, 'note7': 0x80ff00, 'note8': 0x40ff00, 'note9': 0x00ff00, 'note10': 0x00ff40,
            'note11': 0x00ff80, 'note12': 0x00ffbf, 'note13': 0x00ffff, 'note14': 0x00bfff, 'note15': 0x0080ff,
            'note16': 0x0040ff, 'note17': 0x0000ff, 'note18': 0x4000ff, 'note19': 0x8000ff, 'note20': 0xbf00ff,
            'note21': 0xff00ff, 'note22': 0xff00bf, 'note23': 0xff0080, 'note24': 0xff0040, 'note25': 0xff0000,
            'note26': 0xff4000, 'note27': 0xff8000, 'note28': 0xffbf00, 'note29': 0xffff00, 'note30': 0xbfff00,
            'note31': 0x80ff00, 'note32': 0x40ff00, 'note33': 0x00ff00, 'note34': 0x00ff40, 'note35': 0x00ff80,
            'note36': 0x00ffbf, 'note37': 0x00ffff, 'note38': 0x00bfff, 'note39': 0x0080ff, 'note40': 0x0040ff,
            'note41': 0x0000ff, 'note42': 0x4000ff
        };
        return colors[note] || 0xffffff;
    }

    private createObstacles() {
        console.log('开始创建障碍物...');
        const notes = ['note1', 'note2', 'note3', 'note4', 'note5', 'note6', 'note7', 'note8', 
                      'note9', 'note10', 'note11', 'note12', 'note13', 'note14', 'note15',
                      'note16', 'note17', 'note18', 'note19', 'note20', 'note21', 'note22',
                      'note23', 'note24', 'note25', 'note26', 'note27', 'note28', 'note29',
                      'note30', 'note31', 'note32', 'note33', 'note34', 'note35', 'note36',
                      'note37', 'note38', 'note39', 'note40', 'note41', 'note42'];
        
        // 波浪曲线路径参数
        const waveConfig = {
            amplitude1: 80,
            amplitude2: 30,
            frequency1: 0.0015,
            frequency2: 0.003,
            centerX: 400,
            baseDistance: 100,
            distanceVariation: 20,
            ySpacing: 160
        };
        
        // 角度范围配置
        const angleConfig = {
            leftMin: 35,
            leftMax: 55,
            rightMin: 125,
            rightMax: 145
        };
        
        for (let y = 300; y < 1400; y += waveConfig.ySpacing) {
            const pathX = this.calculateWavePath(y, waveConfig);
            const yOffset = Phaser.Math.Between(-15, 15);
            
            // 创建左右两侧的障碍物
            this.createObstaclePair(
                pathX, 
                y + yOffset, 
                waveConfig, 
                angleConfig, 
                notes
            );
        }
        console.log('障碍物创建完成');
    }
    
    private calculateWavePath(y: number, config: WaveConfig): number {
        const offsetX1 = Math.sin(y * config.frequency1) * config.amplitude1;
        const offsetX2 = Math.sin(y * config.frequency2) * config.amplitude2;
        return config.centerX + offsetX1 + offsetX2;
    }
    
    private createObstaclePair(
        pathX: number, 
        y: number, 
        waveConfig: WaveConfig, 
        angleConfig: AngleConfig, 
        notes: string[]
    ) {
        const leftOffset = Phaser.Math.Between(-waveConfig.distanceVariation, waveConfig.distanceVariation);
        const rightOffset = Phaser.Math.Between(-waveConfig.distanceVariation, waveConfig.distanceVariation);
        
        // 左侧障碍物
        this.createObstacleAtPosition(
            pathX - (waveConfig.baseDistance + leftOffset), 
            y, 
            Phaser.Math.Between(angleConfig.leftMin, angleConfig.leftMax),
            notes
        );
        
        // 右侧障碍物
        this.createObstacleAtPosition(
            pathX + (waveConfig.baseDistance + rightOffset), 
            y, 
            Phaser.Math.Between(angleConfig.rightMin, angleConfig.rightMax),
            notes
        );
    }
    
    private createObstacleAtPosition(x: number, y: number, angle: number, notes: string[]) {
        const width = 162;
        const height = 32;

        const obstacle = this.matter.add.sprite(x, y, 'obstacle', undefined, {
            shape: { type: 'rectangle', width, height },
            isStatic: true,
            restitution: 1,  // 完全弹性
            friction: 0,     // 无摩擦
            frictionAir: 0,  // 无空气阻力
            chamfer: { radius: 5 } // 添加圆角，使碰撞更平滑
        }) as Obstacle;

        obstacle.setRotation(Phaser.Math.DegToRad(angle));
        obstacle.setScale(0.5);
        obstacle.setDepth(1);
        obstacle.setPipeline('TextureTintPipeline');
        obstacle.setBlendMode(Phaser.BlendModes.NORMAL);
        obstacle.note = notes[Phaser.Math.Between(0, notes.length - 1)];
        obstacle.lastCollisionTime = 0;

        this.obstacles.add(obstacle);
    }
    
    // 新增方法：更新发光效果
    private updateGlowEffect(glow: Phaser.GameObjects.Graphics, obstacle: Obstacle, color: number, width: number, height: number) {
        glow.clear();
        
        // 计算旋转后的四个顶点
        const cos = Math.cos(obstacle.rotation);
        const sin = Math.sin(obstacle.rotation);
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        
        // 计算四个顶点的位置
        const points = [
            { x: -halfWidth * cos + halfHeight * sin, y: -halfWidth * sin - halfHeight * cos },
            { x: halfWidth * cos + halfHeight * sin, y: halfWidth * sin - halfHeight * cos },
            { x: halfWidth * cos - halfHeight * sin, y: halfWidth * sin + halfHeight * cos },
            { x: -halfWidth * cos - halfHeight * sin, y: -halfWidth * sin + halfHeight * cos }
        ];
        
        // 绘制发光效果
        glow.lineStyle(4, color, glow.alpha);
        glow.beginPath();
        glow.fillStyle(color, glow.alpha * 1);
        glow.moveTo(obstacle.x + points[0].x, obstacle.y + points[0].y);
        for (let i = 1; i < points.length; i++) {
            glow.lineTo(obstacle.x + points[i].x, obstacle.y + points[i].y);
        }
        glow.closePath();
        glow.strokePath();
        
        // 填充发光效果
        glow.fillStyle(color, glow.alpha * 1);
        glow.fillPath();
    }
    
    private getCollisionCooldown(): number {
        // 根据游戏进度动态调整冷却时间
        const progress = this.cameras.main.scrollY / 1000;
        return Math.max(200, this.BASE_COLLISION_COOLDOWN - Math.floor(progress) * 20);
    }

    update() {
        // 更新FPS显示
        const currentTime = this.time.now;
        if (currentTime - this.lastFpsUpdate > 1000) {
            const fps = Math.round(this.game.loop.actualFps);
            this.fpsText.setText(`FPS: ${fps}`);
            this.lastFpsUpdate = currentTime;
        }

        // 确保小球始终在屏幕范围内
        const minX = this.SCREEN_PADDING;
        const maxX = 800 - this.SCREEN_PADDING;
        
        // 使用位置直接控制而不是速度控制
        if (this.cursors.left.isDown) {
            const newX = Math.max(minX, this.marble.x - this.MOVE_SPEED);
            this.marble.setPosition(newX, this.marble.y + 1);
            this.marble.setVelocityX(0);
        } else if (this.cursors.right.isDown) {
            const newX = Math.min(maxX, this.marble.x + this.MOVE_SPEED);
            this.marble.setPosition(newX, this.marble.y + 1);
            this.marble.setVelocityX(0);
        }

        // 添加重力效果
        if (this.marble.body) {
            // 应用重力
            this.matter.world.localWorld.gravity.y = 0.5;
            
            // 获取当前速度
            const velocity = this.marble.body.velocity;
            
            // 限制最大速度
            const maxSpeed = 15;
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > maxSpeed) {
                const scale = maxSpeed / speed;
                this.marble.setVelocity(velocity.x * scale, velocity.y * scale);
            }
            
            // 逐渐减小角速度，使旋转更自然
            const body = this.marble.body as MatterJS.BodyType;
            if (!body.isStatic) {
                const currentAngularVelocity = body.angularVelocity;
                if (Math.abs(currentAngularVelocity) > 0.01) {
                    this.marble.setAngularVelocity(currentAngularVelocity * 0.95);
                } else {
                    this.marble.setAngularVelocity(0);
                }
            }
        }

        // 强制限制小球位置
        if (this.marble.x < minX) {
            this.marble.setPosition(minX, this.marble.y);
            this.marble.setVelocityX(0);
        } else if (this.marble.x > maxX) {
            this.marble.setPosition(maxX, this.marble.y);
            this.marble.setVelocityX(0);
        }

        // 更新摄像机位置，使其平滑跟随小球
        const camera = this.cameras.main;
        const targetY = this.marble.y - 200; // 让摄像机保持在小球上方200像素
        const currentY = camera.scrollY;
        const newY = currentY + (targetY - currentY) * 0.1; // 使用缓动效果
        camera.setScroll(0, newY);
    
        // 更新所有发光效果的位置
        this.glowEffects.forEach((obstacle, glow) => {
            const width = 162 * 0.5;
            const height = 32 * 0.5;
            const colors: Record<string, number> = {
                'note1': 0xff0000, 'note2': 0xff4000, 'note3': 0xff8000, 'note4': 0xffbf00, 'note5': 0xffff00,
                'note6': 0xbfff00, 'note7': 0x80ff00, 'note8': 0x40ff00, 'note9': 0x00ff00, 'note10': 0x00ff40,
                'note11': 0x00ff80, 'note12': 0x00ffbf, 'note13': 0x00ffff, 'note14': 0x00bfff, 'note15': 0x0080ff,
                'note16': 0x0040ff, 'note17': 0x0000ff, 'note18': 0x4000ff, 'note19': 0x8000ff, 'note20': 0xbf00ff,
                'note21': 0xff00ff, 'note22': 0xff00bf, 'note23': 0xff0080, 'note24': 0xff0040, 'note25': 0xff0000,
                'note26': 0xff4000, 'note27': 0xff8000, 'note28': 0xffbf00, 'note29': 0xffff00, 'note30': 0xbfff00,
                'note31': 0x80ff00, 'note32': 0x40ff00, 'note33': 0x00ff00, 'note34': 0x00ff40, 'note35': 0x00ff80,
                'note36': 0x00ffbf, 'note37': 0x00ffff, 'note38': 0x00bfff, 'note39': 0x0080ff, 'note40': 0x0040ff,
                'note41': 0x0000ff, 'note42': 0x4000ff
            };
            const color = colors[obstacle.note] || 0xffffff;
            
            this.updateGlowEffect(glow, obstacle, color, width, height);
        });
    
        // 更新障碍物位置
        this.obstacles.getChildren().forEach((obstacle: Phaser.GameObjects.GameObject) => {
            const sprite = obstacle as Phaser.Physics.Matter.Sprite;
            
            // 更新 sprite 和物理体的位置
            sprite.y -= 2; // 保持障碍物缓慢向上移动
            sprite.setPosition(sprite.x, sprite.y);
    
            // 如果障碍物移出屏幕顶部，重新放置到屏幕底部
            if (sprite.y < this.cameras.main.scrollY - 100) {
                // 清理与该障碍物相关的所有发光效果
                this.glowEffects.forEach((obstacle, glow) => {
                    if (obstacle === sprite) {
                        glow.destroy();
                        this.glowEffects.delete(glow);
                    }
                });

                // 计算新的波浪路径位置，与createObstacles方法保持一致
                const amplitude1 = 80; // 主波浪振幅
                const amplitude2 = 30; // 次波浪振幅
                const frequency1 = 0.012; // 主波浪频率
                const frequency2 = 0.030; // 次波浪频率
                const centerX = 400;
                const baseDistanceFromPath = 100;
                const distanceVariation = 20;
                
                // 计算新的y位置，增加随机性
                const newY = this.cameras.main.scrollY + 600 + Phaser.Math.Between(0, 100);
                
                // 计算波浪路径的中心点，使用多个正弦函数叠加
                const offsetX1 = Math.sin(newY * frequency1) * amplitude1;
                const offsetX2 = Math.sin(newY * frequency2) * amplitude2;
                const pathX = centerX + offsetX1 + offsetX2;
                
                // 确定是左侧还是右侧障碍物（基于当前角度）
                const isLeftSide = sprite.angle >= 0 && sprite.angle < 90;
                
                // 为障碍物添加随机偏移
                const distanceOffset = Phaser.Math.Between(-distanceVariation, distanceVariation);
                const distance = baseDistanceFromPath + distanceOffset;
                
                // 设置新的x位置
                sprite.x = isLeftSide ? pathX - distance : pathX + distance;
                sprite.y = newY + Phaser.Math.Between(-15, 15); // 添加垂直偏移

                // 同步物理体位置
                sprite.setPosition(sprite.x, sprite.y);

                // 更新角度，增加更大的随机性，与波浪路径协调
                const angle = isLeftSide
                    ? Phaser.Math.Between(35, 55) // 左侧角度范围，增加变化
                    : Phaser.Math.Between(125, 145); // 右侧角度范围，增加变化
                sprite.setRotation(Phaser.Math.DegToRad(angle));
                sprite.setAngle(angle); // 更新物理体角度
    
                // 重新分配音符
                const notes = ['note1', 'note2', 'note3', 'note4', 'note5', 'note6', 'note7', 'note8', 
                              'note9', 'note10', 'note11', 'note12', 'note13', 'note14', 'note15',
                              'note16', 'note17', 'note18', 'note19', 'note20', 'note21', 'note22',
                              'note23', 'note24', 'note25', 'note26', 'note27', 'note28', 'note29',
                              'note30', 'note31', 'note32', 'note33', 'note34', 'note35', 'note36',
                              'note37', 'note38', 'note39', 'note40', 'note41', 'note42'];
                (sprite as Obstacle).note = notes[Phaser.Math.Between(0, notes.length - 1)];
            }
        });
    }
}