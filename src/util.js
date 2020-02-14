const fs = require('fs-extra');
const path = require('path');
const { PROJECT_TYPE } = require('./constant');

function genUniqueDirectory(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback 必须是函数并且返回路径');
  }
  let count = 0;
  let dir = callback('');
  while (fs.pathExistsSync(dir)) {
    count++;
    dir = callback(String(count));
  }
  return dir;
}

function getCodeDirectory(projectType, projectPath, pageName) {
  let codeDirectory = '';
  switch (projectType.type) {
    case PROJECT_TYPE.Rax1MultiApp.type:
    case PROJECT_TYPE.Rax1SPAApp.type: {
      // 应用级别的代码不覆盖生成
      codeDirectory = genUniqueDirectory(unique => {
        return path.resolve(projectPath, `src/pages/${pageName + unique}`);
      });
      break;
    }
    case PROJECT_TYPE.Rax1Comp.type:
    case PROJECT_TYPE.Rax1CompUI.type: {
      // 组件代码覆盖生成
      codeDirectory = path.resolve(projectPath, 'src');
      break;
    }
    case PROJECT_TYPE.Rax1TBEMod.type: {
      // 天马模块目录
      codeDirectory = path.resolve(projectPath, 'src/mobile');
      if (!fs.pathExistsSync(codeDirectory)) {
        // 天马组件目录
        codeDirectory = path.resolve(projectPath, 'src');
      }
      break;
    }
    default: {
      // 默认当成模块导出
      codeDirectory = path.resolve(projectPath, pageName);
      break;
    }
  }
  return codeDirectory;
}

function getProjectType(projectPath) {
  const projectBuildPath = path.join(projectPath, 'build.json');
  const projectABCPath = path.join(projectPath, 'abc.json');
  if (fs.existsSync(projectBuildPath)) {
    try {
      const jsonString = fs.readFileSync(projectBuildPath).toString();
      if (jsonString.indexOf('build-plugin-rax-app') > -1) {
        if (jsonString.indexOf('build-plugin-rax-multi-pages') > -1) {
          return PROJECT_TYPE.Rax1MultiApp;
        } else {
          return PROJECT_TYPE.Rax1SPAApp;
        }
      } else if (jsonString.indexOf('build-plugin-rax-component') > -1) {
        if (jsonString.indexOf('build-plugin-multi-demo-portal') > -1) {
          return PROJECT_TYPE.Rax1CompUI;
        } else {
          return PROJECT_TYPE.Rax1Comp;
        }
      }
    } catch (e) {
      console.error('解析 build.json 出错');
    }
  } else if (fs.existsSync(projectABCPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(projectABCPath).toString());
      if (json.builder && typeof json.builder === 'string') {
        if (json.type === 'tbe-mod') {
          return PROJECT_TYPE.Rax1TBEMod;
        }
      }
    } catch (e) {
      console.error('解析 abc.json 出错');
    }
  }
  return PROJECT_TYPE.Other;
}

function optiFileType(fileType, isTS, projectType) {
  if (isTS) {
    if (fileType === 'js') {
      return 'ts';
    }
    if (fileType === 'jsx') {
      return 'tsx';
    }
  } else if (['js', 'jsx'].indexOf(fileType) > -1) {
    return projectType.jsType;
  }
  return fileType;
}

module.exports = {
  PROJECT_TYPE,
  getProjectType,
  getCodeDirectory,
  optiFileType
};
