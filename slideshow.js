(function (){
   const keycodeMap = {left:37, up:38, right:39, down:40};
   var loading = false;
   var lock = false;

   /* load images beyond pages */
   function contentsLoader(set) {
      function getContentImages(xpath, root) {
         imgs = document.evaluate(xpath, root, null, 7, null);
         for (var i=0,max=imgs.snapshotLength;i<max;i++) {
            imglist[imglist.length] = imgs.snapshotItem(i);
         }
      };

      var imglist = [];
      getContentImages(set.xpath, document);
      var current = -1;
      var page    = 1;

      function addElements(proc) {
         loading = true;
         r = new XMLHttpRequest();
         if (r) {
            r.onreadystatechange = function() {
               if (r.readyState == 4 && r.status == 200) {
                  div = document.createElement('div');
                  div.style.display = "none";
                  div.innerHTML = r.responseText;
                  document.body.appendChild(div);
                  getContentImages(set.xpath, document);
                  document.body.removeChild(div);
                  loading = false;
                  proc(imglist[++current]);
	           }
            };
            r.open("GET", "./?page="+(++page));
		    r.send(null);
         } else {
            alert("failed to create xmlhttprequest object");
         }
      }
      this.getNext = function(proc) {
         if (!proc) {
            proc = (function(){});
         }
         
         if (current > imglist.length-10 && !loading) {
            addElements(function(){});
         }
         if (current+1 == imglist.length) {
            /*addElements(proc);*/
         } else {
            proc(imglist[++current]);
         }
      };
      this.getPrevious = function(proc) {
         if (!proc) {
            proc = (function(){});
         }
         if (current > 0) {
            proc(imglist[--current]);
         }
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
   document.body.width = "100%";
   document.body.height = "1372px";
   document.body.style.margin = "0px";

   var container = document.createElement('div');
   container.id = "imagearea";
   container.style.width = "100%";
   container.style.height = "1372px";
   document.body.appendChild(container);
   container.appendChild(document.createElement('img'));

   container.addEventListener('click', function(e) {
      if (!lock) {
         if (e.x < document.body.clientWidth / 2) {
            contents.getPrevious(changeImg);
         } else {
            contents.getNext(changeImg);
         }
      }
   }, true);

   function changeImg(img){
      function animate() {
         if ( parseFloat(img.style.opacity) < 1 ) {
            img.style.opacity =
               (parseFloat(img.style.opacity) + 0.2).toString();
            setTimeout(animate, 40);
         } else {
            ia = document.getElementById('imagearea');
            if (ia.childNodes.length > 1) {
               ia.removeChild(ia.firstChild);
            }
            lock = false;
         }
      }

      img.style.position = "absolute";
      img.style.margin = "0px";
      img.style.width = "100%";
      img.style.opacity = 0;
      document.getElementById('imagearea').appendChild(img);
      setTimeout(animate, 40);
      lock = true;
   }

   contents.getNext(changeImg);

   window.onload = function(){setTimeout(scrollTo, 100, 0, 1);};
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
