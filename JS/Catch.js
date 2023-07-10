sps = []
sqlScripts = ""
exampleCatch = `
        /*
            Homologación Errores 2023 
            Documentación: https://docs.google.com/document/d/1LR-L0wxhREp8kDBDR_iyeJDB32RSM-q8MP72uzjP-g4
        */
        
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION

		    DECLARE @vcSpParameters VARCHAR(MAX)    = ######

		    EXEC [Logs].[SetError]
            @piProcId					              = @@PROCID
            , @pvcSpParameters			     	  = @vcSpParameters
            , @pvcComment			      	      = @vcComment
            , @pvcErrorMessageParameters	  = @vcErrorMessageParameters
            , @vcErrorCode_OUT			        = @vcErrorCode_OUT	    OUTPUT
            , @vcErrorMessage_OUT			      = @vcErrorMessage_OUT	  OUTPUT
`

let blocks = []; // Almacena todos los bloques de código
let currentPage = 0; // Indica la página actual
let blocksPerPage = 1;

//Función para copiar solo el código Nuevo
function copyCodeNew() {
  let codeContainer = document.getElementById('codeNew');
  let codeText = codeContainer.innerText;
  codeText = codeText.replace(/[0-9:]/g, '');
  navigator.clipboard.writeText(codeText)
    .then(function() {
      mostrarToast()
    })
    .catch(function(error) {
      console.error('Error al copiar el código: ', error);
    });
}

//Función para copiar solo el código Antiguo
function copyCodeOld() {
  let codeContainer2 = document.getElementById('codeOld');
  let codeText = codeContainer2.innerText;
  codeText = codeText.replace(/[0-9:]/g, '');
  navigator.clipboard.writeText(codeText)
    .then(function() {
      mostrarToast()
    })
    .catch(function(error) {
      console.error('Error al copiar el código: ', error);
    });
}

//Función para mostrar en el HTML que se copió el código.
function mostrarToast() {
  let toast = document.getElementById('toast');
  toast.style.display = 'block';

  setTimeout(function() {
    toast.style.display = 'none';
  }, 2000);
}


// Pinta las líneas en el HTML.
function addPreformattedText(sps) {
  sps.forEach(function (spObject) {
    let spArrayOriginal = spObject.spOriginal;
    let spArrayEdit = spObject.spEdited;
    blocks.push({
      spOriginal: spArrayOriginal,
      spEdited: spArrayEdit
    });
  });

  let element = document.getElementById('line-number');
  if (typeof (element) !== 'undefined' && element != null) {
    element.remove();
  }
  updatePage(); //Llama a la función 
}

//Función que hace la lógica de pintar las lineas en el HTML
function updatePage() {
  let codeContainer = document.getElementById('codeNew');
  let codeContainer2 = document.getElementById('codeOld');
  let previousButton = document.getElementById('previousButton');
  let nextButton = document.getElementById('nextButton');

  codeContainer.innerHTML = '';
  codeContainer2.innerHTML = '';

  // Logica para saber cántos blockes hay de código.
  let startIndex = currentPage * blocksPerPage;
  let endIndex = Math.min(startIndex + blocksPerPage, blocks.length);

  for (let i = startIndex; i < endIndex; i++) {
    let spArrayOriginal = blocks[i].spOriginal;
    let spArrayEdit = blocks[i].spEdited;

    let preOld = document.createElement('pre');
    preOld.classList.add('preOld');
    let codeOld = document.createElement('code');

    let lineNumberElement = document.createElement('span');
    lineNumberElement.id = 'line-number';
    lineNumberElement.classList.add('line-number', 'noselect');
    preOld.appendChild(lineNumberElement);

    let numberedLines = [];

    for (let j = 0; j < spArrayOriginal.length; j++) {
      let line = spArrayOriginal[j];
      let highlightedLine = line;

      if (spArrayEdit[j] !== line) {
        highlightedLine = '<span style="background-color: #76F674; color: black;">' + line + '</span>';
      }

      let lineNumber = document.createElement('span');
      lineNumber.textContent = (j + 1) + ': ';
      lineNumber.classList.add('noselect');

      let lineContent = document.createElement('span');
      lineContent.innerHTML = highlightedLine;

      let lineContainer = document.createElement('div');
      lineContainer.appendChild(lineNumber);
      lineContainer.appendChild(lineContent);

      numberedLines.push(lineContainer);
    }

    codeOld.innerHTML = '';
    numberedLines.forEach(function (lineContainer) {
      codeOld.appendChild(lineContainer);
    });

    preOld.appendChild(codeOld);
    codeContainer2.appendChild(preOld);

    let preNew = document.createElement('pre');
    preNew.classList.add('preNew');
    let codeNew = document.createElement('code');

    lineNumberElement = document.createElement('span');
    lineNumberElement.id = 'line-number';
    lineNumberElement.classList.add('line-number', 'noselect');
    preNew.appendChild(lineNumberElement);

    numberedLines = [];

    for (let j = 0; j < spArrayEdit.length; j++) {
      let line = spArrayEdit[j];
      let highlightedLine = line;

      if (line !== spArrayOriginal[j]) {
        highlightedLine = '<span style="background-color:#FF9595 ; color: black;">' + line + '</span>';
      }

      let lineNumber = document.createElement('span');
      lineNumber.textContent = (j + 1) + ': ';
      lineNumber.classList.add('noselect');

      let lineContent = document.createElement('span');
      lineContent.innerHTML = highlightedLine;

      let lineContainer = document.createElement('div');
      lineContainer.appendChild(lineNumber);
      lineContainer.appendChild(lineContent);

      numberedLines.push(lineContainer);
    }

    codeNew.innerHTML = '';
    numberedLines.forEach(function (lineContainer) {
      codeNew.appendChild(lineContainer);
    });

    preNew.appendChild(codeNew);
    codeContainer.appendChild(preNew);

    //Cuando se ejecute esta función se verá lo que hay en los dos div
    document.getElementById('cont').style.display = 'block';
    document.getElementById('cont2').style.display = 'block';
    
    //Cambia el estilo de los botones
    document.getElementById('nextButton').style = 'margin-top: -5%';
    document.getElementById('previousButton').style = 'margin-top: 12%';
    document.getElementById('pageCounter').style = 'margin-left: 50%';  
    document.getElementById('copyButtonNew').style = 'margin-top: 2%; margin-bottom: 2%';
    document.getElementById('copyButtonOld').style = 'margin-top: 2%; margin-bottom: 2%';
  }

  previousButton.disabled = currentPage === 0; // Deja de funcionar si la página actual es la primera.
  nextButton.disabled = (currentPage + 1) * blocksPerPage >= blocks.length; // Se desavilita el botón "siguiente" si la página es la última.
  document.getElementById('currentPage').textContent = currentPage + 1;
  document.getElementById('totalPages').textContent = Math.ceil(blocks.length / blocksPerPage); 
}

function nextPage() {
  // Incrementa el contador y actualiza la página si no estás en la última página
  if ((currentPage + 1) * blocksPerPage < blocks.length) {
    currentPage++;
    updatePage();
  }
}

function previousPage() {
 // Disminuye el contador y actualiza la página si no estás en la primera página
 if (currentPage > 0) {
  currentPage--;
  updatePage();
 
}
}

//ActualizarTransaccion
function repeatTabs(maxParamLength, paramLength, index){
  maxTabs =  Math.ceil(maxParamLength / 4)
  currentTabs = Math.ceil(paramLength / 4)

  repeatTabsNumber = maxTabs - currentTabs

  // lastOne = 1;

  if(maxParamLength % 4 >= 2){
      repeatTabsNumber += 1;
  }

  if(paramLength % 4 == 1){
      repeatTabsNumber += 1;
  }

  if(index == 0){
      repeatTabsNumber += 1;
  }

  if(repeatTabsNumber < 0){
      repeatTabsNumber = 0;
  }

  // tabs = Math.ceil((maxParamLength - paramLength) / 4) + lastOne

  // if(tabs <= 0){
  //     return 1;
  // }

  return repeatTabsNumber;
}

//Función que entrega los parametros en un arreglo de cada sp
function simpleArrayParams(stringParams){
  stringParams = stringParams
          .map((line) => {
              return line.substring(0, (line.includes("--") ? line.lastIndexOf('--') : line.length + 1 ) ) 
          })
          .filter((line) => {
              return line.includes("@")
          });


  stringParams = stringParams.toString().split(',');
  regex = new RegExp(`\@([^=<>\s\']+)`);

  return stringParams.filter(line => regex.test(line)).map(function(line){
    wordsArray = line.match(/[A-Za-z0-9_]+\(?[A-Za-z0-9]+\)*/g);
    return wordsArray[0].trim()
  })	
}

//Función que genera el nuevo catch
function GenerateCatch(jsonParams, startCatchLine, endLine){
	code = sqlScripts.slice(endLine, startCatchLine).toString();
	spCatch = exampleCatch;
	
	if (!code.includes("@vcComment")){
		spCatch = spCatch.replace("= @vcComment", '= NULL')
	}
	
	if (!code.includes("@vcErrorMessageParameters")){
		spCatch = spCatch.replace("= @vcErrorMessageParameters", '= NULL')
	}
	
	if (jsonParams.length == 0){
		spCatch = spCatch.replace("DECLARE @vcSpParameters VARCHAR(MAX)    = ######", 'DECLARE @vcSpParameters VARCHAR(MAX)    = NULL')
	}
	
	if (jsonParams.length == 0){
		spCatch = spCatch.replace("DECLARE @vcSpParameters VARCHAR(MAX)    = ######", 'DECLARE @vcSpParameters VARCHAR(MAX)    = NULL')
	}else{
		maxParamLength = Math.max(...(jsonParams.map(el => el.length)));

		params = `DECLARE @vcSpParameters VARCHAR(MAX)    =   (SELECT `
		jsonParams.forEach(function(param, index) {
            initialTabs = "\n" + ("\t".repeat(14));
			tabs = "\t".repeat(repeatTabs(maxParamLength, param.length, index))
			params += `${initialTabs}${(index == 0 ? '' : ', ')}${param}${tabs}= @${param}`
		})
        initialTabs = "\n" + ("\t".repeat(13));
		params += `${initialTabs}FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES)`
		spCatch = spCatch.replace("DECLARE @vcSpParameters VARCHAR(MAX)    = ######", params)
	}
	
	if (!jsonParams.includes("vcErrorCode_OUT")){
		spCatch = spCatch.replace(new RegExp("= @vcErrorCode_OUT", 'g'), '= NULL');
		spCatch = spCatch.replace(new RegExp("= @vcErrorMessage_OUT", 'g'), '= NULL');
		spCatch = spCatch.replace(new RegExp("OUTPUT", 'g'), '');
	}
	
	return spCatch.split('\n');
	
}

//Función que remplaza el catch viejo por el nuevo catch
function ReplaceCatch(spOriginal, newCatch, startIndex, endIndex) {
  const p = Array.from(spOriginal);

  // Eliminar el contenido entre startIndex (BEGIN CATCH) y endIndex (END CATCH - 1)
  p.splice(startIndex, endIndex - startIndex);

  // Insertar el contenido de newCatch en la posición startIndex
  p.splice(startIndex, 0, ...newCatch);

  return p;
}

//Función que busca una palabra especifica dentro de un arreglo.
function findIndexByKeyword(sp, keyword) {
  const index = sp.findIndex(line => line.includes(keyword));
  return index;
}

//Función que busca una palabra especifica de abajo acia arriba dentro de un arreglo.
function findIndexByKeywordReverse(sp, keyword) {
  const reversedSp = sp.slice().reverse(); // Copia el arreglo y lo invierte
  const index = reversedSp.findIndex(line => line.includes(keyword));
  
  if (index !== -1) {
    const adjustedIndex = sp.length - 1 - index; // Ajusta el índice para obtener la posición correcta en el arreglo original
    return adjustedIndex;
  }

  return index;
}

//Función que toma el fragmento de los parametros.
function GetJSONParams(sp) {
  const procedureIndex = findIndexByKeyword(sp, "PROCEDURE");;
  const beginIndex = findIndexByKeyword(sp, "AS");
  
  if (procedureIndex !== -1 && beginIndex !== -1 && procedureIndex < beginIndex) {
    const spFragment = sp.slice(procedureIndex, beginIndex + 1);
    return simpleArrayParams(spFragment);
  } 
  
  return [];  
} 



function handleCatchs(){
  let sps = document.getElementById('textarea').value;
  
  // Separamos los sp's 
  sps = sps.split("/****** Object:  StoredProcedure")
  
  //Filtramos para que queden solo los sp's que tengan Script Date
  sps = sps.filter(function(sp){
      return sp.includes("Script Date")
  })

  //Separa en arreglo los saltos de linea y elimina lo que hay en la posición 0
  sps = sps.map(function(sp, index){
      const arraySP = sp.split("\n")
      arraySP.splice(0,1) //Elimina la primera linea del sp
      return {
        spOriginal: arraySP
      }
  })

  /*Usa la función GetJSONParams(). Devuelve un arreglo de arreglos spFragments donde vienen 
  los parametros de cada sp */ 
  sps = sps.map(function(sp, index){
    sp.JSONParams = GetJSONParams(sp.spOriginal);
    return sp
  })  

  sps = sps.map(function(sp, index){
    sp.startCatch = findIndexByKeywordReverse(sp.spOriginal, "BEGIN CATCH");
    sp.endCatch = findIndexByKeywordReverse(sp.spOriginal, "END CATCH");

    newCatch = GenerateCatch(sp.JSONParams, sp.startCatch, sp.endCatch);
    sp.spEdited = ReplaceCatch(sp.spOriginal, newCatch, sp.startCatch + 1, sp.endCatch);

    return sp;
  });

  addPreformattedText(sps)

  //console.log(sps); 
}

//Resetea cada que se le da click a el botón Mejorar el catch
function resetCode() {
  blocks = [];
  currentPage = 0;

  let codeContainer = document.getElementById('codeNew');
  codeContainer.innerHTML = '';

  let codeContainer2 = document.getElementById('codeOld');
  codeContainer2.innerHTML = '';

  handleCatchs();
}