(function (){
   const keycodeMap = {left:37, up:38, right:39, down:40};
   var loading = false;

   /* load images beyond pages */
   function contentsLoader(set) {
      var imglist = [];
      var current = -1;
      var page    = 0;

      function addElements(next) {
         loading = true;
         r = new XMLHttpRequest();
         if (r) {
            r.onreadystatechange = function() {
               if (r.readyState == 4 && r.status == 200) {
                  div = document.createElement('div');
                  div.style.display = "none";
                  div.innerHTML = r.responseText;
                  document.body.appendChild(div);
                  imgs = document.evaluate(set.xpath, document,
                                           null, 7, null);
                  for (var i=0,max=imgs.snapshotLength;i<max;i++) {
                     imglist[imglist.length] = imgs.snapshotItem(i);
                  }
                  document.body.removeChild(div);
                  loading = false;
                  next(imglist[++current]);
	           }
            };
            r.open("GET", "./?page="+(++page));
		    r.send(null);
         } else {
            alert("failed to create xmlhttprequest object");
         }
      }
      this.getNext = function(next) {
         if (!next) {
            next = (function(){})
         }
         
         if (current > imglist.length-10 && !loading) {
            addElements(function(){});
         }
         if (current+1 == imglist.length) {
            /*addElements(next);*/
         } else {
            next(imglist[++current]);
         }
      };
      this.getPrevious = function() {
         return imglist[--current];
      };
      return this;
   };

   var for4u = {
      xpath : "//div[@class='entry-photo']/a/img",
   };


   var contents = contentsLoader(for4u);


   head = document.getElementsByTagName('head')[0];
   while (head.childNodes.length != 0) {
      head.removeChild(head.firstChild);
   }
   while (document.body.childNodes.length != -0) {
      document.body.removeChild(document.body.firstChild);
   }
   document.body.width = "320px";
   document.body.height = "480px";
   document.body.style.margin = "0px";

   var container = document.createElement('div');
   container.id = "imagearea";
   container.style.width = "320px";
   container.style.height = "480px";
   document.body.appendChild(container);
   container.appendChild(document.createElement('img'));

   container.addEventListener('click', function(e) {
      contents.getNext(changeImg);
   }, true);

   function changeImg(img){
      function animate() {
         if ( parseFloat(img.style.opacity) < 1 ) {
            img.style.opacity =
               (parseFloat(img.style.opacity) + 0.2).toString();
            setTimeout(animate, 40);
         } else {
            ia = document.getElementById('imagearea');
            ia.removeChild(ia.firstChild);
         }
      }

      img.style.position = "absolute";
      img.style.margin = "0px";
      img.style.width = "320px";
      img.style.opacity = 0;
      document.getElementById('imagearea').appendChild(img);
      setTimeout(animate, 40);
   }

   contents.getNext(changeImg);   
})()




// var currentPosition = 1;
// var currentDirection = 0;

// var newimg;
// var oldimg;

// var lock = false;

// function move(direction) {
//    // move pics
//    currentPosition += 1;
//    map = document.getElementById("map");
//    oldimg = map.firstChild;
//    newimg = document.createElement('img');

//    newimg.setAttribute('src', 'pics/SANY000'+currentPosition.toString()+'.JPG')
//    newimg.setAttribute('class', 'mappic');
//    newimg.style.opacity = '0';
//    map.appendChild(newimg);

//    setTimeout(animate, 100)
// }
// function animate() {
//    if ( parseFloat(newimg.style.opacity) < 1 ) {
//       newimg.style.opacity = (parseFloat(newimg.style.opacity) + 0.1).toString();
//       setTimeout(animate, 100);
//    } else {
//       newimg.style.left = "0";
//       newimg.addEventListener("click", function(e){ move() }, true);
//       oldimg.parentNode.removeChild(oldimg);
//       lock = false;
//    }
// }

// function init() {
//    document.body.addEventListener("keydown", onkeydown, false);
// }
// function onkeydown(e) {
//    if (e.keyCode == up && !lock) {
//       lock = true;
//       move();
//    }
// }
