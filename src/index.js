/**
 * @name plugin example
 * @param option: { data, filePath, config }
 * - data: module and generate code Data
 * - filePath: Pull file storage directory
 * - config: cli config
 */

const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

function replaceLocalImports(panelValue, imports, fileName) {
  let replacement = '../';
  if (fileName === 'index') {
    replacement = './component/';
  }
  imports.forEach(item => {
    const newItem = item.replace('./', replacement);
    panelValue = panelValue.replace(item, newItem);
  });
  return panelValue;
}

function replaceCssImport(panelValue, fileName) {
  panelValue = panelValue.replace(
    `import styles from './${fileName}.css';`,
    `import styles from './index.css';`
  );
  return panelValue;
}

function collectImports(imports, panelImports) {
  const realImports = panelImports
    .filter(item => {
      return item.indexOf('./') === -1;
    })
    .concat(imports);
  return Array.from(new Set(realImports));
}

function getPageName(data) {
  if (data && data.moduleData) {
    if (data.moduleData.name) {
      return data.moduleData.name;
    } else if (data.moduleData.id) {
      return 'page' + data.moduleData.id;
    }
  }
  return 'page';
}

/**
 * 源码生成后，将依赖的 npm 包写入 package.json
 * @param {*} projectPath
 * @param {*} imports
 */
function updatePackageJSON(projectPath, imports) {
  const packages = imports.map(item => {
    return item.match(/\'(.*)?\'/g)[0].slice(1, -1);
  });
  const packageJSONPath = path.join(projectPath, 'package.json');
  if (!fs.pathExistsSync(packageJSONPath)) {
    return false;
  }
  try {
    const json = JSON.parse(fs.readFileSync(packageJSONPath).toString());
    if (!json.dependencies) {
      json.dependencies = {};
    }
    if (!json.devDependencies) {
      json.devDependencies = {};
    }
    packages.forEach(name => {
      if (!json.dependencies[name] && !json.devDependencies[name]) {
        json.dependencies[name] = '*';
      }
    });
    fs.writeFileSync(packageJSONPath, `${JSON.stringify(json, null, 2)}\n`, 'utf-8');
  } catch (e) {}
}

/**
 * Rax 1.0 多页应用 && 单页应用源码生成更新路由信息 app.json
 * @param {*} projectPath
 * @param {*} pageName
 */
function updateAppJSON(projectPath, pageName, projectType) {
  if (
    projectType.type === util.PROJECT_TYPE.Rax1MultiApp.type ||
    projectType.type === util.PROJECT_TYPE.Rax1SPAApp.type
  ) {
    const appJSONPath = path.join(projectPath, 'src/app.json');
    if (!fs.pathExistsSync(appJSONPath)) {
      return false;
    }
    try {
      const json = JSON.parse(fs.readFileSync(appJSONPath).toString());
      if (!json.routes) {
        json.routes = [];
      }
      json.routes.push({
        path: `/${pageName}`,
        source: `pages/${pageName}/index`
      });
      fs.writeFileSync(appJSONPath, `${JSON.stringify(json, null, 2)}\n`, 'utf-8');
    } catch (e) {}
  }
}

const pluginHandler = async options => {
  let { config, filePath: projectPath, data } = options;
  let imports = [];
  let result = {
    errorList: []
  };

  const isTSProject = fs.pathExistsSync(path.join(projectPath, 'tsconfig.json'));
  const projectType = util.getProjectType(projectPath);
  let codeDirectory = '';
  const pageName = getPageName(data);
  try {
    codeDirectory = util.getCodeDirectory(projectType, projectPath, pageName);
    fs.ensureDirSync(codeDirectory);
  } catch (error) {
    codeDirectory = projectPath;
    result.errorList.push(error);
  }

  const panelDisplay = data.code.panelDisplay;
  for (const item of panelDisplay) {
    try {
      let { panelName, panelValue, panelImports = [] } = item;
      let filePath = '';
      const fileName = panelName.split('.')[0];
      const fileType = util.optiFileType(panelName.split('.')[1], isTSProject, projectType);
      if (fileName !== 'index' && fileName !== 'context') {
        filePath = path.resolve(codeDirectory, 'component', fileName, `index21.${fileType}`);
      } else {
        filePath = path.resolve(codeDirectory, `${fileName}.${fileType}`);
      }
      panelValue = replaceCssImport(panelValue, fileName);
      panelValue = replaceLocalImports(panelValue, panelImports, fileName);
      const componentPackage = path.resolve(codeDirectory, 'component', fileName, `package.json`);
      fs.outputFileSync(componentPackage, `{"name": "${fileName}"}`);
      fs.outputFileSync(filePath, panelValue);
      imports = collectImports(imports, panelImports);
    } catch (error) {
      result.errorList.push(error);
    }
  }

  updatePackageJSON(projectPath, imports);
  updateAppJSON(projectPath, pageName, projectType);
  return options;
};

module.exports = (...args) => {
  return pluginHandler(...args).catch(err => {
    console.log(err);
  });
};
