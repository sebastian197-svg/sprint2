apiKey = "QEiNwRIV3GcWQ83yvX6IVcIAST0hxr1n";

let btnComenzar = document.getElementById('btn-creargifo-comenzar');
let btnGrabar = document.getElementById('btn-creargifo-grabar');
let btnFinalizar = document.getElementById('btn-creargifo-finalizar');
let btnSubirGifo = document.getElementById('btn-creargifo-subirgifo');

let pasoActivo = document.querySelectorAll('#creargifo-pasos-numero');
let contadorGrabacion = document.getElementById('contador-grabacion');
let repetirCaptura = document.getElementById('contador-repetircaptura');

let overlayCargando = document.getElementById('overlay-video');
let iconoCargando = document.getElementById('overlay-video-icon');
let textoCargando = document.getElementById('overlay-video-parrafo');
let accionesCargando = document.getElementById('overlay-video-actions');
let overlayActions = document.getElementById('overlay-video-actions');

let recorder;
let blob;
let dateStarted;

let form = new FormData();
let misGifosArray = [];
let misGifosString = localStorage.getItem("misGifos");

let video = document.getElementById('grabacion-video');
let gifGrabado = document.getElementById('gif-grabado');



btnComenzar.addEventListener('click', comenzarGifo);

function comenzarGifo() {

    btnComenzar.style.display = "none";

    let tituloGrabar = document.getElementById('titulo-grabargifo');
    let textoGrabar = document.getElementById('texto-grabargifo');
    tituloGrabar.innerHTML = "¿Nos das acceso </br>a tu cámara?";
    textoGrabar.innerHTML = "El acceso a tu camara será válido sólo </br>por el tiempo en el que estés creando el GIFO."

    pasoActivo[0].classList.add('paso-activo');

    
    navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 480, height: 320 } })

        
        .then(function (mediaStream) {
            
            tituloGrabar.style.display = "none";
            textoGrabar.style.display = "none";
            btnGrabar.style.display = "block";

            pasoActivo[0].classList.remove('paso-activo');
            pasoActivo[1].classList.add('paso-activo');

            
            video.style.display = "block";
            video.srcObject = mediaStream;
            video.onloadedmetadata = function (e) {
                video.play();
            };

            recorder = RecordRTC(mediaStream, {
                type: 'gif'
            });
        })


}




btnGrabar.addEventListener('click', grabarGifo);

function grabarGifo() {

    recorder.startRecording();
    console.log("grabando gif");

    btnGrabar.style.display = "none";
    btnFinalizar.style.display = "block";

    contadorGrabacion.style.display = "block";
    repetirCaptura.style.display = "none";


    dateStarted = new Date().getTime();

    (function looper() {
        if (!recorder) {
            return;
        }
        contadorGrabacion.innerHTML = calculateTimeDuration((new Date().getTime() - dateStarted) / 1000);
        setTimeout(looper, 1000);
    })();
}



btnFinalizar.addEventListener('click', finalizarGifo);

function finalizarGifo() {

    console.log("gif terminado");

    btnFinalizar.style.display = "none";
    btnSubirGifo.style.display = "block";

    contadorGrabacion.style.display = "none";
    repetirCaptura.style.display = "block";

    recorder.stopRecording(function () {
        video.style.display = "none";
        gifGrabado.style.display = "block";

        blob = recorder.getBlob();
        gifGrabado.src = URL.createObjectURL(recorder.getBlob());

        form.append('file', recorder.getBlob(), 'myGif.gif');
        form.append('api_key', apiKey);
    });

    
}



btnSubirGifo.addEventListener('click', subirGifo);

function subirGifo() {

    
    overlayCargando.style.display = "flex";
    btnSubirGifo.style.display = "none";
    pasoActivo[1].classList.remove('paso-activo');
    pasoActivo[2].classList.add('paso-activo');
    repetirCaptura.style.display = "none";

    fetch(`https://upload.giphy.com/v1/gifs`, {
        method: 'POST',
        body: form,
    })

        .then(response => {
            return response.json();
        })

        
        .then(objeto => {
            console.log(objeto);
            let miGifId = objeto.data.id;

            
            accionesCargando.style.display = "block";
            iconoCargando.setAttribute("src", "./assets/check.svg");
            textoCargando.innerText = "GIFO subido con éxito";
            overlayActions.innerHTML = `
                <button class="overlay-video-button" id="btn-creargifo-descargar" onclick="descargarGifCreado('${miGifId}')">
                <img src="./assets/icon-download.svg" alt="download">
                </button>
                <button class="overlay-video-button" id="btn-creargifo-link">
                <img src="./assets/icon-link.svg" alt="link">
                </button>
                `;

            
            if (misGifosString == null) {
                misGifosArray = [];

            } else {
                
                misGifosArray = JSON.parse(misGifosString);
            }

            misGifosArray.push(miGifId);
            
            misGifosString = JSON.stringify(misGifosArray);
            localStorage.setItem("misGifos", misGifosString);
        })

        .catch(error => console.log("error al subir gif a GIPHY" + error))
}


async function descargarGifCreado(gifImg) {
    let blob = await fetch(gifImg).then( img => img.blob());;
    invokeSaveAsDialog(blob, "migifo.gif");
}


repetirCaptura.addEventListener('click', repetirGifo);

function repetirGifo() {
    recorder.clearRecordedData();
    console.log("re-grabando gif");

    repetirCaptura.style.display = "none";


    btnSubirGifo.style.display = "none";

    
    gifGrabado.style.display = "none";

    btnGrabar.style.display = "block";

    
    navigator.mediaDevices.getUserMedia({ audio: false, video: { width: 480, height: 320 } })

        
        .then(function (mediaStream) {

            
            video.style.display = "block";
            video.srcObject = mediaStream;
            video.onloadedmetadata = function (e) {
                video.play();
            };

            recorder = RecordRTC(mediaStream, {
                type: 'gif'
            });
        })
}


function calculateTimeDuration(secs) {
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));

    if (min < 10) {
        min = "0" + min;
    }

    if (sec < 10) {
        sec = "0" + sec;
    }

    return hr + ':' + min + ':' + sec;
}