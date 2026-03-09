let scene = new THREE.Scene()

let camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
)

let renderer = new THREE.WebGLRenderer({antialias:true})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth,window.innerHeight)

renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.NoToneMapping

document
.getElementById("canvas-container")
.appendChild(renderer.domElement)

camera.position.z = 5

scene.background = new THREE.Color(0x081421)
scene.fog = new THREE.Fog(0x081421,4,12)



/* ENVIRONMENT LIGHT */

let envLoader = new THREE.TextureLoader()

envLoader.load("textures/studio.jpg", function(texture){

texture.mapping = THREE.EquirectangularReflectionMapping
texture.colorSpace = THREE.SRGBColorSpace

scene.environment = texture

})



/* LIGHTING */

let ambient = new THREE.AmbientLight(0xffffff,0.4)
scene.add(ambient)

let keyLight = new THREE.DirectionalLight(0xffffff,1.2)
keyLight.position.set(5,7,5)
scene.add(keyLight)

let rimLight = new THREE.DirectionalLight(0x88aaff,0.7)
rimLight.position.set(-5,3,-5)
scene.add(rimLight)

let warmGlow = new THREE.PointLight(0xffbb66,2,10)
warmGlow.position.set(0,1.5,2)
scene.add(warmGlow)



/* TEXTURES */

let loader = new THREE.TextureLoader()

let frontTexture = loader.load("front.jpg")
let backTexture = loader.load("back.jpg")
let spineTexture = loader.load("spine.jpg")
let paperTexture = loader.load("textures/paper.jpg")
let glowTexture = loader.load("textures/glow.png")

frontTexture.colorSpace = THREE.SRGBColorSpace
backTexture.colorSpace = THREE.SRGBColorSpace
spineTexture.colorSpace = THREE.SRGBColorSpace
paperTexture.colorSpace = THREE.SRGBColorSpace



let max = renderer.capabilities.getMaxAnisotropy()

frontTexture.anisotropy = max
backTexture.anisotropy = max
spineTexture.anisotropy = max
paperTexture.anisotropy = max



paperTexture.wrapS = THREE.RepeatWrapping
paperTexture.wrapT = THREE.RepeatWrapping
paperTexture.repeat.set(120,6)



/* BOOK */

let book = new THREE.Group()
scene.add(book)

let geometry = new THREE.BoxGeometry(2,3,0.4)

let materials = [

new THREE.MeshStandardMaterial({map:paperTexture}),
new THREE.MeshStandardMaterial({map:spineTexture}),
new THREE.MeshStandardMaterial({map:paperTexture}),
new THREE.MeshStandardMaterial({map:paperTexture}),

new THREE.MeshBasicMaterial({map:frontTexture}),
new THREE.MeshBasicMaterial({map:backTexture})

]

let mesh = new THREE.Mesh(geometry,materials)

book.add(mesh)



/* PARTICLES */

let particleCount = 200

let particleGeometry = new THREE.BufferGeometry()

let positions = []

for(let i=0;i<particleCount;i++){

positions.push(
(Math.random()-0.5)*12,
Math.random()*8-3,
(Math.random()-0.5)*12
)

}

particleGeometry.setAttribute(
'position',
new THREE.Float32BufferAttribute(positions,3)
)

let particleMaterial = new THREE.PointsMaterial({

map: glowTexture,
color:0xffddaa,
size:0.12,
transparent:true,
blending: THREE.AdditiveBlending,
depthWrite:false

})

let particles = new THREE.Points(
particleGeometry,
particleMaterial
)

scene.add(particles)



/* DRAG ROTATION */

let dragging=false
let prevX=0
let prevY=0

function startDrag(x,y){
dragging=true
prevX=x
prevY=y
}

function drag(x,y){

if(!dragging) return

let dx=x-prevX
let dy=y-prevY

book.rotation.y += dx*0.01
book.rotation.x += dy*0.01

prevX=x
prevY=y

}

function stopDrag(){
dragging=false
}



/* MOUSE */

document.addEventListener("mousedown",(e)=>{
startDrag(e.clientX,e.clientY)
})

document.addEventListener("mousemove",(e)=>{
drag(e.clientX,e.clientY)
})

document.addEventListener("mouseup",stopDrag)



/* TOUCH */

document.addEventListener("touchstart",(e)=>{
startDrag(e.touches[0].clientX,e.touches[0].clientY)
})

document.addEventListener("touchmove",(e)=>{
drag(e.touches[0].clientX,e.touches[0].clientY)
})

document.addEventListener("touchend",stopDrag)



/* FLOATING */

let floating = true

function animate(){

requestAnimationFrame(animate)

if(floating){

book.rotation.y += 0.001
book.position.y = Math.sin(Date.now()*0.001)*0.05

}

particles.rotation.y += 0.0003
particles.rotation.x += 0.0001

renderer.render(scene,camera)

}

animate()



/* RESIZE */

window.addEventListener("resize",()=>{

camera.aspect =
window.innerWidth/window.innerHeight

camera.updateProjectionMatrix()

renderer.setSize(
window.innerWidth,
window.innerHeight
)

})



/* BOOK OPEN ANIMATION */

function openBookAnimation(){

floating = false

let start = performance.now()

function animateOpen(time){

let t = (time - start) / 1200

if(t > 1){

window.location.href = "reader.html"
return

}

/* rotate book */

book.rotation.y -= 0.08

/* move book forward */

book.position.z = -2.5 * t

/* camera zoom */

camera.position.z = 5 - (2 * t)

renderer.render(scene,camera)

requestAnimationFrame(animateOpen)

}

requestAnimationFrame(animateOpen)

}



/* CLICK BOOK */

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

function onClick(event){

mouse.x = (event.clientX / window.innerWidth) * 2 - 1
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

raycaster.setFromCamera(mouse,camera)

let intersects = raycaster.intersectObject(mesh)

if(intersects.length > 0){

openBookAnimation()

}

}

window.addEventListener("click",onClick)
window.addEventListener("touchend",onClick)