const fs = require('fs');
const path = require('path');

// 获取工作目录
const currentDirectory = process.argv[2] || process.cwd();

// 获取子文件夹名称
const files = fs.readdirSync(currentDirectory, { withFileTypes: true });
const directoryNames = files
  .filter((file) => file.isDirectory() && !file.name.startsWith('.'))
  .map((file) => file.name);

if (directoryNames.length === 0) {
  console.log('当前目录下没有子文件夹，无法生成 Makefile');
  return;
}

// 生成 makefile 文件内容
let makefileContent =
  `#*********************************************************************************************************\n` +
  `# ENV for Build \n` +
  `#*********************************************************************************************************\n`;
directoryNames.forEach((directoryName) => {
  makefileContent += `${directoryName}\t:=${directoryName}\n`;
});

directoryNames.forEach((directoryName) => {
  makefileContent += `export WORKSPACE_${directoryName}\t:=${path.join(currentDirectory, directoryName)}\n`;
});

makefileContent += '\n';
directoryNames.forEach((directoryName) => {
  makefileContent +=
    `#*********************************************************************************************************\n` +
    `# ${directoryName} \n` +
    `#*********************************************************************************************************\n` +
    `Build_${directoryName}: $(${directoryName})\n\tbear --append -- make -C $(${directoryName}) all;\n` +
    `Clean_${directoryName}:\n\tmake -C $(${directoryName}) clean;\n` +
    `Rebuild_${directoryName}:\n\tmake -C $(${directoryName}) clean;bear --append -- make -C $(${directoryName}) all;\n` +
    `Upload_${directoryName}:\n\tsylixos-upload $(${directoryName})/.reproject root root 21;\n\n`;
});

// 将 makefile 内容写入文件
fs.writeFile(path.join(currentDirectory, 'Makefile'), makefileContent, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Makefile 生成成功!\n` + `路径：${path.join(currentDirectory, 'Makefile')}\n` +
                    `你可以将 Makefile 所在目录导入 CLion，并在 CLion 下点击 Makefile 前的按钮进行编译和部署!\n` + 
                    `尽情使用吧！`);
    }
});
