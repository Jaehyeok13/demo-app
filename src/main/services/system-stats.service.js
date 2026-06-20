/**
 * @FileName    : system-stats.service.js
 * @Description : 시스템(CPU, 메모리) 상태 조회 서비스
 */

'use strict';

const os = require('os');
const { exec } = require('child_process');

class SystemStatsService {
  constructor() {
    this.lastCpuUsage = null;
    this.lastTime     = null;
  }

  /**
   * @description 전체 연산량 대비 사용률 계산 (0~100)
   */
  async getCpuUsage() {
    return new Promise((resolve) => {
      try {
        const cpus = os.cpus();
        if (!cpus || cpus.length === 0) return resolve(0);
        
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
          for (const type in cpu.times) {
            totalTick += cpu.times[type];
          }
          totalIdle += cpu.times.idle;
        });

        const currentTotalTick = totalTick;
        const currentTotalIdle = totalIdle;

        if (this.lastCpuUsage) {
          const idleDiff = currentTotalIdle - this.lastCpuUsage.idle;
          const tickDiff = currentTotalTick - this.lastCpuUsage.tick;
          
          if (tickDiff <= 0) {
            return resolve(0);
          }

          const usage = Math.min(100, Math.max(0, 100 - Math.floor((100 * idleDiff) / tickDiff)));
          
          this.lastCpuUsage = { idle: currentTotalIdle, tick: currentTotalTick };
          resolve(usage);
        } else {
          this.lastCpuUsage = { idle: currentTotalIdle, tick: currentTotalTick };
          // 첫 호출 시엔 0 혹은 시도
          setTimeout(async () => {
            resolve(await this.getCpuUsage());
          }, 200);
        }
      } catch (e) {
        console.error('CPU stats error:', e);
        resolve(0);
      }
    });
  }

  /**
   * @description 메모리 정보 리턴 (단위: GB)
   */
  getMemoryInfo() {
    try {
      const total = os.totalmem();
      const free  = os.freemem();
      const used  = Math.max(0, total - free);

      return {
        total: (total / (1024 ** 3)).toFixed(1),
        used : (used / (1024 ** 3)).toFixed(1),
        percent: total > 0 ? Math.min(100, Math.floor((used / total) * 100)) : 0
      };
    } catch (e) {
      console.error('Memory stats error:', e);
      return { total: '0.0', used: '0.0', percent: 0 };
    }
  }

  /**
   * @description 전체 정보 패키징
   */
  async getStats() {
    const cpu = await this.getCpuUsage();
    const mem = this.getMemoryInfo();

    return { cpu, mem };
  }
}

module.exports = new SystemStatsService();
