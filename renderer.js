const information = document.getElementById("info");
const fileInput = document.getElementById("file-input");

information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}) and Electron (v${versions.electron()})`;

fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

const func = async () => {
  const response = await window.versions.ping();
  console.log(response);
};

func();

function handleFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const initialContent = event.target.result;

    const finalContent = `#Criptografado no envCryptor\n#Data da última modificação: ${file.lastModifiedDate}\n#Versão do projeto: 1.0.0\n#Editado por: ...\n${initialContent}`;

    window.envFile.sendToEncrypt(finalContent, file.path);
  };

  reader.readAsText(file);
}
