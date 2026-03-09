let pdfDoc = null
let pageNum = parseInt(localStorage.getItem("echoes_page")) || 1

const canvas = document.getElementById("pdf-canvas")
const ctx = canvas.getContext("2d")

const indicator = document.getElementById("page-indicator")
const progressBar = document.getElementById("progress")

let zoom = 1
let baseScale = 1

/* RENDER PAGE */

function renderPage(num){

pdfDoc.getPage(num).then(function(page){

/* auto fit width */

let viewport = page.getViewport({scale:1})

let screenWidth = window.innerWidth

/* render 2x resolution for sharp text */

baseScale = (screenWidth / viewport.width) * 4

viewport = page.getViewport({scale:baseScale})

/* offscreen render */

let tempCanvas = document.createElement("canvas")
let tempCtx = tempCanvas.getContext("2d")

tempCanvas.width = viewport.width
tempCanvas.height = viewport.height

page.render({
canvasContext:tempCtx,
viewport:viewport
}).promise.then(()=>{

canvas.width = tempCanvas.width
canvas.height = tempCanvas.height

ctx.clearRect(0,0,canvas.width,canvas.height)
ctx.drawImage(tempCanvas,0,0)

/* page counter */

indicator.innerText = num + " / " + pdfDoc.numPages

/* progress bar */

let percent = (num / pdfDoc.numPages) * 100
progressBar.style.width = percent + "%"

/* save page */

localStorage.setItem("echoes_page",num)

})

})

}

/* LOAD PDF */

function loadPDF(){

pdfjsLib.getDocument("book.pdf").promise.then(function(pdf){

pdfDoc = pdf

if(pageNum > pdfDoc.numPages){
pageNum = pdfDoc.numPages
}

renderPage(pageNum)

})

}

loadPDF()

/* TAP PAGE TURN */

canvas.addEventListener("click",(e)=>{

let width = canvas.clientWidth
let x = e.offsetX

if(x > width/2){

if(pageNum < pdfDoc.numPages){
pageNum++
renderPage(pageNum)
}

}else{

if(pageNum > 1){
pageNum--
renderPage(pageNum)
}

}

})

/* PINCH ZOOM */

let startDistance = null

canvas.addEventListener("touchstart",(e)=>{

if(e.touches.length === 2){

let dx = e.touches[0].clientX - e.touches[1].clientX
let dy = e.touches[0].clientY - e.touches[1].clientY

startDistance = Math.sqrt(dx*dx + dy*dy)

}

})

canvas.addEventListener("touchmove",(e)=>{

if(e.touches.length === 2 && startDistance){

let dx = e.touches[0].clientX - e.touches[1].clientX
let dy = e.touches[0].clientY - e.touches[1].clientY

let newDistance = Math.sqrt(dx*dx + dy*dy)

let scale = newDistance / startDistance

zoom = Math.min(Math.max(scale,1),3)

canvas.style.transform = "scale(" + zoom + ")"

}

})

canvas.addEventListener("touchend",()=>{

startDistance = null

})

/* BACK BUTTON */

document.getElementById("back").onclick = function(){

window.location.href = "index.html"

}