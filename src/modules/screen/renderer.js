let currentSubmitHandler = null;

const fileInputEl = document.getElementById('select-file');
const actionButtonEl = document.getElementById('action-button');
const projectNameInputEl = document.getElementById('project-name');
const modifiedDateInputEl = document.getElementById('last-modified');
const formEl = document.getElementById('form');
const versionInputEl = document.getElementById('version');
const modifiedByInputEl = document.getElementById('modified-by');

fileInputEl.addEventListener('click', () => (this.value = null));
fileInputEl.addEventListener('close', () => (this.value = null));
fileInputEl.addEventListener('change', () => loadFile(fileInputEl.files[0]));

function loadFile(file) {
  const reader = new FileReader();
  const splittedPath = file.path.split('.');

  reader.onload = function (event) {
    const initialTxtContent = event.target.result;
    const splittedInitialTxtContent = initialTxtContent.split('\n');
    if (splittedPath.length === 2 && splittedPath[1] === 'env') {
      enableInputs();
      modifiedDateInputEl.disabled = true;
      const pattern = /^# Projeto:/;
      if (!pattern.test(splittedInitialTxtContent[0])) {
        // SE O ARQUIVO AINDA NÃO TIVER SIDO CRIPTOGRAFADO
        formEl.removeEventListener('submit', currentSubmitHandler);
        currentSubmitHandler = function (e) {
          handleEncryptSubmit(e, initialTxtContent, splittedPath[0]);
        };
        formEl.addEventListener('submit', currentSubmitHandler);
      } else {
        // SE O ARQUIVO JÁ FOI CRIPTOGRAFADO
        const fileData = splittedInitialTxtContent
          .filter((_, index) => index <= 3)
          .map((line, index) => {
            if (index === 1) {
              const matchTimestamp = line.match(/\((\d+)\)/);
              return Number(matchTimestamp[1]);
            } else return line.split(':')[1].trim();
          });
        setInputValues(fileData);
        const envVariables = splittedInitialTxtContent.filter((_, index) => index >= 7).join('\n');
        formEl.removeEventListener('submit', currentSubmitHandler);
        currentSubmitHandler = function (e) {
          handleEncryptSubmit(e, envVariables, splittedPath[0]);
        };
        formEl.addEventListener('submit', currentSubmitHandler);
      }
      actionButtonEl.innerText = 'Criptografar';
    } else if (splittedPath.length === 3 && splittedPath[2] === 'encrypted') {
      // SE O ARQUIVO ESTIVER CRIPTOGRAFADO
      setInitialElValues('fileInput');
      actionButtonEl.disabled = false;
      formEl.removeEventListener('submit', currentSubmitHandler);
      currentSubmitHandler = function (e) {
        handleDecryptSubmit(e, initialTxtContent, splittedPath[0]);
      };
      formEl.addEventListener('submit', currentSubmitHandler);
      actionButtonEl.innerText = 'Descriptografar';
    }
  };

  reader.readAsText(file);
}

function handleEncryptSubmit(e, txtContent, path) {
  e.preventDefault();
  const newFileTxtContent = generateNewTxtContent(
    projectNameInputEl.value,
    getTodayDateString(),
    versionInputEl.value,
    modifiedByInputEl.value,
    txtContent,
  );
  window.envFile.sendToEncrypt(newFileTxtContent, path);
  setInitialElValues();
}

function handleDecryptSubmit(e, txtContent, path) {
  e.preventDefault();
  window.envFile.sendToDecrypt(txtContent, path);
  setInitialElValues();
}

function generateNewTxtContent(project, date, version, modifiedBy, variables) {
  return `# Projeto: ${project}\n# Data da última modificação: ${date}\n# Versão do projeto: ${version}\n# Modificado por: ${modifiedBy}\n \n###############################\n \n${variables}`;
}

function getTodayDateString() {
  const today = new Date();
  const timestamp = today.getTime();
  const stringDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(today);

  return `${stringDate + ' ' + `(${timestamp})`}`;
}

function setInputValues(fileDataArr) {
  projectNameInputEl.value = fileDataArr[0];
  versionInputEl.value = fileDataArr[2];
  modifiedByInputEl.value = fileDataArr[3];
  const today = new Date(fileDataArr[1]);
  today.setUTCHours(today.getUTCHours() - 3);
  const formattedDate = today.toISOString().slice(0, 19).replace('T', ' ');
  modifiedDateInputEl.value = formattedDate;
}

function setInitialElValues(ignoreInput) {
  projectNameInputEl.value = '';
  versionInputEl.value = '';
  modifiedByInputEl.value = '';
  actionButtonEl.innerText = 'Selecione um Arquivo';
  actionButtonEl.disabled = true;
  projectNameInputEl.disabled = true;
  modifiedDateInputEl.value = null;
  versionInputEl.disabled = true;
  modifiedByInputEl.disabled = true;
  modifiedDateInputEl.disabled = true;

  if (ignoreInput === undefined) {
    fileInputEl.value = null;
  }
}

function enableInputs() {
  projectNameInputEl.disabled = false;
  actionButtonEl.disabled = false;
  versionInputEl.disabled = false;
  modifiedByInputEl.disabled = false;
  modifiedDateInputEl.disabled = false;
}
