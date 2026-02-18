#!/usr/bin/env node

/**
 * 版本管理器 - 自动递增APK版本号
 * Version Manager - Auto-increment APK version numbers
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const BUILD_GRADLE_PATH = path.join(__dirname, '../android-app/android/app/build.gradle');
const VERSION_FILE_PATH = path.join(__dirname, '../version.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '../android-app/package.json');

// 默认版本信息
const DEFAULT_VERSION = {
    versionCode: 1,
    versionName: "1.18.4",
    buildNumber: 0,
    lastBuildDate: new Date().toISOString()
};

/**
 * 读取当前版本信息
 */
function readCurrentVersion() {
    try {
        if (fs.existsSync(VERSION_FILE_PATH)) {
            const content = fs.readFileSync(VERSION_FILE_PATH, 'utf8');
            return JSON.parse(content);
        }
        // 如果 version.json 不存在，从 package.json 读取
        if (fs.existsSync(PACKAGE_JSON_PATH)) {
            const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
            return {
                ...DEFAULT_VERSION,
                versionName: pkg.version || DEFAULT_VERSION.versionName
            };
        }
    } catch (error) {
        console.warn('读取版本文件失败，使用默认版本:', error.message);
    }
    return { ...DEFAULT_VERSION };
}

/**
 * 保存版本信息
 */
function saveVersion(versionInfo) {
    try {
        fs.writeFileSync(VERSION_FILE_PATH, JSON.stringify(versionInfo, null, 2));
        console.log('✅ 版本信息已保存:', versionInfo);
    } catch (error) {
        console.error('❌ 保存版本文件失败:', error.message);
        throw error;
    }
}

/**
 * 递增版本号
 */
function incrementVersion(currentVersion, incrementType = 'patch') {
    const newVersion = { ...currentVersion };

    // 递增构建号
    newVersion.buildNumber = (currentVersion.buildNumber || 0) + 1;
    newVersion.versionCode = (currentVersion.versionCode || 1) + 1;
    newVersion.lastBuildDate = new Date().toISOString();

    // 解析版本名称 (语义化版本)
    const versionParts = (currentVersion.versionName || '1.18.4').split('.');
    let major = parseInt(versionParts[0]) || 1;
    let minor = parseInt(versionParts[1]) || 18;
    let patch = parseInt(versionParts[2]) || 4;

    switch (incrementType) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
        default:
            patch++;
            break;
    }

    newVersion.versionName = `${major}.${minor}.${patch}`;

    return newVersion;
}

/**
 * 更新 build.gradle 文件
 */
function updateBuildGradle(versionInfo) {
    try {
        if (!fs.existsSync(BUILD_GRADLE_PATH)) {
            throw new Error('build.gradle 文件不存在: ' + BUILD_GRADLE_PATH);
        }

        let content = fs.readFileSync(BUILD_GRADLE_PATH, 'utf8');

        // 更新 versionCode
        content = content.replace(
            /versionCode\s+\d+/,
            `versionCode ${versionInfo.versionCode}`
        );

        // 更新 versionName
        content = content.replace(
            /versionName\s+"[^"]*"/,
            `versionName "${versionInfo.versionName}"`
        );

        fs.writeFileSync(BUILD_GRADLE_PATH, content);
        console.log('✅ build.gradle 已更新');

    } catch (error) {
        console.error('❌ 更新 build.gradle 失败:', error.message);
        throw error;
    }
}

/**
 * 更新 package.json 版本
 */
function updatePackageJson(versionInfo) {
    try {
        if (!fs.existsSync(PACKAGE_JSON_PATH)) {
            console.warn('⚠️  package.json 不存在，跳过更新');
            return;
        }

        const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
        pkg.version = versionInfo.versionName;
        fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');
        console.log('✅ package.json 已更新');

    } catch (error) {
        console.warn('⚠️  更新 package.json 失败:', error.message);
    }
}

/**
 * 生成构建信息
 */
function generateBuildInfo(versionInfo) {
    const buildInfo = {
        version: versionInfo.versionName,
        versionCode: versionInfo.versionCode,
        buildNumber: versionInfo.buildNumber,
        buildDate: versionInfo.lastBuildDate,
        gitCommit: process.env.GITHUB_SHA || 'unknown',
        gitBranch: process.env.GITHUB_REF_NAME || 'unknown',
        buildId: process.env.GITHUB_RUN_ID || 'unknown'
    };

    const buildInfoPath = path.join(__dirname, '../android-app/web/build-info.json');

    try {
        fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
        console.log('✅ 构建信息已生成:', buildInfoPath);
    } catch (error) {
        console.warn('⚠️  生成构建信息失败:', error.message);
    }

    return buildInfo;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始版本管理流程...');

    try {
        // 读取当前版本
        const currentVersion = readCurrentVersion();
        console.log('📋 当前版本:', currentVersion);

        // 获取递增类型（从命令行参数）
        const incrementType = process.argv[2] || 'patch';
        console.log('📈 递增类型:', incrementType);

        // 递增版本
        const newVersion = incrementVersion(currentVersion, incrementType);
        console.log('🆕 新版本:', newVersion);

        // 更新 build.gradle
        updateBuildGradle(newVersion);

        // 更新 package.json
        updatePackageJson(newVersion);

        // 保存版本信息
        saveVersion(newVersion);

        // 生成构建信息
        const buildInfo = generateBuildInfo(newVersion);

        console.log('\n🎉 版本管理完成！');
        console.log('📱 APK 版本信息:');
        console.log(`   版本号: ${newVersion.versionName}`);
        console.log(`   版本代码: ${newVersion.versionCode}`);
        console.log(`   构建号: ${newVersion.buildNumber}`);
        console.log(`   构建时间: ${new Date().toLocaleString()}`);

    } catch (error) {
        console.error('\n❌ 版本管理失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('程序异常:', error);
        process.exit(1);
    });
}

module.exports = {
    readCurrentVersion,
    incrementVersion,
    updateBuildGradle,
    updatePackageJson,
    generateBuildInfo
};
